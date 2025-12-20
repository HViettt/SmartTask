const moment = require('moment-timezone');

// Vietnam timezone constant
const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Parse deadline date and time into a datetime object in VN timezone
 * @param {Date|string} deadlineDate - The deadline date (Date object or string YYYY-MM-DD)
 * @param {string} deadlineTime - The deadline time in HH:MM format (default: '23:59')
 * @returns {moment.Moment} - Moment object in VN timezone
 */
function getDeadlineDateTime(deadlineDate, deadlineTime = '23:59') {
  if (!deadlineDate) {
    return null;
  }

  // Convert Date to YYYY-MM-DD string if needed
  let dateStr = deadlineDate;
  if (deadlineDate instanceof Date) {
    dateStr = moment(deadlineDate).format('YYYY-MM-DD');
  }

  // Parse time
  const [hours = 23, minutes = 59] = (deadlineTime || '23:59').split(':').map(Number);

  // Create moment in VN timezone with date and time
  // ✅ Set seconds to 59 and milliseconds to 999 để task expire SAU 23:59:59.999
  const deadlineMoment = moment
    .tz(`${dateStr} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:59`, 'YYYY-MM-DD HH:mm:ss', VN_TIMEZONE)
    .milliseconds(999);

  return deadlineMoment;
}

/**
 * Check if a task is overdue
 * @param {Object} task - Task object with deadline and deadlineTime fields
 * @param {Date} now - Current datetime (defaults to now)
 * @returns {boolean} - true if task is overdue, false otherwise
 */
function isTaskOverdue(task, now = new Date()) {
  if (!task || !task.deadline) {
    return false;
  }

  // If task is already done, it's not overdue
  if (task.status === 'Done') {
    return false;
  }

  const deadlineMoment = getDeadlineDateTime(task.deadline, task.deadlineTime);
  const nowMoment = moment.tz(now, VN_TIMEZONE);

  // Task is overdue if current time is after deadline time
  return nowMoment.isAfter(deadlineMoment);
}

/**
 * Determine deadline status for display purposes
 * @param {Object} task - Task object with deadline and deadlineTime fields
 * @param {Date} now - Current datetime (defaults to now)
 * @returns {string} - Status: 'overdue' | 'deadline-today' | 'deadline-soon' | 'safe' | 'done'
 */
function getDeadlineStatus(task, now = new Date()) {
  if (!task || !task.deadline) {
    return 'safe';
  }

  // If task is done, return done
  if (task.status === 'Done') {
    return 'done';
  }

  const deadlineMoment = getDeadlineDateTime(task.deadline, task.deadlineTime);
  const nowMoment = moment.tz(now, VN_TIMEZONE);
  const todayStart = moment.tz(VN_TIMEZONE).startOf('day');
  const tomorrowStart = moment.tz(VN_TIMEZONE).add(1, 'day').startOf('day');

  // Check if overdue
  if (nowMoment.isAfter(deadlineMoment)) {
    return 'overdue';
  }

  // Check if deadline is today
  if (
    deadlineMoment.isSameOrAfter(todayStart) &&
    deadlineMoment.isBefore(tomorrowStart)
  ) {
    return 'deadline-today';
  }

  // Check if deadline is within 3 days
  const threeaysFromNow = moment.tz(VN_TIMEZONE).add(3, 'days').startOf('day');
  if (deadlineMoment.isBefore(threeaysFromNow)) {
    return 'deadline-soon';
  }

  return 'safe';
}

/**
 * Format deadline for display
 * @param {Date} deadlineDate - The deadline date
 * @param {string} deadlineTime - The deadline time in HH:MM format
 * @returns {string} - Formatted deadline string (e.g., "18/01/2024 18:30")
 */
function formatDeadline(deadlineDate, deadlineTime = '23:59') {
  const deadlineMoment = getDeadlineDateTime(deadlineDate, deadlineTime);
  if (!deadlineMoment) {
    return null;
  }
  return deadlineMoment.format('DD/MM/YYYY HH:mm');
}

/**
 * Get relative time until deadline (e.g., "2 hours", "3 days")
 * @param {Date} deadlineDate - The deadline date
 * @param {string} deadlineTime - The deadline time in HH:MM format
 * @returns {string} - Relative time string
 */
function getTimeUntilDeadline(deadlineDate, deadlineTime = '23:59') {
  const deadlineMoment = getDeadlineDateTime(deadlineDate, deadlineTime);
  if (!deadlineMoment) {
    return null;
  }
  return deadlineMoment.fromNow();
}

/**
 * Validate deadline time format
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {boolean} - true if valid, false otherwise
 */
function isValidDeadlineTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    return false;
  }

  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(timeStr);
}

/**
 * Get all tasks that became overdue since last check
 * @param {Array} tasks - Array of task objects
 * @param {Date} lastCheckTime - Time of last check
 * @param {Date} now - Current time
 * @returns {Array} - Array of newly overdue tasks
 */
function getNewlyOverdueTasks(tasks, lastCheckTime, now = new Date()) {
  return tasks.filter(task => {
    // Task must not be done and not already marked as notified
    if (task.status === 'Done' || task.isOverdueNotified) {
      return false;
    }

    const wasNotOverdue = !isTaskOverdue(task, lastCheckTime);
    const isNowOverdue = isTaskOverdue(task, now);

    return wasNotOverdue && isNowOverdue;
  });
}

module.exports = {
  getDeadlineDateTime,
  isTaskOverdue,
  getDeadlineStatus,
  formatDeadline,
  getTimeUntilDeadline,
  isValidDeadlineTime,
  getNewlyOverdueTasks,
  VN_TIMEZONE,
};
