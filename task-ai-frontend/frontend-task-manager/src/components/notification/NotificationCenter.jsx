import React, { useState, useEffect, useRef } from 'react';
import { Bell, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { NotificationList } from './NotificationList';
import { NotificationDetailModal } from './NotificationDetailModal';
import { NotificationSettings } from './NotificationSettings';
import api from '../../services/api';
import { useI18n } from '../../utils/i18n';

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const previousUnreadRef = useRef(0);
  const { t } = useI18n();

  // Fetch notifications
  const fetchNotifications = async (options = { silent: false }) => {
    try {
      if (!options.silent) setLoading(true);
      const res = await api.get('/notifications');
      // Filter: only keep email-sent and deadline-soon notifications
      const all = Array.isArray(res.data.notifications) ? res.data.notifications : [];
      const filtered = all.filter((n) =>
        n?.type === 'email' ||
        n?.type === 'deadline' ||
        (n?.type === 'task-status' && n?.subtype === 'deadline-soon')
      );
      setNotifications(filtered);
      const filteredUnread = filtered.filter((n) => !n.read).length;
      setUnreadCount(filteredUnread);

       // Alert khi có thêm thông báo mới (tránh spam trên lần load đầu)
      if (!options.silent) {
        const prev = previousUnreadRef.current;
        const next = filteredUnread;
        if (!prev && next > 0) {
          toast(t('notifications.newCount', { count: next }), { icon: '🔔' });
        }
        if (prev && next > prev) {
          const newest = filtered.find((n) => !n.read) || filtered[0];
          const alertMessage = newest
            ? `${t('notifications.moreCount', { count: next - prev })} ${newest.title || ''}`.trim()
            : t('notifications.newGeneric', { count: next - prev });
          toast(alertMessage, { icon: '🔔' });
        }
        previousUnreadRef.current = next;
      }
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
    } finally {
      if (!options.silent) setLoading(false);
    }
  };

  // Load khi mount
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications({ silent: true }), 60000);
    return () => clearInterval(interval);
  }, []);

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications({ silent: true });
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error);
    }
  };

  // Khi click một thông báo
  const handleSelectNotification = async (notification) => {
    setSelectedNotification(notification);
    try {
      if (!notification.read) {
        await api.put(`/notifications/${notification._id}/read`);
      }
      // Refresh nhưng không bật alert để tránh lặp lại
      fetchNotifications({ silent: true });
    } catch (error) {
      console.error('Lỗi xử lý thông báo:', error);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={24} className="text-gray-700 dark:text-gray-300" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 z-50 mt-2 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('notifications.title')}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
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

            {/* Notification List */}
            <NotificationList 
              notifications={notifications}
              loading={loading}
              onSelect={handleSelectNotification}
            />
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedNotification && (
        <NotificationDetailModal 
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}

      {/* Settings Modal */}
      <NotificationSettings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
