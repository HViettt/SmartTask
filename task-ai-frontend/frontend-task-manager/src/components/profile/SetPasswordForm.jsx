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
 *   - Fully localized with contrast-adjusted submit button
 * 
 * Author: Senior Frontend Engineer
 * ============================================================================
 */

import React from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2, Info } from 'lucide-react';
import { useI18n } from '../../utils/i18n';

export const SetPasswordForm = ({
  passwordData,
  setPasswordData,
  showPasswords,
  setShowPasswords,
  isSettingPassword,
  onSetPassword,
}) => {
  const { t } = useI18n();

  return (
    <form onSubmit={onSetPassword} className="space-y-5 font-mono text-xs">
      {/* Info Message */}
      <div className="flex items-start gap-3 p-4 bg-brand-low/5 border border-brand-low/20 rounded-none relative overflow-hidden">
        <div className="absolute top-1 right-2 text-[6px] text-brand-sub/20 uppercase tracking-widest">[SYS-ALERT-06]</div>
        <Info className="text-brand-low-text flex-shrink-0 mt-0.5" size={14} />
        <div>
          <p className="text-[10px] font-bold text-brand-low-text mb-1 uppercase tracking-wider">
            {t('profile.security.setupTitle')}
          </p>
          <p className="text-[9px] text-brand-sub leading-normal uppercase tracking-wider">
            {t('profile.security.setupDesc')}
          </p>
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
            disabled={isSettingPassword}
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
            disabled={isSettingPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-sub hover:text-brand-main disabled:opacity-50"
            aria-label="Hiển thị mật khẩu"
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
            disabled={isSettingPassword}
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
            disabled={isSettingPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-sub hover:text-brand-main disabled:opacity-50"
            aria-label="Hiển thị mật khẩu xác nhận"
          >
            {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Password Strength Indicator */}
      <PasswordStrengthIndicator password={passwordData.newPassword} t={t} />

      {/* Submit Button */}
      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={isSettingPassword}
          className="w-full sm:w-fit sm:px-8 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white dark:text-brand-card font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 text-[9px] uppercase tracking-wider rounded-none border border-brand-primary shadow-[0_0_10px_rgba(0,240,255,0.1)] cursor-pointer"
        >
          {isSettingPassword ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              {t('profile.security.setting').toUpperCase()}
            </>
          ) : (
            <>
              <CheckCircle2 size={12} />
              {t('profile.security.setPassword').toUpperCase()}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

/**
 * Password Strength Indicator Component
 * Hiển thị độ mạnh của mật khẩu
 */
const PasswordStrengthIndicator = ({ password, t }) => {
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '', textColor: '' };

    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;

    const levels = [
      { level: 1, label: t('profile.security.strengthWeak'), color: 'bg-brand-high', textColor: 'text-brand-high-text' },
      { level: 2, label: t('profile.security.strengthMedium'), color: 'bg-brand-medium', textColor: 'text-brand-medium-text' },
      { level: 3, label: t('profile.security.strengthGood'), color: 'bg-brand-primary', textColor: 'text-brand-primary' },
      { level: 4, label: t('profile.security.strengthStrong'), color: 'bg-brand-low', textColor: 'text-brand-low-text' },
      { level: 5, label: t('profile.security.strengthVeryStrong'), color: 'bg-brand-low', textColor: 'text-brand-low-text' },
    ];

    return levels[strength - 1] || { level: 0, label: '', color: '', textColor: '' };
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2 font-mono text-[9px]">
      <div className="flex items-center justify-between">
        <span className="text-brand-sub uppercase tracking-wider">STRENGTH:</span>
        <span className={`font-bold uppercase tracking-wider ${strength.textColor}`}>
          {strength.label}
        </span>
      </div>
      <div className="h-1.5 bg-brand-base border border-brand-border/40 rounded-none overflow-hidden">
        <div
          className={`h-full ${strength.color} transition-all`}
          style={{ width: `${(strength.level * 100) / 5}%` }}
        ></div>
      </div>
    </div>
  );
};
