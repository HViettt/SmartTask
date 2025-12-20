/**
 * ============================================================================
 * SET PASSWORD FORM COMPONENT
 * ============================================================================
 * Purpose: Form for Google users to set password for the first time
 * 
 * Features:
 *   - NO current password required (first-time setup)
 *   - New Password (required, min 6 chars)
 *   - Confirm Password (required, must match)
 *   - Show/hide password toggle
 *   - Info message about dual login methods
 * 
 * Props:
 *   - passwordData: object
 *   - setPasswordData: (fn) => void
 *   - showPasswords: object
 *   - setShowPasswords: (fn) => void
 *   - isSettingPassword: boolean
 *   - onSetPassword: (e) => void
 * 
 * Author: Senior Frontend Engineer
 * ============================================================================
 */

import React from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2, Info } from 'lucide-react';

export const SetPasswordForm = ({
  passwordData,
  setPasswordData,
  showPasswords,
  setShowPasswords,
  isSettingPassword,
  onSetPassword,
}) => {
  return (
    <form onSubmit={onSetPassword} className="space-y-6">
      {/* Info Message */}
      <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <Info className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-1">
            Thiết lập mật khẩu lần đầu
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
            Sau khi thiết lập, bạn sẽ có thể đăng nhập bằng cả <strong>Google</strong> và <strong>Email + Mật khẩu</strong>. Không cần xác minh mật khẩu cũ.
          </p>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Mật khẩu mới <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPasswords.new ? 'text' : 'password'}
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                newPassword: e.target.value,
              })
            }
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            disabled={isSettingPassword}
            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                       dark:bg-gray-900 dark:text-white
                       disabled:bg-gray-100 disabled:dark:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60
                       outline-none transition-all"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords({
                ...showPasswords,
                new: !showPasswords.new,
              })
            }
            disabled={isSettingPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400
                       hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
          >
            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          Nên sử dụng mật khẩu mạnh: chữ hoa, chữ thường, số, ký tự đặc biệt
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Xác nhận mật khẩu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
            placeholder="Nhập lại mật khẩu"
            disabled={isSettingPassword}
            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                       dark:bg-gray-900 dark:text-white
                       disabled:bg-gray-100 disabled:dark:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60
                       outline-none transition-all"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords({
                ...showPasswords,
                confirm: !showPasswords.confirm,
              })
            }
            disabled={isSettingPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400
                       hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
          >
            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Password Strength Indicator (Optional) */}
      <PasswordStrengthIndicator password={passwordData.newPassword} />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSettingPassword}
        className="w-full px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700
                   text-white font-semibold rounded-lg
                   shadow-md hover:shadow-lg transition-all duration-200
                   flex items-center justify-center gap-2
                   disabled:opacity-60 disabled:cursor-not-allowed
                   focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        {isSettingPassword ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Đang thiết lập...
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            Thiết lập mật khẩu
          </>
        )}
      </button>
    </form>
  );
};

/**
 * Password Strength Indicator Component
 * Hiển thị độ mạnh của mật khẩu
 */
const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };

    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;

    const levels = [
      { level: 1, label: 'Yếu', color: 'bg-red-500' },
      { level: 2, label: 'Trung bình', color: 'bg-yellow-500' },
      { level: 3, label: 'Khá', color: 'bg-blue-500' },
      { level: 4, label: 'Mạnh', color: 'bg-emerald-500' },
      { level: 5, label: 'Rất mạnh', color: 'bg-green-500' },
    ];

    return levels[strength - 1] || { level: 0, label: '', color: '' };
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">Độ mạnh:</span>
        <span className={`font-medium ${strength.color.replace('bg-', 'text-')}`}>
          {strength.label}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${strength.color} transition-all`}
          style={{ width: `${(strength.level * 100) / 5}%` }}
        ></div>
      </div>
    </div>
  );
};
