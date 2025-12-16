const Notification = require('../models/Notification');

// GET /api/notifications - Lấy danh sách thông báo
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 20, skip = 0, unreadOnly = false } = req.query;
    
    const query = { userId: req.user._id };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ message: 'Lỗi khi tải thông báo' });
  }
};

// PUT /api/notifications/:id/read - Đánh dấu đã đọc
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

    res.json(notification);
  } catch (error) {
    console.error('Mark as Read Error:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật thông báo' });
  }
};

// PUT /api/notifications/read-all - Đánh dấu tất cả đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
  } catch (error) {
    console.error('Mark All as Read Error:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật thông báo' });
  }
};

// DELETE /api/notifications/:id - Xóa thông báo
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    res.json({ message: 'Đã xóa thông báo' });
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
        type: 'deadline',
        title: 'Thông báo deadline sắp đến (TEST)',
        message: 'Có 2 công việc cần chú ý trong 24 giờ tới',
        severity: 'warn',
        read: false,
        metadata: {
          test: true,
          emailSent: false,
          upcoming: sampleTasks,
          overdue: []
        }
      },
      {
        userId: req.user._id,
        type: 'email',
        title: 'Đã gửi thông báo qua Email (TEST)',
        message: '5 công việc: 2 quá hạn, 3 sắp hết hạn đã được gửi đến email của bạn',
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
        type: 'task',
        title: 'Công việc mới được tạo (TEST)',
        message: 'Bạn có công việc mới: "Review code Pull Request #123"',
        severity: 'info',
        read: false,
        metadata: {
          test: true,
          task: sampleTasks[1]
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
