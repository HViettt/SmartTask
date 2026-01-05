import React from 'react';
import { Clock, Mail, AlertCircle } from 'lucide-react';
import { useI18n } from '../../utils/i18n';
import { formatNotificationMessage } from './notificationMessage';
import { useDeadlineStats } from '../../hooks/useDeadlineStats';

export const NotificationItem = ({ notification, onClick }) => {
  const { t, locale } = useI18n();
  const { overdueTasks, dueSoonTasks } = useDeadlineStats();

  const formatTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('common.justNow');
    if (diffMins < 60) return t('common.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('common.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('common.daysAgo', { count: diffDays });
    
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const { type, title, message, createdAt, lastTriggeredAt, read, severity = 'info' } = notification;
  const timeSource = lastTriggeredAt || createdAt;

  // Map system notification titles using i18n; fall back to backend title
  const systemTitle = (() => {
    if (type === 'EMAIL_SENT') return t('notifications.systemTitles.emailSent');
    if (type === 'DUE_SOON') return t('notifications.systemTitles.deadlineSoon');
    if (type === 'OVERDUE') return t('notifications.systemTitles.overdue');
    return title;
  })();

  // Icon mapping based on notification type & subtype
  const iconConfig = {
    EMAIL_SENT: {
      Icon: Mail,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    DUE_SOON: {
      Icon: AlertCircle,
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    OVERDUE: {
      Icon: AlertCircle,
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400'
    }
  };

  const config = iconConfig[type] || iconConfig.EMAIL_SENT;
  const { Icon, bgColor, iconColor } = config;

  const severityTone = {
    info: 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20',
    warn: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20',
    warning: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20',
    critical: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20',
    success: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20'
  }[severity] || 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20';

  // Ưu tiên dùng SOURCE OF TRUTH từ Dashboard cho thông điệp đếm
  let renderedMessage = formatNotificationMessage(notification, t);
  if (type === 'DUE_SOON') {
    const count = dueSoonTasks.length;
    // ✅ Luôn hiển thị count thực tế, kể cả khi = 0
    renderedMessage = t('notifications.templates.deadlineSoonCount', { count });
  } else if (type === 'OVERDUE') {
    const count = overdueTasks.length;
    // ✅ Luôn hiển thị count thực tế, kể cả khi = 0
    renderedMessage = t('notifications.templates.overdueCount', { count });
  }

  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
        !read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
          <Icon size={20} className={iconColor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <h4 className={`text-sm font-semibold ${
                !read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {systemTitle}
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${severityTone}`}>
                {t(`notifications.severity.${severity}`) || t('severity.info')}
              </span>
            </div>
            {!read && (
              <span className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {renderedMessage}
          </p>
          
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-500">
            <Clock size={12} />
            <span>{formatTime(timeSource)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
