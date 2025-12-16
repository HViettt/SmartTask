# 🚀 SmartTask - Complete Deployment Guide
# Hướng Dẫn Triển Khai Hoàn Chỉnh

> **Production-ready deployment guide for SmartTask application**  
> **Hướng dẫn triển khai production cho ứng dụng SmartTask**

**Last Updated:** December 16, 2025  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents | Mục Lục

1. [Overview | Tổng Quan](#overview)
2. [Architecture | Kiến Trúc](#architecture)
3. [Prerequisites | Yêu Cầu Tiên Quyết](#prerequisites)
4. [MongoDB Atlas Setup | Cài Đặt MongoDB Atlas](#mongodb-atlas)
5. [Backend Deployment | Triển Khai Backend](#backend-deployment)
   - [Railway Deployment](#railway-deployment)
   - [Render Deployment](#render-deployment)
6. [Frontend Deployment | Triển Khai Frontend](#frontend-deployment)
7. [Environment Variables | Biến Môi Trường](#environment-variables)
8. [CORS Configuration | Cấu Hình CORS](#cors-configuration)
9. [Build Fixes | Sửa Lỗi Build](#build-fixes)
10. [Common Errors | Lỗi Thường Gặp](#common-errors)
11. [Post-Deployment | Sau Triển Khai](#post-deployment)

---

## 🎯 Overview | Tổng Quan {#overview}

### Deployment Stack

```
┌─────────────────────────────────────────┐
│   Frontend (React + Vite)               │
│   Platform: Vercel                      │
│   Domain: your-app.vercel.app           │
└─────────────────┬───────────────────────┘
                  │ HTTPS/REST API
┌─────────────────▼───────────────────────┐
│   Backend (Node.js + Express)           │
│   Platform: Railway / Render            │
│   Domain: your-api.railway.app          │
└─────────────────┬───────────────────────┘
                  │ MongoDB Driver
┌─────────────────▼───────────────────────┐
│   Database (MongoDB Atlas)              │
│   Cloud: AWS / Azure / GCP              │
│   Connection: mongodb+srv://...         │
└─────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 with Vite
- Zustand (state management)
- TailwindCSS (styling)
- Recharts (visualization)
- i18n (Vietnamese/English)

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- AI Integration (Groq/Gemini)
- Task Scheduler (node-cron)

---

## 🏗️ Architecture | Kiến Trúc {#architecture}

### Project Structure

```
TodoApp/
├── task-ai-frontend/frontend-task-manager/   # React Frontend
│   ├── src/
│   │   ├── components/      # UI Components
│   │   ├── pages/           # Page Components
│   │   ├── features/        # Zustand Stores
│   │   ├── services/        # API Services
│   │   └── utils/           # Utilities (i18n, helpers)
│   ├── package.json
│   └── vite.config.js
│
└── task-ai-backend/backend-task-manager/     # Node.js Backend
    ├── src/
    │   ├── controllers/     # Request Handlers
    │   ├── models/          # MongoDB Models
    │   ├── routes/          # API Routes
    │   ├── middlewares/     # Auth, Validation
    │   ├── utils/           # AI Service, Scheduler
    │   └── config/          # DB, Cloudinary Config
    ├── package.json
    └── server.js
```

---

## ✅ Prerequisites | Yêu Cầu Tiên Quyết {#prerequisites}

### Required Accounts | Tài Khoản Cần Thiết

- [ ] **MongoDB Atlas** (free tier available)
- [ ] **Vercel** account (free tier available)
- [ ] **Railway** OR **Render** account (free tier available)
- [ ] **GitHub** account (for deployment integration)
- [ ] **Groq API** key (optional, for AI features)
- [ ] **Google Gemini API** key (optional, fallback AI)
- [ ] **Gmail App Password** (optional, for email notifications)

### Local Development Tools | Công Cụ Phát Triển

```bash
# Kiểm tra phiên bản Node.js (yêu cầu >= 18.x)
node --version  # v18.0.0 hoặc cao hơn

# Kiểm tra npm
npm --version   # v8.0.0 hoặc cao hơn

# Kiểm tra git
git --version
```

---

## 🗄️ MongoDB Atlas Setup | Cài Đặt MongoDB Atlas {#mongodb-atlas}

### Step 1: Create MongoDB Atlas Cluster

1. **Truy cập:** https://cloud.mongodb.com/
2. **Tạo tài khoản** hoặc đăng nhập
3. **Create New Cluster:**
   - Provider: AWS/GCP/Azure (chọn gần nhất)
   - Tier: M0 (Free)
   - Region: Chọn gần vị trí người dùng nhất
   - Cluster Name: `SmartTaskCluster`

### Step 2: Database Access | Quyền Truy Cập

```bash
# Vào Database Access → Add New Database User
# Tạo user với quyền readWrite
Username: smarttask_admin
Password: [Generate secure password]
Database User Privileges: Atlas admin
```

**Lưu ý quan trọng:**
- Lưu password an toàn
- Không commit password vào Git
- Dùng password phức tạp (min 12 ký tự)

### Step 3: Network Access | Cấu Hình Mạng

```bash
# Vào Network Access → Add IP Address
# Chọn: Allow Access From Anywhere (0.0.0.0/0)
# Lý do: Backend deployment có IP động
```

**⚠️ Security Note:**
- Trong production thực tế, nên whitelist IP cụ thể
- MongoDB Atlas có authentication layer bảo mật

### Step 4: Get Connection String | Lấy Connection String

1. Click **Connect** button
2. Chọn **Drivers** (Node.js)
3. Copy connection string:

```bash
# Format mẫu:
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority

# Ví dụ thực tế:
mongodb+srv://smarttask_admin:your_password_here@smarttaskcluster.abc123.mongodb.net/smarttask?retryWrites=true&w=majority
```

**Replace placeholders:**
- `<username>` → database username của bạn
- `<password>` → password đã tạo (URL encode nếu có ký tự đặc biệt)
- `<database>` → tên database (ví dụ: `smarttask`)

---

## 🖥️ Backend Deployment | Triển Khai Backend {#backend-deployment}

### Option A: Railway Deployment {#railway-deployment}

#### Step 1: Prepare Backend Code

```bash
# Di chuyển vào thư mục backend
cd task-ai-backend/backend-task-manager

# Kiểm tra package.json có start script
cat package.json | grep "start"
# Output mong đợi: "start": "node server.js"
```

#### Step 2: Create Railway Project

1. **Truy cập:** https://railway.app/
2. **Login** với GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select Repository** → Authorize Railway
5. **Select Service:** `task-ai-backend/backend-task-manager`

#### Step 3: Configure Environment Variables

Click **Variables** tab và thêm:

```bash
# ===== Database Configuration =====
MONGO_URI=mongodb+srv://smarttask_admin:your_password@cluster0.xxxxx.mongodb.net/smarttask?retryWrites=true&w=majority

# ===== Server Configuration =====
PORT=5000
NODE_ENV=production

# ===== JWT Secret (Generate random string) =====
JWT_SECRET=your_random_jwt_secret_min_32_chars_long_production_ready

# ===== Frontend URL (sẽ update sau khi deploy Vercel) =====
FRONTEND_URL=https://your-app.vercel.app

# ===== AI Service Keys (Optional) =====
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
GOOGLE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXX

# ===== Email Configuration (Optional) =====
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
NOTIFICATION_EMAIL_ENABLED=true

# ===== Google OAuth (Optional) =====
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
```

**Generate JWT Secret:**

```bash
# Trong terminal local:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output và paste vào JWT_SECRET
```

#### Step 4: Deploy

```bash
# Railway sẽ tự động:
# 1. Detect Node.js
# 2. Run npm install
# 3. Run npm start
# 4. Expose port từ biến PORT

# Kiểm tra logs:
# Railway Dashboard → Service → Deployments → View Logs
```

#### Step 5: Get Backend URL

```bash
# Railway sẽ generate domain tự động:
https://your-service.railway.app

# Hoặc setup custom domain:
# Settings → Networking → Generate Domain
```

---

### Option B: Render Deployment {#render-deployment}

#### Step 1: Create Web Service

1. **Truy cập:** https://render.com/
2. **Sign up** với GitHub
3. **Dashboard** → **New +** → **Web Service**
4. **Connect Repository** → Select your repo
5. **Configure Service:**

```yaml
# Service Configuration
Name: smarttask-backend
Region: Oregon (US West) # Chọn gần nhất
Branch: main
Root Directory: task-ai-backend/backend-task-manager

# Build & Start Commands
Build Command: npm install
Start Command: npm start

# Instance Type
Plan: Free (or Starter for production)
```

#### Step 2: Environment Variables

Trong **Environment** tab, add các biến giống Railway ở trên.

**Lưu ý với Render Free Tier:**
- Service sẽ sleep sau 15 phút inactive
- Cold start có thể mất 30-60 giây
- Không phù hợp cho production thực sự
- Nâng cấp lên Starter ($7/month) để service chạy 24/7

#### Step 3: Deploy & Monitor

```bash
# Render sẽ tự động deploy
# Check logs: Dashboard → Service → Logs

# Health check endpoint:
https://your-service.onrender.com/api/health
```

---

## 🎨 Frontend Deployment | Triển Khai Frontend {#frontend-deployment}

### Step 1: Update API URL

```bash
# Di chuyển vào frontend
cd task-ai-frontend/frontend-task-manager

# Mở file: src/services/api.js
```

**Update baseURL:**

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  // Thay YOUR_BACKEND_URL bằng Railway/Render URL
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ... rest of the file
```

### Step 2: Create Vercel Project

1. **Truy cập:** https://vercel.com/
2. **Sign Up** với GitHub
3. **Add New** → **Project**
4. **Import Git Repository** → Select your repo
5. **Configure Project:**

```yaml
# Project Configuration
Project Name: smarttask-frontend
Framework Preset: Vite
Root Directory: task-ai-frontend/frontend-task-manager

# Build & Output Settings
Build Command: npm run build
Output Directory: dist
Install Command: npm install

# Node Version
Node.js Version: 18.x
```

### Step 3: Environment Variables

Click **Environment Variables** và thêm:

```bash
# Backend API URL (Railway hoặc Render URL)
VITE_API_URL=https://your-backend.railway.app

# Google OAuth Client ID (nếu dùng Google Sign-In)
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

**⚠️ Important:**
- Vercel không hỗ trợ `.env` files trong deployment
- Phải config qua dashboard UI
- Biến phải bắt đầu với `VITE_` để Vite expose

### Step 4: Deploy

```bash
# Vercel sẽ tự động:
# 1. Install dependencies
# 2. Run build command
# 3. Deploy static files to CDN
# 4. Generate production URL

# Domain sẽ là:
https://your-project.vercel.app
```

### Step 5: Update Backend CORS

**Quay lại Railway/Render và update `FRONTEND_URL`:**

```bash
# Railway/Render Environment Variables
FRONTEND_URL=https://your-project.vercel.app
```

**Redeploy backend** để áp dụng CORS mới.

---

## 🔐 Environment Variables | Biến Môi Trường {#environment-variables}

### Backend (.env)

```bash
# ===== CRITICAL - REQUIRED =====
MONGO_URI=mongodb+srv://...              # MongoDB connection string
JWT_SECRET=random_32_char_secret         # JWT signing key
PORT=5000                                 # Server port
NODE_ENV=production                       # Environment mode
FRONTEND_URL=https://app.vercel.app      # Frontend URL (for CORS)

# ===== AI SERVICES - OPTIONAL =====
GROQ_API_KEY=gsk_...                     # Groq API key (tier 1 AI)
GOOGLE_GEMINI_API_KEY=AIzaSy...          # Gemini API key (tier 2 AI)

# ===== EMAIL NOTIFICATIONS - OPTIONAL =====
GMAIL_USER=your-email@gmail.com          # Gmail account
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   # Gmail app password
NOTIFICATION_EMAIL_ENABLED=true          # Enable/disable emails

# ===== GOOGLE OAUTH - OPTIONAL =====
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# ===== CLOUDINARY - OPTIONAL =====
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

### Frontend (Vercel)

```bash
# Backend API endpoint
VITE_API_URL=https://your-backend.railway.app

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

### Security Best Practices | Bảo Mật

```bash
# ✅ DO:
# - Dùng strong passwords (min 12 chars, mixed case, numbers, symbols)
# - Generate JWT secret với crypto.randomBytes()
# - Không commit .env files vào Git
# - Rotate secrets định kỳ (quarterly)
# - Dùng environment variables cho tất cả sensitive data

# ❌ DON'T:
# - Hardcode secrets trong source code
# - Dùng weak/predictable passwords
# - Share secrets qua email/chat
# - Commit .env vào public repos
# - Reuse secrets across environments
```

---

## 🔧 CORS Configuration | Cấu Hình CORS {#cors-configuration}

### Backend CORS Setup

**File:** `task-ai-backend/backend-task-manager/server.js`

```javascript
// ===== CORS Configuration =====
// Cấu hình CORS để frontend có thể gọi API

const allowedOrigins = [
  process.env.FRONTEND_URL,           // Production frontend
  'http://localhost:5173',            // Local dev (Vite default)
  'http://localhost:3000',            // Local dev (alternative)
  'http://127.0.0.1:5173'             // Local dev (IP)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép requests không có origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,                  // Cho phép cookies/auth headers
  optionsSuccessStatus: 200,          // Legacy browsers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Preflight requests
app.options('*', cors(corsOptions));
```

### Common CORS Errors

```bash
# ❌ Error 1: "blocked by CORS policy"
# Nguyên nhân: Frontend URL chưa được whitelist
# Fix: Thêm FRONTEND_URL vào environment variables

# ❌ Error 2: "credentials mode is 'include'"
# Nguyên nhân: Backend không set credentials: true
# Fix: Thêm credentials: true vào corsOptions

# ❌ Error 3: "Access-Control-Allow-Origin missing"
# Nguyên nhân: CORS middleware chưa được apply
# Fix: app.use(cors()) phải đặt trước các routes
```

---

## 🛠️ Build Fixes | Sửa Lỗi Build {#build-fixes}

### Frontend Build Issues

#### Issue 1: Vite Build Warnings

```bash
# ⚠️ Warning: "Use of eval() is strongly discouraged"
# Nguyên nhân: Recharts hoặc dependencies dùng eval

# Fix: Ignore warnings (không ảnh hưởng production)
# Hoặc update vite.config.js:
```

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'recharts': ['recharts']  // Tách recharts ra chunk riêng
        }
      }
    }
  }
});
```

#### Issue 2: Environment Variables Not Working

```bash
# ❌ Error: import.meta.env.VITE_API_URL is undefined

# Fix 1: Đảm bảo biến bắt đầu với VITE_
VITE_API_URL=https://...  # ✅ Correct
API_URL=https://...       # ❌ Wrong

# Fix 2: Restart Vite dev server sau khi thêm .env
npm run dev

# Fix 3: Vercel - add qua UI, không dùng .env file
```

#### Issue 3: Large Bundle Size

```bash
# ⚠️ Warning: "chunk size exceeds 500kb"

# Fix: Code splitting
# vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        charts: ['recharts'],
        icons: ['lucide-react']
      }
    }
  }
}
```

### Backend Build Issues

#### Issue 1: Module Not Found

```bash
# ❌ Error: Cannot find module 'dotenv'

# Fix: Ensure all dependencies in package.json
npm install --save dotenv mongoose express cors

# Verify package.json:
"dependencies": {
  "express": "^4.18.0",
  "mongoose": "^7.0.0",
  "dotenv": "^16.0.0",
  // ... other deps
}
```

#### Issue 2: MongoDB Connection Failed

```bash
# ❌ Error: "MongoServerError: Authentication failed"

# Fix 1: Check connection string format
mongodb+srv://username:password@cluster.mongodb.net/database

# Fix 2: URL encode password nếu có ký tự đặc biệt
# Ví dụ: p@ssw0rd! → p%40ssw0rd%21

# Fix 3: Verify MongoDB Atlas network access (0.0.0.0/0)
```

#### Issue 3: Port Already in Use

```bash
# ❌ Error: "EADDRINUSE: address already in use :::5000"

# Fix: Kill process on port
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5000 | xargs kill -9
```

---

## ❌ Common Errors | Lỗi Thường Gặp {#common-errors}

### Deployment Errors

#### 1. Railway/Render Build Failed

```bash
# ❌ Error: "npm ERR! missing script: start"

# Fix: Thêm start script vào package.json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

```bash
# ❌ Error: "Cannot find module './src/config/db'"

# Fix: Kiểm tra root directory setting
# Railway: Set "Root Directory" = task-ai-backend/backend-task-manager
# Render: Set "Root Directory" = task-ai-backend/backend-task-manager
```

#### 2. Vercel Build Failed

```bash
# ❌ Error: "Command 'npm run build' exited with 1"

# Fix 1: Check build command output in Vercel logs
# Fix 2: Test build locally:
cd task-ai-frontend/frontend-task-manager
npm run build

# Fix 3: Kiểm tra vite.config.js syntax
# Fix 4: Ensure all imports resolve correctly
```

#### 3. Environment Variable Issues

```bash
# ❌ Frontend không connect được backend

# Debug steps:
# 1. Check VITE_API_URL trong Vercel settings
# 2. Verify URL không có trailing slash
VITE_API_URL=https://api.railway.app     # ✅ Correct
VITE_API_URL=https://api.railway.app/    # ❌ Wrong

# 3. Test backend URL trực tiếp:
curl https://your-backend.railway.app/api/health
# Should return: {"status":"ok"}
```

### Runtime Errors

#### 1. 500 Internal Server Error

```bash
# ❌ API response: 500 Internal Server Error

# Debug:
# 1. Check Railway/Render logs
# 2. Common causes:
#    - MongoDB connection timeout
#    - Missing environment variables
#    - Unhandled promise rejection
#    - Syntax error in code

# Fix: Check logs và sửa theo error message
```

#### 2. 401 Unauthorized

```bash
# ❌ API response: 401 Unauthorized

# Causes:
# - JWT token expired (frontend cần login lại)
# - JWT_SECRET mismatch giữa environments
# - Token không được gửi trong Authorization header

# Fix: Clear localStorage và login lại
localStorage.clear();
window.location.reload();
```

#### 3. 404 Not Found

```bash
# ❌ API response: 404 Not Found

# Causes:
# - Route không tồn tại
# - Frontend đang call sai endpoint
# - VITE_API_URL sai

# Debug:
# 1. Check VITE_API_URL:
console.log(import.meta.env.VITE_API_URL);

# 2. Verify API endpoint:
GET https://your-backend.railway.app/api/tasks  # ✅
GET https://your-backend.railway.app/tasks     # ❌ (missing /api)
```

### Database Errors

#### 1. MongoDB Connection Timeout

```bash
# ❌ Error: "MongooseServerSelectionError: connect ETIMEDOUT"

# Causes:
# - Network access not configured (0.0.0.0/0)
# - Wrong connection string
# - MongoDB Atlas cluster paused (free tier after 60 days inactive)

# Fix:
# 1. Check MongoDB Atlas → Network Access
# 2. Verify connection string
# 3. Check if cluster is active
```

#### 2. Validation Error

```bash
# ❌ Error: "ValidationError: Path 'title' is required"

# Cause: Required field missing

# Fix: Frontend phải gửi đầy đủ required fields
POST /api/tasks
{
  "title": "Task title",        // Required
  "description": "...",          // Optional
  "deadline": "2025-12-31",     // Required
  "priority": "High",           // Required
  "complexity": "Medium",       // Required
  "status": "Todo"              // Required
}
```

---

## ✅ Post-Deployment | Sau Triển Khai {#post-deployment}

### Health Check Checklist

```bash
# ===== Backend Health =====
# 1. API health endpoint
curl https://your-backend.railway.app/api/health
# Expected: {"status":"ok","timestamp":"..."}

# 2. Database connection
curl https://your-backend.railway.app/api/health/db
# Expected: {"status":"connected","database":"smarttask"}

# 3. Test authentication
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test1234!"}'

# ===== Frontend Health =====
# 1. Open browser: https://your-app.vercel.app
# 2. Check console - no errors
# 3. Test login/register flow
# 4. Create a test task
# 5. Verify data persists (reload page)

# ===== CORS Verification =====
# Frontend console should show successful API calls:
# POST https://your-backend.railway.app/api/auth/login 200 OK
# GET https://your-backend.railway.app/api/tasks 200 OK
```

### Performance Optimization

```bash
# ===== Database Indexes =====
# Run trong MongoDB Atlas → Database → Collections → Indexes

# Tasks collection indexes:
{
  "userId": 1,
  "status": 1,
  "deadline": 1
}

{
  "userId": 1,
  "deadline": 1,
  "priority": 1
}

# Users collection indexes:
{
  "email": 1
}  # Unique

# ===== Backend Optimization =====
# 1. Enable compression
npm install compression
# server.js:
const compression = require('compression');
app.use(compression());

# 2. Enable caching headers
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  next();
});

# ===== Frontend Optimization =====
# 1. Already using Vite code splitting
# 2. Lazy load routes
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

# 3. Optimize images (if any)
# Use WebP format, compress before upload
```

### Monitoring & Logging

```bash
# ===== Railway Monitoring =====
# Dashboard → Service → Metrics
# - CPU usage
# - Memory usage
# - Request volume
# - Response time

# View logs:
# Dashboard → Service → Deployments → Logs

# ===== Vercel Monitoring =====
# Dashboard → Project → Analytics
# - Page views
# - Unique visitors
# - Performance metrics (Web Vitals)

# ===== MongoDB Atlas Monitoring =====
# Dashboard → Clusters → Metrics
# - Connections
# - Operations per second
# - Query performance
```

### Backup Strategy

```bash
# ===== MongoDB Atlas Backups =====
# Free tier: Automatic snapshots (retention: 2 days)
# Paid tier: Continuous backups with point-in-time recovery

# Manual backup (using mongodump):
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/smarttask" --out=./backup

# Restore:
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/smarttask" ./backup/smarttask

# ===== Code Backups =====
# GitHub already serves as primary backup
# Additional: Enable GitHub Actions for automated testing
```

### Scaling Considerations

```bash
# ===== When to Scale? =====
# Monitor these metrics:
# - Backend CPU > 80% consistently
# - Database connections > 80% of limit
# - Response time > 2 seconds
# - Error rate > 1%

# ===== Scaling Options =====
# 1. Vertical scaling (Railway/Render)
#    - Upgrade plan for more CPU/memory
#    - Free → Hobby ($5-7/month) → Pro ($20+/month)

# 2. Horizontal scaling (Advanced)
#    - Multiple backend instances
#    - Load balancer
#    - Redis for session storage
#    - MongoDB Atlas M10+ cluster with sharding

# 3. Database scaling (MongoDB Atlas)
#    - Free M0 → M2/M5 → M10+ (auto-scaling)
#    - Enable replica sets for HA
#    - Add read replicas for read-heavy workloads
```

---

## 📚 Additional Resources | Tài Liệu Tham Khảo

### Official Documentation

- **Vercel:** https://vercel.com/docs
- **Railway:** https://docs.railway.app/
- **Render:** https://render.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **Vite:** https://vitejs.dev/guide/
- **Express:** https://expressjs.com/

### Troubleshooting Links

- **Vercel Status:** https://www.vercel-status.com/
- **Railway Status:** https://railway.app/status
- **MongoDB Atlas Status:** https://status.mongodb.com/
- **Stack Overflow:** https://stackoverflow.com/ (tag: vercel, railway, mongodb)

### Community Support

- **Railway Discord:** https://discord.gg/railway
- **Vercel Discord:** https://discord.gg/vercel
- **MongoDB Community:** https://community.mongodb.com/

---

## 🎉 Deployment Complete! | Hoàn Thành Triển Khai!

### Final Checklist | Kiểm Tra Cuối Cùng

- [ ] MongoDB Atlas cluster running
- [ ] Backend deployed on Railway/Render
- [ ] Frontend deployed on Vercel
- [ ] All environment variables configured
- [ ] CORS configured correctly
- [ ] Health checks passing
- [ ] Test user can register/login
- [ ] Tasks can be created/updated/deleted
- [ ] AI features working (if configured)
- [ ] Email notifications working (if configured)
- [ ] Google Sign-In working (if configured)

### Share Your App | Chia Sẻ Ứng Dụng

```bash
# Frontend URL:
https://your-app.vercel.app

# Backend API:
https://your-backend.railway.app

# Sample test account:
Email: demo@smarttask.com
Password: Demo1234!
```

### Next Steps | Bước Tiếp Theo

1. **Custom Domain:** Configure custom domain in Vercel
2. **SSL Certificate:** Automatically provided by Vercel/Railway
3. **Monitoring:** Set up error tracking (Sentry, LogRocket)
4. **Analytics:** Add Google Analytics or Plausible
5. **CI/CD:** Set up GitHub Actions for automated testing
6. **Documentation:** Update README with deployment URLs

---

**🚀 Happy Deploying! | Chúc Bạn Triển Khai Thành Công!**

> For issues or questions, check logs first, then consult documentation.  
> Nếu có vấn đề, kiểm tra logs trước, sau đó tham khảo tài liệu.

**Version:** 1.0.0  
**Last Updated:** December 16, 2025  
**Maintainer:** SmartTask Team
