const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
// Đảm bảo đường dẫn này đúng: src/middlewares/authMiddleware.js
const { protect } = require('../middlewares/authMiddleware'); 

router.route('/')
  .get(protect, taskController.getTasks)
  .post(protect, taskController.createTask);

// ✨ NEW: AI parsing route - parse natural language to task data
router.post('/ai-parse', protect, taskController.parseTaskText);

// Existing AI suggest route
router.post('/ai-suggest', protect, taskController.suggestTasks);

// Restore task đã soft-delete
router.patch('/:id/restore', protect, taskController.restoreTask);

router.route('/:id')
  .put(protect, taskController.updateTask)
  .delete(protect, taskController.deleteTask);

module.exports = router;