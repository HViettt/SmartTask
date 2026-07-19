const mongoose = require('mongoose');
const emailDigestLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Format: YYYY-MM-DD (ngày gửi theo giờ VN)
  digestDate: {
    type: String,
    required: true,
    index: true
  },
  // Status: 'sent' | 'failed'
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent'
  },
  // Số lượng công việc được gửi
  upcomingCount: {
    type: Number,
    default: 0
  },
  overdueCount: {
    type: Number,
    default: 0
  },
  // Dùng để debug
  errorMessage: {
    type: String,
    default: null
  },
  // Provider info (nếu integrate với Gmail API sau)
  providerMessageId: {
    type: String,
    default: null
  },
  // Ghi lại thời gian thực tế gửi
  sentAt: {
    type: Date,
    default: () => new Date()
  }
}, {
  timestamps: true
});

// Unique index: chỉ cho phép 1 record/user/digestDate
emailDigestLogSchema.index({ userId: 1, digestDate: 1 }, { unique: true });

module.exports = mongoose.model('EmailDigestLog', emailDigestLogSchema);
