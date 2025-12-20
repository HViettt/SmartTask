// Utility to format notification messages with i18n templates while preserving user content.
export const formatNotificationMessage = (notification, t) => {
  if (!notification) return '';
  const { type, subtype, message = '', metadata = {} } = notification;
  const trimmed = (message || '').toString();

  // Email notification: hiển thị văn bản tĩnh (không count do giới hạn Gmail)
  if (type === 'EMAIL_SENT') {
    // Dùng message từ backend (đã có văn bản phù hợp)
    return trimmed || t('notifications.templates.emailSent');
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