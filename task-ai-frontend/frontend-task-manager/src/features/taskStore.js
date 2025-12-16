import { create } from "zustand";
import api from "../services/api";
import { TaskStatus } from "../types";

export const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  // ĐẶT LẠI STATE (dùng khi đổi tài khoản/đăng xuất)
  reset: () => set({ tasks: [], isLoading: false, error: null }),


  clearError: () => set({ error: null }),


  // LẤY TOÀN BỘ CÔNG VIỆC
  fetchTasks: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Không có token → đảm bảo không hiển thị dữ liệu cũ
      return set({ tasks: [], isLoading: false, error: null });
    }
    set({ isLoading: true, error: null });

    try {
      const res = await api.get("/tasks");
      set({ tasks: res.data, isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể tải danh sách.";
      set({ error: msg, isLoading: false });
    }
  },

  // TẠO CÔNG VIỆC MỚI
  addTask: async (taskData) => {
    set({ isLoading: true, error: null });

    try {
      // Payload đã đúng định dạng từ types.js (ví dụ: 'Medium', 'Todo')
      // Đảm bảo status mặc định là 'Todo' nếu không truyền
      const finalPayload = {
        ...taskData,
        status: taskData.status || TaskStatus.TODO,
      };

      // eslint-disable-next-line no-console
      console.info('addTask - final payload:', finalPayload);

      const res = await api.post("/tasks", finalPayload);

      set((state) => ({
        tasks: [res.data, ...state.tasks],
        isLoading: false,
      }));

      return res.data; // Trả về task vừa tạo để hiện toast
    } catch (err) {
      // Ghi log đầy đủ để dễ debug (status, body)
      // Trích xuất thông báo rõ ràng cho người dùng
      // Sau đó ném lại để component xử lý tiếp
      // eslint-disable-next-line no-console
      console.error('addTask error:', err.response || err.message || err);

      const serverMsg = err.response?.data?.message || err.response?.data || null;
      const msg = serverMsg || "Không thể thêm công việc.";
      set({ error: msg, isLoading: false });

      // Ném lại lỗi để component phía trên có thể bắt và xử lý
      throw err;
    }
  },

  // ---------------------------
  // CẬP NHẬT CÔNG VIỆC
  // ---------------------------
  updateTask: async (id, updates) => {
    const prev = get().tasks;

    set({
      tasks: prev.map((t) =>
        t._id === id ? { ...t, ...updates } : t
      ),
    });

    try {
      const res = await api.put(`/tasks/${id}`, updates);
      return res.data; // Trả về task đã cập nhật để hiện toast
    } catch (err) {
      set({ tasks: prev, error: "Cập nhật thất bại." });
      throw err;
    }
  },

  // ---------------------------
  // XÓA CÔNG VIỆC
  // ---------------------------
  deleteTask: async (id) => {
    const prev = get().tasks;
    const deletedTask = prev.find(t => t._id === id);
    set({ tasks: prev.filter((t) => t._id !== id) });

    try {
      await api.delete(`/tasks/${id}`);
      return deletedTask; // Trả về task đã xóa để hiện toast
    } catch (err) {
      set({ tasks: prev, error: "Xóa thất bại." });
      throw err;
    }
  },

  // ---------------------------
  // GỢI Ý CÔNG VIỆC BẰNG AI

  suggestTasks: async () => {
    try {
      const res = await api.post("/tasks/ai-suggest");
      return res.data;
    } catch (err) {
      throw new Error("AI suggest failed");
    }
  },
}));
