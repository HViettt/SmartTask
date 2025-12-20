// Utility to format notification messages with i18n templates while preserving user content.
export const formatNotificationMessage = (notification, t) => {
  if (!notification) return '';
  const { type, subtype, message = '', metadata = {} } = notification;
  const trimmed = (message || '').toString();

  // Email digest: dùng counts khi có
  if (type === 'EMAIL_SENT') {
    const overdue = Number(metadata.overdueCount ?? (Array.isArray(metadata.overdue) ? metadata.overdue.length : 0)) || 0;
    const upcoming = Number(metadata.upcomingCount ?? (Array.isArray(metadata.upcoming) ? metadata.upcoming.length : 0)) || 0;
    const total = Number(metadata.totalTasks ?? overdue + upcoming) || overdue + upcoming;
    return t('notifications.templates.emailDigest', { total, overdue, upcoming });
  }

  // DUE_SOON: ưu tiên hiển thị count
  if (type === 'DUE_SOON') {
    const count = Number(metadata.upcomingCount ?? metadata.count ?? 0) || 0;
    if (count > 0) return t('notifications.templates.deadlineSoonCount', { count });
    return trimmed;
  }

  // OVERDUE: ưu tiên hiển thị count
  if (type === 'OVERDUE') {
    const count = Number(metadata.overdueCount ?? metadata.count ?? 0) || 0;
    if (count > 0) return t('notifications.templates.overdueCount', { count });
    return trimmed;
  }

  return trimmed;
};