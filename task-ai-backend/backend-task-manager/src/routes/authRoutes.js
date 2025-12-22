const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware'); // Cần một middleware bảo vệ
const { validateRegister, validateLogin, validateVerifyEmail } = require('../middlewares/validate.middleware');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/verify-email', validateVerifyEmail, authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
// Đặt lại mật khẩu bằng mã OTP (email + code + password)
router.put('/reset-password', authController.resetPasswordByCode); 
// Route mới cho login với google
router.post('/google-login', authController.loginGoogle);
// Route để lấy thông tin user đã đăng nhập
router.get('/profile', protect, authController.getUserProfile); 

module.exports = router;