/**
 * ============================================================================
 * CONFIRM DIALOG COMPONENT
 * ============================================================================
 * Purpose: Xác nhận hành động nguy hiểm (xoá, cảnh báo, vv)
 * 
 * Props:
 *   - isOpen: boolean - Trạng thái hiển thị dialog
 *   - title: string - Tiêu đề dialog
 *   - message: string - Thông điệp cảnh báo
 *   - cancelText: string - Text nút Hủy (default: "Hủy")
 *   - confirmText: string - Text nút Xác nhận (default: "Xoá")
 *   - isDangerous: boolean - Nếu true, nút confirm màu đỏ (default: false)
 *   - onCancel: function - Callback khi click Hủy
 *   - onConfirm: function - Callback khi click Xác nhận
 *   - isLoading: boolean - Trạng thái loading (disable button khi true)
 * 
 * Usage:
 *   <ConfirmDialog
 *     isOpen={showDialog}
 *     title="Xoá công việc?"
 *     message="Hành động này không thể hoàn tác"
 *     isDangerous={true}
 *     onCancel={() => setShowDialog(false)}
 *     onConfirm={() => handleDelete()}
 *   />
 * 
 * Author: UI/UX Improvement
 * Last Updated: December 18, 2025
 * ============================================================================
 */

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  cancelText = '🚫 Hủy',
  confirmText = '✓ Xác nhận',
  isDangerous = false,
  onCancel,
  onConfirm,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        {/* Header với icon */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {isDangerous && (
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            )}
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>
        </div>

        {/* Message */}
        <div className="px-6 py-4">
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2.5 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700 active:scale-95'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
