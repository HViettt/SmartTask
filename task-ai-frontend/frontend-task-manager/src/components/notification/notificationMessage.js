// Utility to format notification messages with i18n templates while preserving user content.
export const formatNotificationMessage = (notification, t) => {
  if (!notification) return '';
  const { type, subtype, message = '', metadata = {} } = notification;
  const trimmed = (message || '').toString();

  // Email digest: use counts when available
  if (type === 'email') {
    const overdue = Number(metadata.overdueCount ?? (Array.isArray(metadata.overdue) ? metadata.overdue.length : 0)) || 0;
    const upcoming = Number(metadata.upcomingCount ?? (Array.isArray(metadata.upcoming) ? metadata.upcoming.length : 0)) || 0;
    const total = Number(metadata.totalTasks ?? overdue + upcoming) || overdue + upcoming;
    return t('notifications.templates.emailDigest', { total, overdue, upcoming });
  }

  // Task created: attempt to split system suffix from user title; fall back to original
  if (type === 'task') {
    const viMatch = trimmed.match(/^(.*?)(\s+đã được thêm vào danh sách của bạn)$/i);
    const enMatch = trimmed.match(/^(.*?)(\s+has been added to your list)$/i);
    const taskTitle = (viMatch ? viMatch[1] : enMatch ? enMatch[1] : '').trim();
    if (taskTitle) return `${taskTitle} ${t('notifications.templates.addedToList')}`;
    return trimmed;
  }

  // Task status notifications with counts
  if (type === 'task-status') {
    const count = Number(metadata.count ?? metadata.upcomingCount ?? metadata.overdueCount ?? 0) || 0;
    if (subtype === 'deadline-soon' && count > 0) {
      return t('notifications.templates.deadlineSoonCount', { count });
    }
    if (subtype === 'overdue' && count > 0) {
      return t('notifications.templates.overdueCount', { count });
    }
    if (subtype === 'completed') {
      const viMatch = trimmed.match(/^(.*?)(\s+đã hoàn thành)$/i);
      const enMatch = trimmed.match(/^(.*?)(\s+has been completed)$/i);
      const taskTitle = (viMatch ? viMatch[1] : enMatch ? enMatch[1] : '').trim();
      if (taskTitle) return `${taskTitle} ${t('notifications.templates.taskCompletedSuffix')}`;
    }
    return trimmed;
  }

  // Deadline catch-all
  if (type === 'deadline') {
    const count = Number(metadata.count ?? metadata.upcomingCount ?? metadata.overdueCount ?? 0) || 0;
    if (count > 0) return t('notifications.templates.deadlineSoonCount', { count });
  }

  return trimmed;
};