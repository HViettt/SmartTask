/**
 * ============================================================================
 * TASK DETAIL MODAL - XEM & CHỈNH SỬA CHI TIẾT CÔNG VIỆC
 * ============================================================================
 * Purpose: Modal hiển thị chi tiết task với 2 modes: View và Edit
 * 
 * Props:
 *   - isOpen: boolean - Trạng thái hiển thị modal
 *   - onClose: function - Đóng modal
 *   - task: Task object - Dữ liệu công việc
 *   - onUpdate: function(taskId, updates) - Cập nhật task
 * 
 * Modes:
 *   1. View Mode: Hiển thị thông tin chi tiết (read-only)
 *   2. Edit Mode: Form chỉnh sửa (giống AddTaskForm)
 * 
 * Features:
 *   - Toggle giữa View và Edit mode
 *   - Loading state khi save
 *   - Toast notification khi thành công/lỗi
 *   - Responsive: full screen trên mobile, modal trên desktop
 *   - Dark mode support
 *   - Keyboard shortcuts: ESC để đóng
 * 
 * Author: UI/UX Improvement - Task Detail View
 * Last Updated: December 18, 2025
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Calendar, AlertCircle, Layers, StickyNote, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { showToast } from '../../utils/toastUtils';
import { TaskPriority, TaskComplexity, TaskStatus } from '../../types.js';
import { useI18n } from '../../utils/i18n';

export const TaskDetailModal = ({ isOpen, onClose, task, onUpdate }) => {
  const { t, locale } = useI18n();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    complexity: TaskComplexity.MEDIUM,
    status: TaskStatus.TODO,
    deadline: '',    deadlineTime: '23:59',    notes: ''
  });

  // Sync form data khi task thay đổi
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || TaskPriority.MEDIUM,
        complexity: task.complexity || TaskComplexity.MEDIUM,
        status: task.status || TaskStatus.TODO,
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        deadlineTime: task.deadlineTime || '23:59',
        notes: task.notes || ''
      });
    }
  }, [task]);

  // Reset edit mode khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setIsEditMode(false);
    }
  }, [isOpen]);

  // Keyboard shortcut: ESC để đóng
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const handleClose = () => {
    if (isLoading) return; // Không cho đóng khi đang save
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showToast.error(t('tasks.errors.titleRequired'));
      return;
    }

    if (!formData.deadline) {
      showToast.error(t('tasks.errors.deadlineRequired'));
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(task._id, formData);
      showToast.success(t('tasks.success.updated'));
      setIsEditMode(false); // Quay về view mode sau khi save
    } catch (error) {
      showToast.error(t('tasks.errors.updateFailed'));
      console.error('Update task error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Normalize key để render i18n
  const toKey = (val) => (val || '').toString().toLowerCase();
  const priorityLabel = (p) => {
    const key = toKey(p);
    return ['high', 'medium', 'low'].includes(key) ? t(`priorityLabels.${key}`) : p;
  };
  const complexityLabel = (c) => {
    const key = toKey(c);
    return ['hard', 'medium', 'easy'].includes(key) ? t(`complexityLabels.${key}`) : c;
  };
  const statusLabel = (s) => {
    const key = toKey(s);
    return ['todo', 'doing', 'done'].includes(key) ? t(`statusLabels.${key}`) : s;
  };

  // Status badge color
  const statusColors = {
    todo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
    doing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300',
    done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300'
  };

  const priorityColors = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-orange-600 dark:text-orange-400',
    low: 'text-blue-600 dark:text-blue-400'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              {isEditMode ? <Edit2 className="text-white" size={20} /> : <CheckCircle2 className="text-white" size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? t('tasks.editTitle') : t('tasks.detailTitle')}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {task.createdAt && `${t('common.created')}: ${new Date(task.createdAt).toLocaleDateString(locale)}`}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!isEditMode ? (
            // ==================== VIEW MODE ====================
            <div className="space-y-6">
              {/* Tiêu đề Task */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('tasks.form.title')}
                </label>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {task.title}
                </h3>
              </div>

              {/* Mô tả */}
              {task.description && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('tasks.form.description')}
                  </label>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Thông tin Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Clock size={16} />
                    {t('tasks.form.status')}
                  </label>
                  <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${statusColors[toKey(task.status)] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                    {statusLabel(task.status)}
                  </span>
                </div>

                {/* Priority */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <AlertCircle size={16} />
                    {t('tasks.form.priority')}
                  </label>
                  <span className={`text-base font-semibold ${priorityColors[toKey(task.priority)] || 'text-gray-700'}`}>
                    {priorityLabel(task.priority)}
                  </span>
                </div>

                {/* Deadline */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar size={16} />
                    {t('tasks.form.deadline')}
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString(locale, { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : '--'}
                  </p>
                </div>

                {/* Complexity */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Layers size={16} />
                    {t('tasks.form.complexity')}
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {complexityLabel(task.complexity)}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {task.notes && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <StickyNote size={16} />
                    {t('tasks.form.notes')}
                  </label>
                  <p className="text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    {task.notes}
                  </p>
                </div>
              )}

              {/* Completed At */}
              {task.completedAt && (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <strong>{t('common.completedAt')}:</strong> {new Date(task.completedAt).toLocaleString(locale)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // ==================== EDIT MODE ====================
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tiêu đề */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('tasks.form.title')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none"
                  placeholder={t('tasks.form.titlePlaceholder')}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('tasks.form.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none resize-none"
                  placeholder={t('tasks.form.descriptionPlaceholder')}
                  disabled={isLoading}
                />
              </div>

              {/* Grid: Priority & Complexity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('tasks.form.priority')}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none"
                    disabled={isLoading}
                  >
                    {Object.values(TaskPriority).map(p => (
                      <option key={p} value={p}>{priorityLabel(p)}</option>
                    ))}
                  </select>
                </div>

                {/* Complexity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('tasks.form.complexity')}
                  </label>
                  <select
                    value={formData.complexity}
                    onChange={e => setFormData({...formData, complexity: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none"
                    disabled={isLoading}
                  >
                    {Object.values(TaskComplexity).map(c => (
                      <option key={c} value={c}>{complexityLabel(c)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid: Status & Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('tasks.form.status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none"
                    disabled={isLoading}
                  >
                    {Object.values(TaskStatus).map(s => (
                      <option key={s} value={s}>{statusLabel(s)}</option>
                    ))}
                  </select>
                </div>

                {/* Deadline */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('tasks.form.deadline')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={e => setFormData({...formData, deadline: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('tasks.form.time') || 'Giờ'}
                    </label>
                    <input
                      type="time"
                      value={formData.deadlineTime || '23:59'}
                      onChange={e => setFormData({...formData, deadlineTime: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none"
                      disabled={isLoading}
                      title="Giờ hết hạn (mặc định 23:59)"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('tasks.form.notes')}
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none"
                  placeholder={t('tasks.form.notesPlaceholder')}
                  disabled={isLoading}
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          {!isEditMode ? (
            // View Mode: Button "Chỉnh sửa"
            <>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                {t('common.close')}
              </button>
              <button
                onClick={() => setIsEditMode(true)}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Edit2 size={16} />
                {t('common.edit')}
              </button>
            </>
          ) : (
            // Edit Mode: Button "Hủy" và "Lưu"
            <>
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {t('common.save')}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
