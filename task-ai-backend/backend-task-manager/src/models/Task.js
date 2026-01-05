
const mongoose = require('mongoose');

// Chuẩn hóa tiêu đề để so sánh trùng lặp
const normalizeTitle = (title = '') =>
  title
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

const taskSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  // Soft-delete metadata (khong dung plugin de chu dong kiem soat hanh vi)
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: { type: Date, default: null, index: true },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date, required: true },
  deadlineTime: { type: String, default: '23:59' },
  normalizedTitle: { type: String, index: true },
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'], 
    required: true 
  },
  complexity: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Todo', 'Doing', 'Done'], 
    default: 'Todo' 
  },
  notes: { type: String },
  completedAt: { type: Date },
  isOverdueNotified: { 
    type: Boolean, 
    default: false 
  },
}, {
  timestamps: true
});

// Create indexes for performance as per ERD
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, deadline: 1 });
taskSchema.index({ userId: 1, normalizedTitle: 1, deadline: 1 });
taskSchema.index({ userId: 1, isDeleted: 1, deletedAt: 1 });

// Ensure normalized title is always stored for duplicate detection
taskSchema.pre('save', function(next) {
  this.normalizedTitle = normalizeTitle(this.title);
  next();
});

module.exports = mongoose.model('Task', taskSchema);
