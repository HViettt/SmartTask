
import api from './api.js';

export const getTaskSuggestions = async (tasks) => {
  try {
    // Gọi API Backend: POST /api/tasks/ai-suggest
    // Backend sẽ tự lấy danh sách task từ DB dựa trên token của user
    // nên ta không nhất thiết phải gửi tasks từ FE lên, 
    // nhưng để đồng bộ state hiện tại (nếu chưa lưu), ta có thể gửi hoặc chỉ cần trigger.
    // Ở đây ta gọi trigger đơn giản, BE tự query DB.
    
    const response = await api.post('/tasks/ai-suggest');
    
    // Response data structure: { sortedIds: string[], reasoning: Record<string, string> }
    return response.data;

  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    throw error;
  }
};
