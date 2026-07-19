/**
 * ============================================================================
 * ACCOUNT DETAILS CARD COMPONENT
 * ============================================================================
 * Purpose: Card 3 - Display Account Metadata (Created date, Verification status, etc.)
 * 
 * Display:
 *   - Account created date
 *   - Email verification status
 *   - Login method
 *   - Last login (optional)
 * 
 * Props:
 *   - profileData: object
 * 
 * Author: Senior Frontend Engineer
 * ============================================================================
 */

import React from 'react';
import { CheckCircle2, Clock, Shield, LogIn } from 'lucide-react';
import { useI18n } from '../../utils/i18n';

export const AccountDetailsCard = ({ profileData, onSetupPassword }) => {
  const { t, locale } = useI18n();
  // Helper: Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper: Get time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return t('common.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('common.hoursAgo', { count: diffHours });
    if (diffDays < 30) return t('common.daysAgo', { count: diffDays });
    return formatDate(dateString);
  };

  return (
    <div className="bg-brand-card border border-brand-border overflow-hidden font-mono text-xs hud-border scan-lines">
      {/* Card Header */}
      <div className="px-6 py-4 bg-brand-base/20 border-b border-brand-border flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-main flex items-center gap-2">
          <Clock size={14} className="text-brand-primary" />
          {t('profile.account.title')}
        </h3>
        <div className="text-[7px] text-brand-sub/40 uppercase tracking-widest">[SYS-PILOT-LOG]</div>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-5">
        {/* Account Created */}
        <DetailItem
          icon={<Clock size={14} className="text-brand-primary" />}
          label={t('profile.details.created')}
          value={formatDate(profileData.createdAt)}
          subtext={`(${getTimeAgo(profileData.createdAt)})`}
        />

        {/* Email Verification Status */}
        <DetailItem
          icon={
            profileData.isVerified ? (
              <CheckCircle2 size={14} className="text-brand-low-text" />
            ) : (
              <Shield size={14} className="text-brand-medium-text" />
            )
          }
          label={t('profile.details.verified')}
          value={profileData.isVerified ? t('profile.details.verifiedYes') : t('profile.details.verifiedNo')}
          status={profileData.isVerified ? 'verified' : 'pending'}
        />

        {/* Login Method */}
        <DetailItem
          icon={
            profileData.isGoogleUser ? (
              <div className="w-3 h-3 bg-brand-primary animate-pulse" />
            ) : (
              <LogIn size={14} className="text-brand-primary" />
            )
          }
          label={t('profile.details.accountType')}
          value={profileData.isGoogleUser ? t('profile.details.google') : t('profile.details.local')}
          badge={profileData.isGoogleUser ? 'Google' : 'Local'}
        />

        {/* Divider */}
        <div className="border-t border-brand-border/40"></div>

        {/* Setup Password Option (for Google Users without password) */}
        {profileData.isGoogleUser && !profileData.hasPassword && (
          <div className="p-4 bg-brand-low/5 border border-brand-low/20 rounded-none">
            <p className="text-[10px] font-bold text-brand-low-text mb-1.5 uppercase tracking-wider">
              {t('profile.details.securityPrompt')}
            </p>
            <p className="text-[9px] text-brand-sub mb-3 leading-relaxed uppercase tracking-wider">
              {t('profile.security.setupDesc')}
            </p>
            <button 
              onClick={onSetupPassword}
              className="text-[9px] font-bold text-brand-low-text hover:text-brand-low transition-colors underline uppercase tracking-wider"
            >
              {t('profile.security.setPassword')}
            </button>
          </div>
        )}

        {/* Help & Support */}
        <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-none relative overflow-hidden">
          <div className="absolute top-1 right-2 text-[6px] text-brand-sub/20 uppercase tracking-widest">[PILOT-SUPPORT]</div>
          <p className="text-[10px] font-bold text-brand-primary-text mb-1.5 uppercase tracking-wider">
            {t('profile.details.supportTitle')}
          </p>
          <p className="text-[9px] text-brand-sub leading-relaxed uppercase tracking-wider">
            {t('profile.details.supportDesc')}
          </p>
          <button className="mt-2.5 text-[9px] font-bold text-brand-primary-text hover:text-brand-primary transition-colors uppercase tracking-wider underline">
            {t('profile.details.supportCta')}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Detail Item Component
 * Renders a single detail row
 */
const DetailItem = ({ icon, label, value, subtext, status, badge }) => {
  return (
    <div className="font-mono">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-widest text-brand-sub">
            {label}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-brand-main break-all leading-normal uppercase">
              {value}
            </p>
            {badge && (
              <span className="inline-flex items-center px-2 py-0.5 text-[8px] font-mono font-bold border uppercase tracking-wider whitespace-nowrap rounded-none
                             bg-brand-primary/10 border-brand-primary/20 text-brand-primary-text">
                {badge}
              </span>
            )}
          </div>
          {subtext && (
            <p className="mt-1 text-[8px] text-brand-sub font-mono uppercase tracking-wider">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
