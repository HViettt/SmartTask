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
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/useStore.js';
import { useTaskStore } from '../features/taskStore.js';
import { useDeadlineStats } from '../hooks/useDeadlineStats.js';
import { TaskStatus, TaskPriority, getStatusBadgeClasses } from '../types.js';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  CalendarClock,
  ListTodo,
  Cog,
  AlertCircle,
  Trophy
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard.jsx';
import { useI18n } from '../utils/i18n';
import { isTaskExpired, isTaskDueSoon, formatDeadline } from '../utils/deadlineHelpers.js';

export const Dashboard = () => {
  const { tasks, fetchTasks } = useTaskStore();
  const { user } = useAuthStore();
  const { t, locale } = useI18n();
  const [timeFilter, setTimeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatKey, setSelectedStatKey] = useState(null);
  const location = useLocation();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const filteredTasks = useMemo(() => {
    // ✅ Ensure tasks is an array
    if (!Array.isArray(tasks)) {
      return [];
    }

    // ✅ Always filter out deleted tasks first
    const activeTasks = tasks.filter(t => !t.isDeleted);

    if (timeFilter === 'all') return activeTasks;

    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - (timeFilter === '7d' ? 7 : 30));

    // Gộp các mốc thời gian (created/updated/completed/deadline) để không bỏ lỡ task vừa hoạt động
    return activeTasks.filter(task => {
      const created = task.createdAt ? new Date(task.createdAt) : null;
      const updated = task.updatedAt ? new Date(task.updatedAt) : null;
      const completed = task.completedAt ? new Date(task.completedAt) : null;
      const deadline = task.deadline ? new Date(task.deadline) : null;
      const dates = [created, updated, completed, deadline].filter(Boolean);

      if (!dates.length) return true; // Không có timestamp thì không chặn
      return dates.some(date => date >= cutoff && date <= now);
    });
  }, [tasks, timeFilter]);

  // ✅ Helper: Kiểm tra task hoàn thành hôm nay
  const isCompletedToday = (task) => {
    if (!task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  };

  // ✅ Tính toán statistics từ filtered tasks
  const stats = useMemo(() => {
    const total = filteredTasks.length;
    if (total === 0) {
      return {
        total: 0, todo: 0, doing: 0, done: 0, 
        highPriority: 0, completionRate: 0, 
        overdueTasks: 0, completedToday: 0
      };
    }

    // Phân loại task - 1 lần duyệt thay vì nhiều lần filter
    let todo = 0, doing = 0, done = 0;
    let highPriority = 0, overdueTasks = 0, completedToday = 0;

    filteredTasks.forEach(t => {
      // Đếm status
      if (t.status === TaskStatus.TODO) todo++;
      else if (t.status === TaskStatus.DOING) doing++;
      else if (t.status === TaskStatus.DONE) done++;

      // High priority chưa xong
      if (t.priority === TaskPriority.HIGH && t.status !== TaskStatus.DONE) {
        highPriority++;
      }

      // Quá hạn
      if (isTaskExpired(t)) overdueTasks++;

      // Hoàn thành hôm nay
      if (isCompletedToday(t)) completedToday++;
    });

    const completionRate = Math.round((done / total) * 100);

    return {
      total, todo, doing, done,
      highPriority, completionRate,
      overdueTasks, completedToday
    };
  }, [filteredTasks]);

  const pieData = [
    { name: t('statusLabels.todo'), value: stats.todo, color: 'var(--text-sub)' },
    { name: t('statusLabels.doing'), value: stats.doing, color: 'var(--primary)' },
    { name: t('statusLabels.done'), value: stats.done, color: 'var(--low)' },
  ];

  // ✅ KHÔNG giới hạn ngày (72h, 3 ngày...)
  // Dùng useDeadlineStats để lấy đầy đủ upcoming tasks
  const { dueSoonTasks } = useDeadlineStats();
  
  // Upcoming list ONLY includes "Sắp đến hạn" tasks (exclude overdue)
  const upcomingTasks = useMemo(() => {
    return [...dueSoonTasks]
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [dueSoonTasks]);



  const statCards = useMemo(() => ([
    { key: 'total', title: t('dashboard.stats.total'), value: stats.total, icon: ListTodo, color: 'bg-brand-primary' },
    { key: 'todo', title: t('dashboard.stats.todo'), value: stats.todo, icon: AlertCircle, color: 'bg-brand-high', subtext: t('dashboard.stats.sub.todo') },
    { key: 'doing', title: t('dashboard.stats.doing'), value: stats.doing, icon: Cog, color: 'bg-brand-medium', subtext: t('dashboard.stats.sub.doing') },
    { key: 'done', title: t('dashboard.stats.done'), value: stats.done, icon: CheckCircle2, color: 'bg-brand-low', subtext: t('dashboard.stats.sub.done', { percent: stats.completionRate }) },
    { key: 'overdue', title: t('dashboard.stats.overdue'), value: stats.overdueTasks, icon: AlertTriangle, color: 'bg-brand-high', subtext: t('dashboard.stats.sub.overdue') },
    { key: 'highPriority', title: t('dashboard.stats.highPriority'), value: stats.highPriority, icon: AlertCircle, color: 'bg-brand-medium', subtext: t('dashboard.stats.sub.highPriority') },
    { key: 'completedToday', title: t('dashboard.stats.completedToday'), value: stats.completedToday, icon: Trophy, color: 'bg-brand-low', subtext: t('dashboard.stats.sub.completedToday') }
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
        return filteredTasks.filter(isTaskExpired); // ✅ Dùng helper function
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

  // Tự động mở modal theo query param (stat=dueSoon|overdue|todo|doing|done)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stat = params.get('stat');
    if (!stat) return;
    const map = {
      dueSoon: 'doing', // hiển thị các task chưa Done, sắp hết hạn → tương quan với doing/todo; mở doing để người dùng dễ xử lý
      overdue: 'overdue',
      todo: 'todo',
      doing: 'doing',
      done: 'done'
    };
    const key = map[stat];
    if (key) {
      setSelectedStatKey(key);
      setIsModalOpen(true);
    }
  }, [location.search]);

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
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <h1 className="text-xl font-bold font-display uppercase tracking-widest text-brand-main">{t('dashboard.title')}</h1>
          <p className="text-[10px] font-mono text-brand-sub uppercase tracking-wider mt-1">Telemetry Dashboard & System Logs</p>
        </div>
        <div className="text-[9px] font-mono text-brand-sub bg-brand-card px-2.5 py-1.5 border border-brand-border uppercase tracking-widest">
          {t('dashboard.lastUpdated')}: {new Date().toLocaleDateString(locale)}
        </div>
      </div>

      {/* Filters bar - HUD toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-brand-card p-3 border border-brand-border relative overflow-hidden hud-border">
        <div className="flex items-center gap-2 text-[9px] font-mono text-brand-main">
          <CalendarClock size={12} className="text-brand-primary animate-pulse" />
          <span className="font-bold uppercase tracking-widest">{t('dashboard.filters.label')}:</span>
        </div>
        <div className="flex items-center gap-1 bg-brand-base p-0.5 border border-brand-border">
          {timeOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTimeFilter(option.value)}
              className={`px-3 py-1 text-[8px] font-mono font-bold uppercase tracking-wider transition-colors ${
                timeFilter === option.value
                  ? 'bg-brand-card text-brand-primary border border-brand-border'
                  : 'text-brand-sub hover:text-brand-main'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid - Technical Panel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <StatCard
            key={card.key}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            subtext={card.subtext}
            onClick={() => handleOpenStat(card.key)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-2 bg-brand-card p-6 border border-brand-border relative overflow-hidden hud-border">
          <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4 text-brand-main border-b border-brand-border/40 pb-2">{t('dashboard.statusTitle')}</h2>
          <div className="relative h-60 w-full min-w-0">
            {/* Center percentage label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-xl font-bold font-display text-brand-primary leading-none">
                {stats.completionRate}%
              </span>
              <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-brand-sub mt-1">
                {t('statusLabels.done').toUpperCase()}
              </span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-main)',
                    borderWidth: 1,
                    borderRadius: 0,
                    color: 'var(--text-main)',
                    padding: '6px 10px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)',
                    fontFamily: 'monospace',
                    fontSize: '10px'
                  }}
                  itemStyle={{ color: 'var(--text-main)', fontWeight: 600 }}
                  labelStyle={{ color: 'var(--text-sub)', fontWeight: 500 }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={28}
                  formatter={(value) => <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-main">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Deadlines - Telemetry Flight log list */}
        <div className="bg-brand-card p-6 border border-brand-border flex flex-col relative overflow-hidden hud-border">
          <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4 text-brand-main border-b border-brand-border/40 pb-2">{t('dashboard.upcomingTitle')}</h2>
          <div className="space-y-2 flex-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin font-mono text-[10px]">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(task => (
                <div key={task._id} className="flex items-start gap-2.5 p-2.5 border border-brand-border bg-brand-base/20 hover:bg-brand-base hover:border-brand-primary/40 transition-colors">
                  <div className={`mt-1 w-1.5 h-1.5 shrink-0 ${
                    task.priority === TaskPriority.HIGH || task.priority === 'High' ? 'bg-brand-high' : 
                    task.priority === TaskPriority.MEDIUM || task.priority === 'Medium' ? 'bg-brand-medium' : 'bg-brand-low'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-sans font-bold text-brand-main line-clamp-1 uppercase tracking-wide">{task.title}</p>
                    <p className="text-[8px] text-brand-sub mt-1">
                      EXP: {new Date(task.deadline).toLocaleDateString(locale)} | {task.deadlineTime || '23:59'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <p className="text-[10px] text-brand-sub uppercase tracking-wider font-bold">{t('dashboard.noUpcoming')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-brand-card border border-brand-border flex flex-col overflow-hidden max-h-[85vh] hud-border">
            <div className="flex items-start justify-between px-6 py-4 border-b border-brand-border">
              <div>
                <p className="text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub">{timeFilterLabel}</p>
                <h3 className="text-sm font-bold font-display uppercase tracking-widest text-brand-main mt-0.5">
                  {t('dashboard.modal.title')}{selectedStatKey ? ` - ${statCards.find(c => c.key === selectedStatKey)?.title || ''}` : ''}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 border border-brand-border text-brand-sub hover:bg-brand-base hover:text-brand-main transition-colors"
                aria-label={t('common.close')}
              >
                <X size={14} />
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-brand-border/40 flex-1 font-mono text-[10px]">
              {tasksForModal.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-[10px] text-brand-sub uppercase tracking-widest font-bold">{t('dashboard.modal.empty')}</p>
                </div>
              )}

              {tasksForModal.map(task => {
                const statusKey = normalizeStatusKey(task.status);
                const priorityKey = normalizePriorityKey(task.priority);
                
                return (
                  <div key={task._id} className="px-6 py-3.5 flex flex-col gap-1.5 hover:bg-brand-base/20 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-sans font-bold text-xs text-brand-main line-clamp-1 uppercase tracking-wide">{task.title}</p>
                      <span className={`text-[8px] px-1.5 py-0.5 font-bold uppercase tracking-wider border ${
                        task.status === TaskStatus.DONE || task.status === 'Done' ? 'bg-brand-low/10 text-brand-low-text border-brand-low/20' :
                        task.status === TaskStatus.DOING || task.status === 'Doing' ? 'bg-brand-medium/10 text-brand-medium-text border-brand-medium/20' :
                        'bg-brand-high/10 text-brand-high-text border-brand-high/20'
                      }`}>
                        {t(`statusLabels.${statusKey}`)}
                      </span>
                    </div>
                    <div className="text-[8px] text-brand-sub flex flex-wrap gap-x-4 gap-y-1 uppercase tracking-wider">
                      <span>{t('statusLabels.done').toUpperCase()}: {task.completedAt ? formatDate(task.completedAt) : '--'}</span>
                      <span>{t('tasks.form.deadline').toUpperCase()}: {task.deadline ? formatDate(task.deadline) : '--'}</span>
                      <span>{t('tasks.form.priority').toUpperCase()}: <span className={
                        priorityKey === 'high' ? 'text-brand-high-text font-bold' :
                        priorityKey === 'medium' ? 'text-brand-medium-text font-bold' : 'text-brand-low-text font-bold'
                      }>{t(`priorityLabels.${priorityKey}`)}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-3 border-t border-brand-border flex justify-end bg-brand-base/20 font-mono">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-brand-border text-[9px] font-bold text-brand-sub hover:text-brand-main hover:bg-brand-base uppercase tracking-wider"
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