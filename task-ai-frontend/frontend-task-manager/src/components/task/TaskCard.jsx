/**
 * ============================================================================
 * TASK CARD COMPONENT - HIỂN THỊ CÔNG VIỆC ĐƠN HẠNG
 * ============================================================================
 * Purpose: Hiển thị thông tin chi tiết của một task với các hành động
 * 
 * Props:
 *   - task: Task object - Dữ liệu công việc
 *   - index: number - Vị trí trong danh sách (dùng cho AI suggestion badge)
 *   - onUpdate: function(taskId, updates) - Cập nhật task
 *   - onDelete: function(taskId) - Xoá task
 *   - onEdit: function(task) - Mở form edit
 * 
 * Features:
 *   - Hiển thị status, priority, complexity badges
 *   - Quick action buttons (Complete/Start/Reopen)
 *   - Confirm dialog khi xoá
 *   - Responsive: full width trên mobile, side actions trên desktop
 *   - Dark mode support
 * 
 * Author: UI/UX Improvement
 * Last Updated: December 18, 2025
 * ============================================================================
 */

import React, { useState } from 'react';
import { showToast } from '../../utils/toastUtils';
import { 
  Check, Calendar, Trash2, Edit, CheckCircle2, StickyNote, Sparkles, RotateCcw
} from 'lucide-react';
import { TaskPriority, TaskComplexity, TaskStatus } from '../../types.js';
import { useI18n } from '../../utils/i18n';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import { isTaskExpired } from '../../utils/deadlineHelpers.js';

const RESTORE_WINDOW_DAYS = 30;

export const TaskCard = ({ task, index, onUpdate, onDelete, onRestore, onEdit, onViewDetail, isHighlighted = false }) => {
  const { t, locale } = useI18n();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const isDeleted = !!task?.isDeleted;
  const deletedAtDate = task?.deletedAt ? new Date(task.deletedAt) : null;
  const daysLeft = deletedAtDate
    ? Math.max(0, RESTORE_WINDOW_DAYS - Math.floor((Date.now() - deletedAtDate.getTime()) / (1000 * 60 * 60 * 24)))
    : RESTORE_WINDOW_DAYS;

  const statusColors = {
    [TaskStatus.TODO]: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    [TaskStatus.DOING]: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    [TaskStatus.DONE]: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  };

  const priorityConfig = {
    [TaskPriority.HIGH]: { color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800' },
    [TaskPriority.MEDIUM]: { color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
    [TaskPriority.LOW]: { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    // Also support capitalized versions (backend may return 'High', 'Medium', 'Low')
    High: { color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800' },
    Medium: { color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
    Low: { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  };

  const complexityConfig = {
    [TaskComplexity.HARD]: { color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400' },
    [TaskComplexity.MEDIUM]: { color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400' },
    [TaskComplexity.EASY]: { color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400' },
    // Also support capitalized versions (backend may return 'Hard', 'Medium', 'Easy')
    Hard: { color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400' },
    Medium: { color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400' },
    Easy: { color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400' },
  };

  // Helper to safely get config with fallback
  const getPriorityConfig = (priority) => {
    return priorityConfig[priority] || { color: 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-300', label: priority || 'N/A' };
  };

  const getComplexityConfig = (complexity) => {
    return complexityConfig[complexity] || { color: 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-300', label: complexity || 'N/A' };
  };

  const handleToggleComplete = async () => {
    if (isDeleted) {
      showToast.info('Không thể cập nhật vì công việc đang ở trạng thái xoá tạm.');
      return;
    }
    const newStatus = task.status === TaskStatus.DONE ? TaskStatus.DOING : TaskStatus.DONE;
    try {
      await onUpdate(task._id, { status: newStatus });
      const titleSuffix = task.title ? ` "${task.title}"` : '';
      showToast.success(
        newStatus === TaskStatus.DONE
          ? `${t('tasks.toasts.statusDone')}${titleSuffix}`
          : `${t('tasks.toasts.statusReopen')}${titleSuffix}`
      );
    } catch (err) {
      showToast.error(t('tasks.toasts.statusError'));
    }
  };

  const handleMarkDone = async () => {
    if (isDeleted) {
      showToast.info('Không thể cập nhật vì công việc đang ở trạng thái xoá tạm.');
      return;
    }
    try {
      await onUpdate(task._id, { status: TaskStatus.DONE });
      const titleSuffix = task.title ? ` "${task.title}"` : '';
      showToast.success(`${t('tasks.toasts.statusDone')}${titleSuffix}`);
    } catch (err) {
      showToast.error(t('tasks.toasts.statusError'));
    }
  };

  const handleStart = async () => {
    if (isDeleted) {
      showToast.info('Không thể cập nhật vì công việc đang ở trạng thái xoá tạm.');
      return;
    }
    // Move from Todo -> Doing
    if (task.status === TaskStatus.TODO) {
      try {
        await onUpdate(task._id, { status: TaskStatus.DOING });
        const titleSuffix = task.title ? ` "${task.title}"` : '';
        showToast.success(`${t('tasks.toasts.statusStart')}${titleSuffix}`);
      } catch (err) {
        showToast.error(t('tasks.toasts.statusError'));
      }
    }
  };

  const handleRevert = async () => {
    if (isDeleted) {
      showToast.info(t('tasks.toasts.revertNotice'));
      return;
    }
    // Move from Done -> Doing (reopen)
    if (task.status === TaskStatus.DONE) {
      try {
        await onUpdate(task._id, { status: TaskStatus.DOING });
        const titleSuffix = task.title ? ` "${task.title}"` : '';
        showToast.success(`${t('tasks.toasts.statusReopen')}${titleSuffix}`);
      } catch (err) {
        showToast.error(t('tasks.toasts.statusError'));
      }
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const deleted = await onDelete(task._id);
      const deletedSuffix = deleted?.data?.title || deleted?.title ? ` "${(deleted?.data || deleted)?.title}"` : '';
      const fallbackMsg = locale === 'vi-VN' ? 'Công việc đã được xoá tạm thời trong 30 ngày.' : 'Task shifted to archive temporarily for 30 days.';
      const message = deleted?.message || fallbackMsg;
      showToast.success(`${message}${deletedSuffix}`.trim());
      setShowDeleteConfirm(false);
    } catch (err) {
      showToast.error(t('tasks.toasts.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async () => {
    if (!onRestore) return;
    setIsRestoring(true);
    try {
      const restored = await onRestore(task._id);
      const restoredTitle = restored?.data?.title || restored?.title || task.title;
      const message = restored?.message || t('tasks.toasts.restored');
      const titleSuffix = restoredTitle ? ` "${restoredTitle}"` : '';
      showToast.success(`${message}${titleSuffix}`.trim());
    } catch (err) {
      showToast.error(t('tasks.toasts.restoreError'));
    } finally {
      setIsRestoring(false);
    }
  };
  // Define ribbon color and text contrasts matching priorities
  let ribbonColor = 'bg-brand-medium shadow-[0_0_8px_rgba(245,158,11,0.4)]';
  if (task.priority === TaskPriority.HIGH || task.priority === 'High') {
    ribbonColor = 'bg-brand-high shadow-[0_0_8px_rgba(244,63,94,0.4)]';
  } else if (task.priority === TaskPriority.LOW || task.priority === 'Low') {
    ribbonColor = 'bg-brand-low shadow-[0_0_8px_rgba(16,185,129,0.4)]';
  }

  return (
    <>
      <div 
        className={`group relative glass-panel hover-lift p-5 border transition-all duration-300 select-none overflow-hidden rounded-xl ${
          isHighlighted 
            ? 'border-brand-primary shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
            : task.status === TaskStatus.DONE 
              ? 'border-brand-border/35 opacity-70 hover:opacity-100 shadow-sm' 
              : 'border-brand-border hover:border-brand-primary/40 shadow-sm'
        }`}
      >
        {/* Left vertical ribbon - glowing pill indicator */}
        <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${ribbonColor}`} />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 min-w-0">
              {/* Checkbox button - modern rounded design */}
              <button 
                onClick={handleToggleComplete}
                className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  task.status === TaskStatus.DONE 
                    ? 'bg-brand-low border-brand-low text-white dark:text-brand-card shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                    : 'border-brand-border hover:border-brand-primary text-transparent hover:text-brand-primary bg-brand-base'
                }`}
                aria-label={task.status === TaskStatus.DONE ? "Reopen task" : "Complete task"}
              >
                <Check size={11} strokeWidth={3.5} />
              </button>
              
              {/* Title & Description clickable area */}
              <div 
                className="min-w-0 flex-1 cursor-pointer group"
                onClick={() => onViewDetail && onViewDetail(task)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && onViewDetail) {
                    e.preventDefault();
                    onViewDetail(task);
                  }
                }}
              >
                <h3 className={`text-sm font-bold truncate pr-2 transition-colors group-hover:text-brand-primary uppercase tracking-wide font-sans ${
                  task.status === TaskStatus.DONE 
                    ? 'text-brand-sub line-through decoration-brand-sub' 
                    : 'text-brand-main'
                }`}>
                  {task.title}
                </h3>
                <p className="text-brand-sub text-[10px] mt-1 line-clamp-2 leading-relaxed font-sans">
                  {task.description || t('common.noDescription')}
                </p>
              </div>
            </div>

            {/* Metadata Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pl-8 font-mono text-[8px] uppercase tracking-wider">
              {/* Priority badge */}
              <span className={`px-2.5 py-0.5 rounded-full border font-bold ${
                (task.priority === 'High' || task.priority === TaskPriority.HIGH) ? 'bg-brand-high/10 text-brand-high-text border-brand-high/20 shadow-xs' :
                (task.priority === 'Medium' || task.priority === TaskPriority.MEDIUM) ? 'bg-brand-medium/10 text-brand-medium-text border-brand-medium/20 shadow-xs' :
                'bg-brand-low/10 text-brand-low-text border-brand-low/20 shadow-xs'
              }`}>
                {t('tasks.form.priority')}: {(() => {
                  const priorityKey = (task.priority || 'Medium').toString().toLowerCase();
                  return ['high', 'medium', 'low'].includes(priorityKey) ? t(`priorityShort.${priorityKey}`) : task.priority;
                })()}
              </span>

              {/* Complexity badge */}
              <span className="px-2.5 py-0.5 rounded-full border border-brand-border bg-brand-base text-brand-sub font-semibold">
                {t('tasks.form.complexity')}: {t(`complexityLabels.${(task.complexity || '').toString().toLowerCase()}`) || task.complexity}
              </span>

              {/* Calendar deadline */}
              <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-semibold ${
                (task.computedStatus === 'overdue' || task.status === TaskStatus.OVERDUE || isTaskExpired(task))
                  ? 'text-brand-high-text bg-brand-high/10 border-brand-high/20 shadow-xs'
                  : 'text-brand-sub bg-brand-base border-brand-border shadow-xs'
              }`}>
                <Calendar size={10} strokeWidth={2.2} />
                EXP: {new Date(task.deadline).toLocaleDateString(locale)} 
                {task.deadlineTime ? ` ${task.deadlineTime}` : ' 23:59'}
              </span>
              
              {task.notes && (
                <div className="flex items-center gap-1 text-[8px] text-brand-sub bg-brand-base border border-brand-border px-2.5 py-0.5 rounded-full shadow-xs" title={task.notes}>
                  <StickyNote size={10} />
                  <span className="max-w-[100px] truncate">NOTE: {task.notes}</span>
                </div>
              )}
            </div>

            {/* Deleted Temporary Notice */}
            {isDeleted && (
              <div className="mt-3 ml-8 p-3 border border-brand-medium/20 bg-brand-medium/5 text-brand-medium-text text-[10px] flex flex-col gap-1 font-mono uppercase tracking-wider">
                <span className="font-bold">STATUS: DELETED_TEMPORARY</span>
                <span>RETENTION_TIME: {daysLeft} DAYS REMAINING BEFORE PERMANENT WIPEOUT</span>
                {deletedAtDate && (
                  <span className="text-[8px] opacity-80">TIMESTAMP: {deletedAtDate.toLocaleString(locale)}</span>
                )}
              </div>
            )}
            
            {task.completedAt && task.status === TaskStatus.DONE && (
              <div className="mt-2 ml-8 text-[8px] text-brand-low-text flex items-center gap-1 font-mono uppercase tracking-wider">
                <CheckCircle2 size={10} />
                {t('common.completedAt')}: {new Date(task.completedAt).toLocaleString(locale)}
              </div>
            )}

            {/* Segmented Status Path (Interactive bottom bar) */}
            {!isDeleted && (
              <div className="flex flex-wrap items-center gap-2 text-[8px] font-mono font-bold mt-4 border-t border-brand-border/30 pt-3.5 pl-8">
                <span className="text-brand-sub mr-1 uppercase tracking-widest">// STATUS:</span>
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (task.status !== TaskStatus.TODO) {
                      try {
                        await onUpdate(task._id, { status: TaskStatus.TODO });
                        showToast.success(`${t('tasks.toasts.statusReopen')} "${task.title}"`);
                      } catch (err) {
                        showToast.error(t('tasks.toasts.statusError'));
                      }
                    }
                  }}
                  className={`px-2.5 py-0.5 rounded-full border transition-all duration-300 cursor-pointer ${
                    task.status === TaskStatus.TODO 
                      ? 'bg-brand-high/15 text-brand-high-text border-brand-high shadow-[0_0_8px_rgba(244,63,94,0.15)]' 
                      : 'bg-brand-base/40 border-transparent text-brand-sub hover:border-brand-border hover:text-brand-main'
                  }`}
                >
                  {t('statusLabels.todo')}
                </button>
                <div className="h-[1px] w-1.5 bg-brand-border/40" />
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (task.status !== TaskStatus.DOING) {
                      try {
                        await onUpdate(task._id, { status: TaskStatus.DOING });
                        showToast.success(`${t('tasks.toasts.statusStart')} "${task.title}"`);
                      } catch (err) {
                        showToast.error(t('tasks.toasts.statusError'));
                      }
                    }
                  }}
                  className={`px-2.5 py-0.5 rounded-full border transition-all duration-300 cursor-pointer ${
                    task.status === TaskStatus.DOING 
                      ? 'bg-brand-medium/15 text-brand-medium-text border-brand-medium shadow-[0_0_8px_rgba(245,158,11,0.15)]' 
                      : 'bg-brand-base/40 border-transparent text-brand-sub hover:border-brand-border hover:text-brand-main'
                  }`}
                >
                  {t('statusLabels.doing')}
                </button>
                <div className="h-[1px] w-1.5 bg-brand-border/40" />
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (task.status !== TaskStatus.DONE) {
                      try {
                        await onUpdate(task._id, { status: TaskStatus.DONE });
                        showToast.success(`${t('tasks.toasts.statusDone')} "${task.title}"`);
                      } catch (err) {
                        showToast.error(t('tasks.toasts.statusError'));
                      }
                    }
                  }}
                  className={`px-2.5 py-0.5 rounded-full border transition-all duration-300 cursor-pointer ${
                    task.status === TaskStatus.DONE 
                      ? 'bg-brand-low/15 text-brand-low-text border-brand-low shadow-[0_0_8px_rgba(16,185,129,0.15)]' 
                      : 'bg-brand-base/40 border-transparent text-brand-sub hover:border-brand-border hover:text-brand-main'
                  }`}
                >
                  {t('statusLabels.done')}
                </button>
              </div>
            )}
          </div>

          {/* Action buttons (Right Column) */}
          <div className="flex md:flex-col items-center md:items-end gap-1.5 mt-4 md:mt-0 border-t md:border-t-0 border-brand-border/40 pt-3 md:pt-0 pl-8 md:pl-0 shrink-0 font-mono">
            <div className="flex gap-1.5 w-full md:w-auto">
              {!isDeleted && (
                <>
                  <button 
                    onClick={() => onEdit(task)}
                    className="p-1.5 text-brand-sub hover:bg-brand-base hover:text-brand-primary border border-brand-border bg-brand-card transition-colors rounded-none"
                    title={t('common.edit')}
                  >
                    <Edit size={13} />
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-1.5 text-red-500 hover:bg-brand-high/10 border border-brand-border hover:text-brand-high-text transition-colors rounded-none"
                    title={t('common.delete')}
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}

              {isDeleted && (
                <button
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-brand-low-text bg-brand-low/10 hover:bg-brand-low/20 border border-brand-low/20 transition-colors rounded-none uppercase tracking-wider"
                  title="Khôi phục công việc"
                >
                  <RotateCcw size={11} />
                  {isRestoring ? 'RESTORE...' : 'RESTORE'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={`🗑️ ${t('tasks.confirmDeleteTitle').toUpperCase()}`}
        message={t('tasks.confirmDeleteMessage', { title: task.title.toUpperCase(), days: RESTORE_WINDOW_DAYS })}
        isDangerous={true}
        confirmText={`🗑️ ${t('common.delete').toUpperCase()}`}
        cancelText={`🚫 ${t('common.cancel').toUpperCase()}`}
        isLoading={isDeleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};
