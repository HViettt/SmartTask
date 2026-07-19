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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-base/80 backdrop-blur-xs animate-fadeIn font-sans">
      {/* Modal Container */}
      <div className="bg-brand-card shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-brand-border animate-slideUp hud-border scan-lines">
        
        {/* HUD Tech Corner Tag */}
        <div className="absolute top-2 right-10 text-[7px] font-mono text-brand-sub/40 uppercase tracking-widest">
          [SYS-DETAIL-VIEW-07]
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-base/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-brand-primary text-brand-primary flex items-center justify-center bg-brand-primary/10">
              {isEditMode ? <Edit2 size={14} /> : <CheckCircle2 size={14} />}
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-main">
                {isEditMode ? t('tasks.editTitle') : t('tasks.detailTitle')}
              </h2>
              <p className="text-[8px] text-brand-sub font-mono uppercase tracking-wider mt-0.5">
                {task.createdAt && `INIT_TIME: ${new Date(task.createdAt).toLocaleString(locale)}`}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 border border-brand-border text-brand-sub hover:bg-brand-base hover:text-brand-main transition-colors disabled:opacity-50"
            title={t('common.close')}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
          {!isEditMode ? (
            // ==================== VIEW MODE ====================
            <div className="space-y-5 text-xs">
              {/* Task Title */}
              <div>
                <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1">
                  {t('tasks.form.title').toUpperCase()}
                </label>
                <h3 className="text-sm font-bold uppercase tracking-wide text-brand-main font-sans">
                  {task.title}
                </h3>
              </div>

              {/* Description */}
              {task.description && (
                <div>
                  <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1">
                    {t('tasks.form.description').toUpperCase()}
                  </label>
                  <p className="text-brand-main text-[11px] whitespace-pre-wrap bg-brand-base p-4 border border-brand-border leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Technical Telemetry Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-[9px]">
                {/* Status */}
                <div>
                  <label className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1">
                    <Clock size={11} />
                    {t('tasks.form.status').toUpperCase()}
                  </label>
                  <span className={`inline-flex items-center px-2 py-0.5 border uppercase tracking-wider ${
                    task.status === TaskStatus.DONE || task.status === 'Done' ? 'bg-brand-low/10 text-brand-low-text border-brand-low/20' :
                    task.status === TaskStatus.DOING || task.status === 'Doing' ? 'bg-brand-medium/10 text-brand-medium-text border-brand-medium/20' :
                    'bg-brand-high/10 text-brand-high-text border-brand-high/20'
                  }`}>
                    {statusLabel(task.status)}
                  </span>
                </div>

                {/* Priority */}
                <div>
                  <label className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1">
                    <AlertCircle size={11} />
                    {t('tasks.form.priority').toUpperCase()}
                  </label>
                  <span className={`font-bold uppercase tracking-wider ${
                    toKey(task.priority) === 'high' ? 'text-brand-high-text' :
                    toKey(task.priority) === 'medium' ? 'text-brand-medium-text' : 'text-brand-low-text'
                  }`}>
                    {priorityLabel(task.priority)}
                  </span>
                </div>

                {/* Deadline */}
                <div>
                  <label className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1">
                    <Calendar size={11} />
                    {t('tasks.form.deadline').toUpperCase()}
                  </label>
                  <p className="text-brand-main font-bold uppercase">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString(locale, { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : '--'}
                  </p>
                </div>

                {/* Complexity */}
                <div>
                  <label className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1">
                    <Layers size={11} />
                    {t('tasks.form.complexity').toUpperCase()}
                  </label>
                  <p className="text-brand-main font-bold uppercase tracking-wider">
                    {complexityLabel(task.complexity)}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {task.notes && (
                <div>
                  <label className="flex items-center gap-1 text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1">
                    <StickyNote size={11} />
                    {t('tasks.form.notes').toUpperCase()}
                  </label>
                  <p className="text-[10px] text-brand-medium-text font-bold bg-brand-medium/5 p-4 border border-brand-medium/20 leading-relaxed font-mono uppercase">
                    {task.notes}
                  </p>
                </div>
              )}

              {/* Completed At */}
              {task.completedAt && (
                <div className="bg-brand-low/5 p-4 border border-brand-low/20 font-mono uppercase">
                  <p className="text-[9px] text-brand-low-text flex items-center gap-2">
                    <CheckCircle2 size={12} />
                    <strong>{t('common.completedAt')}:</strong> {new Date(task.completedAt).toLocaleString(locale)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // ==================== EDIT MODE ====================
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              {/* Title */}
              <div>
                <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1">
                  {t('tasks.form.title').toUpperCase()} <span className="text-brand-high font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-brand-border bg-brand-base text-brand-main text-xs outline-none transition-colors rounded-none font-sans"
                  placeholder={t('tasks.form.titlePlaceholder')}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1">
                  {t('tasks.form.description').toUpperCase()}
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-brand-border bg-brand-base text-brand-main text-xs outline-none resize-none transition-colors placeholder-brand-sub/40 rounded-none leading-relaxed font-sans"
                  placeholder={t('tasks.form.descriptionPlaceholder')}
                  disabled={isLoading}
                />
              </div>

              {/* Grid: Priority & Complexity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1">
                    {t('tasks.form.priority').toUpperCase()}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-1.5 border border-brand-border bg-brand-base text-brand-main text-[10px] outline-none transition-colors rounded-none cursor-pointer"
                    disabled={isLoading}
                  >
                    {Object.values(TaskPriority).map(p => (
                      <option key={p} value={p}>{priorityLabel(p)}</option>
                    ))}
                  </select>
                </div>

                {/* Complexity */}
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1">
                    {t('tasks.form.complexity').toUpperCase()}
                  </label>
                  <select
                    value={formData.complexity}
                    onChange={e => setFormData({...formData, complexity: e.target.value})}
                    className="w-full px-3 py-1.5 border border-brand-border bg-brand-base text-brand-main text-[10px] outline-none transition-colors rounded-none cursor-pointer"
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
                  <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1">
                    {t('tasks.form.status').toUpperCase()}
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-1.5 border border-brand-border bg-brand-base text-brand-main text-[10px] outline-none transition-colors rounded-none cursor-pointer"
                    disabled={isLoading}
                  >
                    {Object.values(TaskStatus).map(s => (
                      <option key={s} value={s}>{statusLabel(s)}</option>
                    ))}
                  </select>
                </div>

                {/* Deadline */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1">
                      {t('tasks.form.deadline').toUpperCase()} <span className="text-brand-high font-bold">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={e => setFormData({...formData, deadline: e.target.value})}
                      className="w-full px-2 py-1.5 border border-brand-border bg-brand-base text-brand-main text-[10px] outline-none transition-colors rounded-none"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1">
                      {t('tasks.form.time').toUpperCase()}
                    </label>
                    <input
                      type="time"
                      value={formData.deadlineTime || '23:59'}
                      onChange={e => setFormData({...formData, deadlineTime: e.target.value})}
                      className="w-full px-2 py-1.5 border border-brand-border bg-brand-base text-brand-main text-[10px] outline-none transition-colors rounded-none"
                      disabled={isLoading}
                      title="Giờ hết hạn (mặc định 23:59)"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1">
                  {t('tasks.form.notes').toUpperCase()}
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-brand-border bg-brand-base text-brand-main text-xs outline-none transition-colors placeholder-brand-sub/40 rounded-none font-sans"
                  placeholder={t('tasks.form.notesPlaceholder')}
                  disabled={isLoading}
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-brand-border bg-brand-base/30 flex-shrink-0 font-mono">
          {!isEditMode ? (
            // View Mode
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-[9px] font-bold text-brand-sub hover:text-brand-main bg-brand-card border border-brand-border hover:bg-brand-base transition-colors rounded-none uppercase tracking-wider"
              >
                {t('common.close')}
              </button>
              <button
                onClick={() => setIsEditMode(true)}
                className="px-5 py-2 text-[9px] font-bold text-white dark:text-brand-card bg-brand-primary hover:bg-brand-primary/90 transition-colors flex items-center gap-1.5 rounded-none border border-brand-primary uppercase tracking-wider cursor-pointer"
              >
                <Edit2 size={12} />
                {t('common.edit')}
              </button>
            </>
          ) : (
            // Edit Mode
            <>
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                disabled={isLoading}
                className="px-4 py-2 text-[9px] font-bold text-brand-sub hover:text-brand-main bg-brand-card border border-brand-border hover:bg-brand-base transition-colors disabled:opacity-50 rounded-none uppercase tracking-wider"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-5 py-2 text-[9px] font-bold text-white dark:text-brand-card bg-brand-primary hover:bg-brand-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-50 rounded-none border border-brand-primary uppercase tracking-wider cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save size={12} />
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
