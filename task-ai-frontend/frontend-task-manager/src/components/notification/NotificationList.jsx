import React from 'react';
import { NotificationItem } from './NotificationItem';
import { useI18n } from '../../utils/i18n';

export const NotificationList = ({ notifications, loading, onSelect }) => {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">{t('notifications.loading')}</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          {t('notifications.empty')}
        </p>
      </div>
    );
  }

  // Group notifications by type
  const grouped = notifications.reduce((acc, n) => {
    const key = n.type === 'task-status' ? 'task-status' : n.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  // Only show email and deadline-related groups; 'task' group omitted
  const order = ['email', 'task-status', 'deadline'];
  const typeLabels = {
    email: t('notifications.types.email'),
    'task-status': t('notifications.types.taskStatus'),
    task: t('notifications.types.task'),
    deadline: t('notifications.types.deadline')
  };

  return (
    <div className="max-h-96 overflow-y-auto">
      {order.map(type => {
        if (!grouped[type] || grouped[type].length === 0) return null;
        return (
          <div key={type}>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {typeLabels[type]} ({grouped[type].length})
              </p>
            </div>
            {grouped[type].map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClick={() => onSelect(notification)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};
