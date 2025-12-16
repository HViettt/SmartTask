require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Route Imports
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const schedulerRoutes = require('./src/routes/scheduler');
const statsRoutes = require('./src/routes/stats');
const notificationRoutes = require('./src/routes/notifications');
const userRoutes = require('./src/routes/user');

// Middleware Imports
const errorHandler = require('./src/middlewares/error.middleware');

// Scheduler Import
const { initializeScheduler, runImmediately } = require('./src/utils/taskScheduler');

const app = express();

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smarttask');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// CORS CONFIGURATION
// Cho phép cả localhost và 127.0.0.1 cho các port phổ biến của React/Vite
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

// Thêm các origin dev thường dùng (vite tự đổi port khi cần)
allowedOrigins.push("http://localhost:3001", "http://127.0.0.1:3001");

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // Trong môi trường dev, có thể cho phép tất cả nếu cần thiết, nhưng tốt nhất là strict
        // return callback(null, true); 
        return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
      }
      return callback(null, true);
    },
    credentials: true, // Quan trọng để gửi cookies/authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/user', userRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is healthy!" });
});

// Public config endpoint (dev only) - trả Google Client ID để FE có thể fallback
app.get('/api/config', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || null });
});

// Routes
app.use('/api/notifications', notificationRoutes);

// Global Error Handler (must be last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Khởi động Task Scheduler
  initializeScheduler();
  
  // OPTIONAL: Chạy thử ngay lập tức trong môi trường development
  // Uncomment dòng dưới nếu muốn test scheduler ngay khi start server
  // if (process.env.NODE_ENV === 'development') {
  //   setTimeout(() => runImmediately(), 5000); // Đợi 5s sau khi server start
  // }
});