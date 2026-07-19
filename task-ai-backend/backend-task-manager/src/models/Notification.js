const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    // Bao gồm type legacy để tránh lỗi dữ liệu cũ; type hệ thống chuẩn: EMAIL_SENT | DUE_SOON | OVERDUE
    enum: ['deadline', 'email', 'task', 'task-status', 'EMAIL_SENT', 'DUE_SOON', 'OVERDUE'],
    required: true
  },
  subtype: {
    type: String,
    enum: ['deadline-soon', 'not-started', 'in-progress', 'overdue', 'completed'],
    default: null
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warn', 'warning', 'critical', 'success'],
    default: 'info'
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  read: {
    type: Boolean,
    default: false
  },
  // Thời điểm hệ thống “kích hoạt” lại thông báo (do dữ liệu dashboard đổi)
  lastTriggeredAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Dùng để đồng bộ với Gmail / các nguồn khác, tránh trùng lặp
  provider: {
    type: String,
    default: 'local'
  },
  externalId: {
    type: String,
    default: null,
    index: true
  }
}, {
  timestamps: true
});

// Index để query nhanh
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, lastTriggeredAt: -1 });
notificationSchema.index({ userId: 1, provider: 1, externalId: 1 }, { unique: false });

// ==========================
// DEDUP THÔNG BÁO THEO LOẠI
// ==========================
// Yêu cầu: Mỗi loại thông báo (theo cặp type/subtype) chỉ có 1 record mới nhất.
// Giải pháp: Áp dụng unique index theo {userId, type, subtype}
// Lưu ý: subtype có thể null (ví dụ type='EMAIL_SENT'), index vẫn unique trên cặp.
// Khi ghi thông báo mới cùng loại, backend sẽ dùng upsert (findOneAndUpdate) để ghi đè.
notificationSchema.index(
  { userId: 1, type: 1, subtype: 1 },
  { unique: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
