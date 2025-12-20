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
  Check, Calendar, Trash2, Edit, CheckCircle2, StickyNote, Sparkles
} from 'lucide-react';
import { TaskPriority, TaskComplexity, TaskStatus } from '../../types.js';
import { useI18n } from '../../utils/i18n';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import { isTaskExpired } from '../../utils/deadlineHelpers.js';

export const TaskCard = ({ task, index, onUpdate, onDelete, onEdit, onViewDetail, isHighlighted = false }) => {
  const { t, locale } = useI18n();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    try {
      await onUpdate(task._id, { status: TaskStatus.DONE });
      const titleSuffix = task.title ? ` "${task.title}"` : '';
      showToast.success(`${t('tasks.toasts.statusDone')}${titleSuffix}`);
    } catch (err) {
      showToast.error(t('tasks.toasts.statusError'));
    }
  };

  const handleStart = async () => {
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
      const deletedSuffix = deleted?.title ? ` "${deleted.title}"` : '';
      showToast.success(`${t('tasks.toasts.deleted')}${deletedSuffix}`.trim());
      setShowDeleteConfirm(false);
    } catch (err) {
      showToast.error(t('tasks.toasts.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Main Task Card */}
      <div 
        className={`group relative bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border card-hover ${
          isHighlighted 
            ? 'border-indigo-500 dark:border-indigo-400 ring-4 ring-indigo-100 dark:ring-indigo-900/50 shadow-lg' 
            : task.status === TaskStatus.DONE 
              ? 'border-emerald-100 dark:border-emerald-900/30 opacity-75' 
              : 'border-gray-100 dark:border-gray-700'
        }`}
      >
      {/* AI Reason Badge */}
      {task.aiReasoning && task.status !== TaskStatus.DONE && (
        <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-800 p-3">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 p-1 bg-white dark:bg-gray-800 rounded-md shadow-sm text-violet-600">
                <Sparkles size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wide mb-0.5">
                  {t('tasks.aiSuggest')} #{index + 1}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {task.aiReasoning}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 min-w-0">
              <button 
                onClick={handleToggleComplete}
                className={`mt-1 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.status === TaskStatus.DONE 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 text-transparent'
                }`}
              >
                <Check size={14} strokeWidth={3} />
              </button>
              {/* Clickable area để xem chi tiết task */}
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
                <h3 className={`text-lg font-semibold truncate pr-2 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                  task.status === TaskStatus.DONE 
                    ? 'text-gray-500 line-through decoration-gray-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {task.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {task.description || t('common.noDescription')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
              {/* Badge status - hiển thị trạng thái qua i18n, chỉ hỗ trợ 3 status: todo/doing/done */}
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${statusColors[task.status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}>
              {(() => {
                const statusKey = (task.status || 'Todo').toString().toLowerCase();
                return ['todo', 'doing', 'done'].includes(statusKey) ? t(`statusLabels.${statusKey}`) : task.status;
              })()}
            </span>

            {/* Badge priority - hiển thị độ ưu tiên qua i18n */}
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 ${getPriorityConfig(task.priority).color}`}>
              {t('tasks.form.priority')}: {(() => {
                const priorityKey = (task.priority || 'Medium').toString().toLowerCase();
                return ['high', 'medium', 'low'].includes(priorityKey) ? t(`priorityShort.${priorityKey}`) : task.priority;
              })()}
            </span>

            <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border ${
              (task.computedStatus === 'overdue' || task.status === TaskStatus.OVERDUE || isTaskExpired(task))
                ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                : 'text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600'
            }`}>
              <Calendar size={13} />
              {new Date(task.deadline).toLocaleDateString(locale)} 
              {task.deadlineTime ? ` ${task.deadlineTime}` : ' 23:59'}
            </span>

            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getComplexityConfig(task.complexity).color}`}>
              {t('tasks.form.complexity')}: {t(`complexityLabels.${(task.complexity || '').toString().toLowerCase()}`) || task.complexity}
            </span>
            
            {task.notes && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400" title={task.notes}>
                <StickyNote size={14} />
                <span className="hidden sm:inline max-w-[100px] truncate">{task.notes}</span>
              </div>
            )}
          </div>
          
          {task.completedAt && task.status === TaskStatus.DONE && (
            <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} />
              {t('common.completedAt')}: {new Date(task.completedAt).toLocaleString(locale)}
            </div>
          )}
        </div>

        <div className="flex md:flex-col items-center md:items-end gap-2 mt-4 md:mt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700 pt-3 md:pt-0">
          {/* Action buttons: Start / Complete / Reopen */}
          {task.status === TaskStatus.TODO && (
            <button
              onClick={handleStart}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
            >
              {t('tasks.quick.start')}
            </button>
          )}

          {task.status !== TaskStatus.DONE && (
            <button 
              onClick={handleMarkDone}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 rounded-md transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              <Check size={14} /> {t('tasks.quick.complete')}
            </button>
          )}

          {task.status === TaskStatus.DONE && (
            <button
              onClick={handleRevert}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-md transition-colors border border-yellow-200"
            >
              {t('tasks.quick.reopen')}
            </button>
          )}

          <div className="flex gap-1 w-full md:w-auto">
            <button 
              onClick={() => onEdit(task)}
              className="flex-1 md:flex-none px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={t('common.edit')}
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 md:flex-none px-3 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title={t('common.delete')}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* 🗑️ Confirm Delete Dialog */}
    <ConfirmDialog
      isOpen={showDeleteConfirm}
      title="🗑️ Xoá công việc?"
      message={`Bạn có chắc chắn muốn xoá "${task.title}"? Hành động này không thể hoàn tác.`}
      isDangerous={true}
      confirmText="🗑️ Xoá"
      cancelText="🚫 Hủy"
      isLoading={isDeleting}
      onCancel={() => setShowDeleteConfirm(false)}
      onConfirm={handleDelete}
    />
    </>
  );
};