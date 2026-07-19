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
import { useAuthStore } from '../features/useStore';

// Import component con
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { AccountInfoCard } from '../components/profile/AccountInfoCard';
import { SecurityCard } from '../components/profile/SecurityCard';
import { AccountDetailsCard } from '../components/profile/AccountDetailsCard';
import { useI18n } from '../utils/i18n';

// Custom Hook
import { useProfileLogic } from '../hooks/useProfileLogic';

const ProfileSkeleton = () => {
  const skeletonCard = 'bg-brand-card border border-brand-border hud-border';

  return (
    <div className="min-h-screen bg-brand-base font-sans">
      <div className="bg-brand-card border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start gap-4 animate-pulse">
            <div className="w-10 h-10 bg-brand-border" />
            <div className="space-y-3">
              <div className="h-4 w-48 bg-brand-border" />
              <div className="h-3 w-64 bg-brand-border" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono">
        <div className="flex gap-2 mb-6 animate-pulse">
          <div className="h-8 w-24 bg-brand-card border border-brand-border" />
          <div className="h-8 w-24 bg-brand-card border border-brand-border" />
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
  const user = useAuthStore((state) => state.user);
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
    hydrateFromUser,
    handleAvatarChange,
    handleUpdateProfile,
    handleChangePassword,
    handleSetPassword,
    setProfileData,
  } = useProfileLogic();

  // ===== LIFECYCLE =====
  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Nếu đã có user trong store, hydrate ngay để render tức thì
        if (user) {
          hydrateFromUser(user);
          setIsLoadingProfile(false);

          // Refresh nền để đảm bảo dữ liệu mới nhất nhưng không chặn UI
          try {
            await fetchProfile();
          } catch (error) {
            console.error('Background refresh profile error:', error);
          }
          return;
        }

        setIsLoadingProfile(true);
        await fetchProfile();
      } catch (error) {
        console.error('Failed to load profile:', error);
        showToast.error(t('common.error'));
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [fetchProfile, hydrateFromUser, navigate, t, user]);

  // ===== RENDER LOADING STATE =====
  if (isLoadingProfile) {
    return <ProfileSkeleton />;
  }

  // ===== RENDER MAIN PAGE =====
  return (
    <div className="text-brand-main font-sans w-full max-w-6xl mx-auto animate-fadeIn">
      {/* Profile Header */}
      <ProfileHeader />

      {/* Main Content */}
      <div className="py-6">
        {/* Section Tabs - Telemetry Panel Selector */}
        <div className="mb-6 flex gap-2 border-b border-brand-border/65">
          <button
            onClick={() => setActiveSection('info')}
            className={`px-4 py-2 text-[10px] font-bold font-mono border-b-2 transition-all uppercase tracking-widest
              ${
                activeSection === 'info'
                  ? 'text-brand-primary border-brand-primary'
                  : 'text-brand-sub border-transparent hover:text-brand-main'
              }`}
          >
            {t('profile.sections.info')}
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`px-4 py-2 text-[10px] font-bold font-mono border-b-2 transition-all uppercase tracking-widest
              ${
                activeSection === 'security'
                  ? 'text-brand-primary border-brand-primary'
                  : 'text-brand-sub border-transparent hover:text-brand-main'
              }`}
          >
            {t('profile.sections.security')}
          </button>
        </div>

        {/* Section Content */}
        {activeSection === 'info' ? (
          // Info Section
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
            <div className="animate-in fade-in duration-300">
              <AccountDetailsCard profileData={profileData} onSetupPassword={() => setActiveSection('security')} />
            </div>
          </div>
        ) : (
          // Security Section
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
