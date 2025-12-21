import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, AlertCircle, Clock } from 'lucide-react';
import { useI18n } from '../../utils/i18n';
import { parseDeadlineDateTime } from '../../utils/deadlineHelpers';
import { useDeadlineStats } from '../../hooks/useDeadlineStats';

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
    blue: 'bg-blue-100 text-blue-700'
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${tones[tone] || tones.gray}`}>
      {label}
    </span>
  );
};

const TaskRow = ({ task, onOpen, locale }) => {
  const dateObj = parseDeadlineDateTime(task.deadline, task.deadlineTime || '23:59');
  const display = dateObj
    ? dateObj.toLocaleString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';
  return (
    <div
      className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-indigo-300 hover:shadow-sm transition"
      onClick={() => onOpen && onOpen(task._id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <Clock size={14} />
          <span>{display}</span>
        </div>
      </div>
    </div>
  );
};

export const NotificationDetailModal = ({ notification, onClose, onCloseDropdown }) => {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const { overdueTasks, dueSoonTasks } = useDeadlineStats();

  const { title, createdAt, lastTriggeredAt, type, severity = 'info' } = notification || {};

  const iconConfig = {
    EMAIL_SENT: { Icon: Mail, tone: 'blue', label: t('notifications.detail.email') },
    DUE_SOON: { Icon: AlertCircle, tone: 'amber', label: t('notifications.detail.deadline') },
    OVERDUE: { Icon: AlertCircle, tone: 'red', label: t('notifications.detail.deadline') }
  };
  const { Icon, tone, label } = iconConfig[type] || iconConfig.EMAIL_SENT;

  const headerTitle = (() => {
    if (type === 'EMAIL_SENT') return t('notifications.systemTitles.emailSent');
    if (type === 'DUE_SOON') return t('notifications.systemTitles.deadlineSoon');
    if (type === 'OVERDUE') return t('notifications.systemTitles.overdue');
    return title;
  })();

  const severityText = t(`notifications.severity.${severity}`) || t('notifications.severity.info');
  const severityTone = severity === 'critical'
    ? 'bg-red-100 text-red-700'
    : (severity === 'warn' || severity === 'warning')
      ? 'bg-amber-100 text-amber-700'
      : 'bg-indigo-100 text-indigo-700';

  const goToTask = (id) => {
    if (!id) return;
    navigate(`/tasks?highlight=${id}`);
    onClose();
    if (onCloseDropdown) onCloseDropdown();
  };

  const openGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  const renderBody = () => {
    if (type === 'EMAIL_SENT') {
      return (
        <div className="space-y-3">
          <Pill label={t('notifications.detail.email')} tone="blue" />
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('notifications.systemTitles.emailSent')}
          </p>
          <button
            onClick={openGmail}
            className="px-4 py-2 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/40 transition-colors"
          >
            📧 Mở Gmail
          </button>
        </div>
      );
    }

    if (type === 'OVERDUE') {
      return (
        <div className="space-y-3">
          <Pill label={t('notifications.detail.overdue', { count: overdueTasks.length })} tone="red" />
          <div className="max-h-96 overflow-y-auto space-y-3">
            {overdueTasks.map(task => (
              <TaskRow key={task._id || task.title} task={task} onOpen={goToTask} locale={locale} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <Pill label={t('notifications.detail.upcoming', { count: dueSoonTasks.length })} tone="amber" />
        <div className="max-h-96 overflow-y-auto space-y-3">
          {dueSoonTasks.map(task => (
            <TaskRow key={task._id || task.title} task={task} onOpen={goToTask} locale={locale} />
          ))}
        </div>
      </div>
    );
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
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
            tone === 'red'
              ? 'bg-red-100'
              : tone === 'blue'
                ? 'bg-blue-100'
                : 'bg-amber-100'
          }`}>
            <Icon className={tone === 'red' ? 'text-red-600' : tone === 'blue' ? 'text-blue-600' : 'text-amber-600'} size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{headerTitle}</h3>
            <span className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${severityTone}`}>
              {severityText}
            </span>
          </div>
        </div>

        {renderBody()}

        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
          <Clock size={14} />
          <span>{formatDateTime(lastTriggeredAt || createdAt, locale)}</span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
