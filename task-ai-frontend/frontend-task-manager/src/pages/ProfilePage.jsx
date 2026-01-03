/**
 * ============================================================================
 * PROFILE PAGE - QUẢN LÝ THÔNG TIN CÁ NHÂN (REFACTORED)
 * ============================================================================
 * Purpose: Trang quản lý profile người dùng với UI/UX nâng cao
 * 
 * Features:
 *   - Layout modular, card-based
 *   - Avatar tròn với gradient border + hover overlay
 *   - Xử lý Google Account + Set Password
 *   - Form validation đầy đủ
 *   - Loading states & Toast notifications
 *   - i18n ready (không hard-code text)
 * 
 * Routes: /profile
 * Access: Private (requires authentication)
 * 
 * Author: Senior Frontend Engineer (Refactored)
 * Last Updated: December 18, 2025
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { showToast } from '../utils/toastUtils';
import { useNavigate } from 'react-router-dom';

// Import component con
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { AccountInfoCard } from '../components/profile/AccountInfoCard';
import { SecurityCard } from '../components/profile/SecurityCard';
import { AccountDetailsCard } from '../components/profile/AccountDetailsCard';
import { useI18n } from '../utils/i18n';

// Custom Hook
import { useProfileLogic } from '../hooks/useProfileLogic';

const ProfileSkeleton = () => {
  const skeletonCard = 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-600/10 to-emerald-600/10 dark:from-blue-600/5 dark:to-emerald-600/5 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-gray-300 dark:bg-gray-700" />
            <div className="space-y-3">
              <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6 animate-pulse">
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className={`lg:col-span-2 h-64 ${skeletonCard} animate-pulse`} />
          <div className={`h-64 ${skeletonCard} animate-pulse`} />
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  // ===== STATE MANAGEMENT =====
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [activeSection, setActiveSection] = useState('info'); // 'info' or 'security'

  // Custom hook chứa tất cả logic
  const {
    profileData,
    avatarPreview,
    isSavingProfile,
    isChangingPassword,
    isSettingPassword,
    showPasswords,
    passwordData,
    setPasswordData,
    setShowPasswords,
    fetchProfile,
    handleAvatarChange,
    handleUpdateProfile,
    handleChangePassword,
    handleSetPassword,
    setProfileData,
  } = useProfileLogic();

  // ===== LIFECYCLE =====
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        setIsLoadingProfile(true);
        await fetchProfile();
      } catch (error) {
        console.error('Failed to load profile:', error);
        showToast.error(t('common.error'));
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [fetchProfile, navigate, t]);

  // ===== RENDER LOADING STATE =====
  if (isLoadingProfile) {
    return <ProfileSkeleton />;
  }

  // ===== RENDER MAIN PAGE =====
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 page-enter">
      {/* Profile Header */}
      <ProfileHeader />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Tabs */}
        <div className="mb-8 flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveSection('info')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
              ${
                activeSection === 'info'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
              }`}
          >
            {t('profile.sections.info')}
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
              ${
                activeSection === 'security'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
              }`}
          >
            {t('profile.sections.security')}
          </button>
        </div>

        {/* Section Content */}
        {activeSection === 'info' ? (
          // Info Section
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Account Info Card */}
            <div className="lg:col-span-2">
              <AccountInfoCard
                profileData={profileData}
                avatarPreview={avatarPreview}
                isSavingProfile={isSavingProfile}
                onAvatarChange={handleAvatarChange}
                onUpdateProfile={handleUpdateProfile}
                setProfileData={setProfileData}
              />
            </div>

            {/* Account Details Card (Sidebar) */}
            <div>
              <AccountDetailsCard profileData={profileData} onSetupPassword={() => setActiveSection('security')} />
            </div>
          </div>
        ) : (
          // Security Section
          <SecurityCard
            profileData={profileData}
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            showPasswords={showPasswords}
            setShowPasswords={setShowPasswords}
            isChangingPassword={isChangingPassword}
            isSettingPassword={isSettingPassword}
            onChangePassword={handleChangePassword}
            onSetPassword={handleSetPassword}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
