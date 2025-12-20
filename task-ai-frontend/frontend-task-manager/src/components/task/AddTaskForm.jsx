import React from 'react';
import { X, Edit, Plus, StickyNote, ArrowRight, Loader2, Save, Sparkles } from 'lucide-react';
import { TaskPriority, TaskComplexity, TaskStatus } from '../../types.js';
import { useI18n } from '../../utils/i18n';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {editingTask ? (
              <Edit size={20} className="text-blue-600" />
            ) : (
              <Plus size={20} className="text-blue-600" />
            )}
            {editingTask ? t('tasks.formTitleEdit') : t('tasks.formTitleCreate')}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              {t('tasks.form.title')} <span className="text-red-500">*</span>
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
              className={`w-full px-4 py-2.5 rounded-lg transition-all outline-none border
                ${titleError
                  ? 'border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-300 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'}
                dark:bg-gray-900 dark:text-white`}
              placeholder={t('tasks.form.titlePlaceholder')}
            />
            {titleError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{titleError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {t('tasks.form.deadline')} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none"
              />
              <input
                type="time"
                value={formData.deadlineTime || '23:59'}
                onChange={e => setFormData({...formData, deadlineTime: e.target.value})}
                className="w-full mt-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none"
                title="Giờ hết hạn (mặc định 23:59)"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {t('tasks.form.complexity')}
              </label>
              <div className="relative">
                <select
                  value={formData.complexity}
                  onChange={e => setFormData({...formData, complexity: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white appearance-none outline-none"
                >
                  {Object.values(TaskComplexity).map(c => (
                    <option key={c} value={c}>{complexityLabel(c)}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ArrowRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Status select - only when editing a task */}
          {editingTask && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {t('tasks.form.status')}
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white appearance-none outline-none"
                >
                  {Object.values(TaskStatus).map(s => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ArrowRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('tasks.form.priority')}
            </label>
            <div className="grid grid-cols-3 gap-3">
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
                  <div className={`text-center py-2.5 rounded-lg text-sm font-medium transition-all border
                    peer-checked:ring-2 peer-checked:ring-offset-1 dark:peer-checked:ring-offset-gray-800
                    ${p === TaskPriority.HIGH ? 'peer-checked:bg-red-50 peer-checked:text-red-700 peer-checked:border-red-200 peer-checked:ring-red-500' : ''}
                    ${p === TaskPriority.MEDIUM ? 'peer-checked:bg-orange-50 peer-checked:text-orange-700 peer-checked:border-orange-200 peer-checked:ring-orange-500' : ''}
                    ${p === TaskPriority.LOW ? 'peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-checked:border-blue-200 peer-checked:ring-blue-500' : ''}
                    ${formData.priority !== p ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
                  `}>
                    {priorityLabel(p)}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              {t('tasks.form.description')}
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white resize-none outline-none"
              placeholder={t('tasks.form.descriptionPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
              {t('tasks.form.notes')} <StickyNote size={14} className="text-gray-400"/>
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none"
              placeholder={t('tasks.form.notesPlaceholder')}
            />
          </div>

          {/* 📌 Nút hành động - Chuẩn hóa UI, thêm visual feedback */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <X size={16} /> {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isLoading ? (
                <>
                  {/* Hiển thị 1 icon loading duy nhất khi submit */}
                  <Loader2 size={16} className="animate-spin" />
                  {t('common.loading')}
                </>
              ) : editingTask ? (
                <>
                  <Save size={16} />
                  {t('common.update')}
                </>
              ) : (
                <>
                  <Sparkles size={16} />
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