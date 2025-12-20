/**
 * ============================================================================
 * TOAST NOTIFICATION COMPONENT
 * ============================================================================
 * Purpose: Professional toast component with close button and advanced UX
 * 
 * Features:
 *   ✅ Beautiful lucide-react icons (check-circle, alert-circle, alert-triangle, info)
 *   ✅ Close button (X) with hover/focus states
 *   ✅ Auto-dismiss with pause on hover
 *   ✅ Dark mode support with proper contrast
 *   ✅ Smooth slide-in/out animations
 *   ✅ WCAG 2.1 AA accessibility
 *   ✅ Responsive design
 * 
 * Usage:
 *   <Toast message="Thành công!" type="success" onClose={handleClose} />
 *   Types: success | error | warning | info
 * 
 * Author: Senior Frontend Engineer + UI/UX Designer
 * Last Updated: December 18, 2025
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Icon mapping for toast types
 * Using lucide-react for consistency and professionalism
 */
const ICON_MAP = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

/**
 * Color scheme for each toast type
 * Includes background, text, border, and icon colors
 */
const COLOR_SCHEME = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    text: 'text-emerald-900 dark:text-emerald-100',
    icon: 'text-emerald-600 dark:text-emerald-400',
    closeHover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
    accent: 'bg-emerald-200/30 dark:bg-emerald-900/30',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-800/60',
    text: 'text-red-900 dark:text-red-100',
    icon: 'text-red-600 dark:text-red-400',
    closeHover: 'hover:bg-red-100 dark:hover:bg-red-900/50',
    accent: 'bg-red-200/30 dark:bg-red-900/30',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/60',
    text: 'text-amber-900 dark:text-amber-100',
    icon: 'text-amber-600 dark:text-amber-400',
    closeHover: 'hover:bg-amber-100 dark:hover:bg-amber-900/50',
    accent: 'bg-amber-200/30 dark:bg-amber-900/30',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800/60',
    text: 'text-blue-900 dark:text-blue-100',
    icon: 'text-blue-600 dark:text-blue-400',
    closeHover: 'hover:bg-blue-100 dark:hover:bg-blue-900/50',
    accent: 'bg-blue-200/30 dark:bg-blue-900/30',
  },
};

/**
 * Toast Component
 * @param {string} message - Toast message content
 * @param {string} type - Toast type: success | error | warning | info
 * @param {Function} onClose - Callback to dismiss toast
 * @param {boolean} visible - Whether toast is visible
 * @param {number} duration - Auto-dismiss duration in ms (default 4000)
 * @param {Function} onAction - Optional action button callback
 * @param {string} actionLabel - Optional action button label
 */
export const Toast = ({
  message,
  type = 'info',
  onClose,
  visible = true,
  duration = 4000,
  onAction,
  actionLabel,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);

  const IconComponent = ICON_MAP[type] || ICON_MAP.info;
  const colors = COLOR_SCHEME[type] || COLOR_SCHEME.info;

  // Auto-dismiss timer with pause on hover
  useEffect(() => {
    if (!isHovered && duration > 0 && visible) {
      const timer = setTimeout(() => {
        onClose?.();
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [isHovered, duration, visible, remainingTime, onClose]);

  // Pause timer on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={`
        toast-notification
        ${colors.bg} ${colors.border} ${colors.text}
        flex items-center gap-3 px-4 py-3 rounded-xl
        border-l-4 shadow-lg backdrop-blur-md
        transform transition-all duration-300 ease-out
        ${visible
          ? 'animate-toast-in translate-x-0 opacity-100 scale-100'
          : 'animate-toast-out translate-x-4 opacity-0 scale-95 pointer-events-none'
        }
        min-w-[320px] max-w-[420px]
        group
      `}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Left Accent Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${colors.accent}`} />

      {/* Icon */}
      <div className={`flex-shrink-0 ${colors.icon}`}>
        <IconComponent size={20} strokeWidth={2.5} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug break-words">
          {message}
        </p>

        {/* Optional action button */}
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className={`
              mt-2 text-xs font-semibold px-3 py-1 rounded-md
              ${colors.closeHover} transition-colors
              focus:outline-none focus:ring-2 focus:ring-offset-2
              dark:focus:ring-offset-gray-900
            `}
          >
            {actionLabel}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className={`
          flex-shrink-0 p-1.5 rounded-lg transition-all
          ${colors.closeHover}
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
          dark:focus:ring-offset-gray-900
          opacity-60 hover:opacity-100
        `}
        aria-label={`Đóng thông báo: ${message}`}
        type="button"
      >
        <X size={18} strokeWidth={2} />
      </button>

      {/* Hover indicator - pause indicator */}
      {isHovered && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-current to-transparent opacity-20" />
      )}
    </div>
  );
};

export default Toast;
