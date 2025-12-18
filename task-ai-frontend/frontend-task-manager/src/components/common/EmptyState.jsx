/**
 * ============================================================================
 * EMPTY STATE COMPONENT
 * ============================================================================
 * Purpose: Hiển thị khi danh sách công việc trống, khuyến khích user tạo task
 * 
 * Props:
 *   - title: string - Tiêu đề (default: "Không có công việc")
 *   - message: string - Thông điệp (default: "Hãy tạo công việc đầu tiên")
 *   - icon: React component - Icon (default: ClipboardList)
 *   - actionText: string - Text nút hành động (default: "Tạo công việc")
 *   - onAction: function - Callback khi click nút
 * 
 * Usage:
 *   <EmptyState
 *     title="Không có task nào"
 *     message="Bắt đầu bằng cách tạo công việc đầu tiên"
 *     onAction={() => setIsModalOpen(true)}
 *   />
 * 
 * Author: UI/UX Improvement
 * Last Updated: December 18, 2025
 * ============================================================================
 */

import React from 'react';
import { Plus, ClipboardList } from 'lucide-react';

export const EmptyState = ({
  title = '📋 Không có công việc nào',
  message = 'Bắt đầu bằng cách tạo công việc đầu tiên của bạn',
  icon: Icon = ClipboardList,
  actionText = '✨ Tạo công việc ngay',
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      {/* Icon lớn */}
      <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full">
        <Icon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>

      {/* Tiêu đề */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* Thông điệp */}
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm">
        {message}
      </p>

      {/* Nút hành động */}
      {onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all active:scale-95 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          {actionText}
        </button>
      )}
    </div>
  );
};
