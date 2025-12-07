
const Task = require('../models/Task');

// GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    // req.user được gán từ middleware xác thực
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

    // Logic update completedAt khớp với ERD
    if (status === 'Done') {
      updates.completedAt = new Date();
    } else if (status && status !== 'Done') {
      updates.completedAt = null; // Reset nếu mở lại task
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true } // Trả về document mới sau khi update
    );

    if (!task) return res.status(404).json({ message: 'Task not found' });
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
