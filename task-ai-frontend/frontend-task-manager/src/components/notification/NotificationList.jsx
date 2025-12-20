import React from 'react';
import { NotificationItem } from './NotificationItem';
import { useI18n } from '../../utils/i18n';
import { useDeadlineStats } from '../../hooks/useDeadlineStats';

/**
 * ============================================================================
 * NOTIFICATION LIST
 * ============================================================================
 * Display notifications grouped by type (EMAIL_SENT, DUE_SOON, OVERDUE)
 * with counts showing LIVE deadline stats from useDeadlineStats hook
 * → SOURCE OF TRUTH: useDeadlineStats (100% khớp với Form)
 * ============================================================================
 */

export const NotificationList = ({ notifications, loading, onSelect }) => {
  const { t } = useI18n();
  // SOURCE OF TRUTH duy nhất: useDeadlineStats (giống với NotificationDetailModal)
  const { overdueTasks, dueSoonTasks } = useDeadlineStats();

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

  // Group notifications by type (1 bản ghi/type)
  const grouped = notifications.reduce((acc, n) => {
    const key = n.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  // Fixed display order for 3 system notification types
  const order = ['EMAIL_SENT', 'DUE_SOON', 'OVERDUE'];
  const typeLabels = {
    EMAIL_SENT: t('notifications.types.email'),
    DUE_SOON: t('notifications.systemTitles.deadlineSoon'),
    OVERDUE: t('notifications.systemTitles.overdue')
  };

  return (
    <div className="max-h-96 overflow-y-auto">
      {order.map(type => {
        if (!grouped[type] || grouped[type].length === 0) return null;
        const first = grouped[type][0];
        // SOURCE OF TRUTH: Tính count từ useDeadlineStats (100% khớp với Form)
        const taskCount = type === 'DUE_SOON'
          ? dueSoonTasks.length
          : type === 'OVERDUE'
            ? overdueTasks.length
            : grouped[type].length;
        return (
          <div key={type}>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {typeLabels[type]} ({taskCount})
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
