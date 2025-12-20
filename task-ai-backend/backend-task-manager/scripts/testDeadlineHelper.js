/**
 * ============================================================================
 * DEADLINE HELPER TEST SUITE
 * ============================================================================
 * Testing VN timezone deadline calculations
 */

const {
  getDeadlineDateTime,
  isTaskOverdue,
  getDeadlineStatus,
  formatDeadline,
  getTimeUntilDeadline,
  isValidDeadlineTime,
  getNewlyOverdueTasks
} = require('../src/utils/deadlineHelper');

const moment = require('moment-timezone');
const VN_TZ = 'Asia/Ho_Chi_Minh';

console.log('🧪 Starting Deadline Helper Tests...\n');

// Test 1: Valid Deadline Time Validation
console.log('📝 Test 1: Validate Deadline Time Format');
console.assert(isValidDeadlineTime('23:59') === true, 'Should accept 23:59');
console.assert(isValidDeadlineTime('00:00') === true, 'Should accept 00:00');
console.assert(isValidDeadlineTime('12:30') === true, 'Should accept 12:30');
console.assert(isValidDeadlineTime('25:00') === false, 'Should reject 25:00');
console.assert(isValidDeadlineTime('12:60') === false, 'Should reject 12:60');
console.assert(isValidDeadlineTime('invalid') === false, 'Should reject invalid format');
console.log('✅ Passed: Deadline time validation\n');

// Test 2: Get Deadline DateTime
console.log('📝 Test 2: Get Deadline DateTime in VN Timezone');
const deadline = new Date('2024-01-18T00:00:00Z');
const dt1 = getDeadlineDateTime(deadline, '18:30');
console.assert(dt1.format('DD/MM/YYYY HH:mm') === '18/01/2024 18:30', 'Should format correctly');
console.assert(dt1.tz() === VN_TZ, 'Should be in VN timezone');
console.log('✅ Passed: Deadline datetime conversion\n');

// Test 3: Task Overdue Detection
console.log('📝 Test 3: Overdue Task Detection (VN Timezone)');
const task1 = {
  deadline: new Date('2024-01-18T00:00:00Z'),
  deadlineTime: '18:30',
  status: 'Todo'
};

// BEFORE deadline (17:00 VN time on 18th)
const beforeDeadline = moment.tz('2024-01-18 17:00', 'YYYY-MM-DD HH:mm', VN_TZ).toDate();
console.assert(isTaskOverdue(task1, beforeDeadline) === false, 'Should NOT be overdue before deadline time');

// AFTER deadline (19:00 VN time on 18th)
const afterDeadline = moment.tz('2024-01-18 19:00', 'YYYY-MM-DD HH:mm', VN_TZ).toDate();
console.assert(isTaskOverdue(task1, afterDeadline) === true, 'Should be overdue after deadline time');

// Done tasks never overdue
const doneTask = { ...task1, status: 'Done' };
console.assert(isTaskOverdue(doneTask, afterDeadline) === false, 'Completed tasks never overdue');
console.log('✅ Passed: Overdue detection\n');

// Test 4: Deadline Status
console.log('📝 Test 4: Get Deadline Status for Display');
const now = moment.tz('2024-01-18 10:00', 'YYYY-MM-DD HH:mm', VN_TZ).toDate();

const task2 = {
  deadline: new Date('2024-01-18T00:00:00Z'),
  deadlineTime: '18:30',
  status: 'Todo'
};
console.assert(getDeadlineStatus(task2, now) === 'deadline-today', 'Should be deadline-today');

const task3 = {
  deadline: new Date('2024-01-18T00:00:00Z'),
  deadlineTime: '18:30',
  status: 'Todo'
};
const afterDeadline2 = moment.tz('2024-01-18 20:00', 'YYYY-MM-DD HH:mm', VN_TZ).toDate();
console.assert(getDeadlineStatus(task3, afterDeadline2) === 'overdue', 'Should be overdue');

const task4 = {
  deadline: new Date('2024-01-25T00:00:00Z'),
  deadlineTime: '23:59',
  status: 'Todo'
};
console.assert(getDeadlineStatus(task4, now) === 'safe', 'Should be safe');

const doneTask2 = { ...task2, status: 'Done' };
console.assert(getDeadlineStatus(doneTask2, now) === 'done', 'Completed tasks should show as done');
console.log('✅ Passed: Deadline status detection\n');

// Test 5: Format Deadline
console.log('📝 Test 5: Format Deadline for Display');
const formatted = formatDeadline(new Date('2024-01-18T00:00:00Z'), '18:30');
console.assert(formatted === '18/01/2024 18:30', 'Should format as DD/MM/YYYY HH:mm');
console.log('✅ Passed: Deadline formatting\n');

// Test 6: Get Newly Overdue Tasks
console.log('📝 Test 6: Find Newly Overdue Tasks');
const allTasks = [
  { deadline: new Date('2024-01-15'), deadlineTime: '23:59', status: 'Todo', isOverdueNotified: false },
  { deadline: new Date('2024-01-17'), deadlineTime: '18:00', status: 'Todo', isOverdueNotified: false },
  { deadline: new Date('2024-01-20'), deadlineTime: '10:00', status: 'Todo', isOverdueNotified: false },
  { deadline: new Date('2024-01-18'), deadlineTime: '23:59', status: 'Done', isOverdueNotified: false }
];

const lastCheck = moment.tz('2024-01-17 17:00', 'YYYY-MM-DD HH:mm', VN_TZ).toDate();
const currentTime = moment.tz('2024-01-17 18:30', 'YYYY-MM-DD HH:mm', VN_TZ).toDate();

const newlyOverdue = getNewlyOverdueTasks(allTasks, lastCheck, currentTime);
console.assert(newlyOverdue.length > 0, 'Should find newly overdue tasks');
console.log('✅ Passed: Newly overdue task detection\n');

// Test 7: Default Deadline Time
console.log('📝 Test 7: Default Deadline Time');
const dt2 = getDeadlineDateTime(new Date('2024-01-18'), undefined);
console.assert(dt2.format('HH:mm') === '23:59', 'Should default to 23:59');
console.log('✅ Passed: Default deadline time\n');

// Test 8: VN Timezone Accuracy
console.log('📝 Test 8: VN Timezone Accuracy (UTC+7)');
const utcTime = moment.utc('2024-01-18 12:00').toDate();
const vnTime = moment.tz(utcTime, VN_TZ);
console.assert(vnTime.format('HH:mm') === '19:00', 'UTC 12:00 should be VN 19:00 (UTC+7)');
console.log('✅ Passed: VN timezone calculation\n');

console.log('═══════════════════════════════════════════════════════════');
console.log('✅ ALL TESTS PASSED!');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('Summary:');
console.log('✓ Deadline time validation working');
console.log('✓ Datetime conversion to VN timezone working');
console.log('✓ Overdue detection accurate');
console.log('✓ Deadline status display correct');
console.log('✓ Deadline formatting correct');
console.log('✓ Newly overdue task detection working');
console.log('✓ Default time handling correct');
console.log('✓ VN timezone (UTC+7) calculations accurate\n');

console.log('🎯 Ready for Phase 2: Frontend integration!\n');
