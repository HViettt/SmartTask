/**
 * ============================================================================
 * CHANGE PASSWORD FORM COMPONENT
 * ============================================================================
 * Purpose: Form for email/password users to change their password
 * 
 * Fields:
 *   - Current Password (required)
 *   - New Password (required, min 6 chars)
 *   - Confirm Password (required, must match)
 * 
 * Features:
 *   - Show/hide password toggle
 *   - Form validation
 *   - Loading state
 * 
 * Props:
 *   - passwordData: object
 *   - setPasswordData: (fn) => void
 *   - showPasswords: object
 *   - setShowPasswords: (fn) => void
 *   - isChangingPassword: boolean
 *   - onChangePassword: (e) => void
 * 
 * Author: Senior Frontend Engineer
 * ============================================================================
 */

import React from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../utils/i18n';

export const ChangePasswordForm = ({
  passwordData,
  setPasswordData,
  showPasswords,
  setShowPasswords,
  isChangingPassword,
  onChangePassword,
}) => {
  const { t } = useI18n();
  
  return (
    <form onSubmit={onChangePassword} className="space-y-6">
      {/* Current Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('profile.security.currentPassword')} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPasswords.current ? 'text' : 'password'}
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                currentPassword: e.target.value,
              })
            }
            placeholder={t('profile.security.currentPlaceholder')}
            disabled={isChangingPassword}
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
                current: !showPasswords.current,
              })
            }
            disabled={isChangingPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400
                       hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
          >
            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('profile.security.newPassword')} <span className="text-red-500">*</span>
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
            placeholder={t('profile.security.newPlaceholder')}
            disabled={isChangingPassword}
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
            disabled={isChangingPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400
                       hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
          >
            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          {t('profile.security.passwordHint')}
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('profile.security.confirmPassword')} <span className="text-red-500">*</span>
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
            placeholder={t('profile.security.confirmPlaceholder')}
            disabled={isChangingPassword}
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
            disabled={isChangingPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400
                       hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
          >
            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isChangingPassword}
        className="w-full px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg
                   shadow-md hover:shadow-lg transition-all duration-200
                   flex items-center justify-center gap-2
                   disabled:opacity-60 disabled:cursor-not-allowed
                   focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        {isChangingPassword ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {t('profile.security.updating')}
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            {t('profile.security.submit')}
          </>
        )}
      </button>
    </form>
  );
};
