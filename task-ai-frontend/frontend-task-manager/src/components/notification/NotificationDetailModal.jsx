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
    gray: 'bg-brand-base border border-brand-border text-brand-sub',
    red: 'bg-brand-high/10 border border-brand-high/20 text-brand-high-text',
    amber: 'bg-brand-medium/10 border border-brand-medium/20 text-brand-medium-text',
    blue: 'bg-brand-primary/10 border border-brand-primary/20 text-brand-primary-text'
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 border text-[8px] font-mono font-bold uppercase tracking-wider rounded-none ${tones[tone] || tones.gray}`}>
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
      className="p-3 bg-brand-base border border-brand-border cursor-pointer hover:border-brand-primary/45 transition-colors font-sans text-xs rounded-none"
      onClick={() => onOpen && onOpen(task._id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold uppercase tracking-wide text-brand-main">{task.title}</p>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-brand-sub font-mono">
          <Clock size={11} />
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
    ? 'bg-brand-high/10 text-brand-high-text border border-brand-high/20'
    : (severity === 'warn' || severity === 'warning')
      ? 'bg-brand-medium/10 text-brand-medium-text border border-brand-medium/20'
      : 'bg-brand-primary/10 text-brand-primary-text border border-brand-primary/20';

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
        <div className="space-y-3 font-mono">
          <Pill label={t('notifications.detail.email')} tone="blue" />
          <p className="text-brand-sub text-[10px] leading-relaxed uppercase tracking-wider">
            {t('notifications.systemTitles.emailSent')}
          </p>
          <button
            onClick={openGmail}
            className="px-3.5 py-1.5 text-[9px] font-bold text-brand-primary-text bg-brand-primary/10 border border-brand-primary hover:bg-brand-primary/20 transition-all rounded-none uppercase tracking-wider"
          >
            📧 {t('notifications.detail.openEmail').toUpperCase()}
          </button>
        </div>
      );
    }

    if (type === 'OVERDUE') {
      return (
        <div className="space-y-3 font-mono">
          <Pill label={t('notifications.detail.overdue', { count: overdueTasks.length })} tone="red" />
          <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin pr-1">
            {overdueTasks.map(task => (
              <TaskRow key={task._id || task.title} task={task} onOpen={goToTask} locale={locale} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 font-mono">
        <Pill label={t('notifications.detail.upcoming', { count: dueSoonTasks.length })} tone="amber" />
        <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin pr-1">
          {dueSoonTasks.map(task => (
            <TaskRow key={task._id || task.title} task={task} onOpen={goToTask} locale={locale} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-base/80 backdrop-blur-xs px-4 font-sans text-xs">
      <div className="relative w-full max-w-2xl bg-brand-card border border-brand-border p-6 animate-in fade-in zoom-in-95 duration-150 z-10 hud-border scan-lines">
        {/* HUD Corner Tag */}
        <div className="absolute top-2 right-10 text-[7px] font-mono text-brand-sub/40 uppercase tracking-widest">[SYS-ALERT-DETAIL-10]</div>
        
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 border border-brand-border bg-brand-card text-brand-sub hover:text-brand-main transition-colors"
          aria-label="Đóng"
        >
          <X size={14} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 border flex items-center justify-center rounded-none ${
            tone === 'red'
              ? 'bg-brand-high/10 border-brand-high/20'
              : tone === 'blue'
                ? 'bg-brand-primary/10 border-brand-primary/20'
                : 'bg-brand-medium/10 border-brand-medium/20'
          }`}>
            <Icon className={tone === 'red' ? 'text-brand-high-text' : tone === 'blue' ? 'text-brand-primary-text' : 'text-brand-medium-text'} size={14} />
          </div>
          <div>
            <p className="text-[8px] font-mono font-bold text-brand-sub uppercase tracking-wider">{label}</p>
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-main mt-0.5 font-sans">{headerTitle}</h3>
            <span className={`inline-flex mt-1.5 px-2 py-0.5 text-[8px] font-bold font-mono uppercase border rounded-none ${severityTone}`}>
              {severityText}
            </span>
          </div>
        </div>

        {renderBody()}

        <div className="flex items-center gap-1 mt-4 text-[9px] text-brand-sub font-mono uppercase tracking-wider">
          <Clock size={11} className="opacity-70" />
          <span>TIMESTAMP: {formatDateTime(lastTriggeredAt || createdAt, locale)}</span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 shrink-0 font-mono">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[9px] font-bold text-brand-sub hover:text-brand-main bg-brand-card border border-brand-border hover:bg-brand-base transition-colors rounded-none uppercase tracking-wider"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
