const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getUserDeadlineBuckets } = require('../services/deadlineService');

/**
 * @route   GET /api/stats/deadlines
 * @desc    Thống kê deadline của user hiện tại
 * @access  Private
 */
router.get('/deadlines', protect, async (req, res) => {
    try {
        const buckets = await getUserDeadlineBuckets(req.user._id);
        const overdue = buckets.overdue || [];
        const upcoming = buckets.upcoming || [];

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
                    count: 0,
                    tasks: []
                },
                total: overdue.length + upcoming.length
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