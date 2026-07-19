/**
 * ============================================================================
 * PROFILE HEADER COMPONENT
 * ============================================================================
 * Purpose: Header section của Profile page
 * 
 * Display:
 *   - Title & Description
 *   - Icon
 *   - Breadcrumb (nếu cần)
 * 
 * Author: Senior Frontend Engineer
 * ============================================================================
 */

import React from 'react';
import { User, Shield } from 'lucide-react';
import { useI18n } from '../../utils/i18n';

export const ProfileHeader = () => {
  const { t } = useI18n();
  return (
    <div className="bg-brand-card/30 border-b border-brand-border font-mono">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative overflow-hidden scan-lines">
        {/* HUD Tech Corner Tag */}
        <div className="absolute top-2 right-10 text-[6px] text-brand-sub/30 uppercase tracking-widest">[SYS-PILOT-IDENTITY-LOG]</div>
        
        {/* Header Content */}
        <div className="flex items-start justify-between">
          {/* Left: Title & Description */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="p-2 border border-brand-primary bg-brand-primary/10 text-brand-primary-text rounded-none shadow-[0_0_8px_rgba(0,240,255,0.1)]">
              <User className="w-4 h-4" />
            </div>

            {/* Title */}
            <div className="flex-1">
              <h1 className="text-sm font-bold font-sans uppercase tracking-widest text-brand-main mb-1">
                {t('profile.title')}
              </h1>
              <p className="text-[9px] text-brand-sub flex items-center gap-1.5 uppercase tracking-wider">
                <Shield size={11} className="text-brand-primary" />
                {t('profile.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Optional: Breadcrumb */}
        <nav className="mt-4 flex items-center gap-2 text-[8px] font-mono font-bold uppercase tracking-wider">
          <a href="/dashboard" className="text-brand-primary hover:text-brand-primary/80 transition-colors">
            {t('nav.dashboard')}
          </a>
          <span className="text-brand-border">/</span>
          <span className="text-brand-sub">
            {t('profile.title')}
          </span>
        </nav>
      </div>
    </div>
  );
};
