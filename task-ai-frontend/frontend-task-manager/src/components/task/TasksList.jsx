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
    isLoading, 
    error,
    clearError 
  } = useTaskStore();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

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
  const [sortBy, setSortBy] = useState('deadline');
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, sortBy, activeTab]);
  
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
  // - Mỗi nhóm đều sắp xếp theo tiêu chí được chọn (deadline, priority, hoặc complexity)
  const sortedTasks = useMemo(() => {
    if (activeTab === 'deleted') {
      return [...filteredTasks].sort((a, b) => {
        const aTime = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
        const bTime = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
        return bTime - aTime;
      });
    }

    const priorityWeight = {
      [TaskPriority.HIGH]: 3,
      [TaskPriority.MEDIUM]: 2,
      [TaskPriority.LOW]: 1,
      'High': 3,
      'Medium': 2,
      'Low': 1
    };

    const complexityWeight = {
      [TaskComplexity.HARD]: 3,
      [TaskComplexity.MEDIUM]: 2,
      [TaskComplexity.EASY]: 1,
      'Hard': 3,
      'Medium': 2,
      'Easy': 1
    };

    const sortFn = (a, b) => {
      if (sortBy === 'priority') {
        const wa = priorityWeight[a.priority] || 0;
        const wb = priorityWeight[b.priority] || 0;
        return wb - wa; // Highest priority first
      }
      if (sortBy === 'complexity') {
        const wa = complexityWeight[a.complexity] || 0;
        const wb = complexityWeight[b.complexity] || 0;
        return wb - wa; // Hardest first
      }
      // default: deadline
      const ad = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
      const bd = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
      return ad - bd;
    };

    const unfinished = filteredTasks.filter(t => t.status !== TaskStatus.DONE).sort(sortFn);
    const finished = filteredTasks.filter(t => t.status === TaskStatus.DONE).sort(sortFn);
    return [...unfinished, ...finished];
  }, [filteredTasks, activeTab, sortBy]);

  const totalPages = Math.ceil(sortedTasks.length / ITEMS_PER_PAGE);

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedTasks, currentPage]);

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
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-brand-border pb-4">
        <div>
          <h1 className="text-xl font-bold font-display uppercase tracking-widest text-brand-main">
            {t('tasks.headerTitle')}
          </h1>
          <p className="text-brand-sub text-[10px] font-mono uppercase tracking-wider mt-1">{t('tasks.headerSubtitle')}</p>
          <div className="mt-3 flex p-0.5 bg-brand-base border border-brand-border w-fit font-mono">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1 text-[8px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'active'
                ? 'bg-brand-card text-brand-primary-text border border-brand-border'
                : 'text-brand-sub hover:text-brand-main'}`}
            >
              {t('tasks.tabActive')}
            </button>
            <button
              onClick={() => setActiveTab('deleted')}
              className={`px-3 py-1 text-[8px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'deleted'
                ? 'bg-brand-card text-brand-medium-text border border-brand-border'
                : 'text-brand-sub hover:text-brand-main'}`}
            >
              {t('tasks.tabDeleted')} {deletedTasks?.length ? `(${deletedTasks.length})` : ''}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto font-mono">
          {/* Logic Sorting Select */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-border bg-brand-card">
            <span className="text-brand-sub text-[8px] font-bold uppercase tracking-wider">{t('tasks.aiSuggest')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-brand-main text-[8px] font-bold outline-none cursor-pointer uppercase border-0 p-0"
            >
              <option value="deadline" className="bg-brand-card text-brand-main">{t('tasks.form.deadline')}</option>
              <option value="priority" className="bg-brand-card text-brand-main">{t('tasks.form.priority')}</option>
              <option value="complexity" className="bg-brand-card text-brand-main">{t('tasks.form.complexity')}</option>
            </select>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white dark:text-brand-card font-bold text-[9px] uppercase tracking-wider transition-colors border border-brand-primary shadow-[0_0_10px_rgba(0,240,255,0.1)] rounded-none cursor-pointer"
          >
            <Plus size={12} />
            <span>{t('tasks.add')}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-brand-high/5 border border-brand-high p-3 flex items-center gap-2 text-xs text-brand-high-text font-mono uppercase tracking-wider">
          <AlertCircle size={14} className="text-brand-high" />
          <span>ERR_SYS: {error}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-brand-card p-3 border border-brand-border relative overflow-hidden hud-border scan-lines">
        <div className="flex flex-1 gap-2 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-sub" size={14} />
            <input
              type="text"
              placeholder={t('common.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-brand-base border border-brand-border focus:border-brand-primary focus:outline-none text-brand-main placeholder-brand-sub/40 text-xs transition-colors rounded-none font-sans"
            />
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 font-mono">
          {['all', TaskStatus.TODO, TaskStatus.DOING, TaskStatus.DONE].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors border rounded-none ${
                filter === s
                  ? 'bg-brand-primary/10 text-brand-primary border-brand-primary shadow-[0_0_8px_rgba(0,240,255,0.1)]'
                  : 'bg-brand-card text-brand-sub border-brand-border hover:border-brand-primary/45 hover:text-brand-main'
              }`}
            >
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
        <div className="py-20 flex justify-center text-brand-primary">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        /* Task List Grid */
        <div>
          <div className="grid grid-cols-1 gap-4 max-h-[calc(100vh-310px)] overflow-y-auto pr-2 scrollbar-thin">
            {paginatedTasks.map((task, index) => (
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
                title={activeTab === 'deleted' ? t('tasks.emptyState.archiveTitle') : t('tasks.emptyState.systemTitle')}
                message={
                  activeTab === 'deleted'
                    ? t('tasks.emptyState.archiveMessage')
                    : (filter === 'all' && searchTerm === ''
                        ? t('tasks.emptyState.systemMessageEmpty')
                        : t('tasks.emptyState.systemMessageFiltered'))
                }
                onAction={() => handleOpenModal()}
              />
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-brand-card border border-brand-border rounded-xl font-mono text-[9px] mt-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-brand-sub uppercase tracking-wider">// PAGE:</span>
                <span className="text-brand-primary font-bold">[{currentPage.toString().padStart(2, '0')}]</span>
                <span className="text-brand-sub">/</span>
                <span className="text-brand-main font-bold">[{totalPages.toString().padStart(2, '0')}]</span>
              </div>

              {/* Progress bar visual */}
              <div className="hidden sm:block flex-grow max-w-[150px] h-1 bg-brand-base rounded-full overflow-hidden mx-4">
                <div 
                  className="h-full bg-brand-primary transition-all duration-300"
                  style={{ width: `${(currentPage / totalPages) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-brand-border bg-brand-card text-brand-sub hover:text-brand-primary hover:border-brand-primary/30 transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer uppercase tracking-wider font-bold text-[8px]"
                >
                  &lt; {t('common.prev') || 'PREV'}
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-brand-border bg-brand-card text-brand-sub hover:text-brand-primary hover:border-brand-primary/30 transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer uppercase tracking-wider font-bold text-[8px]"
                >
                  {t('common.next') || 'NEXT'} &gt;
                </button>
              </div>
            </div>
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