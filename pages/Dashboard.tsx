import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { TaskStatus, TaskPriority } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  CheckCircle2, 
  CircleDashed, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { tasks } = useStore();

  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter(t => t.status === TaskStatus.TODO).length;
    const doing = tasks.filter(t => t.status === TaskStatus.DOING).length;
    const done = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const highPriority = tasks.filter(t => t.priority === TaskPriority.HIGH && t.status !== TaskStatus.DONE).length;
    
    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, todo, doing, done, highPriority, completionRate };
  }, [tasks]);

  const pieData = [
    { name: 'Chưa làm', value: stats.todo, color: '#94a3b8' }, // Slate 400
    { name: 'Đang làm', value: stats.doing, color: '#3b82f6' }, // Blue 500
    { name: 'Hoàn thành', value: stats.done, color: '#22c55e' }, // Green 500
  ];

  // Tasks due soon (next 3 days)
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    return tasks
      .filter(t => t.status !== TaskStatus.DONE)
      .filter(t => {
        const d = new Date(t.deadline);
        return d >= today && d <= threeDaysLater;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
  }, [tasks]);

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
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
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Tổng Quan</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng công việc" 
          value={stats.total} 
          icon={ListTodoIcon} 
          color="bg-indigo-500 text-indigo-500" 
        />
        <StatCard 
          title="Đang thực hiện" 
          value={stats.doing} 
          icon={Clock} 
          color="bg-blue-500 text-blue-500" 
        />
        <StatCard 
          title="Đã hoàn thành" 
          value={stats.done} 
          icon={CheckCircle2} 
          color="bg-green-500 text-green-500" 
          subtext={`Tỷ lệ: ${stats.completionRate}%`}
        />
        <StatCard 
          title="Ưu tiên cao (Chưa xong)" 
          value={stats.highPriority} 
          icon={AlertTriangle} 
          color="bg-red-500 text-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Trạng thái công việc</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
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
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Sắp đến hạn (3 ngày)</h2>
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
                      {new Date(task.deadline).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                Không có công việc nào sắp đến hạn.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper icon component
const ListTodoIcon = (props: any) => (
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