import { create } from "zustand";
import api from "../services/api";
import { TaskStatus } from "../types";

export const useTaskStore = create((set, get) => ({
  tasks: [],
  deletedTasks: [],
  isLoading: false,
  error: null,
  // ĐẶT LẠI STATE (dùng khi đổi tài khoản/đăng xuất)
  reset: () => set({ tasks: [], deletedTasks: [], isLoading: false, error: null }),


  clearError: () => set({ error: null }),


  // LẤY TOÀN BỘ CÔNG VIỆC
  fetchTasks: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Không có token → đảm bảo không hiển thị dữ liệu cũ
      return set({ tasks: [], deletedTasks: [], isLoading: false, error: null });
    }
    set({ isLoading: true, error: null });

    try {
      const res = await api.get("/tasks");
      // ✅ Handle new response format: { success, data, count }
      const tasksData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      set({ tasks: tasksData, isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể tải danh sách.";
      set({ error: msg, isLoading: false });
    }
  },

  // LẤY DANH SÁCH CÔNG VIỆC ĐÃ XOÁ (SOFT DELETE)
  fetchDeletedTasks: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return set({ deletedTasks: [], isLoading: false, error: null });
    }
    set({ isLoading: true, error: null });

    try {
      const res = await api.get("/tasks", { params: { includeDeleted: true, scope: 'deleted' } });
      const tasksData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      
      // ✅ Merge với optimistic deletedTasks để tránh mất task vừa xoá
      const existingOptimistic = get().deletedTasks || [];
      const optimisticIds = new Set(existingOptimistic.map(t => t._id));
      const serverIds = new Set(tasksData.map(t => t._id));
      
      // Giữ lại task optimistic chưa có trong response (vừa mới xoá)
      const optimisticOnly = existingOptimistic.filter(t => !serverIds.has(t._id));
      
      // Merge: server data + optimistic
      const merged = [...tasksData, ...optimisticOnly];
      
      set({ deletedTasks: merged, isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể tải công việc đã xoá.";
      set({ error: msg, isLoading: false });
    }
  },

  // TẠO CÔNG VIỆC MỚI (với optimistic update)
  addTask: async (taskData) => {
    // Tạo temporary task để hiển thị ngay
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      _id: tempId,
      ...taskData,
      status: taskData.status || TaskStatus.TODO,
      createdAt: new Date().toISOString(),
      userId: 'temp', // placeholder
      isOptimistic: true, // flag để styling nếu cần
    };

    // Thêm ngay vào state (optimistic update)
    set((state) => ({
      tasks: [optimisticTask, ...state.tasks],
      isLoading: false,
    }));

    try {
      // Payload đã đúng định dạng từ types.js (ví dụ: 'Medium', 'Todo')
      const finalPayload = {
        ...taskData,
        status: taskData.status || TaskStatus.TODO,
      };

      const res = await api.post("/tasks", finalPayload);

      // ✅ Backend returns { success, data, message }
      const newTask = res.data.data || res.data;

      // Thay thế optimistic task bằng task thật từ server
      set((state) => ({
        tasks: state.tasks.map(t => 
          t._id === tempId ? newTask : t
        ),
        isLoading: false,
      }));

      return newTask; // Trả về task vừa tạo để hiện toast
    } catch (err) {
      // Rollback: xóa optimistic task nếu lỗi
      set((state) => ({
        tasks: state.tasks.filter(t => t._id !== tempId),
        isLoading: false,
      }));

      const serverMsg = err.response?.data?.message || err.response?.data || null;
      const msg = serverMsg || "Không thể thêm công việc.";
      set({ error: msg });

      // Ném lại lỗi để component phía trên có thể bắt và xử lý
      throw err;
    }
  },

  // CẬP NHẬT CÔNG VIỆC
  // ---------------------------
  updateTask: async (id, updates) => {
    const prev = get().tasks;
    // ✅ Ensure prev is an array
    if (!Array.isArray(prev)) {
      throw new Error("Tasks state is not an array");
    }

    // Optimistic update
    set({
      tasks: prev.map((t) =>
        t._id === id ? { ...t, ...updates } : t
      ),
    });

    try {
      const res = await api.put(`/tasks/${id}`, updates);
      // ✅ Backend returns { success, data, message }
      const updatedTask = res.data.data || res.data;
      
      // ✅ Cập nhật lại state với dữ liệu đầy đủ từ backend
      set({
        tasks: prev.map((t) =>
          t._id === id ? updatedTask : t
        ),
      });
      
      return updatedTask; // Trả về task đã cập nhật để hiện toast
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
    const prevDeleted = get().deletedTasks || [];
    // ✅ Ensure prev is an array
    if (!Array.isArray(prev)) {
      throw new Error("Tasks state is not an array");
    }
    
    const deletedTask = prev.find(t => t._id === id);
    set({ tasks: prev.filter((t) => t._id !== id) });

    try {
      const res = await api.delete(`/tasks/${id}`);
      const payload = res.data?.data || res.data || deletedTask;
      set({ deletedTasks: [payload, ...prevDeleted] });
      return res.data || { data: payload, message: "Công việc đã được xoá tạm thời." };
    } catch (err) {
      set({ tasks: prev, error: "Xóa thất bại." });
      throw err;
    }
  },

  // ---------------------------
  // KHÔI PHỤC CÔNG VIỆC ĐÃ XOÁ
  // ---------------------------
  restoreTask: async (id) => {
    const prevDeleted = get().deletedTasks || [];
    const prevActive = get().tasks || [];
    try {
      const res = await api.patch(`/tasks/${id}/restore`);
      const restored = res.data?.data || res.data;
      set({
        deletedTasks: prevDeleted.filter(t => t._id !== id),
        tasks: [restored, ...prevActive]
      });
      return res.data;
    } catch (err) {
      set({ deletedTasks: prevDeleted, tasks: prevActive, error: "Khôi phục thất bại." });
      throw err;
    }
  },

  // ---------------------------
  // GỢI Ý CÔNG VIỆC BẰNG AI

  suggestTasks: async () => {
    try {
      const res = await api.post("/tasks/ai-suggest");
      // Backend returns { success, data: { sortedIds, reasoning }, message }
      return res.data.data || res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "AI suggest failed");
    }
  },
}));
