const mongoose = require('mongoose');

/**
 * ============================================================================
 * EMAIL DIGEST LOG MODEL
 * ============================================================================
 * Mục đích: Ghi lại lịch sử gửi email tổng hợp deadline hàng ngày
 * 
 * Tính năng:
 * - Tránh gửi trùng lặp: 1 user chỉ nhận 1 email/ngày
 * - Lưu trạng thái: sent/failed + error message
 * - Tracked tasks: Danh sách task được gửi + tổng số (dùng để audit)
 * 
 * Unique constraint: { userId, digestDate } -> 1 record/user/ngày
 * 
 * Author: System Implementation
 * Last Updated: December 20, 2025
 * ============================================================================
 */

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
