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
    <div className="bg-brand-card border border-brand-border overflow-hidden font-mono text-xs hud-border scan-lines">
      {/* Card Header */}
      <div className="px-6 py-4 bg-brand-base/20 border-b border-brand-border flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-main flex items-center gap-2">
          <Shield size={14} className="text-brand-primary" />
          {t('profile.account.title')}
        </h2>
        <div className="text-[7px] text-brand-sub/40 uppercase tracking-widest">[SYS-PILOT-META]</div>
      </div>

      {/* Card Content */}
      <div className="p-6 sm:p-8">
        <form onSubmit={onUpdateProfile} className="space-y-6">
          {/* Avatar Upload Section */}
          <div className="flex justify-center">
            <AvatarUpload
              preview={avatarPreview}
              name={profileData.name}
              onAvatarChange={onAvatarChange}
              disabled={isSavingProfile}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-brand-border/40"></div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1.5 flex items-center gap-1.5">
                <Mail size={12} className="text-brand-sub/60" />
                {t('profile.account.email')}
              </label>
              <div className="flex items-center gap-3 px-4 py-2 bg-brand-base border border-brand-border rounded-none">
                <span className="flex-1 text-brand-main font-semibold text-xs break-all">
                  {profileData.email}
                </span>
                {profileData.isGoogleUser && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-brand-primary/20 bg-brand-primary/10 text-brand-primary text-[8px] font-bold uppercase tracking-wider whitespace-nowrap rounded-none">
                    <Shield size={10} />
                    {t('profile.details.google')}
                  </span>
                )}
              </div>
              <p className="text-[8px] text-brand-sub mt-1 leading-normal uppercase tracking-wider">
                {t('profile.account.emailNote')}
              </p>
            </div>

            {/* Display Name Field (Editable) */}
            <div>
              <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-sub mb-1.5">
                {t('profile.account.displayName')} <span className="text-brand-high">*</span>
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
                className="w-full px-4 py-2 border border-brand-border bg-brand-base text-brand-main text-xs outline-none transition-colors disabled:opacity-50 rounded-none font-sans"
                required
              />
              <p className="text-[8px] text-brand-sub mt-1 leading-normal uppercase tracking-wider">
                {t('profile.account.displayHint')}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-brand-border/40"></div>

          {/* Submit Button */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full sm:w-fit sm:px-8 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white dark:text-brand-card font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 text-[9px] uppercase tracking-wider rounded-none border border-brand-primary shadow-[0_0_10px_rgba(0,240,255,0.1)] cursor-pointer"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  {t('profile.account.saving')}
                </>
              ) : (
                <>
                  <Save size={12} />
                  {t('profile.account.save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
