/**
 * ============================================================================
 * ACCOUNT INFO CARD COMPONENT
 * ============================================================================
 * Purpose: Card 1 - Display & Edit Account Information
 * 
 * Features:
 *   - Avatar upload (using AvatarUpload component)
 *   - Email (read-only)
 *   - Display Name (editable)
 *   - Google Account badge
 *   - Save button with loading state
 * 
 * Props:
 *   - profileData: object
 *   - avatarPreview: string
 *   - isSavingProfile: boolean
 *   - onAvatarChange: (e) => void
 *   - onUpdateProfile: (e) => void
 *   - setProfileData: (fn) => void
 * 
 * Author: Senior Frontend Engineer
 * ============================================================================
 */

import React, { memo } from 'react';
import { Mail, Loader2, Save, CheckCircle2, Shield } from 'lucide-react';
import { AvatarUpload } from './AvatarUpload';
import { useI18n } from '../../utils/i18n';

export const AccountInfoCard = memo(function AccountInfoCard({
  profileData,
  avatarPreview,
  isSavingProfile,
  onAvatarChange,
  onUpdateProfile,
  setProfileData,
}) {
  const { t } = useI18n();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Card Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-gray-800/50 dark:to-gray-800/30 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield size={20} className="text-blue-600 dark:text-blue-400" />
          {t('profile.account.title')}
        </h2>
      </div>

      {/* Card Content */}
      <div className="p-6 sm:p-8">
        <form onSubmit={onUpdateProfile} className="space-y-8">
          {/* Avatar Upload Section */}
          <div className="flex justify-center py-4">
            <AvatarUpload
              preview={avatarPreview}
              name={profileData.name}
              onAvatarChange={onAvatarChange}
              disabled={isSavingProfile}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-gray-500" />
                {t('profile.account.email')}
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                <span className="flex-1 text-gray-700 dark:text-gray-300 font-medium break-all">
                  {profileData.email}
                </span>
                {profileData.isGoogleUser && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium whitespace-nowrap">
                    <Shield size={14} />
                    {t('profile.details.google')}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                {t('profile.account.emailNote')}
              </p>
            </div>

            {/* Display Name Field (Editable) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('profile.account.displayName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    name: e.target.value,
                  })
                }
                placeholder={t('profile.account.namePlaceholder')}
                disabled={isSavingProfile}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 
                           dark:bg-gray-900 dark:text-white 
                           disabled:bg-gray-100 disabled:dark:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60
                           outline-none transition-all"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                {t('profile.account.displayHint')}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSavingProfile}
            className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg
                       shadow-md hover:shadow-lg transition-all duration-200
                       flex items-center justify-center gap-2
                       disabled:opacity-60 disabled:cursor-not-allowed
                       focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {isSavingProfile ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t('profile.account.saving')}
              </>
            ) : (
              <>
                <Save size={18} />
                {t('profile.account.save')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
});
