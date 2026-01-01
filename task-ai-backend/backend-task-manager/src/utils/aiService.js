/**
 * ============================================================================
 * AI SERVICE MODULE
 * ============================================================================
 * Mục đích: Dịch vụ AI tập trung, hỗ trợ nhiều provider với cơ chế fallback
 * 
 * Tính năng:
 * - Chính: Groq API (nhanh, 9000 yêu cầu miễn phí/ngày)
 * - Dự phòng: Google Gemini (chậm hơn, chạy khi Groq lỗi)
 * - Dự phòng: Thuật toán sắp xếp thông minh (tức thì, luôn hoạt động)
 * 
 * Thứ tự ưu tiên: Groq > Gemini > Thuật toán
 * 
 * Cách dùng:
 *   const result = await suggestTaskOrder(tasks);
 *   // Trả về: { suggestions: [...sorted tasks...], source: 'groq'|'gemini'|'algorithm' }
 * 
 * Biến môi trường:
 *   GROQ_API_KEY: API key Groq (tùy chọn, cho Groq)
 *   GOOGLE_API_KEY: API key Google (tùy chọn, cho Gemini)
 * 
 * Author: System Implementation
 * Last Updated: December 16, 2025
 * ============================================================================
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

/**
 * Gọi Groq API để lấy gợi ý AI
 */
const suggestWithGroq = async (tasks) => {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey || groqApiKey.includes('placeholder')) {
    throw new Error('Groq API key not configured');
  }
  
  const groq = new Groq({ apiKey: groqApiKey });
  
  const tasksForPrompt = JSON.stringify(tasks.map(t => ({
    id: t._id.toString(),
    title: t.title,
    deadline: t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : 'N/A',
    priority: t.priority,
    complexity: t.complexity,
    status: t.status
  })));

  const prompt = `Bạn là chuyên gia quản lý công việc. Hãy sắp xếp thứ tự thực hiện tối ưu cho danh sách task sau.
Ưu tiên:
1. Overdue tasks (status = 'Overdue') - PHẢI XỬ LÝ NGAY
2. Deadline gần nhất trước
3. Priority: High > Medium > Low
4. Complexity: Easy trước (tạo momentum), Hard sau (khi năng lượng cao)

Danh sách task:
${tasksForPrompt}

Trả về JSON array với format:
[{"taskId": "id", "reasoning": "lý do ngắn gọn tiếng Việt"}]

Chỉ trả về JSON, không thêm text nào.`;

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'llama-3.3-70b-versatile', // Model mới nhất (mixtral đã ngừng)
    temperature: 0.3, // Sắp xếp mang tính quyết định
    max_tokens: 1024
  });

  const resultText = response.choices[0].message.content.trim();
  
  const suggestions = JSON.parse(resultText);
  
  if (!Array.isArray(suggestions)) {
    throw new Error('Invalid response format from Groq');
  }
  
  return suggestions;
};

/**
 * Gọi Google Gemini (dự phòng)
 */
const suggestWithGemini = async (tasks) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const tasksForPrompt = JSON.stringify(tasks.map(t => ({
    id: t._id.toString(),
    title: t.title,
    deadline: t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : 'N/A',
    priority: t.priority,
    complexity: t.complexity,
    status: t.status
  })));

  const prompt = `Bạn là chuyên gia quản lý công việc. Hãy sắp xếp thứ tự thực hiện tối ưu.
Ưu tiên:
1. Overdue tasks (status = 'Overdue')
2. Deadline gần nhất
3. Priority cao
4. Complexity Easy trước

Danh sách task: ${tasksForPrompt}

Trả về JSON array: [{"taskId": "...", "reasoning": "..."}]
Chỉ JSON, không text thêm.`;

  const result = await model.generateContent({
    contents: [{ parts: [{ text: prompt }] }]
  });

  const resultText = result.response.text().trim();
  
  const suggestions = JSON.parse(resultText);
  
  if (!Array.isArray(suggestions)) {
    throw new Error('Invalid response format from Gemini');
  }
  
  return suggestions;
};

/**
 * Thuật toán sắp xếp dự phòng đơn giản
 */
const suggestWithFallback = (tasks) => {
  const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
  const complexityMap = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
  
  const sorted = [...tasks].sort((a, b) => {
    // 1. Ưu tiên Overdue trước
    const aIsOverdue = a.status === 'Overdue' ? 1 : 0;
    const bIsOverdue = b.status === 'Overdue' ? 1 : 0;
    if (aIsOverdue !== bIsOverdue) return bIsOverdue - aIsOverdue;
    
    // 2. Theo hạn chót
    if (a.deadline && b.deadline) {
      const diff = new Date(a.deadline) - new Date(b.deadline);
      if (diff !== 0) return diff;
    }
    
    // 3. Theo mức ưu tiên
    const pA = priorityMap[a.priority] || 0;
    const pB = priorityMap[b.priority] || 0;
    if (pA !== pB) return pB - pA;
    
    // 4. Theo độ phức tạp
    const cA = complexityMap[a.complexity] || 0;
    const cB = complexityMap[b.complexity] || 0;
    return cA - cB;
  });
  
  return sorted.map(t => ({
    taskId: t._id.toString(),
    reasoning: t.status === 'Overdue' 
      ? `QUÁ HẠN! Hạn: ${t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : 'N/A'}`
      : `Deadline: ${t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : 'N/A'}, Priority: ${t.priority}`
  }));
};

/**
 * Main function - Try AI providers in order
 */
const getSuggestedOrder = async (tasks) => {
  if (!tasks || tasks.length === 0) {
    return { sortedIds: [], reasoning: {} };
  }
  
  // Thử 1: Groq 
  try {
    const suggestions = await suggestWithGroq(tasks);
    const result = processAISuggestions(tasks, suggestions);
    result.provider = 'groq'; // Thêm thông tin provider
    result.providerName = 'Groq AI';
    return result;
  } catch (groqError) {
    // Try Gemini fallback
  }
  
  // Thử 2: Gemini (dự phòng)
  try {
    const suggestions = await suggestWithGemini(tasks);
    const result = processAISuggestions(tasks, suggestions);
    result.provider = 'gemini'; // Thêm thông tin provider
    result.providerName = 'Google Gemini';
    return result;
  } catch (geminiError) {
    // Use fallback
  }
  
  // Thử 3: Thuật toán dự phòng
  const suggestions = suggestWithFallback(tasks);
  const result = processAISuggestions(tasks, suggestions);
  result.provider = 'fallback'; // Thêm thông tin provider
  result.providerName = 'Smart Algorithm (No AI)';
  return result;
};

/**
 * Chuyển kết quả AI thành format response
 */
const processAISuggestions = (tasks, suggestions) => {
  const validTaskIds = new Set(tasks.map(t => t._id.toString()));
  const filteredSuggestions = suggestions.filter(s => validTaskIds.has(s.taskId));
  
  const sortedIds = filteredSuggestions.map(s => s.taskId);
  const reasoning = {};
  filteredSuggestions.forEach(s => {
    reasoning[s.taskId] = s.reasoning;
  });
  
  return { sortedIds, reasoning };
};

/**
 * ============================================================================
 * PARSE NATURAL LANGUAGE TO TASK DATA
 * ============================================================================
 * Chuyển đổi câu mô tả công việc bằng ngôn ngữ tự nhiên thành dữ liệu task
 * 
 * Input: "Tuần sau nộp báo cáo AI, thứ sáu họp nhóm, ưu tiên cao"
 * Output: {
 *   title: "Nộp báo cáo AI",
 *   description: "Họp nhóm vào thứ sáu",
 *   deadline: "2026-01-10",
 *   priority: "High",
 *   complexity: "Medium"
 * }
 */

/**
 * Parse task bằng Groq AI (ưu tiên)
 * 
 * ⚠️ IMPORTANT: AI chỉ trích xuất semantic fields, KHÔNG tính toán deadline!
 * - AI trả về: dateText (text thô), timeText (time thô)
 * - Backend sẽ dùng resolveVietnameseDate() để tính deadline chính xác
 */
const parseTaskWithGroq = async (text) => {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey || groqApiKey.includes('placeholder')) {
    throw new Error('Groq API key not configured');
  }
  
  const groq = new Groq({ apiKey: groqApiKey });

  const prompt = `Bạn là trợ lý AI phân tích công việc.

Phân tích câu sau và trích xuất thông tin công việc:
"${text}"

Trả về JSON với format CHÍNH XÁC:
{
  "title": "tiêu đề ngắn gọn (tối đa 50 ký tự)",
  "description": "mô tả chi tiết hơn (nếu có)",
  "dateText": "biểu thức ngày bằng tiếng Việt (vd: 'Thứ 2 tuần sau', 'ngày mai', 'hôm nay')",
  "timeText": "biểu thức giờ (vd: '09:00', '9 sáng', '3 chiều')",
  "priority": "High|Medium|Low",
  "complexity": "Easy|Medium|Hard",
  "notes": "ghi chú thêm, URLs (nếu có)"
}

Quy tắc QUAN TRỌNG:
1. Không tính toán ngày! Chỉ TRÍCH XUẤT text thô từ input
2. **GIỮ NGUYÊN các trạng từ thời gian: "trước", "sau", "đến", "tới"**
3. dateText ví dụ: 
   - "trước Thứ 2 tuần sau" (GIỮ "trước")
   - "đến Thứ 5" (GIỮ "đến")
   - "Thứ 2 tuần sau"
   - "ngày mai", "hôm nay", "tuần này"
4. timeText ví dụ: "09:00", "9 sáng", "3 chiều", "11:59 tối"
5. "ưu tiên cao/gấp/quan trọng" → High; "bình thường" → Medium; "thấp/không gấp" → Low
6. "dễ/đơn giản" → Easy; "bình thường" → Medium; "khó/phức tạp" → Hard
7. Nếu không rõ priority/complexity, mặc định: Medium
8. Nếu không có time → timeText = "" (backend sẽ dùng 23:59)
9. **QUAN TRỌNG**: Nếu có URLs (http://, https://, www.), phải đưa TOÀN BỘ vào notes
10. Chỉ trả về JSON, không thêm text.

Ví dụ input: "Thứ 2 tuần sau vào lúc 9 sáng họp nhóm, dự án AI, ưu tiên cao"
Ví dụ output:
{
  "title": "Họp nhóm dự án AI",
  "description": "Họp với nhóm",
  "dateText": "Thứ 2 tuần sau",
  "timeText": "9 sáng",
  "priority": "High",
  "complexity": "Medium",
  "notes": ""
}

Ví dụ 2 input: "trước thứ 2 tuần sau hoàn thành báo cáo, https://example.com"
Ví dụ 2 output:
{
  "title": "Hoàn thành báo cáo",
  "description": "Hoàn thành báo cáo",
  "dateText": "trước thứ 2 tuần sau",
  "timeText": "",
  "priority": "High",
  "complexity": "Medium",
  "notes": "https://example.com"
}`;

  const response = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 512
  });

  const resultText = response.choices[0].message.content.trim();
  
  let cleanedText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleanedText);
  
  if (!parsed.title || !parsed.priority || !parsed.complexity) {
    throw new Error('Invalid parsed task format from Groq');
  }
  
  return parsed;
};

/**
 * Parse task bằng Gemini AI (dự phòng)
 * 
 * ⚠️ IMPORTANT: AI chỉ trích xuất semantic fields, KHÔNG tính toán deadline!
 */
const parseTaskWithGemini = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Bạn là trợ lý AI phân tích công việc.

Phân tích câu sau:
"${text}"

Trả về JSON:
{
  "title": "...",
  "description": "...",
  "dateText": "...",
  "timeText": "...",
  "priority": "High|Medium|Low",
  "complexity": "Easy|Medium|Hard",
  "notes": "URLs và ghi chú thêm (nếu có)"
}

Quy tắc:
- dateText: "Thứ 2 tuần sau", "trước Thứ 2 tuần sau", "ngày mai", "hôm nay", etc (KHÔNG tính toán!)
- **GIỮ NGUYÊN từ "trước", "sau", "đến" trong dateText**
- timeText: "09:00", "9 sáng", "3 chiều", etc (KHÔNG tính toán!)
- **notes**: Đưa TẤT CẢ URLs vào notes
- Chỉ TRÍCH XUẤT từ text, không tính toán.
- Chỉ JSON, không text thêm.`;

  const result = await model.generateContent({
    contents: [{ parts: [{ text: prompt }] }]
  });

  const resultText = result.response.text().trim();
  
  let cleanedText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleanedText);
  
  if (!parsed.title || !parsed.priority || !parsed.complexity) {
    throw new Error('Invalid parsed task format from Gemini');
  }
  
  return parsed;
};

/**
 * Main parsing function với fallback
 */
const parseTaskFromText = async (text) => {
  if (!text || text.trim().length === 0) {
    throw new Error('Text input is empty');
  }
  
  // Thử 1: Groq
  try {
    const result = await parseTaskWithGroq(text);
    result.aiProvider = 'Groq AI';
    return result;
  } catch (groqError) {
    // Try Gemini fallback
  }
  
  // Thử 2: Gemini
  try {
    const result = await parseTaskWithGemini(text);
    result.aiProvider = 'Google Gemini';
    return result;
  } catch (geminiError) {
    throw new Error('AI parsing failed. Please try again or enter task details manually.');
  }
};

module.exports = {
  suggestWithGroq,
  suggestWithGemini,
  suggestWithFallback,
  getSuggestedOrder,
  processAISuggestions,
  parseTaskFromText,
  parseTaskWithGroq,
  parseTaskWithGemini
};
