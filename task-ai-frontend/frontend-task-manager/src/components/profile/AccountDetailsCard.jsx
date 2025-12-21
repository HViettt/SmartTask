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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Card Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800/50 dark:to-gray-800/30 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock size={20} className="text-purple-600 dark:text-purple-400" />
          {t('profile.account.title')}
        </h3>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-6">
        {/* Account Created */}
        <DetailItem
          icon={<Clock size={18} className="text-blue-600 dark:text-blue-400" />}
          label={t('profile.details.created')}
          value={formatDate(profileData.createdAt)}
          subtext={`(${getTimeAgo(profileData.createdAt)})`}
        />

        {/* Email Verification Status */}
        <DetailItem
          icon={
            profileData.isVerified ? (
              <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
            ) : (
              <Shield size={18} className="text-yellow-600 dark:text-yellow-400" />
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
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 rounded-full" />
            ) : (
              <LogIn size={18} className="text-indigo-600 dark:text-indigo-400" />
            )
          }
          label={t('profile.details.accountType')}
          value={profileData.isGoogleUser ? t('profile.details.google') : t('profile.details.local')}
          badge={profileData.isGoogleUser ? 'Google' : 'Local'}
        />

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Setup Password Option (for Google Users without password) */}
        {profileData.isGoogleUser && !profileData.hasPassword && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs font-medium text-green-900 dark:text-green-200 mb-2">
              {t('profile.details.securityPrompt')}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mb-3 leading-relaxed">
              {t('profile.security.setupDesc')}
            </p>
            <button 
              onClick={onSetupPassword}
              className="text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              {t('profile.security.setPassword')}
            </button>
          </div>
        )}

        {/* Help & Support */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-2">
            {t('profile.details.supportTitle')}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            {t('profile.details.supportDesc')}
          </p>
          <button className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
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
    <div>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {label}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
              {value}
            </p>
            {badge && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap
                             bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {badge}
              </span>
            )}
          </div>
          {subtext && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
