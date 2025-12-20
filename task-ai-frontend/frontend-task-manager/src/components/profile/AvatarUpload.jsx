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

export const AvatarUpload = ({ preview, name = 'User', onAvatarChange, disabled = false }) => {
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

  // Helper: Get avatar background color based on name
  const getAvatarColor = (fullName) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];
    const hash = fullName.charCodeAt(0) + fullName.charCodeAt(fullName.length - 1);
    return colors[hash % colors.length];
  };

  // Helper: Render avatar content (image or initials)
  const renderAvatarContent = () => {
    if (preview) {
      return (
        <img
          src={preview}
          alt={name}
          className="w-full h-full object-cover rounded-full"
        />
      );
    }

    // Fallback: Initials with background color
    return (
      <div
        className={`w-full h-full flex items-center justify-center rounded-full ${getAvatarColor(
          name
        )}`}
      >
        <span className="text-2xl font-bold text-white">
          {getInitials(name)}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Container */}
      <div className="relative group">
        {/* Avatar Circle with Gradient Border */}
        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-500 via-emerald-500 to-purple-500 shadow-lg">
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-1 overflow-hidden">
            {renderAvatarContent()}
          </div>
        </div>

        {/* Hover Overlay */}
        {!disabled && (
          <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Camera className="text-white" size={32} />
              <span className="text-white text-xs font-medium">Đổi ảnh</span>
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
      <div className="text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Định dạng: JPG, PNG, WebP
          <br />
          Kích thước tối đa: 10MB (tự động tối ưu)
        </p>
      </div>
    </div>
  );
};
