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
  title = 'LOG_EMPTY: KHÔNG CÓ DỮ LIỆU',
  message = 'BẮT ĐẦU BẰNG CÁCH KHỞI TẠO CÔNG VIỆC MỚI.',
  icon: Icon = ClipboardList,
  actionText = 'TẠO CÔNG VIỆC MỚI',
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center font-mono text-xs py-10 border border-dashed border-brand-border bg-brand-card/10">
      {/* Icon */}
      <div className="mb-4 p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-none text-brand-primary">
        <Icon className="w-8 h-8" />
      </div>

      {/* Title */}
      <h3 className="text-xs font-bold text-brand-main mb-1 uppercase tracking-widest">
        {title}
      </h3>

      {/* Message */}
      <p className="text-brand-sub mb-5 max-w-xs leading-relaxed text-[9px] uppercase tracking-wider">
        {message}
      </p>

      {/* Action Button */}
      {onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold transition-colors flex items-center gap-1 rounded-none border border-brand-primary shadow-[0_0_10px_rgba(0,240,255,0.1)] text-[9px] uppercase tracking-wider cursor-pointer"
        >
          <Plus size={12} />
          {actionText}
        </button>
      )}
    </div>
  );
};
