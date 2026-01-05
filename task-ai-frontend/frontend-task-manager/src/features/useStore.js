/**
 * ============================================================================
 * AUTHENTICATION & APP STATE STORE (ZUSTAND)
 * ============================================================================
 * Mục đích: Quản lý state tập trung cho auth, tasks và preferences
 * 
 * Tính năng:
 * - Trạng thái xác thực (login/logout/register)
 * - Quản lý task (CRUD)
 * - Tuỳ chọn người dùng (dark mode, ngôn ngữ)
 * - Lưu trữ bền vững (localStorage)
 * - Luồng xác minh email và đặt lại mật khẩu
 * - Tích hợp Google OAuth
 * 
 * State chứa:
 *   - user: Đối tượng người dùng hiện tại hoặc null
 *   - isLoading: Cờ loading cho các thao tác async
 *   - error: Thông báo lỗi của lần thao tác gần nhất
 *   - tasks: Mảng công việc của người dùng
 *   - darkMode: Chủ đề giao diện
 *   - isInitialized: Cờ đánh dấu app đã khởi tạo
 * 
 * Phương thức chính:
 *   - login/logout: Quản lý phiên đăng nhập
 *   - register/verifyEmail: Tạo tài khoản mới
 *   - fetchUser: Phục hồi phiên khi load app
 *   - addTask/updateTask/deleteTask: CRUD task
 *   - toggleLanguage: Đổi ngôn ngữ giao diện
 * 
 * Lưu trữ:
 *   - localStorage keys: token, user, darkMode, lang
 *   - Tự động lưu user
 *   - Dọn dẹp khi logout
 * 
 * Cách dùng:
 *   import { useAuthStore } from './features/useStore';
 *   const { user, login, logout } = useAuthStore();
 * 
 * Author: System Implementation
 * Last Updated: December 16, 2025
 * ============================================================================
 */

import { create } from 'zustand';
import api from '../services/api.js';
import { TaskStatus } from '../types.js';
import { useTaskStore } from './taskStore.js';

// HÀM UTILITY: Xử lý Local Storage
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

const getInitialUser = () => {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        return null;
    }
};
const setUserData = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};
const removeUserData = () => {
    localStorage.removeItem('user');
};

// Lưu trạng thái dark mode
const getInitialDarkMode = () => {
    try {
        const v = localStorage.getItem('darkMode');
        return v === 'true';
    } catch (e) {
        return false;
    }
};

// KHỞI TẠO ZUSTAND STORE
export const useAuthStore = create((set, get) => ({
    // AUTH & UTILITY STATE
    user: getInitialUser(),
    darkMode: getInitialDarkMode(),
    isLoading: false,
    error: null,
    isInitialized: false, // Đánh dấu app đã validate token

    // AUTH & UTILITY ACTIONS
    clearError: () => set({ error: null }),
    toggleDarkMode: () => {
        const newVal = !get().darkMode;
        try {
            localStorage.setItem('darkMode', newVal ? 'true' : 'false');
        } catch (e) {
            // Bỏ qua lỗi lưu trữ (trình duyệt chặn, quota)
        }
        set({ darkMode: newVal });
    },
    toggleLanguage: async () => {
        const currentLang = get().user?.preferences?.language || 'vi';
        const newLang = currentLang === 'vi' ? 'en' : 'vi';
        
        try {
            const res = await api.put('/user/preferences', { language: newLang });
            const updatedUser = { ...get().user, preferences: res.data.preferences };
            setUserData(updatedUser);
            try {
                localStorage.setItem('lang', newLang);
            } catch (e) {
                // Bỏ qua lỗi lưu trữ (trình duyệt chặn, quota)
            }
            set({ user: updatedUser });
        } catch (error) {
            console.error('Lỗi khi đổi ngôn ngữ:', error);
            set({ error: 'Không thể đổi ngôn ngữ' });
        }
    },

    // Hàm fetch user profile (dùng khi load app)
    fetchUser: async () => {
        if (!getToken()) {
            set({ isInitialized: true, user: null });
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const res = await api.get('/auth/profile');
            setUserData(res.data);
            try {
                if (res.data?.preferences?.language) {
                    localStorage.setItem('lang', res.data.preferences.language);
                }
            } catch (e) {
                // Bỏ qua lỗi lưu trữ (trình duyệt chặn, quota)
            }
            set({ user: res.data, isLoading: false, isInitialized: true });
            // Đảm bảo danh sách task phản ánh đúng user hiện tại
            try {
                const taskStore = useTaskStore.getState();
                taskStore.reset?.();
                await taskStore.fetchTasks();
            } catch (e) {
                // Bỏ qua nếu task store chưa sẵn sàng
            }
        } catch (error) {
            // Token invalid hoặc expired
            removeToken();
            removeUserData();
            set({ user: null, error: 'Phiên hết hạn. Vui lòng đăng nhập lại.', isLoading: false, isInitialized: true }); 
        }
    },

    // ĐĂNG KÝ
    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/auth/register', userData);
            
            // Backend chỉ trả về user và message
            // Không lưu token vào localStorage, vì user chưa verified
            set({ isLoading: false }); 
            return res.data; // Trả về message và user info
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đăng ký thất bại.';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    // XÁC MINH EMAIL (Mã OTP)
    verifyEmail: async (email, code) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/auth/verify-email', { email, code }); 
            
            // Lưu token và user data sau khi verified
            setToken(res.data.token);
            setUserData(res.data.user);

            set({ user: res.data.user, isLoading: false });
            return res.data; 
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Xác minh thất bại.';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    // GỬI LẠI MÃ XÁC MINH EMAIL
    resendVerification: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/auth/resend-verification', { email });
            set({ isLoading: false });
            return res.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Gửi lại mã thất bại.';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    // GỬI LẠI MÃ XÁC MINH EMAIL
    resendVerification: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/auth/resend-verification', { email });
            set({ isLoading: false });
            return res.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể gửi lại mã xác minh.';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    

    // ĐĂNG NHẬP THƯỜNG
    loginWithPassword: async ({ email, password }) => { 
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/auth/login', { email, password }); // Dùng api.post
            
            const { token, user } = res.data;
            setToken(token);
            setUserData(user);
            //  Set flag để Layout hiển thị toast deadline khi login
            sessionStorage.setItem('justLoggedIn', 'true');
            // Reset state task cho tài khoản mới rồi fetch lại
            try {
                const taskStore = useTaskStore.getState();
                taskStore.reset?.();
                await taskStore.fetchTasks();
            } catch (e) {
                // Bỏ qua nếu task store chưa sẵn sàng
            }
            set({ user, isLoading: false });
            return user;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại.';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    // ĐĂNG NHẬP GOOGLE
    loginGoogle: async (credential) => { 
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/auth/google-login', { credential }); // ✅ Dùng api.post
            
            const { token, user } = res.data;
            setToken(token);
            setUserData(user);
            // ✅ Set flag để Layout hiển thị toast deadline khi login
            sessionStorage.setItem('justLoggedIn', 'true');
            // Reset state task cho tài khoản mới rồi fetch lại
            try {
                const taskStore = useTaskStore.getState();
                taskStore.reset?.();
                await taskStore.fetchTasks();
            } catch (e) {
                // Bỏ qua nếu task store chưa sẵn sàng
            }
            set({ user, isLoading: false });
            return user;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đăng nhập Google thất bại.';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    }, 

    // QUÊN MẬT KHẨU
    forgotPassword: async (email) => { 
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/auth/forgot-password', { email }); // ✅ Dùng api.post
            set({ isLoading: false });
            return res.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Gửi yêu cầu thất bại.';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    // ĐẶT LẠI MẬT KHẨU BẰNG MÃ OTP
    resetPassword: async (email, code, newPassword) => {
        set({ isLoading: true, error: null });
        try {
            // Gọi API Backend: PUT /api/auth/reset-password (OTP) và nhận token + user để auto-login
            const res = await api.put('/auth/reset-password', {
                email,
                code,
                password: newPassword,
            });

            // Nếu backend trả token/user: auto-login
            if (res.data?.token && res.data?.user) {
                setToken(res.data.token);
                setUserData(res.data.user);
                set({ user: res.data.user });
            }

            set({ isLoading: false });
            return res.data; // Trả về thông báo thành công
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi đặt lại mật khẩu không xác định.';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },
    
    // ĐĂNG XUẤT
    logout: async () => { 
        // Xóa token và user khỏi state/localStorage
        removeToken();
        removeUserData();
        set({ user: null, error: null, isLoading: false, isInitialized: true });
        // Xóa state task để tránh dữ liệu cũ
        try {
            const taskStore = useTaskStore.getState();
            taskStore.reset?.();
        } catch (e) {
            // Bỏ qua nếu task store chưa sẵn sàng
        }
    },

    // CẬP NHẬT THÔNG TIN NGƯỜI DÙNG (sau khi update profile)
    updateUserInfo: (userData) => {
        // Đồng bộ dữ liệu người dùng vào localStorage và Zustand state
        setUserData(userData);
        set({ user: userData });
    },

    // TRẠNG THÁI & HÀNH ĐỘNG QUẢN LÝ TASK
    tasks: [],
    setTasks: (tasks) => set({ tasks }), 

    // TẢI CÔNG VIỆC
    fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get('/tasks'); // ✅ Dùng api.get
            set({ tasks: res.data, isLoading: false });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể tải công việc.';
            set({ error: errorMessage, isLoading: false, tasks: [] });
        }
    },

    // THÊM CÔNG VIỆC
    addTask: async (taskData) => {
        const { tasks } = get();
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/tasks', taskData); // ✅ Dùng api.post
            const newTask = res.data;
            set({ tasks: [...tasks, newTask], isLoading: false });
            return newTask;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể thêm công việc mới.';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    // CẬP NHẬT CÔNG VIỆC
    updateTask: async (id, updates) => {
        const { tasks } = get();
        set({ isLoading: true, error: null });
        try {
            const res = await api.put(`/tasks/${id}`, updates); // ✅ Dùng api.put
            const updatedTask = res.data;
            set({
                tasks: tasks.map(t => t._id === id ? updatedTask : t),
                isLoading: false
            });
            return updatedTask;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể cập nhật công việc.';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    // XÓA CÔNG VIỆC
    deleteTask: async (id) => {
        const { tasks } = get();
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/tasks/${id}`); // ✅ Dùng api.delete
            
            set({
                tasks: tasks.filter(t => t._id !== id),
                isLoading: false
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể xóa công việc.';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },
}));