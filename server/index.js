
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
// Cho phép tất cả các origin trong quá trình phát triển để tránh lỗi CORS
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smarttask')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️ Server running without DB. API calls will fail.');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is running OK' });
});

const PORT = process.env.PORT || 5000;

// Listen on 0.0.0.0 to accept connections from other network interfaces (important for some local dev setups)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`   - Local: http://localhost:${PORT}`);
  console.log(`   - Network: http://127.0.0.1:${PORT}`);
});
