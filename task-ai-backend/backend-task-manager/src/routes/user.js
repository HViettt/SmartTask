const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Tất cả routes cần authentication
router.use(protect);

router.get('/settings', userController.getNotificationSettings);
router.put('/settings', userController.updateNotificationSettings);
router.put('/preferences', userController.updatePreferences);

module.exports = router;
