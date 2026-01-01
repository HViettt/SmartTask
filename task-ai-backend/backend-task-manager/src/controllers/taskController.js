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
const moment = require('moment-timezone');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiService = require('../utils/aiService');
const { resolveVietnameseDate } = require('../utils/dateResolver');
const { getDeadlineStatus, isValidDeadlineTime, isTaskOverdue } = require('../utils/deadlineHelper');
const { refreshUserDeadlineNotifications } = require('../utils/taskScheduler');

// Helpers
const normalizeTitle = (title = '') =>
  title
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

const getDayRange = (deadline) => {
  if (!deadline) return {};
  const date = new Date(deadline);
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
};

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
    
    // Add computed deadline status to each task
    const tasksWithStatus = tasks.map(task => {
      const taskObj = task.toObject();
      taskObj.computedStatus = getDeadlineStatus(taskObj);
      return taskObj;
    });
    
    res.json({
      success: true,
      data: tasksWithStatus,
      count: tasksWithStatus.length
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
    // Validate bắt buộc
    if (!req.body?.title || !req.body?.deadline) {
      return res.status(400).json({
        success: false,
        code: 'TASK_VALIDATION_ERROR',
        message: 'Thiếu tiêu đề hoặc deadline'
      });
    }

    // Validate deadlineTime format if provided
    if (req.body.deadlineTime && !isValidDeadlineTime(req.body.deadlineTime)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_DEADLINE_TIME',
        message: 'Định dạng giờ hết hạn không hợp lệ. Sử dụng định dạng HH:MM'
      });
    }

    // ⚠️ FIX: Combine deadline (YYYY-MM-DD) + deadlineTime (HH:mm) → ISO UTC datetime
    const deadlineDate = req.body.deadline;  // e.g. "2025-01-05"
    const deadlineTime = req.body.deadlineTime || '23:59';

    let finalDeadlineUTC;
    try {
      // Parse ngày + giờ theo timezone Việt Nam
      const vietnamMoment = moment.tz(`${deadlineDate} ${deadlineTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Ho_Chi_Minh');
      
      finalDeadlineUTC = vietnamMoment.utc().toDate();
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        code: 'DEADLINE_PARSE_ERROR',
        message: 'Không thể xử lý thời gian deadline. Vui lòng kiểm tra lại format.'
      });
    }

    const normalizedTitle = normalizeTitle(req.body.title);
    const { start, end } = getDayRange(finalDeadlineUTC);

    // Kiểm tra trùng tiêu đề trong cùng ngày với cùng user
    if (start && end) {
      const duplicate = await Task.findOne({
        userId: req.user._id,
        normalizedTitle,
        deadline: { $gte: start, $lte: end }
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          code: 'TASK_DUPLICATE',
          message: 'Tiêu đề công việc đã tồn tại trong ngày này. Vui lòng đổi tên hoặc chọn ngày khác.',
          data: {
            existingTaskId: duplicate._id,
            status: duplicate.status,
            deadline: duplicate.deadline
          }
        });
      }
    }

    const newTask = new Task({
      ...req.body,
      userId: req.user._id,
      normalizedTitle,
      deadline: finalDeadlineUTC,  // ✅ Store UTC datetime
      deadlineTime: deadlineTime
    });
    const savedTask = await newTask.save();
    
    try {
      await refreshUserDeadlineNotifications(req.user._id);
    } catch (notifyErr) {
      // Silent fail - not critical
    }

    // Add computed status to response
    const taskObj = savedTask.toObject();
    taskObj.computedStatus = getDeadlineStatus(taskObj);

    res.status(201).json({
      success: true,
      data: taskObj,
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
    const currentTask = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!currentTask) {
      return res.status(404).json({
        success: false,
        message: 'Công việc không tồn tại'
      });
    }

    // Validate deadlineTime format if provided
    if (req.body.deadlineTime && !isValidDeadlineTime(req.body.deadlineTime)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_DEADLINE_TIME',
        message: 'Định dạng giờ hết hạn không hợp lệ. Sử dụng định dạng HH:MM'
      });
    }

    const { status } = req.body;
    let updates = { ...req.body };

    // ⚠️ FIX: If deadline or deadlineTime changed, combine and convert to UTC
    if (updates.deadline || updates.deadlineTime) {
      const deadlineDate = updates.deadline 
        ? updates.deadline.split('T')[0]  // Extract YYYY-MM-DD if ISO string
        : currentTask.deadline.toISOString().split('T')[0];  // Use current date
      const deadlineTime = updates.deadlineTime || currentTask.deadlineTime || '23:59';
      
      try {
        const vietnamMoment = moment.tz(`${deadlineDate} ${deadlineTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Ho_Chi_Minh');
        const finalDeadlineUTC = vietnamMoment.utc().toDate();
        
        updates.deadline = finalDeadlineUTC;
        updates.deadlineTime = deadlineTime;
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          code: 'DEADLINE_PARSE_ERROR',
          message: 'Không thể xử lý thời gian deadline. Vui lòng kiểm tra lại format.'
        });
      }
    }

    // Chuẩn hóa tiêu đề nếu có thay đổi
    const nextNormalizedTitle = updates.title
      ? normalizeTitle(updates.title)
      : currentTask.normalizedTitle;

    // Kiểm tra trùng lặp khi đổi title hoặc deadline
    if (updates.title || updates.deadline) {
      const targetDeadline = updates.deadline
        ? new Date(updates.deadline)
        : currentTask.deadline;
      const { start, end } = getDayRange(targetDeadline);

      if (start && end) {
        const duplicate = await Task.findOne({
          _id: { $ne: currentTask._id },
          userId: req.user._id,
          normalizedTitle: nextNormalizedTitle,
          deadline: { $gte: start, $lte: end }
        });

        if (duplicate) {
          return res.status(409).json({
            success: false,
            code: 'TASK_DUPLICATE',
            message: 'Tiêu đề công việc đã tồn tại trong ngày này. Vui lòng đổi tên hoặc chọn ngày khác.',
            data: {
              existingTaskId: duplicate._id,
              status: duplicate.status,
              deadline: duplicate.deadline
            }
          });
        }
      }
    }

    if (updates.title) {
      updates.normalizedTitle = nextNormalizedTitle;
    }

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

    try {
      await refreshUserDeadlineNotifications(req.user._id);
    } catch (notifyErr) {
      // Silent fail - not critical
    }

    res.json({
      success: true,
      data: (() => {
        const taskObj = task.toObject();
        taskObj.computedStatus = getDeadlineStatus(taskObj);
        return taskObj;
      })(),
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

    const result = await aiService.getSuggestedOrder(tasks);
    return res.json({
      success: true,
      data: result,
      message: 'AI đã phân tích và gợi ý thứ tự ưu tiên'
    });
    
  } catch (error) {
    console.error('Error in AI suggest:', error.message);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi gợi ý công việc: ' + error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

/**
 * ============================================================================
 * 📌 POST /api/tasks/ai-parse
 * ============================================================================
 * Phân tích ngôn ngữ tự nhiên thành dữ liệu task
 * 
 * Body: { text: "Tuần sau nộp báo cáo AI, thứ sáu họp nhóm, ưu tiên cao" }
 * 
 * Response: {
 *   success: true,
 *   data: {
 *     title: "...",
 *     description: "...",
 *     deadline: "YYYY-MM-DD",
 *     priority: "High|Medium|Low",
 *     complexity: "Easy|Medium|Hard",
 *     aiProvider: "Groq AI" | "Google Gemini"
 *   }
 * }
 * 
 * Flow:
 * 1. User gửi text mô tả công việc
 * 2. AI parse thành structured data
 * 3. Trả về để user xác nhận (KHÔNG TỰ ĐỘNG LƯU)
 * 4. Frontend sẽ hiện form với dữ liệu đã parse để user điều chỉnh
 * 5. User nhấn "Lưu" → gọi POST /api/tasks (endpoint tạo task thông thường)
 * 
 * Authentication: Required (JWT protect middleware)
 * Rate Limiting: Nên áp dụng để tránh spam API
 * ============================================================================
 */
exports.parseTaskText = async (req, res) => {
  try {
    const { text } = req.body;
    
    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_INPUT',
        message: 'Vui lòng nhập mô tả công việc'
      });
    }
    
    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        code: 'TEXT_TOO_LONG',
        message: 'Mô tả công việc quá dài (tối đa 500 ký tự)'
      });
    }
    
    const aiOutput = await aiService.parseTaskFromText(text);
    
    if (!aiOutput.title || !aiOutput.priority || !aiOutput.complexity) {
      return res.status(500).json({
        success: false,
        code: 'AI_PARSE_INCOMPLETE',
        message: 'AI không thể trích xuất đầy đủ thông tin. Vui lòng nhập thủ công.'
      });
    }
    
    let deadline;
    try {
      deadline = resolveVietnameseDate(aiOutput.dateText || '', aiOutput.timeText || '');
    } catch (dateError) {
      deadline = resolveVietnameseDate('hôm nay', '23:59');
    }
    
    // Step 3: Validate enum values
    const validPriorities = ['High', 'Medium', 'Low'];
    const validComplexities = ['Easy', 'Medium', 'Hard'];
    
    if (!validPriorities.includes(aiOutput.priority)) {
      aiOutput.priority = 'Medium';
    }
    
    if (!validComplexities.includes(aiOutput.complexity)) {
      aiOutput.complexity = 'Medium';
    }
    
    // Step 4: Return parsed data with resolved deadline
    const result = {
      title: aiOutput.title,
      description: aiOutput.description || '',
      dateText: aiOutput.dateText || '', // Keep for reference
      timeText: aiOutput.timeText || '', // Keep for reference
      deadline: deadline, // ← RESOLVED ISO datetime
      priority: aiOutput.priority,
      complexity: aiOutput.complexity,
      aiProvider: aiOutput.aiProvider || 'Unknown'
    };
    
    return res.json({
      success: true,
      data: result,
      message: 'Phân tích thành công! Vui lòng xem lại và xác nhận trước khi lưu.'
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 'AI_PARSE_ERROR',
      message: 'Không thể phân tích công việc. Vui lòng thử lại hoặc nhập thủ công.',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
};