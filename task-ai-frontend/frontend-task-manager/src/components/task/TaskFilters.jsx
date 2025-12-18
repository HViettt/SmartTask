/**
 * ============================================================================
 * TASK FILTERS COMPONENT
 * ============================================================================
 * Purpose: Bộ lọc & tìm kiếm công việc theo status, priority, deadline
 * 
 * Props:
 *   - filter: string - Status filter hiện tại
 *   - onFilterChange: function(filter: string) - Callback khi thay đổi filter
 *   - searchTerm: string - Text tìm kiếm
 *   - onSearchChange: function(term: string) - Callback khi thay đổi search
 *   - priorityFilter: string - Priority filter ('all' | 'high' | 'medium' | 'low')
 *   - onPriorityChange: function(priority: string) - Callback
 *   - deadlineFilter: string - Deadline filter ('all' | 'today' | 'week' | 'month' | 'overdue')
 *   - onDeadlineChange: function(deadline: string) - Callback
 * 
 * Usage:
 *   <TaskFilters
 *     filter={filter}
 *     onFilterChange={setFilter}
 *     searchTerm={searchTerm}
 *     onSearchChange={setSearchTerm}
 *     priorityFilter={priority}
 *     onPriorityChange={setPriority}
 *   />
 * 
 * Author: UI/UX Improvement
 * Last Updated: December 18, 2025
 * ============================================================================
 */

import React from 'react';
import { Search, Filter, ListTodo, AlertCircle, Cog, CheckCircle2, AlertTriangle } from 'lucide-react';
import { TaskStatus, TaskPriority } from '../../types.js';
import { useI18n } from '../../utils/i18n';

export const TaskFilters = ({
  filter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  priorityFilter = 'all',
  onPriorityChange,
  deadlineFilter = 'all',
  onDeadlineChange
}) => {
  const { t } = useI18n();

  const statusOptions = [
    { value: 'all', label: '📋 Tất cả', icon: ListTodo },
    { value: TaskStatus.TODO, label: '📌 Chưa làm', icon: AlertCircle },
    { value: TaskStatus.DOING, label: '⚙️ Đang làm', icon: Cog },
    { value: TaskStatus.DONE, label: '✅ Hoàn thành', icon: CheckCircle2 }
  ];

  const priorityOptions = [
    { value: 'all', label: 'Tất cả mức độ' },
    { value: 'high', label: '🔴 Cao' },
    { value: 'medium', label: '🟠 Trung bình' },
    { value: 'low', label: '🔵 Thấp' }
  ];

  const deadlineOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'today', label: 'Hôm nay' },
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'overdue', label: '⚠️ Quá hạn' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      {/* Thanh tìm kiếm */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="🔍 Tìm kiếm công việc..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white outline-none transition-all"
        />
      </div>

      {/* Status Filter - Horizontal */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <Filter className="inline w-4 h-4 mr-1" />
          Trạng thái
        </label>
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => onFilterChange(opt.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filter === opt.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon size={16} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Mức độ ưu tiên
        </label>
        <div className="flex gap-2 flex-wrap">
          {priorityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPriorityChange(opt.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                priorityFilter === opt.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deadline Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Thời hạn
        </label>
        <div className="flex gap-2 flex-wrap">
          {deadlineOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onDeadlineChange(opt.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                deadlineFilter === opt.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
