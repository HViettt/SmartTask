/**
 * ============================================================================
 * AI TASK INPUT COMPONENT
 * ============================================================================
 * Component cho phép người dùng nhập mô tả công việc bằng ngôn ngữ tự nhiên
 * và sử dụng AI để parse thành dữ liệu task có cấu trúc.
 * 
 * Data Flow:
 * 1. User nhập text: "Thứ 2 tuần sau vào 9 sáng họp nhóm"
 * 2. Frontend POST /api/tasks/ai-parse
 * 3. AI trích xuất semantic fields:
 *    - dateText: "Thứ 2 tuần sau"
 *    - timeText: "9 sáng"
 * 4. Backend dùng dateResolver để convert thành ISO datetime
 * 5. Frontend nhận lại deadline đã resolve (YYYY-MM-DD HH:mm)
 * 6. Form hiện kết quả cho user xác nhận
 * 
 * Features:
 * - Input field cho natural language
 * - Button "Phân tích bằng AI"
 * - Show dateText/timeText + resolved deadline
 * - Loading state, error/success messages
 * - Callback onParsed để fill form
 * 
 * Usage:
 * <AITaskInput onParsed={(taskData) => setFormData(taskData)} />
 * ============================================================================
 */

import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

// Extract all URLs to push into notes so links aren't lost
const extractUrls = (text) => {
  if (!text) return [];
  const matches = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi);
  return matches || [];
};

export const AITaskInput = ({ onParsed, onError }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [parseResult, setParseResult] = useState(null);

  const handleParse = async () => {
    if (!text || text.trim().length === 0) {
      setError('Vui lòng nhập mô tả công việc');
      return;
    }

    if (text.length > 500) {
      setError('Mô tả quá dài (tối đa 500 ký tự)');
      return;
    }

    setError(null);
    setSuccess(false);
    setParseResult(null);
    setIsLoading(true);

    try {
      const response = await api.post('/tasks/ai-parse', { text });

      if (response.data.success) {
        const parsedData = response.data.data;
        const urls = extractUrls(text);
        const mergedData = {
          ...parsedData,
          // Append all detected URLs into notes (one per line), preserving any existing notes
          notes: [parsedData.notes, urls.length ? urls.join('\n') : null]
            .filter(Boolean)
            .join('\n')
        };

        setParseResult(mergedData);
        setSuccess(true);
        
        // Callback với data đã parse (có deadline đã resolve)
        if (onParsed) {
          onParsed(mergedData);
        }

        // Clear input after 2 seconds
        setTimeout(() => {
          setText('');
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể phân tích. Vui lòng thử lại.';
      setError(errorMsg);
      
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleParse();
    }
  };

  // Format deadline for display
  const formatDeadline = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Tạo công việc bằng AI
        </label>
      </div>

      {/* Input area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          rows={2}
          maxLength={500}
          placeholder='Ví dụ: "Thứ 2 tuần sau vào 9 sáng họp nhóm dự án AI, ưu tiên cao"'
          className="w-full px-4 py-3 border border-purple-300 dark:border-purple-600 rounded-lg 
            focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 
            dark:bg-gray-900 dark:text-white resize-none outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
          {text.length}/500
        </div>
      </div>

      {/* Parse button */}
      <button
        onClick={handleParse}
        disabled={isLoading || !text.trim()}
        className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 
          hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg 
          shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md
          active:scale-95 disabled:active:scale-100"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Đang phân tích...
          </>
        ) : success ? (
          <>
            <CheckCircle2 size={18} />
            Phân tích thành công!
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Phân tích bằng AI
          </>
        )}
      </button>

      {/* Parse result - show dateText/timeText and resolved deadline */}
      {parseResult && success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-green-700 dark:text-green-300">
              <p className="font-semibold">Phân tích thành công!</p>
              <p className="text-xs mt-1">
                {parseResult.dateText && parseResult.timeText && (
                  <span>📅 {parseResult.dateText} {parseResult.timeText}</span>
                )}
              </p>
              {parseResult.deadline && (
                <p className="text-xs mt-1">
                  ⏰ Deadline: <strong>{formatDeadline(parseResult.deadline)}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Info text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        💡 AI sẽ tự động trích xuất tiêu đề, mô tả, ngày giờ, độ ưu tiên và độ phức tạp từ văn bản của bạn.
      </p>
    </div>
  );
};
