const Notification = require('../models/Notification');
const { NOTIFICATION_TYPES } = require('../common/constants');

// ============================================================================
// OPTIMIZATION: Request Deduplication Cache
// ============================================================================
// Mục đích: Tránh database query liên tục (mỗi 30s = 2 lần/phút)
// Cơ chế: Lưu cache 5 phút, chỉ query database khi cache hết hạn
// Kết quả: Giảm 90% database hits, tốn resource CPU/RAM minimal
// 
// Công thức: cache = { [userId]: { data, timestamp } }
// Nếu (now - timestamp) < 5 phút → return cache
// Nếu (now - timestamp) >= 5 phút → query DB + update cache
// ============================================================================
const notificationCache = new Map(); // { userId: { data, timestamp } }
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const getCachedNotifications = (userId) => {
  const cached = notificationCache.get(userId);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data; // Return cache nếu còn fresh
  }
  
  // Cache expired → xóa
  notificationCache.delete(userId);
  return null;
};

const setCachedNotifications = (userId, data) => {
  notificationCache.set(userId, { data, timestamp: Date.now() });
};

// GET /api/notifications - Lấy danh sách thông báo
// =============================
// YÊU CẦU MỚI:
// - Mỗi loại thông báo (type/subtype) chỉ hiển thị bản ghi MỚI NHẤT
// - Không hiển thị lịch sử cũ, chỉ giữ 1 tin cho mỗi loại
// KỸ THUẬT:
// - Sử dụng aggregation: sort theo updatedAt DESC, group theo {type, subtype}, lấy bản ghi đầu tiên
// OPTIMIZATION:
// - Cache 5 phút để tránh repeated DB queries
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { unreadOnly = false } = req.query;
    
    // ⚡ OPTIMIZATION: Check cache trước - giảm 90% DB queries
    const cached = getCachedNotifications(userId);
    if (cached && unreadOnly !== 'true') {
      return res.json(cached); // Return cache ngay nếu tìm thấy
    }

    // ✅ Gate theo cài đặt người dùng: nếu tắt thông báo, không trả về loại bị tắt
    const User = require('../models/User');
    const user = await User.findById(userId).select('notificationSettings').lean();
    const settings = user?.notificationSettings || {};

    let allowedTypes = Object.values(NOTIFICATION_TYPES);
    // Nếu tắt email → bỏ EMAIL_SENT
    if (settings.emailNotifications === false) {
      allowedTypes = allowedTypes.filter(t => t !== NOTIFICATION_TYPES.EMAIL_SENT);
    }
    // Nếu tắt deadline → bỏ DUE_SOON và OVERDUE
    if (settings.deadlineNotifications === false) {
      allowedTypes = allowedTypes.filter(t => t !== NOTIFICATION_TYPES.DUE_SOON && t !== NOTIFICATION_TYPES.OVERDUE);
    }

    const matchStage = { userId: userId, type: { $in: allowedTypes } };
    if (unreadOnly === 'true') {
      matchStage.read = false;
    }

    const pipeline = [
      { $match: matchStage },
      { $sort: { updatedAt: -1 } }, // Ưu tiên bản ghi cập nhật mới nhất
      { $group: {
          _id: { type: '$type' },
          doc: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { updatedAt: -1 } }
    ];

    const notifications = await Notification.aggregate(pipeline);

    // ✅ Unread badge cũng phải gate theo cài đặt, tránh tăng badge khi user đã tắt
    const unreadCount = await Notification.countDocuments({
      userId: userId,
      type: { $in: allowedTypes },
      read: false
    });

    const result = { notifications, unreadCount };
    
    // ⚡ OPTIMIZATION: Lưu vào cache để request tiếp theo không cần query DB
    if (unreadOnly !== 'true') {
      setCachedNotifications(userId, result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ message: 'Lỗi khi tải thông báo' });
  }
};

// PUT /api/notifications/:id/read - Đánh dấu đã đọc
// + Clear cache để fetch tiếp theo thấy data mới
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    // ⚡ Clear cache để request tiếp theo thấy data mới
    notificationCache.delete(req.user._id);

    res.json(notification);
  } catch (error) {
    console.error('Mark as Read Error:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật thông báo' });
  }
};

// PUT /api/notifications/read-all - Đánh dấu tất cả đã đọc
// + Clear cache
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    // ⚡ Clear cache để request tiếp theo thấy data mới
    notificationCache.delete(req.user._id);

    res.json({ message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
  } catch (error) {
    console.error('Mark All as Read Error:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật thông báo' });
  }
};

// DELETE /api/notifications/:id - Xóa thông báo
// + Clear cache
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    // ⚡ Clear cache để request tiếp theo thấy data mới
    notificationCache.delete(req.user._id);
  } catch (error) {
    console.error('Delete Notification Error:', error);
    res.status(500).json({ message: 'Lỗi khi xóa thông báo' });
  }
};

// POST /api/notifications/test - Tạo thông báo test (có cờ metadata.test để dễ xóa)
exports.createTestNotification = async (req, res) => {
  try {
    const sampleTasks = [
      {
        _id: 't1',
        title: 'Hoàn thành dự án React',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        priority: 'High',
        complexity: 'Medium',
        status: 'In Progress'
      },
      {
        _id: 't2',
        title: 'Review code Pull Request #123',
        deadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
        priority: 'Medium',
        complexity: 'Easy',
        status: 'Todo'
      }
    ];

    const notifications = [
      {
        userId: req.user._id,
        type: NOTIFICATION_TYPES.EMAIL_SENT,
        title: 'Đã gửi thông báo qua Gmail (TEST)',
        message: '5 công việc: 2 quá hạn, 3 sắp hết hạn đã được gửi qua email',
        severity: 'info',
        read: false,
        metadata: {
          test: true,
          emailSent: true,
          upcomingCount: 3,
          overdueCount: 2,
          upcoming: sampleTasks,
          overdue: []
        }
      },
      {
        userId: req.user._id,
        type: NOTIFICATION_TYPES.DUE_SOON,
        title: '⚠️ Công việc sắp hết hạn (TEST)',
        message: 'Có 2 công việc cần chú ý trong 48 giờ tới',
        severity: 'warn',
        read: false,
        metadata: {
          test: true,
          upcomingCount: sampleTasks.length,
          upcoming: sampleTasks
        }
      },
      {
        userId: req.user._id,
        type: NOTIFICATION_TYPES.OVERDUE,
        title: '🚨 Công việc quá hạn (TEST)',
        message: '1 công việc đã quá hạn cần xử lý',
        severity: 'critical',
        read: false,
        metadata: {
          test: true,
          overdueCount: 1,
          overdue: [sampleTasks[0]]
        }
      }
    ];

    const created = await Notification.insertMany(notifications);

    res.json({
      message: `Đã tạo ${created.length} thông báo test thành công`,
      notifications: created
    });
  } catch (error) {
    console.error('Create Test Notification Error:', error);
    res.status(500).json({ message: 'Lỗi khi tạo thông báo test' });
  }
};

// POST /api/notifications/email-ingest - Nhận thông báo từ Gmail/webhook và lưu vào in-app (dedup theo externalId)
exports.ingestEmailNotification = async (req, res) => {
  try {
    const { subject, body, threadId, messageId, taskId, severity = 'info', provider = 'gmail', metadata = {} } = req.body;

    if (!subject || !messageId) {
      return res.status(400).json({ message: 'Thiếu subject hoặc messageId' });
    }

    // Tránh trùng lặp: nếu đã có messageId cho user thì bỏ qua
    const existing = await Notification.findOne({ userId: req.user._id, provider, externalId: messageId });
    if (existing) {
      return res.status(200).json({ message: 'Thông báo đã tồn tại', notification: existing });
    }

    // ✅ Gate: nếu user tắt email notifications → không tạo thông báo email
    const User = require('../models/User');
    const user = await User.findById(req.user._id).select('notificationSettings').lean();
    if (user?.notificationSettings?.emailNotifications === false) {
      return res.status(200).json({ message: 'Email notifications đã tắt. Bỏ qua ghi thông báo.' });
    }

    const notification = await Notification.create({
      userId: req.user._id,
      type: 'email',
      title: subject,
      message: body?.slice(0, 500) || 'Bạn có email mới liên quan đến công việc',
      severity,
      taskId: taskId || null,
      provider,
      externalId: messageId,
      metadata: {
        ...metadata,
        threadId,
        messageId,
        source: 'gmail'
      }
    });

    return res.status(201).json({ message: 'Đã ghi thông báo email', notification });
  } catch (error) {
    console.error('Email ingest error:', error);
    return res.status(500).json({ message: 'Lỗi ghi thông báo email' });
  }
};

// DELETE /api/notifications/purge-test - Xóa thông báo test, giữ thông báo email thật
exports.purgeTestNotifications = async (req, res) => {
  try {
    const knownTestMessages = [
      'Công việc "Hoàn thành dự án React" sẽ hết hạn trong 24 giờ',
      '5 công việc: 2 quá hạn, 3 sắp hết hạn đã được gửi đến email của bạn',
      'Bạn có công việc mới: "Review code Pull Request #123"',
      'Có 2 công việc cần chú ý trong 24 giờ tới'
    ];

    const result = await Notification.deleteMany({
      userId: req.user._id,
      $or: [
        { 'metadata.test': true },
        { message: { $in: knownTestMessages } }
      ]
    });

    res.json({
      message: 'Đã xóa thông báo test. Thông báo email thực tế được giữ nguyên.',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Purge Test Notification Error:', error);
    res.status(500).json({ message: 'Lỗi khi xóa thông báo test' });
  }
};
