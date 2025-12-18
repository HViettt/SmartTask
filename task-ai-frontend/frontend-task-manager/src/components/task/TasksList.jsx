import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useTaskStore } from '../../features/taskStore.js';
import { TaskPriority, TaskComplexity, TaskStatus } from '../../types.js';
import { 
  Plus, Search, Sparkles, Loader2, AlertCircle, Check
} from 'lucide-react';
import { TaskCard } from './TaskCard.jsx';
import { AddTaskForm } from './AddTaskForm.jsx';
import { EmptyState } from '../common/EmptyState.jsx';
import { useI18n } from '../../utils/i18n';

export const TaskList = () => {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    fetchTasks, 
    suggestTasks,
    isLoading, 
    error,
    clearError 
  } = useTaskStore();
  const { t } = useI18n();
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isAILoading, setIsAILoading] = useState(false);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Form State
  const initialFormState = {
    title: '',
    description: '',
    deadline: new Date().toISOString().split('T')[0],
    priority: TaskPriority.MEDIUM,
    complexity: TaskComplexity.MEDIUM,
    notes: '',
    status: TaskStatus.TODO
  };
  const [formData, setFormData] = useState(initialFormState);

  const filteredTasks = useMemo(() => {
    // ✅ Ensure tasks is an array
    if (!Array.isArray(tasks)) {
      return [];
    }
    
    return tasks.filter(task => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, searchTerm]);

  const handleOpenModal = (task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        deadline: typeof task.deadline === 'string' 
          ? task.deadline.split('T')[0] 
          : new Date(task.deadline).toISOString().split('T')[0],
        priority: task.priority,
        complexity: task.complexity,
        notes: task.notes || '',
        status: task.status || TaskStatus.TODO
      });
    } else {
      setEditingTask(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask._id, formData);
        const titleSuffix = updated?.title ? ` "${updated.title}"` : '';
        toast.success(`${t('tasks.toasts.updated')}${titleSuffix}`, { duration: 3000 });
      } else {
        // Payload already uses correct enum values from types.js (capitalized: 'Medium', 'Todo')
        const payload = {
          title: formData.title,
          description: formData.description,
          // convert date-only value to an ISO timestamp (backend may expect full datetime)
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
          priority: formData.priority,
          complexity: formData.complexity,
          notes: formData.notes,
        };

        // Debugging: log payload sent to backend
        // eslint-disable-next-line no-console
        console.info('Submitting task payload:', payload);

        const created = await addTask(payload);
        const titleSuffix = created?.title ? ` "${created.title}"` : '';
        toast.success(`${t('tasks.toasts.created')}${titleSuffix}`, { duration: 3000 });
      }
      setIsModalOpen(false);
      setFormData(initialFormState);
      setEditingTask(null);
    } catch (error) {
      // Extract server message if available for clearer debugging
      const serverMsg = error?.response?.data?.message || error?.response?.data || error?.message;
      // eslint-disable-next-line no-console
      console.error('Failed to save task:', error, serverMsg);
      toast.error(typeof serverMsg === 'string' ? serverMsg : t('tasks.toasts.saveError'), { duration: 4000 });
    }
  };

  const handleAISuggestion = async () => {
    if (tasks.length === 0) return;
    
    setIsAILoading(true);
    try {
      const result = await suggestTasks();
      
      // Assuming result has format: { sortedIds: [], reasoning: {} }
      if (result.sortedIds && result.reasoning) {
        const { sortedIds, reasoning } = result;
        
        // Reorder tasks based on AI suggestion
        const taskMap = new Map(tasks.map(t => [t._id, t]));
        const reorderedTasks = sortedIds
          .map(id => taskMap.get(id))
          .filter(Boolean)
          .map(task => ({
            ...task,
            aiReasoning: reasoning[task._id] || undefined
          }));
        
        // Add tasks that weren't in sortedIds
        const remainingTasks = tasks
          .filter(t => !sortedIds.includes(t._id))
          .map(t => ({ ...t, aiReasoning: undefined }));
        
        useTaskStore.setState({ 
          tasks: [...reorderedTasks, ...remainingTasks] 
        });
      }
    } catch (error) {
      toast.error(t('tasks.toasts.aiError'));
      console.error('AI suggestion error:', error);
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('tasks.headerTitle')}
          </h1>
          <p className="text-gray-500 text-sm">{t('tasks.headerSubtitle')}</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleAISuggestion}
            disabled={isAILoading || tasks.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg transition-all disabled:opacity-70 shadow-md hover:shadow-lg border border-transparent"
          >
            {isAILoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Sparkles size={18} />
            )}
            <span className="hidden sm:inline font-medium">{t('tasks.aiSuggest')}</span>
          </button>
          
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm font-medium"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">{t('tasks.add')}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['all', TaskStatus.TODO, TaskStatus.DOING, TaskStatus.DONE].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                filter === s
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-white text-gray-600 border-transparent hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {/* Hiển thị filter label qua i18n, chỉ chấp nhận all/todo/doing/done */}
              {s === 'all' ? t('tasks.filterAll') : (() => {
                const key = s.toLowerCase();
                return ['todo', 'doing', 'done'].includes(key) ? t(`statusLabels.${key}`) : s;
              })()}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && tasks.length === 0 ? (
        <div className="py-20 flex justify-center text-blue-600">
          <Loader2 className="animate-spin" size={40} />
        </div>
      ) : (
        /* Task List Grid */
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task, index) => (
            <TaskCard
              key={task._id}
              task={task}
              index={index}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onEdit={handleOpenModal}
            />
          ))}

          {filteredTasks.length === 0 && !isLoading && (
            <EmptyState
              title="Không có công việc nào"
              message={
                filter === 'all' && searchTerm === ''
                  ? 'Bắt đầu bằng cách tạo công việc đầu tiên của bạn'
                  : 'Không tìm thấy công việc phù hợp với tiêu chí lọc'
              }
              onAction={() => handleOpenModal()}
            />
          )}
        </div>
      )}

      {/* Modal Form */}
      <AddTaskForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
          setFormData(initialFormState);
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingTask={editingTask}
        isLoading={isLoading}
      />
    </div>
  );
};