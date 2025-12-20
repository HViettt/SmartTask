const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Tất cả routes cần authentication
router.use(protect);

// ===== NOTIFICATION & PREFERENCES =====
router.get('/settings', userController.getNotificationSettings);
router.put('/settings', userController.updateNotificationSettings);
router.put('/preferences', userController.updatePreferences);

// ===== USER PROFILE =====
router.get('/profile', userController.getProfile);           // Lấy thông tin profile
router.put('/profile', userController.updateProfile);        // Cập nhật profile (name, avatar)
router.put('/change-password', userController.changePassword); // Đổi mật khẩu
router.post('/set-password', userController.setPassword);    // Thiết lập mật khẩu (Google users)

module.exports = router;
