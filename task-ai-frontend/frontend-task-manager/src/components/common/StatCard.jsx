/**
 * ============================================================================
 * STAT CARD COMPONENT - HIỂN THỊ THỐNG KÊ
 * ============================================================================
 * Purpose: Card hiển thị số liệu thống kê với icon, title, value và subtext
 * 
 * Props:
 *   - title: string - Tiêu đề
 *   - value: number - Giá trị chính
 *   - icon: React component - Icon lucide
 *   - color: string - Màu chủ đạo ('blue' | 'green' | 'red' | 'orange' | 'purple')
 *   - subtext: string - Thông tin phụ
 *   - trend: '+5%' | '-3%' - Xu hướng (optional)
 *   - onClick: function - Callback khi click
 * 
 * Usage:
 *   <StatCard
 *     title="Hoàn thành"
 *     value={12}
 *     icon={<CheckCircle2 size={24} />}
 *     color="green"
 *     subtext="Tuần này"
 *     onClick={() => handleStatClick()}
 *   />
 * 
 * Author: UI/UX Improvement
 * Last Updated: December 18, 2025
 * ============================================================================
 */

import React from 'react';

const colorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
  red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
};

const iconBgClasses = {
  blue: 'bg-blue-100 dark:bg-blue-900/40',
  green: 'bg-green-100 dark:bg-green-900/40',
  red: 'bg-red-100 dark:bg-red-900/40',
  orange: 'bg-orange-100 dark:bg-orange-900/40',
  purple: 'bg-purple-100 dark:bg-purple-900/40',
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  subtext,
  trend,
  onClick
}) => {
  const colorClass = colorClasses[color] || colorClasses.blue;
  const iconBgClass = iconBgClasses[color] || iconBgClasses.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            {trend && (
              <span className={`text-sm font-semibold ${
                trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend}
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBgClass}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
};
