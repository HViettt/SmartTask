
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Task, TaskPriority, TaskComplexity, TaskStatus } from '../types';
import { getTaskSuggestions } from '../services/geminiService';
import { 
  Plus, Search, Sparkles, Calendar, Trash2, Edit, Check, X, 
  Loader2, CheckCircle2, StickyNote, ArrowRight, AlertCircle
} from 'lucide-react';

export const TaskList: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, setTasks, fetchTasks, isLoading, error } = useStore();
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Form State
  const initialFormState = {
    title: '',
    description: '',
    deadline: new Date().toISOString().split('T')[0],
    priority: TaskPriority.MEDIUM,
    complexity: TaskComplexity.MEDIUM,
    notes: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, searchTerm]);

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        deadline: typeof task.deadline === 'string' ? task.deadline.split('T')[0] : new Date(task.deadline).toISOString().split('T')[0],
        priority: task.priority,
        complexity: task.complexity,
        notes: task.notes || ''
      });
    } else {
      setEditingTask(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      await updateTask(editingTask._id, formData);
    } else {
      await addTask(formData);
    }
    setIsModalOpen(false);
  };

  const handleAISuggestion = async () => {
    setIsAILoading(true);
    try {
      const { sortedIds, reasoning } = await getTaskSuggestions(tasks);
      const reorderedTasks = [...tasks].sort((a, b) => {
        const indexA = sortedIds.indexOf(a._id);
        const indexB = sortedIds.indexOf(b._id);
        const finalA = indexA === -1 ? 9999 : indexA;
        const finalB = indexB === -1 ? 9999 : indexB;
        return finalA - finalB;
      });
      const enrichedTasks = reorderedTasks.map(t => ({
        ...t,
        aiReasoning: reasoning[t._id] || undefined
      }));
      setTasks(enrichedTasks);
    } catch (error) {
      alert("Có lỗi xảy ra khi gọi AI. Vui lòng kiểm tra API Key.");
    } finally {
      setIsAILoading(false);
    }
  };

  const statusColors = {
    [TaskStatus.TODO]: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    [TaskStatus.DOING]: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    [TaskStatus.DONE]: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  };

  const priorityConfig = {
    [TaskPriority.HIGH]: { color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Cao' },
    [TaskPriority.MEDIUM]: { color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800', label: 'TB' },
    [TaskPriority.LOW]: { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800', label: 'Thấp' },
  };

  const complexityConfig = {
    [TaskComplexity.HARD]: { color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400', label: 'Khó' },
    [TaskComplexity.MEDIUM]: { color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400', label: 'Vừa' },
    [TaskComplexity.EASY]: { color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400', label: 'Dễ' },
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Danh sách công việc</h1>
           <p className="text-gray-500 text-sm">Quản lý và theo dõi tiến độ công việc</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleAISuggestion}
            disabled={isAILoading || tasks.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg transition-all disabled:opacity-70 shadow-md hover:shadow-lg border border-transparent"
          >
            {isAILoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            <span className="hidden sm:inline font-medium">AI Gợi Ý Sắp Xếp</span>
          </button>
          
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm font-medium"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Thêm mới</span>
          </button>
        </div>
      </div>

      {/* Error Message for Demo Mode */}
      {error && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 rounded-lg flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
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
            placeholder="Tìm kiếm công việc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(['all', TaskStatus.TODO, TaskStatus.DOING, TaskStatus.DONE] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                filter === s
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-white text-gray-600 border-transparent hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {s === 'all' ? 'Tất cả' : s}
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
          <div 
            key={task._id} 
            className={`group relative bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border transition-all hover:shadow-md ${
              task.status === TaskStatus.DONE 
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
                          AI Gợi ý #{index + 1}
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
                          onClick={() => updateTask(task._id, { status: task.status === TaskStatus.DONE ? TaskStatus.DOING : TaskStatus.DONE })}
                          className={`mt-1 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.status === TaskStatus.DONE 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 text-transparent'
                          }`}
                       >
                         <Check size={14} strokeWidth={3} />
                       </button>
                       <div className="min-w-0">
                          <h3 className={`text-lg font-semibold truncate pr-2 transition-colors ${task.status === TaskStatus.DONE ? 'text-gray-500 line-through decoration-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {task.title}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                            {task.description || 'Không có mô tả'}
                          </p>
                       </div>
                     </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${statusColors[task.status]}`}>
                      {task.status}
                    </span>

                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 ${priorityConfig[task.priority].color}`}>
                      Ưu tiên: {priorityConfig[task.priority].label}
                    </span>

                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border ${
                       new Date(task.deadline) < new Date() && task.status !== TaskStatus.DONE
                         ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                         : 'text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600'
                    }`}>
                      <Calendar size={13} />
                      {new Date(task.deadline).toLocaleDateString('vi-VN')}
                    </span>

                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${complexityConfig[task.complexity].color}`}>
                      Độ khó: {complexityConfig[task.complexity].label}
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
                        Hoàn thành: {new Date(task.completedAt).toLocaleString('vi-VN')}
                      </div>
                  )}
                </div>

                <div className="flex md:flex-col items-center md:items-end gap-2 mt-4 md:mt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700 pt-3 md:pt-0">
                   {task.status !== TaskStatus.DONE && (
                      <button 
                        onClick={() => updateTask(task._id, { status: TaskStatus.DONE })}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 rounded-md transition-colors border border-emerald-200 dark:border-emerald-800"
                      >
                        <Check size={14} /> Hoàn thành ngay
                      </button>
                   )}
                   
                   <div className="flex gap-1 w-full md:w-auto">
                      <button 
                        onClick={() => handleOpenModal(task)}
                        className="flex-1 md:flex-none px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                         onClick={() => deleteTask(task._id)}
                         className="flex-1 md:flex-none px-3 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                         title="Xóa"
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>
             </div>
          </div>
        ))}

        {filteredTasks.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4 text-blue-500">
               <div className="w-8 h-8 flex items-center justify-center border-2 border-current rounded-lg">
                  <Check size={18} />
               </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Chưa có công việc nào</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto mb-6">
              Danh sách trống. Hãy thêm công việc mới hoặc thử thay đổi bộ lọc tìm kiếm.
            </p>
            <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
              >
                <Plus size={18} />
                Thêm công việc đầu tiên
              </button>
          </div>
        )}
      </div>
      )}

      {/* Modal - Kept same as previous but connected to state */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {editingTask ? <Edit size={20} className="text-blue-600" /> : <Plus size={20} className="text-blue-600" />}
                {editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tiêu đề <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white transition-all outline-none"
                  placeholder="Ví dụ: Hoàn thành báo cáo..."
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Deadline <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Độ phức tạp</label>
                  <div className="relative">
                    <select
                      value={formData.complexity}
                      onChange={e => setFormData({...formData, complexity: e.target.value as TaskComplexity})}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white appearance-none outline-none"
                    >
                      {Object.values(TaskComplexity).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <ArrowRight size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mức độ ưu tiên</label>
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
                        {p}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white resize-none outline-none"
                  placeholder="Nhập mô tả chi tiết cho công việc..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                   Ghi chú thêm <StickyNote size={14} className="text-gray-400"/>
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none"
                  placeholder="Link tài liệu, ghi chú nhanh..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin"/>}
                  {editingTask ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
