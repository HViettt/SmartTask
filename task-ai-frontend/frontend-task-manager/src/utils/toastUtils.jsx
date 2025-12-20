/**
 * ============================================================================
 * TOAST NOTIFICATION UTILITIES
 * ============================================================================
 * Purpose: Centralized, standardized toast notification API
 * 
 * Features:
 *   ✅ Clean, consistent API across app
 *   ✅ Auto-dismiss with configurable duration
 *   ✅ Pause on hover
 *   ✅ Close button for manual dismiss
 *   ✅ Professional lucide-react icons
 *   ✅ Dark mode support
 *   ✅ WCAG 2.1 AA accessibility
 * 
 * Usage:
 *   import { showToast } from '@/utils/toastUtils'
 *
 *   // Simple usage
 *   showToast.success('Thành công!')
 *   showToast.error('Có lỗi xảy ra')
 *   showToast.warning('Cảnh báo!')
 *   showToast.info('Thông tin mới')
 *
 *   // With action button (future enhancement)
 *   showToast.success('Undo action', {
 *     action: () => console.log('Undo clicked'),
 *     actionLabel: 'Hoàn tác',
 *     duration: 5000
 *   })
 *
 * Types:
 *   - success: Positive outcomes, confirmations (3 seconds)
 *   - error: Errors, failures (4 seconds)
 *   - warning: Warnings, cautions (5 seconds)
 *   - info: Informational messages (5 seconds)
 * 
 * Author: Senior Frontend Engineer + UI/UX Designer
 * Last Updated: December 18, 2025
 * ============================================================================
 */

import toast from 'react-hot-toast';
import Toast from '../components/ui/ToastComponent';

/**
 * Default durations per toast type (ms)
 */
const DEFAULT_DURATIONS = {
  success: 3000,
  error: 4000,
  warning: 5000,
  info: 5000,
};

/**
 * Create a custom toast with proper configuration
 * 
 * @param {string} message - Toast message to display
 * @param {string} type - Type of toast: success | error | warning | info
 * @param {object} options - Optional configuration
 * @param {number} options.duration - Auto-dismiss duration (ms)
 * @param {function} options.action - Action callback (future enhancement)
 * @param {string} options.actionLabel - Action button label (future enhancement)
 * @returns {string} Toast ID for potential future dismissal
 */
const createToast = (message, type = 'info', options = {}) => {
  const {
    duration = DEFAULT_DURATIONS[type] || 4000,
    action,
    actionLabel,
  } = options;

  return toast.custom(
    (t) => (
      <Toast
        message={message}
        type={type}
        visible={t.visible}
        onClose={() => toast.dismiss(t.id)}
        duration={duration}
        onAction={action}
        actionLabel={actionLabel}
      />
    ),
    {
      position: 'top-right',
      duration,
      // Custom ID strategy to prevent duplicates if needed
      id: `toast-${type}-${Date.now()}`,
    }
  );
};

/**
 * Standardized toast notification API
 * Provides clean, consistent interface for all components
 */
export const showToast = {
  /**
   * Success toast - green theme, 3 seconds
   * Use for: form submission, file upload, operation success
   */
  success: (message, options = {}) =>
    createToast(message, 'success', options),

  /**
   * Error toast - red theme, 4 seconds
   * Use for: errors, failures, exceptions
   * Duration: 4s (slightly longer to read error details)
   */
  error: (message, options = {}) =>
    createToast(message, 'error', options),

  /**
   * Warning toast - amber theme, 5 seconds
   * Use for: cautions, confirmations, warnings
   * Duration: 5s (longer to ensure user sees warning)
   */
  warning: (message, options = {}) =>
    createToast(message, 'warning', options),

  /**
   * Info toast - blue theme, 5 seconds
   * Use for: informational messages, tips, notifications
   * Duration: 5s (time to read information)
   */
  info: (message, options = {}) =>
    createToast(message, 'info', options),

  /**
   * Dismiss a specific toast
   * @param {string} toastId - Toast ID from creation
   */
  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },
};

/**
 * Convenience export as default for alternative import style
 * import toast from '@/utils/toastUtils'
 */
export default showToast;
