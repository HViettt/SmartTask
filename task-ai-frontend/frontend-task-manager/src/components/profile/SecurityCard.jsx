/**
 * ============================================================================
 * SECURITY CARD COMPONENT
 * ============================================================================
 * Purpose: Card 2 - Password Management (Change & Set Password)
 * 
 * Features:
 *   - Change password form (for email/password users)
 *   - Set password form (for Google users)
 *   - Show/hide password toggle
 *   - Form validation & error handling
 *   - Conditional rendering based on user type
 * 
 * Props:
 *   - profileData: object (isGoogleUser)
 *   - passwordData: object
 *   - setPasswordData: (fn) => void
 *   - showPasswords: object
 *   - setShowPasswords: (fn) => void
 *   - isChangingPassword: boolean
 *   - isSettingPassword: boolean
 *   - onChangePassword: (e) => void
 *   - onSetPassword: (e) => void
 * 
 * Author: Senior Frontend Engineer
 * ============================================================================
 */

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { ChangePasswordForm } from './ChangePasswordForm';
import { SetPasswordForm } from './SetPasswordForm';
import { useI18n } from '../../utils/i18n';

export const SecurityCard = ({
  profileData,
  passwordData,
  setPasswordData,
  showPasswords,
  setShowPasswords,
  isChangingPassword,
  isSettingPassword,
  onChangePassword,
  onSetPassword,
}) => {
  const { t } = useI18n();
  
  return (
    <div className="bg-brand-card border border-brand-border overflow-hidden font-mono text-xs hud-border scan-lines">
      {/* Card Header */}
      <div className="px-6 py-4 bg-brand-base/20 border-b border-brand-border flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-main flex items-center gap-2">
          <Lock size={14} className="text-brand-primary" />
          {t('profile.security.title')}
        </h2>
        <div className="text-[7px] text-brand-sub/40 uppercase tracking-widest">[SYS-PILOT-AUTH]</div>
      </div>

      {/* Card Content */}
      <div className="p-6 sm:p-8">
        {/* Conditional Rendering Based on User Type */}
        {profileData.isGoogleUser ? (
          <div className="space-y-6">
            {/* Google User - Show Setup or Change Password Form Based on hasPassword Flag */}
            {profileData.hasPassword ? (
              // Google User with Password - Show Change Password Form
              <ChangePasswordForm
                passwordData={passwordData}
                setPasswordData={setPasswordData}
                showPasswords={showPasswords}
                setShowPasswords={setShowPasswords}
                isChangingPassword={isChangingPassword}
                onChangePassword={onChangePassword}
              />
            ) : (
              // Google User without Password - Show Setup Password Form
              <>
                <div className="mb-6 font-mono">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-main mb-1.5">
                    {t('profile.security.setupTitle')}
                  </h3>
                  <p className="text-[9px] text-brand-sub leading-relaxed uppercase tracking-wider">
                    {t('profile.security.setupDesc')}
                  </p>
                </div>
                <SetPasswordForm
                  passwordData={passwordData}
                  setPasswordData={setPasswordData}
                  showPasswords={showPasswords}
                  setShowPasswords={setShowPasswords}
                  isSettingPassword={isSettingPassword}
                  onSetPassword={onSetPassword}
                />
              </>
            )}
          </div>
        ) : (
          // Email/Password User - Change Password Form
          <ChangePasswordForm
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            showPasswords={showPasswords}
            setShowPasswords={setShowPasswords}
            isChangingPassword={isChangingPassword}
            onChangePassword={onChangePassword}
          />
        )}
      </div>
    </div>
  );
};
