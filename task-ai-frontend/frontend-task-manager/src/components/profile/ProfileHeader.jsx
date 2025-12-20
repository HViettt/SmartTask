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

export const ProfileHeader = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600/10 to-emerald-600/10 dark:from-blue-600/5 dark:to-emerald-600/5 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Content */}
        <div className="flex items-start justify-between">
          {/* Left: Title & Description */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="p-3 bg-blue-600/20 dark:bg-blue-600/10 rounded-xl">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>

            {/* Title */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Thông tin cá nhân
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Shield size={16} />
                Quản lý tài khoản và bảo mật của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Optional: Breadcrumb */}
        <nav className="mt-6 flex items-center gap-2 text-sm">
          <a href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
            Trang chủ
          </a>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 dark:text-gray-400 font-medium">
            Thông tin cá nhân
          </span>
        </nav>
      </div>
    </div>
  );
};
