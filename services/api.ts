
import axios from 'axios';

// Ưu tiên biến môi trường, fallback về 127.0.0.1
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Timeout ngắn hơn để fallback nhanh
});

// Interceptor to attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- MOCK DATA FOR FALLBACK ---
const MOCK_USER = {
  _id: 'mock_user_offline',
  name: 'Nguyễn Hoàng Việt (Offline)',
  email: 'demo@offline.com',
  avatar: 'https://ui-avatars.com/api/?name=Offline+User&background=6b7280&color=fff',
  preferences: { theme: 'light', language: 'vi' },
  token: 'mock_jwt_token_offline'
};

let MOCK_TASKS = [
  {
    _id: 'task_mock_1',
    title: 'Cài đặt MongoDB & Node.js (Offline Mode)',
    description: 'Server chưa chạy hoặc lỗi mạng. Đây là dữ liệu giả lập để test UI.',
    deadline: new Date().toISOString(),
    priority: 'High',
    complexity: 'Medium',
    status: 'Todo',
    userId: 'mock_user_offline',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'task_mock_2',
    title: 'Hoàn thiện báo cáo thực tập',
    description: 'Viết chương 3 và 4.',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    priority: 'Medium',
    complexity: 'Easy',
    status: 'Doing',
    userId: 'mock_user_offline',
    createdAt: new Date().toISOString()
  }
];

// Interceptor to handle global errors & Mock Fallback
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle Network Error (Backend down/blocked)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('⚠️ Network Error detected. Switching to Mock Data for demonstration.');
      
      const { url, method, data } = error.config;
      
      // Simulate Latency
      await new Promise(r => setTimeout(r, 500));

      // 1. Mock Login
      if (url?.includes('/auth/google-callback-simulation') && method === 'post') {
        return {
          data: MOCK_USER,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      // 2. Mock Get Tasks
      if (url?.includes('/tasks') && method === 'get') {
        return {
          data: MOCK_TASKS,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      // 3. Mock Create Task
      if (url?.includes('/tasks') && method === 'post') {
        const newTask = JSON.parse(data);
        const createdTask = { 
          ...newTask, 
          _id: `task_mock_${Date.now()}`,
          userId: 'mock_user_offline',
          createdAt: new Date().toISOString(),
          status: 'Todo'
        };
        MOCK_TASKS = [createdTask, ...MOCK_TASKS];
        return {
          data: createdTask,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: error.config
        };
      }

      // 4. Mock Update Task
      if (url?.match(/\/tasks\/[^/]+$/) && method === 'put') {
         const updates = JSON.parse(data);
         const id = url.split('/').pop();
         MOCK_TASKS = MOCK_TASKS.map(t => t._id === id ? { ...t, ...updates } : t);
         return {
           data: { ...MOCK_TASKS.find(t => t._id === id), ...updates },
           status: 200,
           statusText: 'OK',
           headers: {},
           config: error.config
         };
      }

       // 5. Mock Delete Task
       if (url?.match(/\/tasks\/[^/]+$/) && method === 'delete') {
         const id = url.split('/').pop();
         MOCK_TASKS = MOCK_TASKS.filter(t => t._id !== id);
         return {
           data: { message: 'Deleted' },
           status: 200,
           statusText: 'OK',
           headers: {},
           config: error.config
         };
      }
    }

    if (error.response?.status === 401) {
      console.warn('Unauthorized - Token expired');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
