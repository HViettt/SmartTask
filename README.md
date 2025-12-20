# 🎯 SmartTask - AI Task Management System

> Hệ thống quản lý công việc thông minh với AI scheduling, tự động phát hiện deadline và hỗ trợ đa ngôn ngữ (Tiếng Việt/English)

**Ngày cập nhật:** December 20, 2025  
**Trạng thái:** ✅ Production Ready (v2.0.0)  
**Tech Stack:** React + Node.js + MongoDB + AI (Groq/Gemini)

---

## 📦 Công Nghệ Sử Dụng

### Frontend
- **Framework:** React 18 + Vite 7
- **State Management:** Zustand
- **Styling:** TailwindCSS + Dark Mode
- **UI/UX:** Lucide Icons, Custom Toast System
- **Charts:** Recharts
- **i18n:** Custom (Vietnamese/English)

### Backend
- **Runtime:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + Google OAuth
- **AI Services:** Groq API + Google Gemini (fallback)
- **Scheduler:** node-cron (auto-detect overdue tasks)
- **Upload:** Cloudinary (avatar management)
---

## 🎨 Cập Nhật Mới Nhất (December 20, 2025)

### ✅ Fixed Issues
- **Notification Badge Bug**: Badge không cập nhật khi mark as read
  - ✅ Synthetic notifications (DUE_SOON, OVERDUE) không tính vào unread
  - ✅ Only EMAIL_SENT counts toward unread counter
  - ✅ Badge cập nhật **NGAY LẬP TỨC** (không cần reload trang)
  - 💡 Logic: `unreadCount = emailNotifs.filter(n => !n.read).length`

### 🎨 UI Enhancements
- **Dashboard Status Colors**: Thêm màu cho trạng thái task
  - 🔴 Todo (Chưa Làm) → Màu Đỏ
  - 🟡 Doing (Đang Làm) → Màu Vàng
  - 🟢 Done (Hoàn Thành) → Màu Xanh Lá
  - 🔴 Overdue (Quá Hạn) → Màu Đỏ Đậm
  - Định nghĩa trong `src/types.js` (StatusColors constant)

### 🪝 Code Improvements
- **Shared Deadline Logic**: `useDeadlineStats` hook (Dashboard + Notification)
  - Đồng bộ counts giữa 2 components
  - Real-time updates khi task thay đổi
  - Threshold: 48 giờ cho DUE_SOON counts

### 📄 Documentation
- Consolidate from 9 files → **1 README.md**
- Tất cả thông tin quan trọng tập trung ở đây
---

## 🚀 Cài Đặt & Chạy Dự Án

### 1. Yêu Cầu Hệ Thống

- Node.js >= 18.x
- MongoDB >= 6.x
- npm hoặc yarn

### 2. Clone Repository

```bash
git clone <repository-url>
cd SmartTask
```

### 3. Cài Đặt Dependencies

```bash
# Backend
cd task-ai-backend/backend-task-manager
npm install

# Frontend
cd ../../task-ai-frontend/frontend-task-manager
npm install
```

### 4. Cấu Hình Environment Variables

#### Backend (`.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/smarttask

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Services (Groq - Primary)
GROQ_API_KEY=your-groq-api-key

# AI Services (Gemini - Fallback)
GEMINI_API_KEY=your-gemini-api-key

# Cloudinary (Avatar Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (CORS)
CLIENT_URL=http://localhost:5173
```

#### Frontend (`.env`)

```env
# Backend API
VITE_API_URL=http://localhost:5000

# Google OAuth (Frontend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 5. Chạy Development Server

```bash
# Terminal 1 - Backend (port 5000)
cd task-ai-backend/backend-task-manager
npm run dev

# Terminal 2 - Frontend (port 5173)
cd task-ai-frontend/frontend-task-manager
npm run dev
```

**Truy cập:** http://localhost:5173

---

## ✨ Tính Năng Chính

### 1. Quản Lý Công Việc
- ✅ Tạo/Sửa/Xóa công việc
- ✅ Phân loại theo Priority (Low/Medium/High)
- ✅ Phân loại theo Complexity (Low/Medium/High)
- ✅ Trạng thái: Todo → Doing → Done
- ✅ Tự động phát hiện công việc quá hạn (Overdue)

### 2. AI Scheduling (Sắp Xếp Thông Minh)
- 🤖 **Tier 1:** Groq API (cực nhanh, 9000 requests/day)
- 🤖 **Tier 2:** Google Gemini (fallback)
- 🤖 **Tier 3:** Local Algorithm (luôn hoạt động)

### 3. Dashboard & Analytics
- 📊 Biểu đồ phân bố công việc (Pie Chart)
- 📈 Thống kê theo trạng thái
- ⚡ Danh sách công việc sắp đến hạn
- 🔔 Cảnh báo deadline

### 4. Profile Management
- 👤 Cập nhật thông tin cá nhân
- 📸 Upload avatar (Cloudinary)
- 🔐 Đổi mật khẩu
- 🌐 Google OAuth Login

### 5. Notification System
- 🔔 Thông báo công việc quá hạn
- ⏰ Cảnh báo deadline (7 ngày, 3 ngày, 1 ngày)
- ✉️ Cài đặt thông báo linh hoạt

### 6. Toast Notification System
- ✅ Professional UI/UX
- 🎨 4 loại: Success, Error, Warning, Info
- 🌙 Dark mode support
- ♿ WCAG 2.1 AA accessible
- 📍 **Vị trí:** Bên dưới navbar (không đè lên menu)

---

## 📁 Cấu Trúc Dự Án

```
SmartTask/
├── task-ai-backend/
│   └── backend-task-manager/
│       ├── src/
│       │   ├── controllers/      # Business logic
│       │   ├── models/           # MongoDB schemas
│       │   ├── routes/           # API endpoints
│       │   ├── middlewares/      # Auth, validation, error handling
│       │   ├── utils/            # AI service, task scheduler, logger
│       │   └── config/           # DB, Cloudinary config
│       └── server.js
│
└── task-ai-frontend/
    └── frontend-task-manager/
        ├── src/
        │   ├── components/       # UI components
        │   │   ├── auth/        # Login, Register, etc.
        │   │   ├── task/        # Task list, card, form
        │   │   ├── profile/     # Profile management
        │   │   ├── notification/ # Notification center
        │   │   ├── layout/      # App layout, navbar
        │   │   ├── common/      # Shared components
        │   │   └── ui/          # Toast, icons
        │   ├── pages/           # Page components
        │   ├── services/        # API calls
        │   ├── features/        # Zustand stores
        │   ├── hooks/           # Custom React hooks
        │   └── utils/           # Helpers, i18n, toast utils
        └── index.html
```

---

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/register          # Đăng ký
POST   /api/auth/login             # Đăng nhập
POST   /api/auth/google            # Google OAuth
GET    /api/auth/profile           # Lấy thông tin user
POST   /api/auth/forgot-password   # Quên mật khẩu
POST   /api/auth/reset-password    # Reset mật khẩu
GET    /api/auth/verify-email      # Verify email
```

### Tasks
```
GET    /api/tasks                  # Lấy danh sách tasks
POST   /api/tasks                  # Tạo task mới
PUT    /api/tasks/:id              # Cập nhật task
DELETE /api/tasks/:id              # Xóa task
POST   /api/tasks/:id/status       # Cập nhật status
```

### User Profile
```
GET    /api/user/profile           # Lấy profile
PUT    /api/user/profile           # Cập nhật profile
PUT    /api/user/change-password   # Đổi mật khẩu
PUT    /api/user/set-password      # Set password (Google user)
POST   /api/user/upload-avatar     # Upload avatar
```

### AI & Stats
```
POST   /api/ai/suggest             # AI task suggestions
GET    /api/stats                  # Thống kê dashboard
```

### Notifications
```
GET    /api/notifications          # Lấy danh sách thông báo
PUT    /api/notifications/:id/read # Đánh dấu đã đọc
DELETE /api/notifications/:id      # Xóa thông báo
GET    /api/notifications/settings # Lấy cài đặt
PUT    /api/notifications/settings # Cập nhật cài đặt
```

---

## 🤖 AI Scheduling Logic

### Thuật Toán Sắp Xếp (3 Tiers)

```javascript
1. Groq API (Primary)
   - Cực nhanh (~500ms)
   - 9000 requests/day
   - Phân tích context và suggest order

2. Google Gemini (Fallback)
   - Chậm hơn (~2s)
   - Unlimited requests
   - Backup khi Groq hết quota

3. Local Algorithm (Always Available)
   - Tức thì (<10ms)
   - Priority-based sorting
   - Luôn hoạt động khi cả 2 tier trên fail
```

### Tiêu Chí Sắp Xếp
1. **Overdue tasks** → Ưu tiên cao nhất
2. **Priority** → High > Medium > Low
3. **Deadline** → Gần nhất lên đầu
4. **Complexity** → Cân nhắc thời gian thực hiện

---

## 📊 Background Scheduler

### Auto-detect Overdue Tasks
- **Tần suất:** Mỗi 30 phút
- **Cron Expression:** `*/30 * * * *`
- **Chức năng:**
  - Quét tất cả tasks với deadline < hiện tại
  - Cập nhật status → "Overdue"
  - Tạo notification

### Configuration
```javascript
// utils/taskScheduler.js
const SCHEDULE = '*/30 * * * *'; // Có thể thay đổi
```

---

## 🌐 Đa Ngôn Ngữ (i18n)

- **Ngôn ngữ hỗ trợ:** Tiếng Việt (mặc định), English
- **Lưu trữ:** localStorage + user preferences
- **Chuyển đổi:** Real-time, không reload

```javascript
// Sử dụng trong component
const { t, lang } = useI18n();

<h1>{t('appName')}</h1>
<button>{t('auth.loginButton')}</button>
```

---

## 🎨 Toast Notification System (Refactored)

### Đặc Điểm
- **Vị trí:** Bên dưới navbar (80px from top)
- **Auto-dismiss:** 3-5s tùy loại
- **Pause on hover:** Dừng countdown khi hover
- **Max toasts:** 5 notifications cùng lúc
- **Accessibility:** WCAG 2.1 AA compliant

### Sử Dụng
```javascript
import { showToast } from '@/utils/toastUtils';

showToast.success('Thành công!');
showToast.error('Có lỗi xảy ra');
showToast.warning('Cảnh báo!');
showToast.info('Thông tin mới');
```

---

## 🔐 Authentication Flow

```
1. User đăng ký → Email verification required
2. User login → JWT token issued (7 days expiry)
3. Token stored in localStorage
4. Every request → Authorization: Bearer <token>
5. Token validation on server → User data attached to req.user
```

---

## 🚀 Deployment (Production)

### Frontend (Vercel/Netlify)
```bash
cd task-ai-frontend/frontend-task-manager
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render)
```bash
cd task-ai-backend/backend-task-manager
npm start
```

### Environment Variables
- Đặt tất cả env variables trên hosting platform
- Đảm bảo `NODE_ENV=production`
- Update `CLIENT_URL` và `VITE_API_URL`

---

## 🐛 Xử Lý Sự Cố

### Backend không kết nối được MongoDB
```bash
# Kiểm tra MongoDB đang chạy
mongosh

# Nếu lỗi, khởi động MongoDB
mongod --dbpath /path/to/data
```

### Frontend không gọi được API
- Kiểm tra `VITE_API_URL` trong `.env`
- Kiểm tra CORS config trong backend
- Kiểm tra backend server đang chạy (port 5000)

### Toast không hiển thị đúng vị trí
- Đã fix: Toast hiện ở dưới navbar (80px from top)
- Navbar height = 64px + margin = 80px

### AI Suggestions không hoạt động
1. Kiểm tra Groq API key hợp lệ
2. Nếu Groq hết quota → tự động fallback sang Gemini
3. Nếu cả 2 fail → local algorithm vẫn hoạt động

---

## 👨‍🎓 Dành Cho Giảng Viên

### Điểm Nổi Bật Của Dự Án

1. **Architecture:** Clean separation (Frontend/Backend)
2. **Code Quality:** Professional structure, comprehensive comments
3. **AI Integration:** Multi-tier fallback mechanism
4. **UX/UI:** Modern design, accessibility compliant
5. **Scalability:** Modular components, easy to extend
6. **Error Handling:** Robust error handling throughout
7. **Security:** JWT auth, password hashing, input validation
8. **Performance:** Optimized queries, caching, background jobs

### Technologies Demonstrated
- ✅ Full-stack development (MERN)
- ✅ State management (Zustand)
- ✅ Authentication & Authorization
- ✅ AI API integration
- ✅ Background job scheduling
- ✅ File upload (Cloudinary)
- ✅ Internationalization (i18n)
- ✅ Responsive design
- ✅ Dark mode implementation

---

## 📝 License

Dự án này được phát triển cho mục đích học tập và trình bày đồ án tốt nghiệp.

---

## 📧 Liên Hệ

Nếu có thắc mắc về dự án, vui lòng liên hệ qua email hoặc repository issues.

**Happy Coding! 🚀**
