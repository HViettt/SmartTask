// Task Status Enum - Match backend schema
export const TaskStatus = {
  TODO: 'Todo',
  DOING: 'Doing',
  DONE: 'Done'
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
    [TaskStatus.DONE]: 'Hoàn thành'
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