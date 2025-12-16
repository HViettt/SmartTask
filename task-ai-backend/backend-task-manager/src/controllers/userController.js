const User = require('../models/User');

// GET /api/user/settings - Lấy cài đặt thông báo
exports.getNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationSettings');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      notificationSettings: user.notificationSettings || {
        emailNotifications: true,
        taskActionToasts: true,
        webEntryAlerts: true,
        taskStatusNotifications: true
      }
    });
  } catch (error) {
    console.error('Get Notification Settings Error:', error);
    res.status(500).json({ message: 'Lỗi khi tải cài đặt' });
  }
};

// PUT /api/user/preferences - Cập nhật preferences (language, theme)
exports.updatePreferences = async (req, res) => {
  try {
    const { language, theme } = req.body;
    const updates = {};

    if (language) updates['preferences.language'] = language;
    if (theme) updates['preferences.theme'] = theme;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('preferences');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      message: 'Cập nhật preferences thành công',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update Preferences Error:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật preferences' });
  }
};

// PUT /api/user/settings - Cập nhật cài đặt thông báo
exports.updateNotificationSettings = async (req, res) => {
  try {
    const { emailNotifications, taskActionToasts, webEntryAlerts, taskStatusNotifications } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'notificationSettings.emailNotifications': emailNotifications,
          'notificationSettings.taskActionToasts': taskActionToasts,
          'notificationSettings.webEntryAlerts': webEntryAlerts,
          'notificationSettings.taskStatusNotifications': taskStatusNotifications
        }
      },
      { new: true, runValidators: true }
    ).select('notificationSettings');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      message: 'Cập nhật cài đặt thành công',
      notificationSettings: user.notificationSettings
    });
  } catch (error) {
    console.error('Update Notification Settings Error:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật cài đặt' });
  }
};
