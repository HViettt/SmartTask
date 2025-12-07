
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date, required: true },
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'], 
    required: true 
  },
  complexity: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Todo', 'Doing', 'Done'], 
    default: 'Todo' 
  },
  notes: { type: String },
  completedAt: { type: Date }
}, {
  timestamps: true
});

// Create indexes for performance as per ERD
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, deadline: 1 });

module.exports = mongoose.model('Task', taskSchema);
