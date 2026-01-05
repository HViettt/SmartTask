import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toastUtils';
import { useTaskStore } from '../../features/taskStore.js';
import { TaskPriority, TaskComplexity, TaskStatus } from '../../types.js';
import { 
  Plus, Search, Sparkles, Loader2, AlertCircle, Check
} from 'lucide-react';
import { TaskCard } from './TaskCard.jsx';
import { AddTaskForm } from './AddTaskForm.jsx';
import { TaskDetailModal } from './TaskDetailModal.jsx';
import { DuplicateTaskModal } from './DuplicateTaskModal.jsx';
import { EmptyState } from '../common/EmptyState.jsx';
import { useI18n } from '../../utils/i18n';

export const TaskList = () => {
  const { 
    tasks, 
    deletedTasks,
    addTask, 
    updateTask, 
    deleteTask, 
    restoreTask,
    fetchTasks, 
    fetchDeletedTasks,
    suggestTasks,
    isLoading, 
    error,
    clearError 
  } = useTaskStore();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateTaskInfo, setDuplicateTaskInfo] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // active | deleted
  const [hasLoadedDeleted, setHasLoadedDeleted] = useState(false);
  
  // State cho Task Detail Modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Ref để scroll đến task
  const taskRefs = useRef({});

  // Fetch tasks on mount only
  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - chỉ chạy 1 lần khi mount

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // Nạp danh sách đã xoá khi người dùng mở tab "Đã xoá"
  useEffect(() => {
    if (activeTab === 'deleted' && !hasLoadedDeleted) {
      fetchDeletedTasks().finally(() => setHasLoadedDeleted(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, hasLoadedDeleted]);
  
  // ✅ Handle highlight param from notification
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get('highlight');
    
    if (highlightId && tasks.length > 0) {
      // Tìm task trong list
      const task = tasks.find(t => t._id === highlightId);
      
      if (task) {
        // Set highlighted state
        setHighlightedTaskId(highlightId);
        
        // Scroll to task sau 300ms để DOM render xong
        setTimeout(() => {
          const taskElement = taskRefs.current[highlightId];
          if (taskElement) {
            taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
        
        // Clear highlight sau 3 giây
        setTimeout(() => {
          setHighlightedTaskId(null);
          // Clear URL param
          navigate('/tasks', { replace: true });
        }, 3000);
      }
    }
  }, [location.search, tasks, navigate]);

  // Form State
  const initialFormState = {
    title: '',
    description: '',
    deadline: new Date().toISOString().split('T')[0],
    deadlineTime: '23:59',
    priority: TaskPriority.MEDIUM,
    complexity: TaskComplexity.MEDIUM,
    notes: '',
    status: TaskStatus.TODO
  };
  const [formData, setFormData] = useState(initialFormState);

  const sourceTasks = activeTab === 'deleted' ? deletedTasks : tasks;

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(sourceTasks)) {
      return [];
    }
    
    return sourceTasks.filter(task => {
      // ✅ Ensure task and task.title exist
      if (!task || !task.title) {
        return false;
      }
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [sourceTasks, filter, searchTerm]);

  // 🔽 Sắp xếp theo yêu cầu:
  // - Chia thành 2 nhóm: chưa hoàn thành (Todo/Doing) ở trên, hoàn thành (Done) ở dưới
  // - Mỗi nhóm đều sắp xếp theo ngày đến hạn (deadline) tăng dần
  const sortedTasks = useMemo(() => {
    if (activeTab === 'deleted') {
      return [...filteredTasks].sort((a, b) => {
        const aTime = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
        const bTime = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
        return bTime - aTime;
      });
    }

    const byDeadlineAsc = (a, b) => {
      const ad = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
      const bd = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
      return ad - bd;
    };

    const unfinished = filteredTasks.filter(t => t.status !== TaskStatus.DONE).sort(byDeadlineAsc);
    const finished = filteredTasks.filter(t => t.status === TaskStatus.DONE).sort(byDeadlineAsc);
    return [...unfinished, ...finished];
  }, [filteredTasks, activeTab]);

  const handleOpenModal = (task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        deadline: typeof task.deadline === 'string' 
          ? task.deadline.split('T')[0] 
          : new Date(task.deadline).toISOString().split('T')[0],
        deadlineTime: task.deadlineTime || '23:59',
        priority: task.priority,
        complexity: task.complexity,
        notes: task.notes || '',
        status: task.status || TaskStatus.TODO
      });
    } else {
      setEditingTask(null);
      setFormData(initialFormState);
    }
    setTitleError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask._id, formData);
        const titleSuffix = updated?.title ? ` "${updated.title}"` : '';
        showToast.success(`${t('tasks.toasts.updated')}${titleSuffix}`);
      } else {
        // Payload already uses correct enum values from types.js (capitalized: 'Medium', 'Todo')
        const payload = {
          title: formData.title,
          description: formData.description,
          // convert date-only value to an ISO timestamp (backend may expect full datetime)
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
          deadlineTime: formData.deadlineTime || '23:59',
          priority: formData.priority,
          complexity: formData.complexity,
          notes: formData.notes,
        };

        const created = await addTask(payload);
        const titleSuffix = created?.title ? ` "${created.title}"` : '';
        showToast.success(`${t('tasks.toasts.created')}${titleSuffix}`);
      }
      setIsModalOpen(false);
      setFormData(initialFormState);
      setEditingTask(null);
      setTitleError('');
    } catch (error) {
      // Extract server message if available for clearer debugging
      const serverMsg = error?.response?.data?.message || error?.response?.data || error?.message;
      const code = error?.response?.data?.code;

      if (code === 'TASK_DUPLICATE') {
        const duplicateMsg = typeof serverMsg === 'string'
          ? serverMsg
          : 'Tiêu đề công việc đã tồn tại trong ngày này.';
        setTitleError(duplicateMsg);
        setDuplicateTaskInfo(error.response?.data?.data);
        setPendingFormData({
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
          priority: formData.priority,
          complexity: formData.complexity,
          notes: formData.notes,
        });
        setIsDuplicateModalOpen(true);
        return;
      }
      // eslint-disable-next-line no-console
      console.error('Failed to save task:', error, serverMsg);
      showToast.error(typeof serverMsg === 'string' ? serverMsg : t('tasks.toasts.saveError'));
    }
  };

  const handleAISuggestion = async () => {
    if (tasks.length === 0) return;
    
    setIsAILoading(true);
    try {
      const result = await suggestTasks();
      
      // ✅ Result has format: { sortedIds: [], reasoning: {} }
      if (result && result.sortedIds && result.reasoning) {
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
        
        // ✅ Show success toast
        showToast.success(`AI đã sắp xếp lại ${reorderedTasks.length} công việc theo độ ưu tiên`);
      } else {
        showToast.info('Không có công việc nào để sắp xếp');
      }
    } catch (error) {
      const errorMsg = error?.message || t('tasks.toasts.aiError');
      showToast.error(errorMsg);
      console.error('AI suggestion error:', error);
    } finally {
      setIsAILoading(false);
    }
  };

  // Auto-rename handler for duplicate task
  const handleAutoRenameTask = async () => {
    if (!pendingFormData || !duplicateTaskInfo) return;

    try {
      // Count existing tasks with similar titles to generate suffix
      const titleBase = pendingFormData.title.trim();
      let counter = 2;
      
      // Keep incrementing until we find a unique title
      while (true) {
        const newTitle = `${titleBase} (${counter})`;
        const isDuplicate = tasks.some(t => 
          t.title.toLowerCase() === newTitle.toLowerCase() &&
          new Date(t.deadline).toDateString() === new Date(pendingFormData.deadline).toDateString()
        );
        if (!isDuplicate) {
          pendingFormData.title = newTitle;
          // Ensure deadlineTime is also sent
          if (!pendingFormData.deadlineTime) {
            pendingFormData.deadlineTime = '23:59';
          }
          break;
        }
        counter++;
      }

      // Retry with renamed title
      const created = await addTask(pendingFormData);
      const titleSuffix = created?.title ? ` "${created.title}"` : '';
      showToast.success(`${t('tasks.toasts.created')}${titleSuffix}`);
      
      // Reset states
      setIsModalOpen(false);
      setFormData(initialFormState);
      setEditingTask(null);
      setTitleError('');
      setIsDuplicateModalOpen(false);
      setDuplicateTaskInfo(null);
      setPendingFormData(null);
    } catch (error) {
      const serverMsg = error?.response?.data?.message || error?.message;
      showToast.error(typeof serverMsg === 'string' ? serverMsg : t('tasks.toasts.saveError'));
    }
  };

  const handleCloseDuplicateModal = () => {
    setIsDuplicateModalOpen(false);
    setDuplicateTaskInfo(null);
    setPendingFormData(null);
    // Keep form and error state so user can edit
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
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${activeTab === 'active'
                ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}
            >
              Công việc đang hoạt động
            </button>
            <button
              onClick={() => setActiveTab('deleted')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${activeTab === 'deleted'
                ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}
            >
              Đã xoá tạm (30 ngày){deletedTasks?.length ? ` · ${deletedTasks.length}` : ''}
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleAISuggestion}
            disabled={isAILoading || tasks.length === 0 || activeTab === 'deleted'}
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
          {sortedTasks.map((task, index) => (
            <div
              key={task._id}
              ref={el => taskRefs.current[task._id] = el}
            >
              <TaskCard
                task={task}
                index={index}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onRestore={restoreTask}
                onEdit={handleOpenModal}
                onViewDetail={(task) => {
                  setSelectedTask(task);
                  setIsDetailModalOpen(true);
                }}
                isHighlighted={highlightedTaskId === task._id}
              />
            </div>
          ))}

          {sortedTasks.length === 0 && !isLoading && (
            <EmptyState
              title={activeTab === 'deleted' ? 'Không có công việc đã xoá' : 'Không có công việc nào'}
              message={
                activeTab === 'deleted'
                  ? 'Bạn chưa xoá công việc nào trong 30 ngày gần đây.'
                  : (filter === 'all' && searchTerm === ''
                      ? 'Bắt đầu bằng cách tạo công việc đầu tiên của bạn'
                      : 'Không tìm thấy công việc phù hợp với tiêu chí lọc')
              }
              onAction={() => handleOpenModal()}
            />
          )}
        </div>
      )}

      {/* Modal Form - Tạo/Sửa Task */}
      <AddTaskForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
          setFormData(initialFormState);
          setTitleError('');
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingTask={editingTask}
        isLoading={isLoading}
        titleError={titleError}
        onTitleChange={(value) => {
          setTitleError('');
          setFormData({ ...formData, title: value });
        }}
      />

      {/* Modal Xem Chi Tiết Task */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onUpdate={updateTask}
      />

      {/* Modal Duplicate Task - Auto Rename Option */}
      <DuplicateTaskModal
        isOpen={isDuplicateModalOpen}
        existingTask={duplicateTaskInfo}
        onRetry={() => {
          // Keep form and error state for manual edit
        }}
        onCancel={handleCloseDuplicateModal}
        onAutoRename={handleAutoRenameTask}
      />
    </div>
  );
};