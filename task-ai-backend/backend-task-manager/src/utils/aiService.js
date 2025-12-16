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

  console.log('🤖 Calling Groq API for task suggestions...');
  
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
  console.log('📝 Groq response:', resultText.substring(0, 200));
  
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

  console.log('🤖 Calling Gemini API for task suggestions...');
  
  const result = await model.generateContent({
    contents: [{ parts: [{ text: prompt }] }]
  });

  const resultText = result.response.text().trim();
  console.log('📝 Gemini response:', resultText.substring(0, 200));
  
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
  console.warn('⚠️ Using fallback sorting...');
  
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
      ? `⚠️ QUAY HẠN! Hạn: ${t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : 'N/A'}`
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
  
  // Thử 1: Groq (hiệu năng tốt, gói miễn phí cao)
  try {
    const suggestions = await suggestWithGroq(tasks);
    console.log('✅ Used Groq AI');
    const result = processAISuggestions(tasks, suggestions);
    result.provider = 'groq'; // Thêm thông tin provider
    result.providerName = 'Groq AI';
    return result;
  } catch (groqError) {
    console.warn('⚠️ Groq failed:', groqError.message);
  }
  
  // Thử 2: Gemini (dự phòng)
  try {
    const suggestions = await suggestWithGemini(tasks);
    console.log('✅ Used Gemini AI');
    const result = processAISuggestions(tasks, suggestions);
    result.provider = 'gemini'; // Thêm thông tin provider
    result.providerName = 'Google Gemini';
    return result;
  } catch (geminiError) {
    console.warn('⚠️ Gemini failed:', geminiError.message);
  }
  
  // Thử 3: Thuật toán dự phòng
  console.log('✅ Using fallback sorting');
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

module.exports = {
  suggestWithGroq,
  suggestWithGemini,
  suggestWithFallback,
  getSuggestedOrder,
  processAISuggestions
};
