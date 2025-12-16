
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiService = require('../utils/aiService');

// GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const newTask = new Task({
      ...req.body,
      userId: req.user._id
    });
    const savedTask = await newTask.save();
    
    // Ghi nhận thông báo khi tạo task mới (để hiện rõ trong Notification Center)
    try {
      await Notification.create({
        userId: req.user._id,
        type: 'task',
        title: 'Công việc mới được tạo',
        message: `${savedTask.title} đã được thêm vào danh sách của bạn`,
        taskId: savedTask._id,
        metadata: {
          task: {
            _id: savedTask._id,
            title: savedTask.title,
            deadline: savedTask.deadline,
            priority: savedTask.priority,
            complexity: savedTask.complexity,
            status: savedTask.status
          }
        }
      });
    } catch (notifyErr) {
      console.warn('Không thể ghi thông báo task mới:', notifyErr.message);
    }

    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const { status } = req.body;
    let updates = { ...req.body };

    if (status === 'Done') {
      updates.completedAt = new Date();
    } else if (status && status !== 'Done') {
      updates.completedAt = null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Tạo thông báo task-status (nếu có thay đổi quan trọng)
    try {
      const now = new Date();
      const deadline = task.deadline ? new Date(task.deadline) : null;
      const in48Hours = deadline ? (deadline - now) / (1000 * 60 * 60) : null;

      let notifyData = null;

      if (status === 'Todo' && task.status === 'Todo') {
        notifyData = {
          subtype: 'not-started',
          title: 'Công việc chưa bắt đầu',
          message: `"${task.title}" vẫn chưa được bắt đầu`,
          severity: 'info'
        };
      } else if (status === 'In Progress') {
        notifyData = {
          subtype: 'in-progress',
          title: 'Công việc đang thực hiện',
          message: `"${task.title}" đang được thực hiện`,
          severity: 'info'
        };
      } else if (status === 'Done') {
        notifyData = {
          subtype: 'completed',
          title: 'Công việc hoàn thành',
          message: `"${task.title}" đã hoàn thành`,
          severity: 'info'
        };
      } else if (deadline && in48Hours > 0 && in48Hours <= 48) {
        notifyData = {
          subtype: 'deadline-soon',
          title: 'Công việc sắp đến hạn',
          message: `"${task.title}" sẽ hết hạn trong ${Math.floor(in48Hours)} giờ`,
          severity: 'warn'
        };
      } else if (deadline && in48Hours < 0) {
        notifyData = {
          subtype: 'overdue',
          title: 'Công việc quá hạn',
          message: `"${task.title}" đã quá hạn`,
          severity: 'critical'
        };
      }

      if (notifyData) {
        await Notification.create({
          userId: req.user._id,
          type: 'task-status',
          subtype: notifyData.subtype,
          title: notifyData.title,
          message: notifyData.message,
          severity: notifyData.severity,
          taskId: task._id,
          metadata: {
            task: {
              _id: task._id,
              title: task.title,
              deadline: task.deadline,
              priority: task.priority,
              complexity: task.complexity,
              status: task.status
            }
          }
        });
      }
    } catch (notifyErr) {
      console.warn('Không thể ghi thông báo task status:', notifyErr.message);
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/tasks/ai-suggest
exports.suggestTasks = async (req, res) => {
  try {
    // Get user's non-completed tasks
    const tasks = await Task.find({ 
      userId: req.user._id,
      status: { $ne: 'Done' } 
    });

    if (tasks.length === 0) {
      return res.json({ sortedIds: [], reasoning: {} });
    }

    console.log('📋 Found', tasks.length, 'tasks for user', req.user._id);
    
    // Use AI Service (tries Groq > Gemini > Fallback)
    const result = await aiService.getSuggestedOrder(tasks);
    return res.json(result);
    
  } catch (error) {
    console.error('❌ AI Suggest Error:', error.message);
    return res.status(500).json({ 
      message: "Failed to suggest tasks: " + error.message,
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
    
    // Kiểm tra mỗi item có đúng format không
    const isValid = suggestions.every(s => 
      s.taskId && typeof s.taskId === 'string' &&
      s.reasoning && typeof s.reasoning === 'string'
    );
};