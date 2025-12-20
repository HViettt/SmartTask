import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useI18n } from '../../utils/i18n';
import { formatNotificationMessage } from './notificationMessage';

const formatDateTime = (value, locale) => {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const Pill = ({ label, tone = 'gray' }) => {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700'
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${tones[tone] || tones.gray}`}>
      {label}
    </span>
  );
};

const TaskRow = ({ task, t }) => {
  // Helper: chuẩn hóa key i18n và validate giá trị hợp lệ
  const toKey = (val) => (val || '').toString().toLowerCase();
  
  // Lấy text i18n cho priority (chỉ chấp nhận high/medium/low)
  const priorityKey = toKey(task.priority || 'Medium');
  const priorityText = ['high', 'medium', 'low'].includes(priorityKey) 
    ? t(`priorityLabels.${priorityKey}`) 
    : (task.priority || '—');
  
  // Lấy text i18n cho complexity (chỉ chấp nhận hard/medium/easy)
  const complexityKey = toKey(task.complexity || 'Medium');
  const complexityText = ['hard', 'medium', 'easy'].includes(complexityKey)
    ? t(`complexityLabels.${complexityKey}`)
    : (task.complexity || '—');
  
  // Lấy text i18n cho status (chỉ chấp nhận todo/doing/done)
  const statusKey = toKey(task.status || 'Todo');
  const statusText = ['todo', 'doing', 'done'].includes(statusKey)
    ? t(`statusLabels.${statusKey}`)
    : (task.status || '—');

  return (
    <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Pill label={`${t('notifications.detail.priority')}: ${priorityText}`} tone="amber" />
            <Pill label={`${t('notifications.detail.complexity')}: ${complexityText}`} tone="blue" />
            <Pill label={`${t('notifications.detail.status')}: ${statusText}`} tone="green" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <Clock size={14} />
          <span>{formatDateTime(task.deadline, task.locale)}</span>
        </div>
      </div>
    </div>
  );
};

export const NotificationDetailModal = ({ notification, onClose, onCloseDropdown }) => {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const { title, message, createdAt, taskId, metadata = {}, type, severity = 'info', subtype } = notification;

  const upcoming = Array.isArray(metadata.upcoming) ? metadata.upcoming : [];
  const overdue = Array.isArray(metadata.overdue) ? metadata.overdue : [];
  const hasTask = metadata.task || taskId;
  const iconConfig = {
    deadline: { Icon: AlertCircle, tone: 'red', label: t('notifications.detail.deadline') },
    email: { Icon: Mail, tone: 'blue', label: t('notifications.detail.email') },
    task: { Icon: CheckCircle, tone: 'green', label: t('notifications.detail.task') }
  };
  const { Icon, tone, label } = iconConfig[type] || iconConfig.task;

  // Use i18n system title for header; fall back to backend title
  const headerTitle = (() => {
    if (type === 'email') return t('notifications.systemTitles.emailSent');
    if (type === 'task') return t('notifications.systemTitles.taskCreated');
    if (type === 'task-status') {
      if (subtype === 'deadline-soon') return t('notifications.systemTitles.deadlineSoon');
      if (subtype === 'overdue') return t('notifications.systemTitles.overdue');
      if (subtype === 'completed') return t('notifications.systemTitles.taskCompleted');
    }
    if (type === 'deadline') return t('notifications.systemTitles.deadlineSoon');
    return title;
  })();

  const severityText = t(`notifications.severity.${severity}`) || t('notifications.severity.info');
  const severityTone = severity === 'critical'
    ? 'bg-red-100 text-red-700'
    : severity === 'warn'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-indigo-100 text-indigo-700';

  const goToTask = (id) => {
    navigate(`/tasks?highlight=${id}`);
    onClose();
    // ✅ Close parent dropdown
    if (onCloseDropdown) onCloseDropdown();
  };

  const openGmail = () => {
    const messageLink = metadata.messageId
      ? `https://mail.google.com/mail/u/0/#all/${metadata.messageId}`
      : metadata.threadId
        ? `https://mail.google.com/mail/u/0/#all/${metadata.threadId}`
        : null;
    if (messageLink) {
      window.open(messageLink, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Đóng"
        >
          <X size={18} className="text-gray-600 dark:text-gray-300" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${tone === 'red' ? 'bg-red-100' : tone === 'blue' ? 'bg-blue-100' : 'bg-green-100'}`}>
            <Icon className={tone === 'red' ? 'text-red-600' : tone === 'blue' ? 'text-blue-600' : 'text-green-600'} size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{headerTitle}</h3>
            <span className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${severityTone}`}>
                {severityText}
              </span>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{formatNotificationMessage(notification, t)}</p>

        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
          <Clock size={14} />
            <span>{formatDateTime(createdAt, locale)}</span>
        </div>

        {/* Deadline / Email detail */}
        {(upcoming.length > 0 || overdue.length > 0) && (
          <div className="mt-6 space-y-4">
            {overdue.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pill label={t('notifications.detail.overdue', { count: overdue.length })} tone="red" />
                </div>
                <div className="space-y-3">
                  {overdue.map((task) => (
                    <TaskRow key={task._id || task.title} task={{ ...task, locale }} t={t} />
                  ))}
                </div>
              </div>
            )}

            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pill label={t('notifications.detail.upcoming', { count: upcoming.length })} tone="amber" />
                </div>
                <div className="space-y-3">
                  {upcoming.map((task) => (
                    <TaskRow key={task._id || task.title} task={{ ...task, locale }} t={t} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Task detail */}
        {hasTask && !upcoming.length && !overdue.length && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              <Pill label={t('notifications.detail.taskDetail')} tone="blue" />
            </div>
            <TaskRow task={{ ...(metadata.task || { _id: taskId }), locale }} t={t} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('common.close')}
          </button>
          {metadata.messageId && (
            <button
              onClick={openGmail}
              className="px-4 py-2 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              {t('notifications.detail.openEmail')}
            </button>
          )}
          {(taskId || hasTask) && (
            <button
              onClick={() => goToTask(taskId || metadata.task?._id)}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              {t('notifications.detail.openTask')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
