
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, User, TaskStatus } from '../types';
import api from '../services/api';

interface AppState {
  user: User | null;
  tasks: Task[];
  darkMode: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth Actions
  login: (userData: any) => Promise<void>; // Google Simulation
  loginWithPassword: (data: any) => Promise<void>; // Standard Login
  register: (data: any) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  
  logout: () => void;
  toggleDarkMode: () => void;
  toggleLanguage: () => void;
  
  // Task Actions
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  clearError: () => void;
}

// Mock user config for Dev
export const MOCK_USER_DATA = {
  googleId: 'google_demo_123',
  email: 'demo@smarttask.com',
  name: 'Nguyễn Hoàng Việt',
  avatar: 'https://ui-avatars.com/api/?name=Nguyen+Hoang+Viet&background=0D8ABC&color=fff',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      tasks: [],
      darkMode: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/google-callback-simulation', userData);
          const { token, ...user } = response.data;
          localStorage.setItem('token', token);
          set({ user, isLoading: false });
        } catch (error: any) {
           const msg = error.response?.data?.message || 'Đăng nhập Google thất bại';
           set({ isLoading: false, error: msg });
           throw error;
        }
      },

      loginWithPassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', data);
          const { token, ...user } = response.data;
          localStorage.setItem('token', token);
          set({ user, isLoading: false });
        } catch (error: any) {
          const msg = error.response?.data?.message || 'Đăng nhập thất bại';
          set({ isLoading: false, error: msg });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/register', data);
          set({ isLoading: false });
        } catch (error: any) {
          const msg = error.response?.data?.message || 'Đăng ký thất bại';
          set({ isLoading: false, error: msg });
          throw error;
        }
      },

      verifyEmail: async (token) => {
        set({ isLoading: true, error: null });
        try {
           await api.post('/auth/verify-email', { token });
           set({ isLoading: false });
        } catch (error: any) {
           const msg = error.response?.data?.message || 'Xác thực thất bại';
           set({ isLoading: false, error: msg });
           throw error;
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
           await api.post('/auth/forgot-password', { email });
           set({ isLoading: false });
        } catch (error: any) {
           const msg = error.response?.data?.message || 'Gửi yêu cầu thất bại';
           set({ isLoading: false, error: msg });
           throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, tasks: [] });
      },
      
      toggleDarkMode: () => set((state) => {
        const newMode = !state.darkMode;
        if (newMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return { darkMode: newMode };
      }),

      toggleLanguage: () => set((state) => {
        if (!state.user) return {};
        return { 
          user: { 
            ...state.user, 
            preferences: { ...state.user.preferences, language: state.user.preferences.language === 'vi' ? 'en' : 'vi' } 
          } 
        };
      }),

      // --- CRUD ACTIONS ---

      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/tasks');
          set({ tasks: response.data, isLoading: false });
        } catch (error: any) {
          console.error('Fetch tasks failed:', error);
          // Fallback handled in API interceptor, but if we reach here:
          set({ 
            isLoading: false, 
            error: error.response?.status === 401 
              ? 'Phiên đăng nhập hết hạn.' 
              : null 
          });
        }
      },

      addTask: async (taskData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/tasks', taskData);
          set((state) => ({ tasks: [response.data, ...state.tasks], isLoading: false }));
        } catch (error) {
          set({ isLoading: false, error: 'Không thể thêm công việc.' });
        }
      },

      updateTask: async (id, updates) => {
        const previousTasks = get().tasks;
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t._id !== id) return t;
            const newStatus = updates.status !== undefined ? updates.status : t.status;
            let completedAt = t.completedAt;
            if (newStatus === TaskStatus.DONE && t.status !== TaskStatus.DONE) completedAt = new Date().toISOString();
            else if (newStatus !== TaskStatus.DONE) completedAt = undefined;
            return { ...t, ...updates, completedAt };
          }),
        }));

        try {
          await api.put(`/tasks/${id}`, updates);
        } catch (error) {
          set({ tasks: previousTasks, error: 'Cập nhật thất bại.' });
        }
      },

      deleteTask: async (id) => {
        const previousTasks = get().tasks;
        set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) }));
        try {
          await api.delete(`/tasks/${id}`);
        } catch (error) {
          set({ tasks: previousTasks, error: 'Xóa thất bại.' });
        }
      },

      setTasks: (tasks) => set({ tasks }),
    }),
    {
      name: 'smarttask-storage',
      partialize: (state) => ({
        user: state.user,
        darkMode: state.darkMode,
      })
    }
  )
);
