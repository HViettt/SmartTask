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
      bgColor: 'bg-brand-primary/10 border border-brand-primary/20',
      iconColor: 'text-brand-primary-text'
    },
    DUE_SOON: {
      Icon: AlertCircle,
      bgColor: 'bg-brand-medium/10 border border-brand-medium/20',
      iconColor: 'text-brand-medium-text'
    },
    OVERDUE: {
      Icon: AlertCircle,
      bgColor: 'bg-brand-high/10 border border-brand-high/20',
      iconColor: 'text-brand-high-text'
    }
  };

  const config = iconConfig[type] || iconConfig.EMAIL_SENT;
  const { Icon, bgColor, iconColor } = config;

  const severityTone = {
    info: 'text-brand-primary-text bg-brand-primary/5 border border-brand-primary/10',
    warn: 'text-brand-medium-text bg-brand-medium/5 border border-brand-medium/10',
    warning: 'text-brand-medium-text bg-brand-medium/5 border border-brand-medium/10',
    critical: 'text-brand-high-text bg-brand-high/5 border border-brand-high/10',
    success: 'text-brand-low-text bg-brand-low/5 border border-brand-low/10'
  }[severity] || 'text-brand-primary-text bg-brand-primary/5 border border-brand-primary/10';

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
      className={`px-4 py-3 border-b border-brand-border/40 hover:bg-brand-base/20 cursor-pointer transition-colors font-sans text-xs ${
        !read ? 'bg-brand-primary/[0.03]' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon Container */}
        <div className={`flex-shrink-0 w-8 h-8 border ${bgColor} flex items-center justify-center rounded-none`}>
          <Icon size={14} className={iconColor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 font-mono text-[10px]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <h4 className={`font-sans font-bold uppercase tracking-wide text-xs ${
                !read ? 'text-brand-main font-extrabold' : 'text-brand-sub'
              }`}>
                {systemTitle}
              </h4>
              <span className={`px-1.5 py-0.5 text-[7px] font-bold border uppercase tracking-wider rounded-none ${severityTone}`}>
                {t(`notifications.severity.${severity}`) || t('severity.info')}
              </span>
            </div>
            {!read && (
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-brand-primary rounded-none mt-1 animate-pulse" />
            )}
          </div>
          
          <p className="text-brand-sub text-[9px] mt-1 line-clamp-2 leading-relaxed uppercase tracking-wider">
            {renderedMessage}
          </p>
          
          <div className="flex items-center gap-1 mt-1.5 text-[8px] text-brand-sub uppercase tracking-wider font-mono">
            <Clock size={10} className="opacity-70" />
            <span>{formatTime(timeSource)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
