import React, { useState } from 'react';
import { X, AlertCircle, Copy, ArrowLeft } from 'lucide-react';
import { showToast } from '../../utils/toastUtils';

export const DuplicateTaskModal = ({ isOpen, existingTask, onRetry, onCancel, onAutoRename }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  if (!isOpen || !existingTask) return null;

  const handleAutoRename = async () => {
    setIsRenaming(true);
    try {
      await onAutoRename();
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-amber-200 dark:border-amber-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Công việc trùng tên</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Một công việc với tiêu đề tương tự đã tồn tại vào ngày này:
          </p>

          {/* Existing Task Card */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm break-words max-w-xs">
                {existingTask.title}
              </h3>
              <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${
                existingTask.status === 'Done'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : existingTask.status === 'Doing'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {existingTask.status}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              📅 {new Date(existingTask.deadline).toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Bạn có thể:
            </p>

            {/* Option 1: Auto Rename */}
            <button
              onClick={handleAutoRename}
              disabled={isRenaming}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium"
            >
              <Copy size={16} />
              {isRenaming ? 'Đang xử lý...' : 'Đổi tên & Tạo mới'}
            </button>

            {/* Option 2: Back to Edit */}
            <button
              onClick={onCancel}
              disabled={isRenaming}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Quay lại sửa
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
            💡 Chọn "Đổi tên & Tạo mới" để tự động thêm suffix vào tên (ví dụ: Task A (2))
          </p>
        </div>
      </div>
    </div>
  );
};
