/**
 * ============================================================================
 * DASHBOARD PAGE - TỔNG QUAN CÔNG VIỆC
 * ============================================================================
 * Purpose: Hiển thị dashboard tổng hợp thống kê, chart và công việc sắp tới
 * 
 * Features:
 *   - Thống kê: Tổng số, Chưa làm, Đang làm, Hoàn thành, Quá hạn
 *   - Chart: Pie chart phân bố trạng thái công việc
 *   - Danh sách: Công việc sắp tới (deadline)
 *   - Filter: Lọc theo thời gian (7 ngày, 30 ngày, tất cả)
 *   - I18n: Hỗ trợ đa ngôn ngữ
 * 
 * Author: Dashboard Implementation
 * Last Updated: December 18, 2025
 * ============================================================================
 */

import React, { useMemo, useEffect, useState } from 'react';
import { useAuthStore } from '../features/useStore.js';
import { useTaskStore } from '../features/taskStore.js';
import { TaskStatus, TaskPriority } from '../types.js';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  CalendarClock
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard.jsx';
import { useI18n } from '../utils/i18n';

// Helper icon component
const ListTodoIcon = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="6" height="6" rx="1" />
    <path d="m3 17 2 2 4-4" />
    <path d="M13 6h8" />
    <path d="M13 12h8" />
    <path d="M13 18h8" />
  </svg>
);

export const Dashboard = () => {
  const { tasks, fetchTasks } = useTaskStore();
  const { user } = useAuthStore();
  const { t, locale } = useI18n();
  const [timeFilter, setTimeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatKey, setSelectedStatKey] = useState(null);

  const timeOptions = useMemo(() => ([
    { value: 'all', label: t('dashboard.filters.all') },
    { value: '7d', label: t('dashboard.filters.last7') },
    { value: '30d', label: t('dashboard.filters.last30') }
  ]), [t]);

  const timeFilterLabel = useMemo(
    () => timeOptions.find(opt => opt.value === timeFilter)?.label || t('dashboard.filters.all'),
    [timeFilter, timeOptions, t]
  );

  useEffect(() => {
    // Re-fetch whenever user changes (login/logout/switch accounts)
    if (user?._id) {
      fetchTasks();
    }
  }, [user?._id, fetchTasks]);

  const filteredTasks = useMemo(() => {
    if (timeFilter === 'all') return tasks;

    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - (timeFilter === '7d' ? 7 : 30));

    // Gộp các mốc thời gian (created/updated/completed/deadline) để không bỏ lỡ task vừa hoạt động
    return tasks.filter(task => {
      const created = task.createdAt ? new Date(task.createdAt) : null;
      const updated = task.updatedAt ? new Date(task.updatedAt) : null;
      const completed = task.completedAt ? new Date(task.completedAt) : null;
      const deadline = task.deadline ? new Date(task.deadline) : null;
      const dates = [created, updated, completed, deadline].filter(Boolean);

      if (!dates.length) return true; // Không có timestamp thì không chặn
      return dates.some(date => date >= cutoff && date <= now);
    });
  }, [tasks, timeFilter]);

  const isOverdue = (task) => {
    if (!task.deadline) return false;
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate < today && task.status !== TaskStatus.DONE;
  };

  const isCompletedToday = (task) => {
    if (!task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  };

  const stats = useMemo(() => {
    const total = filteredTasks.length;

    // === LOGIC: Phân loại task theo trạng thái ===
    const todo = filteredTasks.filter(t => t.status === TaskStatus.TODO).length;
    const doing = filteredTasks.filter(t => t.status === TaskStatus.DOING).length;
    const done = filteredTasks.filter(t => t.status === TaskStatus.DONE).length;

    // Task ưu tiên cao chưa xong
    const highPriority = filteredTasks.filter(t =>
      t.priority === TaskPriority.HIGH &&
      t.status !== TaskStatus.DONE
    ).length;

    // Task quá hạn
    const overdueTasks = filteredTasks.filter(isOverdue).length;

    // Task hoàn thành hôm nay
    const completedToday = filteredTasks.filter(isCompletedToday).length;

    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      total,
      todo,
      doing,
      done,
      highPriority,
      completionRate,
      overdueTasks,
      completedToday
    };
  }, [filteredTasks]);

  const pieData = [
    { name: t('statusLabels.todo'), value: stats.todo, color: '#94a3b8' },
    { name: t('statusLabels.doing'), value: stats.doing, color: '#3b82f6' },
    { name: t('statusLabels.done'), value: stats.done, color: '#22c55e' },
  ];

  // Tasks due soon (next 3 days)
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    return filteredTasks
      .filter(t => t.status !== TaskStatus.DONE)
      .filter(t => {
        const d = new Date(t.deadline);
        return d >= today && d <= threeDaysLater;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
  }, [filteredTasks]);

  const StatCard = ({ title, value, icon: Icon, color, subtext, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{value}</h3>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={color.replace('bg-', 'text-')} size={24} />
        </div>
      </div>
    </button>
  );

  const statCards = useMemo(() => ([
    { key: 'total', title: t('dashboard.stats.total'), value: stats.total, icon: ListTodoIcon, color: 'bg-indigo-500 text-indigo-500' },
    { key: 'todo', title: t('dashboard.stats.todo'), value: stats.todo, icon: Clock, color: 'bg-slate-500 text-slate-500', subtext: t('dashboard.stats.sub.todo') },
    { key: 'doing', title: t('dashboard.stats.doing'), value: stats.doing, icon: Clock, color: 'bg-blue-500 text-blue-500', subtext: t('dashboard.stats.sub.doing') },
    { key: 'done', title: t('dashboard.stats.done'), value: stats.done, icon: CheckCircle2, color: 'bg-green-500 text-green-500', subtext: t('dashboard.stats.sub.done', { percent: stats.completionRate }) },
    { key: 'overdue', title: t('dashboard.stats.overdue'), value: stats.overdueTasks, icon: AlertTriangle, color: 'bg-red-500 text-red-500', subtext: t('dashboard.stats.sub.overdue') },
    { key: 'highPriority', title: t('dashboard.stats.highPriority'), value: stats.highPriority, icon: AlertTriangle, color: 'bg-orange-500 text-orange-500', subtext: t('dashboard.stats.sub.highPriority') },
    { key: 'completedToday', title: t('dashboard.stats.completedToday'), value: stats.completedToday, icon: CheckCircle2, color: 'bg-emerald-500 text-emerald-500', subtext: t('dashboard.stats.sub.completedToday') }
  ]), [stats, t]);

  const tasksForModal = useMemo(() => {
    if (!selectedStatKey) return [];

    switch (selectedStatKey) {
      case 'todo':
        return filteredTasks.filter(t => t.status === TaskStatus.TODO);
      case 'doing':
        return filteredTasks.filter(t => t.status === TaskStatus.DOING);
      case 'done':
        return filteredTasks.filter(t => t.status === TaskStatus.DONE);
      case 'overdue':
        return filteredTasks.filter(isOverdue);
      case 'highPriority':
        return filteredTasks.filter(t => t.priority === TaskPriority.HIGH && t.status !== TaskStatus.DONE);
      case 'completedToday':
        return filteredTasks.filter(isCompletedToday);
      case 'total':
      default:
        return filteredTasks;
    }
  }, [filteredTasks, selectedStatKey]);

  const handleOpenStat = (key) => {
    setSelectedStatKey(key);
    setIsModalOpen(true);
  };

  // Helper: format ngày tháng theo locale hiện tại
  const formatDate = (value) => {
    if (!value) return '--';
    const date = new Date(value);
    return date.toLocaleDateString(locale);
  };

  // Helper: chuẩn hóa status thành key i18n hợp lệ (chỉ todo/doing/done)
  const normalizeStatusKey = (status) => {
    const normalized = (status || 'Todo').toString().toLowerCase();
    // Chỉ chấp nhận 3 status hợp lệ từ backend
    if (['todo', 'doing', 'done'].includes(normalized)) {
      return normalized;
    }
    return 'todo'; // Fallback nếu status không hợp lệ
  };

  // Helper: chuẩn hóa priority thành key i18n hợp lệ (high/medium/low)
  const normalizePriorityKey = (priority) => {
    const normalized = (priority || 'Medium').toString().toLowerCase();
    if (['high', 'medium', 'low'].includes(normalized)) {
      return normalized;
    }
    return 'medium'; // Fallback mặc định
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('dashboard.lastUpdated')}: {new Date().toLocaleDateString(locale)}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <CalendarClock size={16} />
          <span className="font-medium">{t('dashboard.filters.label')}:</span>
        </div>
        <div className="flex items-center gap-2">
          {timeOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTimeFilter(option.value)}
              className={`px-3 py-2 text-sm rounded-lg border transition ${
                timeFilter === option.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-blue-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid - 4 cột layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tasks */}
        <StatCard
          title="📋 Tổng công việc"
          value={stats.total}
          icon={CheckCircle2}
          color="blue"
          subtext={timeFilterLabel}
          onClick={() => handleOpenStat('total')}
        />
        
        {/* Todo */}
        <StatCard
          title="📌 Chưa làm"
          value={stats.todo}
          icon={() => <div className="text-lg">📌</div>}
          color="orange"
          subtext="Đang chờ xử lý"
          onClick={() => handleOpenStat('todo')}
        />
        
        {/* Doing */}
        <StatCard
          title="⚙️ Đang làm"
          value={stats.doing}
          icon={() => <div className="text-lg">⚙️</div>}
          color="purple"
          subtext="Đang tiến hành"
          onClick={() => handleOpenStat('doing')}
        />
        
        {/* Done */}
        <StatCard
          title="✅ Hoàn thành"
          value={stats.done}
          icon={() => <div className="text-lg">✅</div>}
          color="green"
          subtext={`${stats.completionRate}% hoàn thành`}
          onClick={() => handleOpenStat('done')}
        />

        {/* Overdue */}
        <StatCard
          title="⚠️ Quá hạn"
          value={stats.overdueTasks}
          icon={() => <div className="text-lg">⚠️</div>}
          color="red"
          subtext="Cần xử lý ngay"
          onClick={() => handleOpenStat('overdue')}
        />

        {/* High Priority */}
        <StatCard
          title="🔴 Ưu tiên cao"
          value={stats.highPriority}
          icon={() => <div className="text-lg">🔴</div>}
          color="red"
          subtext="Chưa hoàn thành"
          onClick={() => handleOpenStat('highPriority')}
        />

        {/* Completed Today */}
        <StatCard
          title="🎉 Hôm nay"
          value={stats.completedToday}
          icon={() => <div className="text-lg">🎉</div>}
          color="green"
          subtext="Hoàn thành"
          onClick={() => handleOpenStat('completedToday')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{t('dashboard.statusTitle')}</h2>
          <div className="h-64 w-full min-w-0">
            {/* Use a fixed pixel height to avoid Recharts measuring -1 when parent size is not settled */}
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{t('dashboard.upcomingTitle')}</h2>
          <div className="space-y-4">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(task => (
                <div key={task._id} className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                  <div className={`mt-1 w-2 h-2 rounded-full ${
                    task.priority === TaskPriority.HIGH ? 'bg-red-500' : 
                    task.priority === TaskPriority.MEDIUM ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{task.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(task.deadline).toLocaleDateString(locale)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                {t('dashboard.noUpcoming')}
              </p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{timeFilterLabel}</p>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('dashboard.modal.title')}{selectedStatKey ? ` - ${statCards.find(c => c.key === selectedStatKey)?.title || ''}` : ''}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                aria-label={t('common.close')}
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {tasksForModal.length === 0 && (
                <p className="px-6 py-8 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {t('dashboard.modal.empty')}
                </p>
              )}

              {tasksForModal.map(task => {
                // Chuẩn hóa status và priority để đảm bảo i18n key hợp lệ
                const statusKey = normalizeStatusKey(task.status);
                const priorityKey = normalizePriorityKey(task.priority);
                
                return (
                  <div key={task._id} className="px-6 py-4 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      {/* Tiêu đề task - giữ nguyên ngôn ngữ người dùng nhập */}
                      <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{task.title}</p>
                      {/* Badge status - hiển thị qua i18n */}
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        {t(`statusLabels.${statusKey}`)}
                      </span>
                    </div>
                    {/* Thông tin bổ sung: ngày hoàn thành, deadline, độ ưu tiên */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-3">
                      <span>{t('common.completedAt')}: {task.completedAt ? formatDate(task.completedAt) : '--'}</span>
                      <span>{t('tasks.form.deadline')}: {task.deadline ? formatDate(task.deadline) : '--'}</span>
                      <span>{t('tasks.form.priority')}: {t(`priorityLabels.${priorityKey}`)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};