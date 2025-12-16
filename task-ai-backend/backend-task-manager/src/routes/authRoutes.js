const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware'); // Cần một middleware bảo vệ

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
// Route mới để xử lý token reset password
router.put('/reset-password/:token', authController.resetPassword); 
// Route mới cho login với google
router.post('/google-login', authController.loginGoogle);
// Route để lấy thông tin user đã đăng nhập
router.get('/profile', protect, authController.getUserProfile); 

module.exports = router;