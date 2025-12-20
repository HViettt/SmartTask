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
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Card Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-gray-800/50 dark:to-gray-800/30 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Lock size={20} className="text-emerald-600 dark:text-emerald-400" />
          Bảo mật
        </h2>
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
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                    Thiết lập mật khẩu
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bạn có thể thiết lập mật khẩu để đăng nhập bằng Email + Password bên cạnh Google.
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
