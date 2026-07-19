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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans text-xs">
      <div
        className="absolute inset-0 bg-brand-base/80 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm bg-brand-card border border-brand-medium/35 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 hud-border scan-lines">
        {/* HUD Tech Corner Tag */}
        <div className="absolute top-2 right-10 text-[7px] font-mono text-brand-sub/40 uppercase tracking-widest">
          [SYS-DUPLICATE-ALERT-08]
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border bg-brand-medium/5 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="text-brand-medium" />
            <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-brand-main">DUPLICATE DETECTED</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-brand-sub hover:text-brand-main transition-colors p-1 border border-brand-border bg-brand-card"
            aria-label="Đóng"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-brand-sub text-[10px] leading-relaxed uppercase font-mono tracking-wider">
            A TASK WITH SIMILAR IDENTIFIER ALREADY EXISTS IN DATABASE LOGS:
          </p>

          {/* Existing Task Card */}
          <div className="bg-brand-base border border-brand-border p-4 space-y-2 rounded-none font-mono">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold font-sans text-xs text-brand-main break-words flex-1 leading-normal uppercase">
                {existingTask.title}
              </h3>
              <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 border whitespace-nowrap ${
                existingTask.status === 'Done' || existingTask.status === 'done'
                  ? 'bg-brand-low/10 text-brand-low-text border-brand-low/20'
                  : existingTask.status === 'Doing' || existingTask.status === 'doing'
                  ? 'bg-brand-medium/10 text-brand-medium-text border-brand-medium/20'
                  : 'bg-brand-base border-brand-border text-brand-sub'
              }`}>
                {existingTask.status.toUpperCase()}
              </span>
            </div>
            <p className="text-[8px] font-mono text-brand-sub uppercase tracking-wider">
              DEADLINE: {new Date(existingTask.deadline).toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2 pt-2 font-mono">
            <p className="text-[8px] font-bold text-brand-sub uppercase tracking-widest">
              TELEMETRY ACTION REQUIRED:
            </p>

            {/* Option 1: Auto Rename */}
            <button
              onClick={handleAutoRename}
              disabled={isRenaming}
              className="w-full px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 font-bold text-[9px] uppercase tracking-wider rounded-none border border-brand-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]"
            >
              <Copy size={12} />
              {isRenaming ? 'PROCESSING...' : 'AUTO-RENAME & CREATE'}
            </button>

            {/* Option 2: Back to Edit */}
            <button
              onClick={onCancel}
              disabled={isRenaming}
              className="w-full px-4 py-2.5 bg-brand-card border border-brand-border text-brand-sub hover:bg-brand-base hover:text-brand-main transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 text-[9px] font-bold uppercase tracking-wider rounded-none"
            >
              <ArrowLeft size={12} />
              BACK TO EDIT
            </button>
          </div>

          <p className="text-[8px] text-brand-sub leading-normal pt-1 font-mono uppercase tracking-wider">
            INFO: AUTO-RENAME SUFFIXES ORDER SEQUENCE (E.G. TASK_A (2)).
          </p>
        </div>
      </div>
    </div>
  );
};
