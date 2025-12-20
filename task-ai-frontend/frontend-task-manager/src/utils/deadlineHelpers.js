/**
 * Frontend Deadline Helper Functions
 * Đồng bộ với backend logic (deadlineHelper.js)
 * Sử dụng computedStatus từ API khi có thể
 */

/**
 * Parse deadline date + time thành Date object
 * @param {string|Date} deadlineDate - Date string hoặc Date object
 * @param {string} deadlineTime - Time string (HH:mm), default '23:59'
 * @returns {Date} Date object
 */
export const parseDeadlineDateTime = (deadlineDate, deadlineTime = '23:59') => {
  if (!deadlineDate) return null;
  
  const dateStr = typeof deadlineDate === 'string' 
    ? deadlineDate.split('T')[0] 
    : deadlineDate.toISOString().split('T')[0];
  
  const [hours, minutes] = (deadlineTime || '23:59').split(':');
  
  // ✅ Tạo Date object với local timezone
  // Set seconds=59, milliseconds=999 để task expire SAU thời gian deadline
  const date = new Date(dateStr);
  date.setHours(parseInt(hours), parseInt(minutes), 59, 999);
  
  return date;
};

/**
 * Kiểm tra task đã hết hạn chưa
 * Ưu tiên dùng computedStatus từ API
 * @param {object} task - Task object
 * @param {Date} now - Current time (optional, default Date.now())
 * @returns {boolean} true nếu task đã hết hạn
 */
export const isTaskExpired = (task, now = new Date()) => {
  if (!task || !task.deadline) return false;
  
  // Nếu task đã Done thì không bao giờ expired
  if (task.status === 'Done') return false;
  
  // Ưu tiên dùng computedStatus từ backend (timezone-aware)
  if (task.computedStatus === 'overdue') return true;
  
  // Fallback: parse deadline + deadlineTime locally
  const deadline = parseDeadlineDateTime(task.deadline, task.deadlineTime || '23:59');
  return now > deadline;
};

/**
 * Kiểm tra task sắp hết hạn (trong X giờ tới)
 * @param {object} task - Task object
 * @param {number} hoursThreshold - Số giờ threshold (default 24)
 * @param {Date} now - Current time (optional)
 * @returns {boolean} true nếu task sắp hết hạn
 */
export const isTaskDueSoon = (task, hoursThreshold = 24, now = new Date()) => {
  if (!task || !task.deadline) return false;
  
  // Task Done hoặc đã expired thì không tính "due soon"
  if (task.status === 'Done') return false;
  if (isTaskExpired(task, now)) return false;
  
  // Ưu tiên dùng computedStatus từ backend
  if (task.computedStatus === 'deadline-soon' || task.computedStatus === 'deadline-today') {
    return true;
  }
  
  // Fallback: tính số giờ còn lại
  const deadline = parseDeadlineDateTime(task.deadline, task.deadlineTime || '23:59');
  const hoursUntil = (deadline - now) / (1000 * 60 * 60);
  
  return hoursUntil > 0 && hoursUntil <= hoursThreshold;
};

/**
 * Kiểm tra task đến hạn hôm nay
 * @param {object} task - Task object
 * @param {Date} now - Current time (optional)
 * @returns {boolean} true nếu deadline là hôm nay
 */
export const isDeadlineToday = (task, now = new Date()) => {
  if (!task || !task.deadline) return false;
  
  // Ưu tiên dùng computedStatus
  if (task.computedStatus === 'deadline-today') return true;
  
  const deadline = parseDeadlineDateTime(task.deadline, task.deadlineTime || '23:59');
  return deadline.toDateString() === now.toDateString();
};

/**
 * Format deadline thành string dễ đọc
 * @param {object} task - Task object
 * @returns {string} Formatted deadline string
 */
export const formatDeadline = (task) => {
  if (!task || !task.deadline) return '';
  
  const deadline = parseDeadlineDateTime(task.deadline, task.deadlineTime || '23:59');
  const now = new Date();
  
  const dateStr = deadline.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const timeStr = task.deadlineTime || '23:59';
  
  // Tính số giờ còn lại
  const hoursUntil = (deadline - now) / (1000 * 60 * 60);
  
  if (hoursUntil < 0) {
    return `${dateStr} ${timeStr} (Quá hạn)`;
  } else if (hoursUntil < 1) {
    const minutesUntil = Math.floor((deadline - now) / (1000 * 60));
    return `${dateStr} ${timeStr} (còn ${minutesUntil} phút)`;
  } else if (hoursUntil < 24) {
    return `${dateStr} ${timeStr} (còn ${Math.floor(hoursUntil)} giờ)`;
  } else {
    const daysUntil = Math.floor(hoursUntil / 24);
    return `${dateStr} ${timeStr} (còn ${daysUntil} ngày)`;
  }
};

/**
 * Lấy status class cho UI (badge color)
 * @param {object} task - Task object
 * @returns {string} CSS class names
 */
export const getDeadlineStatusClass = (task) => {
  if (!task || !task.deadline) return 'bg-gray-100 text-gray-700';
  
  if (task.status === 'Done') {
    return 'bg-green-100 text-green-700';
  }
  
  const status = task.computedStatus || (isTaskExpired(task) ? 'overdue' : 'safe');
  
  switch (status) {
    case 'overdue':
      return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
    case 'deadline-today':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
    case 'deadline-soon':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
  }
};

/**
 * Lấy deadline status text
 * @param {object} task - Task object
 * @returns {string} Status text
 */
export const getDeadlineStatusText = (task) => {
  if (!task || !task.deadline) return 'Không có deadline';
  
  if (task.status === 'Done') return 'Hoàn thành';
  
  const status = task.computedStatus || (isTaskExpired(task) ? 'overdue' : 'safe');
  
  switch (status) {
    case 'overdue':
      return 'Quá hạn';
    case 'deadline-today':
      return 'Hết hạn hôm nay';
    case 'deadline-soon':
      return 'Sắp hết hạn';
    default:
      return 'An toàn';
  }
};
