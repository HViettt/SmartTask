/**
 * ============================================================================
 * AVATAR UPLOAD COMPONENT
 * ============================================================================
 * Purpose: Reusable avatar upload component with preview & hover effect
 * 
 * Features:
 *   - Circular avatar with gradient border
 *   - Hover overlay "Đổi ảnh"
 *   - Fallback to initials if no avatar
 *   - Image preview
 *   - File input validation
 * 
 * Props:
 *   - preview: string (URL or base64)
 *   - name: string (user name for initials)
 *   - onAvatarChange: (file) => void
 *   - disabled: boolean (optional)
 * 
 * Author: Senior Frontend Engineer
 * ============================================================================
 */

import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { useI18n } from '../../utils/i18n';

export const AvatarUpload = ({ preview, name = 'User', onAvatarChange, disabled = false }) => {
  const { t } = useI18n();
  const fileInputRef = useRef(null);

  // Helper: Get initials from name
  const getInitials = (fullName) => {
    return fullName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper: Render avatar content (image or initials)
  const renderAvatarContent = () => {
    if (preview && !preview.includes('ui-avatars.com')) {
      return (
        <img
          src={preview}
          alt={name}
          className="w-full h-full object-cover rounded-none"
          referrerPolicy="no-referrer"
        />
      );
    }

    // Fallback: Initials with Avionics tech colors
    return (
      <div
        className="w-full h-full flex items-center justify-center rounded-none bg-brand-primary/10 text-brand-primary border border-brand-primary/30"
      >
        <span className="text-xl font-mono font-bold">
          {getInitials(name)}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-3 font-mono text-xs">
      {/* Avatar Container */}
      <div className="relative group">
        {/* Avatar Square with Border */}
        <div className="w-24 h-24 p-0.5 border border-brand-border bg-brand-base relative overflow-hidden rounded-none">
          <div className="w-full h-full bg-brand-card overflow-hidden rounded-none">
            {renderAvatarContent()}
          </div>
        </div>

        {/* Hover Overlay */}
        {!disabled && (
          <label className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer flex items-center justify-center rounded-none border border-brand-primary">
            <div className="flex flex-col items-center gap-1">
              <Camera className="text-brand-primary" size={20} />
              <span className="text-brand-primary text-[8px] font-bold uppercase tracking-wider">{t('profile.account.changeAvatar')}</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
              disabled={disabled}
              className="hidden"
              aria-label="Upload avatar"
            />
          </label>
        )}
      </div>

      {/* Help Text */}
      <div className="text-center mt-1">
        <p className="text-[8px] text-brand-sub leading-normal uppercase tracking-wider">
          FORMAT: JPG, PNG, WEBP
          <br />
          LIMIT: 10MB (AUTO-OPT)
        </p>
      </div>
    </div>
  );
};
