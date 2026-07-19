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
import { useI18n } from '../../utils/i18n';

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  cancelText,
  confirmText,
  isDangerous = false,
  onCancel,
  onConfirm,
  isLoading = false
}) => {
  const { t } = useI18n();
  const resolvedCancelText = cancelText || t('common.cancel');
  const resolvedConfirmText = confirmText || t('common.confirm');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans text-xs">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-brand-base/80 backdrop-blur-xs"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-brand-card border border-brand-border shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200 rounded-none hud-border scan-lines">
        {/* HUD Tech Corner Tag */}
        <div className="absolute top-2 right-10 text-[6px] font-mono text-brand-sub/30 uppercase tracking-widest">[SYS-CONFIRM-ALERT]</div>
        
        {/* Header với icon */}
        <div className="px-6 py-3.5 bg-brand-base/20 border-b border-brand-border">
          <div className="flex items-center gap-2">
            {isDangerous && (
              <AlertTriangle className="w-4 h-4 text-brand-high flex-shrink-0" />
            )}
            <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-brand-main">
              {title}
            </h2>
          </div>
        </div>

        {/* Message */}
        <div className="px-6 py-4">
          <p className="text-brand-sub text-xs leading-relaxed font-mono uppercase tracking-wider">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-3 bg-brand-base/10 border-t border-brand-border flex gap-2 justify-end font-mono">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-brand-border text-[9px] font-bold text-brand-main bg-brand-base hover:bg-brand-base/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-none uppercase tracking-wider"
          >
            {resolvedCancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-[9px] font-bold text-white dark:text-brand-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 rounded-none uppercase tracking-wider ${
              isDangerous
                ? 'bg-brand-high hover:bg-brand-high/90 border border-brand-high'
                : 'bg-brand-primary hover:bg-brand-primary/90 border border-brand-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]'
            }`}
          >
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
