
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

// DATABASE CONNECTION - KẾT NỐI MONGODB
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};
connectDB();

// CORS CONFIGURATION - CẤU HÌNH CHO PHÉP REQUEST TỪ FRONTEND
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3001",
  "http://127.0.0.1:3001"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép request từ các origin được liệt kê
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Từ chối request từ origin không được phép
      return callback(new Error('CORS: Origin not allowed'), false);
    },
    credentials: true, // Cho phép gửi credentials (cookies, headers)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // Cache preflight request 24h để tránh gọi OPTIONS liên tục
  })
);

// Tăng giới hạn payload size cho upload ảnh (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API ROUTES - ĐỊNH NGHĨA ROUTES CỦA API
app.use('/api/auth', authRoutes);         //  Xác thực
app.use('/api/tasks', taskRoutes);        //  Công việc
app.use('/api/user', userRoutes);         //  Người dùng
app.use('/api/stats', statsRoutes);       //  Thống kê
app.use('/api/notifications', notificationRoutes); // Thông báo
app.use('/api/scheduler', schedulerRoutes);  // Lên lịch

// HEALTH CHECK - KIỂM TRA TRẠNG THÁI SERVER
app.get("/api/health", (req, res) => {
  res.json({ 
    success: true,
    message: "🟢 Server is healthy",
    timestamp: new Date().toISOString()
  });
});

// CONFIG ENDPOINT - TRẢ CLIENT ID CHO GOOGLE OAUTH
app.get('/api/config', (req, res) => {
  res.json({ 
    googleClientId: process.env.GOOGLE_CLIENT_ID || null 
  });
});

// GLOBAL ERROR HANDLER - XỬ LỲ LỖI TOÀN CỤC (PHẢI CÓ CUỐI CÙNG)
app.use(errorHandler);

// START SERVER

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  initializeScheduler();
});

