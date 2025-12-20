# 📁 SmartTask - Project Structure

> Final cleaned structure after refactoring - December 18, 2025

---

## 🗂️ ROOT STRUCTURE

```
SmartTask/
├── README.md                    # 📘 Main documentation (ONLY ONE)
├── REFACTOR_SUMMARY.md          # 📋 Refactor changelog
├── .gitignore
├── .vscode/                     # VS Code settings
│
├── task-ai-backend/             # 🔧 Backend (Node.js + Express)
│   └── backend-task-manager/
│       ├── server.js            # Entry point
│       ├── package.json
│       ├── .env                 # Environment variables
│       └── src/
│           ├── config/          # DB, Cloudinary config
│           ├── controllers/     # Business logic
│           ├── middlewares/     # Auth, validation, error
│           ├── models/          # MongoDB schemas
│           ├── routes/          # API endpoints
│           └── utils/           # AI service, scheduler, logger
│
└── task-ai-frontend/            # 🎨 Frontend (React + Vite)
    └── frontend-task-manager/
        ├── index.html           # Entry HTML
        ├── package.json
        ├── vite.config.js       # Vite configuration
        ├── tailwind.config.js   # TailwindCSS config
        ├── .env                 # Frontend env variables
        │
        └── src/
            ├── main.jsx         # ⚡ React entry point
            ├── app.jsx          # 🎯 App root + routing
            ├── index.css        # Global styles
            ├── types.js         # TypeScript-like type definitions
            │
            ├── components/      # 🧩 UI Components
            │   ├── auth/        # Login, Register, Verify, Reset
            │   ├── common/      # EmptyState, ConfirmDialog, StatCard
            │   ├── layout/      # Layout, Navbar, Sidebar
            │   ├── notification/ # NotificationCenter, Settings
            │   ├── profile/     # Profile cards & forms
            │   ├── task/        # TaskCard, TaskForm, TasksList, Filters
            │   └── ui/          # Toast, Icons, ToasterProvider
            │
            ├── pages/           # 📄 Page Components
            │   ├── DashboardPage.jsx   # Dashboard với charts
            │   ├── Task.jsx            # Task management page
            │   └── ProfilePageRefactored.jsx # User profile
            │
            ├── services/        # 🌐 API & External Services
            │   ├── api.js       # Axios instance + interceptors
            │   └── geminiService.js # AI service integration
            │
            ├── features/        # 🗃️ Zustand State Management
            │   ├── useStore.js  # Auth store
            │   └── taskStore.js # Task store
            │
            ├── hooks/           # 🎣 Custom React Hooks
            │   └── useProfileLogic.js
            │
            ├── utils/           # 🛠️ Utilities & Helpers
            │   ├── toastUtils.jsx # Toast notification API
            │   ├── i18n.js      # Internationalization (Vi/En)
            │   └── helpers.js   # Date format, validation
            │
            └── styles/          # 🎨 Custom Styles
                └── toast.css    # Toast animations & dark mode
```

---

## 🔑 KEY FILES EXPLAINED

### Backend

| File | Purpose |
|------|---------|
| `server.js` | Express server entry point |
| `src/config/db.js` | MongoDB connection |
| `src/config/cloudinary.js` | Image upload config |
| `src/controllers/authController.js` | Auth logic (login/register) |
| `src/controllers/taskController.js` | Task CRUD operations |
| `src/middlewares/authMiddleware.js` | JWT verification |
| `src/models/User.js` | User schema |
| `src/models/Task.js` | Task schema |
| `src/utils/aiService.js` | AI scheduling (Groq + Gemini) |
| `src/utils/taskScheduler.js` | Auto-detect overdue tasks |

### Frontend

| File | Purpose |
|------|---------|
| `main.jsx` | React app initialization |
| `app.jsx` | Routing + Protected routes |
| `components/layout/Layout.jsx` | App layout với navbar/sidebar |
| `pages/DashboardPage.jsx` | Dashboard với stats & charts |
| `pages/Task.jsx` | Task management page |
| `pages/ProfilePageRefactored.jsx` | User profile management |
| `services/api.js` | Axios instance + JWT interceptor |
| `features/useStore.js` | Auth state (Zustand) |
| `features/taskStore.js` | Task state (Zustand) |
| `utils/toastUtils.jsx` | Toast notification API |
| `utils/i18n.js` | Multi-language support |
| `components/ui/ToasterProvider.jsx` | Toast configuration |
| `components/ui/ToastComponent.jsx` | Toast UI component |

---

## 📊 COMPONENT HIERARCHY

### Layout
```
App.jsx
└── <ToasterProvider />          # Toast notifications
└── <Routes>
    ├── /login                   → LoginPage
    ├── /register                → RegisterPage
    ├── /verify-email            → VerifyEmailPage
    └── / (Protected)            → Layout
        ├── Navbar (top)
        ├── Sidebar (left)
        └── <Outlet>
            ├── /dashboard       → DashboardPage
            ├── /tasks           → Task (TasksList)
            └── /profile         → ProfilePageRefactored
```

### Task Management Flow
```
Task.jsx
└── TasksList.jsx
    ├── TaskFilters.jsx          # Search & filter
    ├── AddTaskForm.jsx          # Create new task
    ├── TaskCard.jsx × N         # Task items
    └── TaskDetailModal.jsx      # View/Edit task
```

### Profile Management Flow
```
ProfilePageRefactored.jsx
├── ProfileHeader.jsx            # Page header
├── AccountInfoCard.jsx          # Email, Name, Avatar
│   └── AvatarUpload.jsx        # Upload avatar
├── SecurityCard.jsx             # Password management
│   ├── ChangePasswordForm.jsx  # Change password
│   └── SetPasswordForm.jsx     # Set password (Google users)
└── AccountDetailsCard.jsx       # Account metadata
```

---

## 🎨 STYLING ARCHITECTURE

### TailwindCSS
- **Base:** `index.css`
- **Components:** Inline Tailwind classes
- **Dark Mode:** `dark:` prefix classes
- **Responsive:** `sm:`, `md:`, `lg:` breakpoints

### Custom CSS
- **Toast Animations:** `styles/toast.css`
  - Keyframes: `toast-in`, `toast-out`
  - Dark mode variants
  - Responsive positioning

---

## 🔄 STATE MANAGEMENT

### Zustand Stores

#### useStore.js (Auth)
```javascript
{
  user: Object | null,
  isLoading: boolean,
  darkMode: boolean,
  login: Function,
  logout: Function,
  fetchUser: Function,
  toggleDarkMode: Function,
}
```

#### taskStore.js (Tasks)
```javascript
{
  tasks: Array,
  isLoading: boolean,
  error: string | null,
  fetchTasks: Function,
  createTask: Function,
  updateTask: Function,
  deleteTask: Function,
}
```

---

## 🌐 API ROUTES

### Frontend Routes
```
/                  → Redirect to /dashboard (if logged in)
/login             → Login page
/register          → Register page
/verify-email      → Email verification
/forgot-password   → Request password reset
/reset-password    → Reset password form
/dashboard         → Dashboard (protected)
/tasks             → Task management (protected)
/profile           → User profile (protected)
```

### Backend Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
GET    /api/auth/profile
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id

GET    /api/user/profile
PUT    /api/user/profile
POST   /api/user/upload-avatar

POST   /api/ai/suggest
GET    /api/stats

GET    /api/notifications
PUT    /api/notifications/:id/read
```

---

## 🚀 ENTRY POINTS

### Development
```bash
# Backend (Terminal 1)
cd task-ai-backend/backend-task-manager
npm run dev  # → http://localhost:5000

# Frontend (Terminal 2)
cd task-ai-frontend/frontend-task-manager
npm run dev  # → http://localhost:5173
```

### Production Build
```bash
# Frontend
npm run build  # → dist/

# Backend
npm start      # → Production mode
```

---

## 📦 DEPENDENCIES

### Frontend Main
- react, react-dom
- react-router-dom
- zustand
- axios
- recharts
- lucide-react
- react-hot-toast
- tailwindcss

### Backend Main
- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- dotenv
- node-cron
- cloudinary
- groq-sdk
- @google/generative-ai

---

## ✅ FILE COUNTS (After Cleanup)

```
Total Files:     ~980 files
JavaScript/JSX:  ~150 files
Components:      ~60 components
Pages:           3 pages
Services:        2 services
Stores:          2 stores
Utils:           3 utilities
Documentation:   2 markdown files (README.md + REFACTOR_SUMMARY.md)
```

---

**Status:** ✅ Production Ready  
**Last Updated:** December 18, 2025  
**Maintainability:** ⭐⭐⭐⭐⭐ (5/5)
