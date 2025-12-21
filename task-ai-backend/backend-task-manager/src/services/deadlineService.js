/**
 * Dịch vụ dùng chung để tính danh sách task sắp hết hạn / quá hạn
 * Yêu cầu: TÁI SỬ DỤNG 100% logic của Dashboard (đang hiển thị đúng)
 * - overdue: deadline < now
 * - upcoming: deadline <= now + 48h và deadline >= now
 * - Chỉ lấy task chưa hoàn thành (status != 'Done')
 */

const Task = require('../models/Task');
const { getDeadlineDateTime } = require('../utils/deadlineHelper');

// Chuẩn hóa task (giảm payload, đủ cho Notification/Dashboard)
const mapTaskSummary = (task) => ({
  _id: task._id,
  title: task.title,
  deadline: task.deadline,
  deadlineTime: task.deadlineTime,
  status: task.status,
  priority: task.priority,
  complexity: task.complexity
});

// Phân loại danh sách task (array) theo logic Dashboard
const buildDeadlineBucketsByTasks = (tasks, now = new Date()) => {
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const bucketsByUser = new Map();

  tasks.forEach(task => {
    if (!task.userId) return;
    if (!task.deadline) return;

    // So sánh FULL datetime theo deadline + deadlineTime (timezone VN)
    const deadlineMoment = getDeadlineDateTime(task.deadline, task.deadlineTime);
    const isOverdue = deadlineMoment ? deadlineMoment.toDate() < now : false;
    const isUpcoming = !isOverdue && (deadlineMoment ? deadlineMoment.toDate() <= in48Hours : false);
    if (!isOverdue && !isUpcoming) return;

    const key = task.userId.toString();
    const bucket = bucketsByUser.get(key) || { upcoming: [], overdue: [] };
    if (isUpcoming) bucket.upcoming.push(mapTaskSummary(task));
    if (isOverdue) bucket.overdue.push(mapTaskSummary(task));
    bucketsByUser.set(key, bucket);
  });

  return bucketsByUser;
};

// Lấy bucket cho 1 user (dùng cho Notification refresh + Dashboard nếu cần)
const getUserDeadlineBuckets = async (userId, now = new Date()) => {
  const tasks = await Task.find({
    userId,
    status: { $ne: 'Done' },
    deadline: { $exists: true, $ne: null }
  }).lean();

  const buckets = buildDeadlineBucketsByTasks(tasks, now).get(userId?.toString()) || { upcoming: [], overdue: [] };
  return buckets;
};

// Lấy bucket cho tất cả user (dùng cho scheduler batch)
const getAllUsersDeadlineBuckets = async (now = new Date()) => {
  const tasks = await Task.find({
    status: { $ne: 'Done' },
    deadline: { $exists: true, $ne: null }
  }).lean();
  return buildDeadlineBucketsByTasks(tasks, now);
};

module.exports = {
  mapTaskSummary,
  buildDeadlineBucketsByTasks,
  getUserDeadlineBuckets,
  getAllUsersDeadlineBuckets
};
