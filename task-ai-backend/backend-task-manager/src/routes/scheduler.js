const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { processDeadlineNotifications, runImmediately } = require('../utils/taskScheduler');
const { sendEmail } = require('../utils/email');
const net = require('net');
const nodemailer = require('nodemailer');

/**
 * @route   POST /api/scheduler/test
 * @desc    Test scheduler - Chạy thử kiểm tra và gửi thông báo deadline ngay lập tức
 * @access  Private (chỉ admin hoặc dev)
 */
router.post('/test', protect, async (req, res) => {
    try {
        await processDeadlineNotifications();
        
        res.json({
            success: true,
            message: 'Scheduler test completed. Check console logs for details.'
        });
    } catch (error) {
        console.error('Error in scheduler test:', error);
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
        schedule: [
            'Email digest: 07:00 Asia/Ho_Chi_Minh',
            'Overdue refresh: mỗi 5 phút',
            'Hard delete soft-deleted >30 ngày: 03:30 Asia/Ho_Chi_Minh'
        ],
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

        // Optional TCP probe to quickly check network reachability
        if (req.query.probe === 'true') {
            const host = req.query.host || process.env.EMAIL_HOST || 'smtp.gmail.com';
            const port = Number(req.query.port || process.env.EMAIL_PORT || (process.env.EMAIL_HOST ? 587 : 465));
            const timeoutMs = Number(req.query.timeoutMs || 7000);
            const started = Date.now();
            const socket = new net.Socket();
            let settled = false;
            const done = (payload) => {
                if (settled) return;
                settled = true;
                try { socket.destroy(); } catch (e) {}
                res.json(payload);
            };
            socket.setTimeout(timeoutMs);
            socket.once('connect', () => {
                done({ success: true, probe: { host, port, latencyMs: Date.now() - started } });
            });
            socket.once('timeout', () => {
                done({ success: false, error: 'TCP timeout', probe: { host, port, latencyMs: Date.now() - started } });
            });
            socket.once('error', (err) => {
                done({ success: false, error: err?.message || String(err), code: err?.code || null, probe: { host, port, latencyMs: Date.now() - started } });
            });
            try {
                socket.connect(port, host);
            } catch (err) {
                done({ success: false, error: err?.message || String(err), code: err?.code || null });
            }
            return; // early return; response handled in probe callbacks
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
                secure: process.env.EMAIL_SECURE ? 'custom' : 'default',
                provider: (process.env.EMAIL_PROVIDER || process.env.EMAIL_HTTP_PROVIDER || 'smtp').toLowerCase()
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal error', error: err.message });
    }
});

/**
 * Verify SMTP connectivity and auth via Nodemailer without sending an email.
 * GET /api/scheduler/verify-smtp?token=...&host=smtp.gmail.com&port=587&secure=false
 */
router.get('/verify-smtp', async (req, res) => {
    try {
        const { token } = req.query || {};
        if (!process.env.ADMIN_TEST_TOKEN) {
            return res.status(403).json({ success: false, message: 'ADMIN_TEST_TOKEN not configured' });
        }
        if (!token || token !== process.env.ADMIN_TEST_TOKEN) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const host = req.query.host || process.env.EMAIL_HOST || 'smtp.gmail.com';
        const port = Number(req.query.port || process.env.EMAIL_PORT || 465);
        const secure = (req.query.secure ?? process.env.EMAIL_SECURE ?? 'true') === 'true';
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT || 20000),
            socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT || 20000),
            greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT || 10000),
            logger: process.env.EMAIL_DEBUG === 'true',
            debug: process.env.EMAIL_DEBUG === 'true',
        });

        try {
            const ok = await transporter.verify();
            return res.json({ success: ok === true, meta: { host, port, secure } });
        } catch (err) {
            return res.json({ success: false, error: err?.message || String(err), meta: { host, port, secure } });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal error', error: err.message });
    }
});
