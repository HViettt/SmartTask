const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/stats/deadlines
 * @desc    Thống kê deadline của user hiện tại
 * @access  Private
 */
router.get('/deadlines', protect, async (req, res) => {
    try {
        const now = new Date();
        const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        // Lấy tasks chưa hoàn thành của user
        const tasks = await Task.find({
            userId: req.user._id,
            status: { $ne: 'Done' },
            deadline: { $exists: true, $ne: null }
        }).sort({ deadline: 1 });

        // Phân loại
        const overdue = [];
        const upcoming = [];
        const later = [];

        tasks.forEach(task => {
            const deadline = new Date(task.deadline);
            if (deadline < now) {
                overdue.push(task);
            } else if (deadline <= in48Hours) {
                upcoming.push(task);
            } else {
                later.push(task);
            }
        });

        res.json({
            success: true,
            data: {
                overdue: {
                    count: overdue.length,
                    tasks: overdue
                },
                upcoming: {
                    count: upcoming.length,
                    tasks: upcoming
                },
                later: {
                    count: later.length,
                    tasks: later
                },
                total: tasks.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching deadline stats',
            error: error.message
        });
    }
});

module.exports = router;