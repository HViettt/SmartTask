import React from 'react';
import { X, Edit, Plus, StickyNote, ArrowRight, Loader2, Save, Sparkles } from 'lucide-react';
import { TaskPriority, TaskComplexity, TaskStatus } from '../../types.js';
import { useI18n } from '../../utils/i18n';
import { AITaskInput } from './AITaskInput';

export const AddTaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  editingTask,
  isLoading,
  titleError,
  onTitleChange
}) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  // Helper: chuẩn hóa và validate key i18n trước khi render
  const toKey = (val) => (val || '').toString().toLowerCase();
  
  // Chỉ render i18n nếu key hợp lệ, fallback về giá trị gốc
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  // Handle AI parsed data
  const handleAIParsed = (parsedData) => {
    
    // Parse deadline ISO string (UTC) into Vietnam local date and time
    let deadlineDate = formData.deadline;
    let deadlineTime = formData.deadlineTime || '23:59';
    
    if (parsedData.deadline) {
      try {
        const date = new Date(parsedData.deadline);
        
        // ⚠️ FIX: Convert UTC to Vietnam timezone (UTC+7) using local time
        // Backend stores in UTC, but form needs local Vietnam time
        const vnOffset = 7 * 60; // Vietnam is UTC+7
        const localDate = new Date(date.getTime() + vnOffset * 60 * 1000);
        
        // Extract YYYY-MM-DD from local time
        const year = localDate.getUTCFullYear();
        const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(localDate.getUTCDate()).padStart(2, '0');
        deadlineDate = `${year}-${month}-${day}`;
        
        // Extract HH:mm from local time
        const hours = String(localDate.getUTCHours()).padStart(2, '0');
        const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
        deadlineTime = `${hours}:${minutes}`;
      } catch (err) {
        // Error parsing deadline, use defaults
      }
    }
    
    setFormData({
      ...formData,
      title: parsedData.title || formData.title,
      description: parsedData.description || formData.description,
      deadline: deadlineDate,
      deadlineTime: deadlineTime,
      priority: parsedData.priority || formData.priority,
      complexity: parsedData.complexity || formData.complexity,
      notes: parsedData.notes || formData.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-brand-base/80 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-lg max-h-[90vh] bg-brand-card border border-brand-border flex flex-col z-10 font-sans hud-border scan-lines">
        {/* HUD Tech Corner Tag */}
        <div className="absolute top-2 right-10 text-[7px] font-mono text-brand-sub/40 uppercase tracking-widest">
          [SYS-TASK-FORM-06]
        </div>

        <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center bg-brand-base/30 flex-shrink-0">
          <h2 className="text-xs font-bold font-display uppercase tracking-widest text-brand-main flex items-center gap-2">
            {editingTask ? (
              <Edit size={14} className="text-brand-primary" />
            ) : (
              <Plus size={14} className="text-brand-primary" />
            )}
            {editingTask ? t('tasks.formTitleEdit') : t('tasks.formTitleCreate')}
          </h2>
          <button 
            onClick={onClose} 
            className="text-brand-sub hover:text-brand-main transition-colors p-1 border border-brand-border bg-brand-card"
            aria-label="Đóng form"
          >
            <X size={14} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          {!editingTask && (
            <div className="mb-2">
              <AITaskInput onParsed={handleAIParsed} />
            </div>
          )}
          <div>
            <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
              {t('tasks.form.title')} <span className="text-brand-high font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => {
                const value = e.target.value;
                if (onTitleChange) {
                  onTitleChange(value);
                } else {
                  setFormData({ ...formData, title: value });
                }
              }}
              className={`w-full px-3 py-2 transition-colors outline-none border text-xs rounded-none font-sans
                ${titleError
                  ? 'border-brand-high bg-brand-high/5 text-brand-high-text'
                  : 'border-brand-border focus:border-brand-primary'}
                bg-brand-base text-brand-main placeholder-brand-sub/40`}
              placeholder={t('tasks.form.titlePlaceholder')}
            />
            {titleError && (
              <p className="mt-1 text-[9px] font-mono font-bold uppercase text-brand-high-text">{titleError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
                {t('tasks.form.deadline')} <span className="text-brand-high font-bold">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={e => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-2 py-1.5 border border-brand-border bg-brand-base text-brand-main text-[10px] font-mono outline-none transition-colors cursor-pointer rounded-none"
                />
                <input
                  type="time"
                  value={formData.deadlineTime || '23:59'}
                  onChange={e => setFormData({...formData, deadlineTime: e.target.value})}
                  className="w-full px-2 py-1.5 border border-brand-border bg-brand-base text-brand-main text-[10px] font-mono outline-none transition-colors cursor-pointer rounded-none"
                  title="Giờ hết hạn (mặc định 23:59)"
                />
              </div>
            </div>
            <div>
              <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
                {t('tasks.form.complexity')}
              </label>
              <div className="relative font-mono">
                <select
                  value={formData.complexity}
                  onChange={e => setFormData({...formData, complexity: e.target.value})}
                  className="w-full px-3 py-1.5 border border-brand-border bg-brand-base text-brand-main text-[10px] appearance-none outline-none transition-colors rounded-none cursor-pointer"
                >
                  {Object.values(TaskComplexity).map(c => (
                    <option key={c} value={c}>{complexityLabel(c)}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-sub">
                  <ArrowRight size={12} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Status select - only when editing a task */}
          {editingTask && (
            <div>
              <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
                {t('tasks.form.status')}
              </label>
              <div className="relative font-mono">
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-1.5 border border-brand-border bg-brand-base text-brand-main text-[10px] appearance-none outline-none transition-colors rounded-none cursor-pointer"
                >
                  {Object.values(TaskStatus).map(s => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-sub">
                  <ArrowRight size={12} className="rotate-90" />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-2">
              {t('tasks.form.priority')}
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono text-[9px]">
              {Object.values(TaskPriority).map(p => (
                <label key={p} className="relative cursor-pointer group">
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={formData.priority === p}
                    onChange={() => setFormData({...formData, priority: p})}
                    className="peer sr-only"
                  />
                  <div className={`text-center py-2 border font-bold uppercase transition-colors rounded-none
                    ${p === TaskPriority.HIGH ? 'peer-checked:bg-brand-high/10 peer-checked:text-brand-high-text peer-checked:border-brand-high' : ''}
                    ${p === TaskPriority.MEDIUM ? 'peer-checked:bg-brand-medium/10 peer-checked:text-brand-medium-text peer-checked:border-brand-medium' : ''}
                    ${p === TaskPriority.LOW ? 'peer-checked:bg-brand-low/10 peer-checked:text-brand-low-text peer-checked:border-brand-low' : ''}
                    ${formData.priority !== p ? 'bg-brand-base border-brand-border text-brand-sub hover:bg-brand-base/80 hover:text-brand-main' : ''}
                  `}>
                    {priorityLabel(p)}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
              {t('tasks.form.description')}
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-brand-border bg-brand-base text-brand-main text-xs resize-none outline-none transition-colors placeholder-brand-sub/40 rounded-none font-sans"
              placeholder={t('tasks.form.descriptionPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5 flex items-center gap-1.5">
              {t('tasks.form.notes')} <StickyNote size={12} className="text-brand-sub/60"/>
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-brand-border bg-brand-base text-brand-main text-xs outline-none transition-colors placeholder-brand-sub/40 rounded-none font-sans"
              placeholder={t('tasks.form.notesPlaceholder')}
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex justify-end gap-2.5 border-t border-brand-border bg-brand-card shrink-0 font-mono">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-[9px] font-bold text-brand-sub hover:text-brand-main bg-brand-card border border-brand-border hover:bg-brand-base transition-colors disabled:opacity-50 flex items-center gap-1.5 rounded-none uppercase tracking-wider"
            >
              <X size={12} /> {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white dark:text-brand-card transition-colors flex items-center gap-1.5 disabled:opacity-50 font-bold text-[9px] uppercase tracking-wider rounded-none border border-brand-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  {t('common.loading')}
                </>
              ) : editingTask ? (
                <>
                  <Save size={12} />
                  {t('common.update')}
                </>
              ) : (
                <>
                  <Plus size={12} />
                  {t('tasks.add')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};