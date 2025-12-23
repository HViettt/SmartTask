const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { processDeadlineNotifications, runImmediately } = require('../utils/taskScheduler');
const { sendEmail } = require('../utils/email');

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

/**
 * Lightweight, protected email test endpoint for production debugging.
 * Usage: GET /api/scheduler/test-email?to=user@example.com&token=YOUR_ADMIN_TEST_TOKEN
 * - Requires env ADMIN_TEST_TOKEN to be set on the server.
 * - Does NOT expose sensitive env values.
 */
router.get('/test-email', async (req, res) => {
    try {
        const { token, to } = req.query || {};
        if (!process.env.ADMIN_TEST_TOKEN) {
            return res.status(403).json({ success: false, message: 'ADMIN_TEST_TOKEN not configured' });
        }
        if (!token || token !== process.env.ADMIN_TEST_TOKEN) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const target = to || process.env.EMAIL_USER;
        if (!target) {
            return res.status(400).json({ success: false, message: 'Missing "to" param and EMAIL_USER not set' });
        }

        const result = await sendEmail(target, 'SmartTask: Production test email', '<p>This is a production email test.</p>');

        return res.json({
            success: result.success,
            error: result.error || null,
            messageId: result.messageId || null,
            meta: {
                hasCreds: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
                host: process.env.EMAIL_HOST ? 'custom' : 'gmail-default',
                port: process.env.EMAIL_PORT ? 'custom' : 'default',
                secure: process.env.EMAIL_SECURE ? 'custom' : 'default'
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal error', error: err.message });
    }
});
