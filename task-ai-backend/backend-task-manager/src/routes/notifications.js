const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// Tất cả routes cần authentication
router.use(protect);

router.get('/', notificationController.getNotifications);
router.post('/test', notificationController.createTestNotification);
router.post('/email-ingest', notificationController.ingestEmailNotification);
router.delete('/purge-test', notificationController.purgeTestNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
