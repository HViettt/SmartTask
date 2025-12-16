const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { processDeadlineNotifications, runImmediately } = require('../utils/taskScheduler');

/**
 * @route   POST /api/scheduler/test
 * @desc    Test scheduler - Chạy thử kiểm tra và gửi thông báo deadline ngay lập tức
 * @access  Private (chỉ admin hoặc dev)
 */
router.post('/test', protect, async (req, res) => {
    try {
        console.log(`🧪 [Manual Test] User ${req.user.email} triggered scheduler test`);
        
        await processDeadlineNotifications();
        
        res.json({
            success: true,
            message: 'Scheduler test completed. Check console logs for details.'
        });
    } catch (error) {
        console.error('❌ Error in scheduler test:', error);
        res.status(500).json({
            success: false,
            message: 'Scheduler test failed',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/scheduler/status
 * @desc    Kiểm tra trạng thái scheduler
 * @access  Private
 */
router.get('/status', protect, (req, res) => {
    res.json({
        success: true,
        message: 'Task Scheduler is active',
        schedule: 'Runs daily at 9:00 AM (Asia/Ho_Chi_Minh)',
        nextRun: 'Check server logs for next scheduled run'
    });
});

module.exports = router;
