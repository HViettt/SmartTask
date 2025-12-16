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
    enum: ['deadline', 'email', 'task', 'task-status'],
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
    enum: ['info', 'warn', 'critical'],
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
notificationSchema.index({ userId: 1, provider: 1, externalId: 1 }, { unique: false });

module.exports = mongoose.model('Notification', notificationSchema);
