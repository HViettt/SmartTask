// Task Status Enum - Match backend schema
export const TaskStatus = {
  TODO: 'Todo',
  DOING: 'Doing',
  DONE: 'Done',
  OVERDUE: 'Overdue'
};

// 🎨 Status Colors - Tailwind CSS classes for UI consistency
// Used in Dashboard, Task cards, and other components
export const StatusColors = {
  [TaskStatus.TODO]: 'bg-red-500 text-red-500', // 🔴 CHƯA LÀM = ĐỎ
  [TaskStatus.DOING]: 'bg-yellow-500 text-yellow-500', // 🟡 ĐANG LÀM = VÀNG
  [TaskStatus.DONE]: 'bg-green-500 text-green-500', // 🟢 HOÀN THÀNH = XANH LÁ
  [TaskStatus.OVERDUE]: 'bg-red-600 text-red-600' // 🔴 QUÁ HẠN = ĐỎ ĐỎM
};

// 🎨 Status badge tone cho pill (dùng ở Dashboard modal "Tổng công việc")
const StatusBadgeTone = {
  [TaskStatus.TODO]: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-200' },
  [TaskStatus.DOING]: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-200' },
  [TaskStatus.DONE]: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-200' },
  [TaskStatus.OVERDUE]: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-200' }
};

export const getStatusBadgeClasses = (status) => {
  const tone = StatusBadgeTone[status] || StatusBadgeTone[TaskStatus.TODO];
  return `${tone.bg} ${tone.text}`;
};

// Task Priority Enum - Match backend schema
export const TaskPriority = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

// Task Complexity Enum - Match backend schema
export const TaskComplexity = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard'
};

// Helper function to get Vietnamese labels
export const getStatusLabel = (status) => {
  const labels = {
    [TaskStatus.TODO]: 'Cần làm',
    [TaskStatus.DOING]: 'Đang làm',
    [TaskStatus.DONE]: 'Hoàn thành',
    [TaskStatus.OVERDUE]: 'Quá hạn'
  };
  return labels[status] || status;
};

export const getPriorityLabel = (priority) => {
  const labels = {
    [TaskPriority.HIGH]: 'Cao',
    [TaskPriority.MEDIUM]: 'Trung bình',
    [TaskPriority.LOW]: 'Thấp'
  };
  return labels[priority] || priority;
};

export const getComplexityLabel = (complexity) => {
  const labels = {
    [TaskComplexity.EASY]: 'Dễ',
    [TaskComplexity.MEDIUM]: 'Vừa',
    [TaskComplexity.HARD]: 'Khó'
  };
  return labels[complexity] || complexity;
};