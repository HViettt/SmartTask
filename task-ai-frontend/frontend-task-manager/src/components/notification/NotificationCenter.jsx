import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Settings } from 'lucide-react';
import { showToast } from '../../utils/toastUtils';
import { NotificationList } from './NotificationList';
import { NotificationDetailModal } from './NotificationDetailModal';
import { NotificationSettings } from './NotificationSettings';
import api from '../../services/api';
import { useI18n } from '../../utils/i18n';
import { useTaskStore } from '../../features/taskStore';

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

  // Tạo task signature để detect bất kỳ thay đổi nào (status, deadline, etc)
  const taskSignature = useMemo(() => {
    return tasks.map(t => `${t._id}-${t.status}-${t.deadline}`).join('|');
  }, [tasks]);

  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/notifications');
      const allNotifs = Array.isArray(res.data.notifications) ? res.data.notifications : [];
      const filtered = allNotifs.filter((n) => ALLOWED_TYPES.includes(n?.type));

      setNotifications(filtered);
      const newUnreadCount = Math.min(
        filtered.filter((n) => !n.read).length,
        ALLOWED_TYPES.length
      );
      setUnreadCount(newUnreadCount);
    } catch (error) {
      if (!silent) showToast.error(t('notifications.loadError'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ✅ GỘP 3 useEffect thành 1: initial load + polling + task changes + window events
  useEffect(() => {
    // Load ban đầu
    fetchNotifications(false);

    // Polling mỗi 10s cho real-time tốt hơn
    const interval = setInterval(() => fetchNotifications(true), 10000);

    // Window event listeners
    const onFocus = () => fetchNotifications(true);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchNotifications(true);
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [taskSignature]); // Refetch khi tasks thay đổi (status, deadline, etc)

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      showToast.error(t('notifications.markReadError'));
    }
  };

  const handleSelectNotification = async (notification) => {
    try {
      if (!notification.read) {
        await api.put(`/notifications/${notification._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
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
