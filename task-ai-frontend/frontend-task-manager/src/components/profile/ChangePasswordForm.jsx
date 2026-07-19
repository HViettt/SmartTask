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
    <form onSubmit={onChangePassword} className="space-y-5 font-mono text-xs">
      {/* Current Password */}
      <div>
        <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1.5">
          {t('profile.security.currentPassword')} <span className="text-brand-high">*</span>
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
            className="w-full px-4 py-2 pr-10 border border-brand-border bg-brand-base text-brand-main text-xs outline-none transition-colors disabled:opacity-50 rounded-none font-sans"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-sub hover:text-brand-main disabled:opacity-50"
            aria-label="Hiển thị mật khẩu"
          >
            {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1.5">
          {t('profile.security.newPassword')} <span className="text-brand-high">*</span>
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
            className="w-full px-4 py-2 pr-10 border border-brand-border bg-brand-base text-brand-main text-xs outline-none transition-colors disabled:opacity-50 rounded-none font-sans"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-sub hover:text-brand-main disabled:opacity-50"
            aria-label="Hiển thị mật khẩu mới"
          >
            {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <p className="text-[8px] text-brand-sub mt-1 leading-normal uppercase tracking-wider">
          {t('profile.security.passwordHint')}
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1.5">
          {t('profile.security.confirmPassword')} <span className="text-brand-high">*</span>
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
            className="w-full px-4 py-2 pr-10 border border-brand-border bg-brand-base text-brand-main text-xs outline-none transition-colors disabled:opacity-50 rounded-none font-sans"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-sub hover:text-brand-main disabled:opacity-50"
            aria-label="Xác nhận mật khẩu mới"
          >
            {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={isChangingPassword}
          className="w-full sm:w-fit sm:px-8 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white dark:text-brand-card font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 text-[9px] uppercase tracking-wider rounded-none border border-brand-primary shadow-[0_0_10px_rgba(0,240,255,0.1)] cursor-pointer"
        >
          {isChangingPassword ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              {t('profile.security.updating')}
            </>
          ) : (
            <>
              <CheckCircle2 size={12} />
              {t('profile.security.submit')}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
