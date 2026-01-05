import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Bell, Settings } from 'lucide-react';
import { showToast } from '../../utils/toastUtils';
import { NotificationList } from './NotificationList';
import { NotificationDetailModal } from './NotificationDetailModal';
import { NotificationSettings } from './NotificationSettings';
import api from '../../services/api';
import { useI18n } from '../../utils/i18n';
import { useTaskStore } from '../../features/taskStore';
import { useDeadlineStats } from '../../hooks/useDeadlineStats';

const ALLOWED_TYPES = ['EMAIL_SENT', 'DUE_SOON', 'OVERDUE'];

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { t } = useI18n();
  const { tasks } = useTaskStore();

  /**
   * ============================================================================
   * OPTIMIZATION: Notification Polling Strategy (v4 - FINAL)
   * ============================================================================
   * KEY INSIGHT từ user feedback:
   * - Badge count dựa trên useDeadlineStats (LOCAL tasks array)
   * - Khi user thêm/sửa/xóa task → tasks array auto-update → badge auto-update
   * - Notification database CHỈ dùng cho:
   *   1. Notification history (xem trong modal)
   *   2. EMAIL_SENT notification (1 lần/ngày lúc 7am)
   *   3. Mark as read status
   * 
   * STRATEGY:
   * - ❌ REMOVE base polling (không cần 5 phút polling)
   * - ✅ ONLY fetch khi modal mở (user click bell icon)
   * - ✅ ONLY fetch khi window focus (user quay lại từ tab khác)
   * - ✅ Badge count = useDeadlineStats (real-time từ local tasks)
   * 
   * RESULT:
   * - 0 polling requests ✅
   * - Badge luôn accurate (useDeadlineStats)
   * - Notification history chỉ load khi cần (modal open)
   * - 100% tiết kiệm tài nguyên
   * ============================================================================
   */

  // Track last task count để detect NEW task creation
  const taskCount = tasks.length;
  const lastTaskCountRef = useRef(taskCount);
  const hasNewTask = taskCount > lastTaskCountRef.current;
  if (hasNewTask) {
    lastTaskCountRef.current = taskCount;
  }

  // ⚠️ CRITICAL: Badge count = SỐ LOẠI notification chưa đọc (tối đa 3)
  const { overdueTasks, dueSoonTasks } = useDeadlineStats();
  
  // Debounce timer để tránh fetch liên tục
  const fetchTimeoutRef = useRef(null);
  
  // Track last unread count để tránh hiển thị lại badge khi đã read
  // Chỉ hiển thị lại nếu có NEW unread notification hoặc NEW task
  const lastUnreadCountRef = useRef(0);

  // Hash notifications để detect thay đổi thực sự (bao gồm read status)
  // ⚠️ CRITICAL: Hash PHẢI include read status, không chỉ _id
  const notificationHash = useMemo(() => {
    return notifications.map(n => `${n._id}-${n.read}`).join('|');
  }, [notifications]);

  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/notifications');
      const allNotifs = Array.isArray(res.data.notifications) ? res.data.notifications : [];
      const filtered = allNotifs.filter((n) => ALLOWED_TYPES.includes(n?.type));

      // ✅ Hash phải include read status để detect khi user mark as read
      const newHash = filtered.map(n => `${n._id}-${n.read}`).join('|');
      if (newHash !== notificationHash) {
        setNotifications(filtered);
      }

      // ⚠️ CRITICAL: Badge count = SỐ LOẠI notification CHƯA ĐỌC (tối đa 3)
      // 
      // Logic:
      // 1. Có notification OVERDUE chưa đọc + có tasks thực tế → badge +1
      // 2. Có notification DUE_SOON chưa đọc + có tasks thực tế → badge +1
      // 3. Có notification EMAIL_SENT chưa đọc → badge +1
      //
      // ⚠️ KEY: Chỉ đếm notification CHƯA ĐỌC (read: false)
      //         Nếu user đã mark as read → badge phải biến mất
      const unreadNotifications = filtered.filter((n) => !n.read);
      const unreadTypes = new Set();
      
      unreadNotifications.forEach(n => {
        // OVERDUE: Chỉ đếm nếu notification chưa đọc VÀ có tasks thực tế
        if (n.type === 'OVERDUE' && overdueTasks.length > 0) {
          unreadTypes.add('OVERDUE');
        } 
        // DUE_SOON: Chỉ đếm nếu notification chưa đọc VÀ có tasks thực tế
        else if (n.type === 'DUE_SOON' && dueSoonTasks.length > 0) {
          unreadTypes.add('DUE_SOON');
        } 
        // EMAIL_SENT: Chỉ đếm nếu notification chưa đọc
        else if (n.type === 'EMAIL_SENT') {
          unreadTypes.add('EMAIL_SENT');
        }
      });
      
      // ✅ FIXED: Chỉ update badge nếu:
      // 1. Unread count thay đổi (có notification mới chưa đọc hoặc đã read)
      // 2. Hoặc có task mới được tạo (hasNewTask)
      // 
      // Điều này tránh badge hiển thị lại khi đã read rồi,
      // chỉ hiển thị lại nếu có thực sự có notification mới hoặc task mới
      const newUnreadCount = unreadTypes.size;
      if (newUnreadCount !== lastUnreadCountRef.current || hasNewTask) {
        setUnreadCount(newUnreadCount);
        lastUnreadCountRef.current = newUnreadCount;
      }
      
      // ⚠️ EDGE CASE: Nếu có tasks nhưng notification chưa tồn tại trong DB
      // (VD: User vừa tạo task mới, backend scheduler chưa chạy)
      // → Tạm thời KHÔNG hiển thị badge (đợi backend scheduler tạo notification)
      // Lý do: Badge phải sync với notification database để "mark as read" hoạt động đúng
    } catch (error) {
      if (!silent) showToast.error(t('notifications.loadError'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ✅ Fetch notifications CHỈ 1 LẦN khi component mount
  // Không refetch khi tasks thay đổi (tránh loop)
  useEffect(() => {
    // ✅ NEW: Check if it's a new day - reset badge if needed
    const badgeResetFlag = localStorage.getItem('badgeResetFlag');
    if (badgeResetFlag === 'true') {
      // New day detected! Reset badge state
      // Clear the flag immediately
      localStorage.removeItem('badgeResetFlag');
      // Reset last unread count so badge will recalculate
      lastUnreadCountRef.current = 0;
    }
    
    // Initial load để tính badge (cần EMAIL_SENT notification)
    fetchNotifications(true);

    // ⚠️ KHÔNG có dependency [overdueTasks.length, dueSoonTasks.length]
    // Lý do: Tránh re-fetch liên tục khi tasks thay đổi
    // Badge sẽ update thông qua:
    // 1. Modal open (user click bell)
    // 2. Mark as read (refetch sau action)
    // 3. Task changes (refetch nếu có NEW task được tạo)
    // 4. NEW DAY: Reset badge khi vào ngày mới
  }, []); // ✅ Empty dependency: chỉ fetch 1 lần khi mount

  // ✅ Refetch chỉ khi user interaction (KHÔNG dùng window focus)
  // 
  // ⚠️ REMOVED: window focus event
  // Lý do: Gây badge hiển thị lại mỗi khi user switch tab, 
  // ngay cả khi đã read và không có notification mới
  // 
  // Behavior hiện tại:
  // ✅ Mount: Fetch 1 lần để tính badge
  // ✅ Task changes: Debounced 500ms để update badge nếu có task mới
  // ✅ Modal open: Fetch ngay khi user click bell icon
  // ❌ REMOVED: Window focus (không cần thiết, gây spam)
  
  // No window focus listener - chỉ refetch khi thực sự cần

  // ✅ Update badge khi tasks thay đổi (debounced để tránh loop)
  useEffect(() => {
    // Clear timeout cũ
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce 500ms: chỉ fetch sau khi tasks ổn định
    fetchTimeoutRef.current = setTimeout(() => {
      // Chỉ refetch nếu có thay đổi thực sự về deadline status
      fetchNotifications(true);
    }, 500);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [overdueTasks.length, dueSoonTasks.length]); // ✅ Refetch khi số lượng tasks deadline thay đổi

  // ✅ Thêm effect: khi modal mở, refetch ngay để hiển thị data mới
  useEffect(() => {
    if (isOpen) {
      // User vừa click bell → refetch ngay để thấy data latest
      fetchNotifications(true); // silent=true vì đã có loading state từ dropdown
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      // ✅ Update UI immediately (optimistic)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      // ⚠️ Badge sẽ còn hiển thị nếu còn tasks (OVERDUE/DUE_SOON)
      // Vì badge đếm theo SỐ LOẠI có tasks, không phỉ notification read status
      // → Refetch để recalc badge chính xác
      setTimeout(() => fetchNotifications(true), 500);
    } catch (error) {
      showToast.error(t('notifications.markReadError'));
    }
  };

  const handleSelectNotification = async (notification) => {
    try {
      if (!notification.read) {
        await api.put(`/notifications/${notification._id}/read`);
        // ✅ Update UI immediately (optimistic)
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
        
        // ⚠️ Refetch để recalc badge (badge phụ thuộc vào tasks, không chỉ read status)
        setTimeout(() => fetchNotifications(true), 200);
      }
      setSelectedNotification(notification);
    } catch (error) {
      showToast.error(t('notifications.readError'));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
        aria-label="Notifications"
      >
        <Bell size={24} className="text-gray-700 dark:text-gray-300" />
        {/* ✅ Badge count = SỐ LOẠI notification (tối đa 3), KHÔNG phải tổng số tasks */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('notifications.title')}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                  title={t('notifications.settings')}
                >
                  <Settings size={16} />
                </button>
                {unreadCount > 0 && (
                  <button
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    onClick={handleMarkAllRead}
                  >
                    {t('common.markAllRead')}
                  </button>
                )}
              </div>
            </div>
            <NotificationList
              notifications={notifications}
              loading={loading}
              onSelect={handleSelectNotification}
            />
          </div>
        </>
      )}

      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onCloseDropdown={() => setIsOpen(false)}
        />
      )}

      <NotificationSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
