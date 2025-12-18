/**
 * ============================================================================
 * TASK CONTROLLER - QUẢN LÝ CÔNG VIỆC
 * ============================================================================
 * Mục đích: Xử lý các logic liên quan đến công việc (CRUD)
 * 
 * API Endpoints:
 * - GET  /api/tasks          - Lấy danh sách tất cả công việc của user
 * - POST /api/tasks          - Tạo công việc mới
 * - PUT  /api/tasks/:id      - Cập nhật công việc
 * - DELETE /api/tasks/:id    - Xoá công việc
 * - POST /api/tasks/ai-suggest - Gợi ý thứ tự ưu tiên công việc bằng AI
 * 
 * Authentication: Tất cả endpoints cần JWT token (yêu cầu xác thực)
 * 
 * ============================================================================
 */

const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiService = require('../utils/aiService');

/**
 * 📌 GET /api/tasks
 * Lấy danh sách tất cả công việc của user hiện tại
 * 
 * Query params: None
 * Response: Array<Task>
 */
exports.getTasks = async (req, res) => {
  try {
    // ✅ Lấy công việc sắp xếp theo ngày tạo mới nhất
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy danh sách công việc: ' + error.message 
    });
  }
};

/**
 * 📌 POST /api/tasks
 * Tạo công việc mới
 * 
 * Body: {
 *   title: string (required),
 *   description: string,
 *   deadline: ISO8601 string,
 *   priority: 'High' | 'Medium' | 'Low',
 *   complexity: 'Hard' | 'Medium' | 'Easy',
 *   notes: string
 * }
 * 
 * Response: Task object (201 Created)
 */
exports.createTask = async (req, res) => {
  try {
    const newTask = new Task({
      ...req.body,
      userId: req.user._id
    });
    const savedTask = await newTask.save();
    
    // 🔔 Ghi nhận thông báo khi tạo task mới
    try {
      await Notification.create({
        userId: req.user._id,
        type: 'task',
        title: 'Công việc mới được tạo',
        message: `"${savedTask.title}" đã được thêm vào danh sách của bạn`,
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
      console.warn('⚠️ Lỗi ghi thông báo task mới:', notifyErr.message);
    }

    res.status(201).json({
      success: true,
      data: savedTask,
      message: 'Công việc được tạo thành công'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Lỗi khi tạo công việc: ' + error.message 
    });
  }
};

/**
 * 📌 PUT /api/tasks/:id
 * Cập nhật công việc
 * 
 * Body: Các field cần cập nhật (title, deadline, priority, status, etc)
 * Response: Updated Task object
 */
exports.updateTask = async (req, res) => {
  try {
    const { status } = req.body;
    let updates = { ...req.body };

    // ✅ Nếu đánh dấu hoàn thành, ghi lại thời gian hoàn thành
    if (status === 'Done') {
      updates.completedAt = new Date();
    } else if (status && status !== 'Done') {
      updates.completedAt = null;
    }

    // 🔍 Tìm và cập nhật task (chỉ được cập nhật task của chính user)
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Công việc không tồn tại' 
      });
    }

    // 🔔 Tạo thông báo cho thay đổi quan trọng
    try {
      const now = new Date();
      const deadline = task.deadline ? new Date(task.deadline) : null;
      const in48Hours = deadline ? (deadline - now) / (1000 * 60 * 60) : null;

      let notifyData = null;

      if (status === 'Done') {
        notifyData = {
          subtype: 'completed',
          title: '✅ Công việc hoàn thành',
          message: `"${task.title}" đã hoàn thành!`,
          severity: 'success'
        };
      } else if (status === 'In Progress' || status === 'Doing') {
        notifyData = {
          subtype: 'in-progress',
          title: '⚙️ Công việc đang thực hiện',
          message: `"${task.title}" đang được thực hiện`,
          severity: 'info'
        };
      } else if (deadline && in48Hours > 0 && in48Hours <= 48) {
        notifyData = {
          subtype: 'deadline-soon',
          title: '⏰ Công việc sắp đến hạn',
          message: `"${task.title}" sẽ hết hạn trong ${Math.floor(in48Hours)} giờ`,
          severity: 'warning'
        };
      } else if (deadline && in48Hours < 0 && status !== 'Done') {
        notifyData = {
          subtype: 'overdue',
          title: '🚨 Công việc quá hạn',
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
      console.warn('⚠️ Lỗi ghi thông báo status:', notifyErr.message);
    }

    res.json({
      success: true,
      data: task,
      message: 'Công việc được cập nhật thành công'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Lỗi khi cập nhật công việc: ' + error.message 
    });
  }
};

/**
 * 📌 DELETE /api/tasks/:id
 * Xoá công việc
 * 
 * Response: Deleted task info
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Công việc không tồn tại' 
      });
    }

    res.json({
      success: true,
      data: task,
      message: 'Công việc đã được xoá thành công'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi xoá công việc: ' + error.message 
    });
  }
};

/**
 * 📌 POST /api/tasks/ai-suggest
 * Gợi ý thứ tự ưu tiên công việc bằng AI (Google Gemini)
 * 
 * Algorithm:
 * 1. Lấy tất cả công việc chưa hoàn thành
 * 2. Gửi cho Gemini AI để phân tích
 * 3. Trả về danh sách công việc được sắp xếp lại + lý do
 * 
 * Response: { sortedIds: [], reasoning: {} }
 */
exports.suggestTasks = async (req, res) => {
  try {
    // 🔍 Lấy tất cả công việc chưa hoàn thành của user
    const tasks = await Task.find({ 
      userId: req.user._id,
      status: { $ne: 'Done' } 
    });

    if (tasks.length === 0) {
      return res.json({ 
        success: true,
        data: {
          sortedIds: [], 
          reasoning: {}
        },
        message: 'Không có công việc nào để gợi ý'
      });
    }

    console.log('📋 Tìm thấy', tasks.length, 'công việc cho user', req.user._id);
    
    // 🤖 Sử dụng AI Service (thử Groq > Gemini > Fallback)
    const result = await aiService.getSuggestedOrder(tasks);
    return res.json({
      success: true,
      data: result,
      message: 'AI đã phân tích và gợi ý thứ tự ưu tiên'
    });
    
  } catch (error) {
    console.error('❌ Lỗi AI Suggest:', error.message);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi gợi ý công việc: ' + error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};