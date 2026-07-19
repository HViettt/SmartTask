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
    <div className="bg-brand-card border border-brand-border p-5 space-y-4 font-sans hud-border scan-lines">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-sub" />
        <input
          type="text"
          placeholder="Tìm kiếm công việc..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-brand-border bg-brand-base text-brand-main text-xs outline-none transition-colors placeholder-brand-sub/40 rounded-none"
        />
      </div>

      {/* Status Filter - Horizontal */}
      <div>
        <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-2 flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-brand-primary" />
          STATUS FILTER
        </label>
        <div className="flex gap-2 flex-wrap font-mono">
          {statusOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => onFilterChange(opt.value)}
                className={`px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 border rounded-none ${
                  filter === opt.value
                    ? 'bg-brand-primary/10 text-brand-primary border-brand-primary shadow-[0_0_8px_rgba(0,240,255,0.1)]'
                    : 'bg-brand-card text-brand-sub border-brand-border hover:border-brand-primary/45 hover:text-brand-main'
                }`}
              >
                <Icon size={12} />
                {opt.label.replace(/^[^\s]+\s+/, '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-2">
          PRIORITY FILTER
        </label>
        <div className="flex gap-2 flex-wrap font-mono">
          {priorityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPriorityChange(opt.value)}
              className={`px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider transition-colors border rounded-none ${
                priorityFilter === opt.value
                  ? 'bg-brand-primary/10 text-brand-primary border-brand-primary shadow-[0_0_8px_rgba(0,240,255,0.1)]'
                  : 'bg-brand-card text-brand-sub border-brand-border hover:border-brand-primary/45 hover:text-brand-main'
              }`}
            >
              {opt.label.replace(/^[^\s]+\s+/, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Deadline Filter */}
      <div>
        <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-2">
          EXPIRY FILTER
        </label>
        <div className="flex gap-2 flex-wrap font-mono">
          {deadlineOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onDeadlineChange(opt.value)}
              className={`px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider transition-colors border rounded-none ${
                deadlineFilter === opt.value
                  ? 'bg-brand-primary/10 text-brand-primary border-brand-primary shadow-[0_0_8px_rgba(0,240,255,0.1)]'
                  : 'bg-brand-card text-brand-sub border-brand-border hover:border-brand-primary/45 hover:text-brand-main'
              }`}
            >
              {opt.label.replace(/^[^\s]+\s+/, '')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
