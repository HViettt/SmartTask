const User = require('../models/User');
const { uploadBase64Image, deleteImage } = require('../config/cloudinary');

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

// =====================================================================
// USER PROFILE MANAGEMENT
// =====================================================================

/**
 * @desc    Lấy thông tin profile người dùng
 * @route   GET /api/user/profile
 * @access  Private (cần JWT token)
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy người dùng' 
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isGoogleUser: !!user.googleId,
        hasPassword: user.hasPassword || false,
        isVerified: user.isVerified,
        preferences: user.preferences,
        notificationSettings: user.notificationSettings,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi tải thông tin profile' 
    });
  }
};

/**
 * @desc    Cập nhật thông tin profile (name, avatar)
 * @route   PUT /api/user/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    // Validation
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ 
          success: false,
          message: 'Tên không được để trống' 
        });
      }
      updates.name = name.trim();
    }

    if (avatar !== undefined) {
      // Nếu avatar là base64
      if (avatar && avatar.startsWith('data:image/')) {
        try {
          // Kiểm tra xem Cloudinary có được cấu hình không
          const hasCloudinary = 
            process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
            process.env.CLOUDINARY_API_KEY && 
            process.env.CLOUDINARY_API_KEY !== 'demo';

          if (hasCloudinary) {
            // Upload lên Cloudinary nếu có config
            const currentUser = await User.findById(req.user._id);
            if (currentUser.avatar && currentUser.avatar.includes('cloudinary')) {
              await deleteImage(currentUser.avatar);
            }
            
            const cloudinaryUrl = await uploadBase64Image(avatar, 'avatars');
            updates.avatar = cloudinaryUrl;
          } else {
            // Lưu trực tiếp base64 nếu không có Cloudinary (dev mode)
            console.log('⚠️ Cloudinary not configured - saving base64 directly');
            updates.avatar = avatar;
          }
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          // Fallback: lưu base64 nếu upload thất bại
          console.log('⚠️ Upload failed - saving base64 as fallback');
          updates.avatar = avatar;
        }
      } else {
        // Nếu là URL thông thường
        updates.avatar = avatar;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy người dùng' 
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isGoogleUser: !!user.googleId
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi cập nhật profile' 
    });
  }
};

/**
 * @desc    Đổi mật khẩu (chỉ cho user đăng ký bằng email/password)
 * @route   PUT /api/user/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // 1. Validation input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu mới và xác nhận không khớp' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
      });
    }

    // 2. Lấy user với password field (thường bị exclude)
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy người dùng' 
      });
    }

    // 3. Kiểm tra nếu là Google user (không có password)
    if (user.googleId && !user.password) {
      return res.status(400).json({ 
        success: false,
        message: 'Tài khoản đăng nhập bằng Google không thể đổi mật khẩu' 
      });
    }

    // 4. Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Mật khẩu hiện tại không đúng' 
      });
    }

    // 5. Update password (pre-save hook sẽ tự động hash)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi đổi mật khẩu' 
    });
  }
};

/**
 * @desc    Thiết lập mật khẩu lần đầu (chỉ cho user đăng ký bằng Google)
 * @route   POST /api/user/set-password
 * @access  Private
 */
exports.setPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    // 1. Validation input
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu và xác nhận không khớp' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự' 
      });
    }

    // 2. Lấy user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy người dùng' 
      });
    }

    // 3. Kiểm tra đây có phải Google user không
    if (!user.googleId) {
      return res.status(400).json({ 
        success: false,
        message: 'Chỉ có Google user mới có thể thiết lập mật khẩu lần đầu' 
      });
    }

    if (user.hasPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Bạn đã thiết lập mật khẩu rồi. Sử dụng thay đổi mật khẩu để cập nhật.' 
      });
    }

    // 4. Thiết lập password (pre-save hook sẽ tự động hash và set hasPassword=true)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Thiết lập mật khẩu thành công',
      data: {
        hasPassword: user.hasPassword
      }
    });
  } catch (error) {
    console.error('Set Password Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi thiết lập mật khẩu' 
    });
  }
};
