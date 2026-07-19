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
  blue: 'text-brand-primary',
  green: 'text-brand-low',
  red: 'text-brand-high',
  orange: 'text-brand-medium',
  purple: 'text-brand-primary',
  'bg-brand-primary': 'text-brand-primary',
  'bg-brand-low': 'text-brand-low',
  'bg-brand-high': 'text-brand-high',
  'bg-brand-medium': 'text-brand-medium',
};

const iconBgClasses = {
  blue: 'bg-brand-primary/10 border border-brand-primary/20 text-brand-primary',
  green: 'bg-brand-low/10 border border-brand-low/20 text-brand-low',
  red: 'bg-brand-high/10 border border-brand-high/20 text-brand-high',
  orange: 'bg-brand-medium/10 border border-brand-medium/20 text-brand-medium',
  purple: 'bg-brand-primary/10 border border-brand-primary/20 text-brand-primary',
  'bg-brand-primary': 'bg-brand-primary/10 border border-brand-primary/20 text-brand-primary',
  'bg-brand-low': 'bg-brand-low/10 border border-brand-low/20 text-brand-low',
  'bg-brand-high': 'bg-brand-high/10 border border-brand-high/20 text-brand-high',
  'bg-brand-medium': 'bg-brand-medium/10 border border-brand-medium/20 text-brand-medium',
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
  const iconBgClass = iconBgClasses[color] || iconBgClasses.blue;

  let glowClass = 'glow-primary';
  if (color.includes('high') || color === 'red') glowClass = 'glow-high';
  else if (color.includes('medium') || color === 'orange') glowClass = 'glow-medium';
  else if (color.includes('low') || color === 'green') glowClass = 'glow-low';

  return (
    <div
      onClick={onClick}
      className={`glass-panel hover-lift p-5 transition-all duration-300 font-mono text-xs relative overflow-hidden rounded-xl border border-brand-border ${glowClass} ${
        onClick ? 'cursor-pointer hover:border-brand-primary/50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-bold uppercase tracking-widest text-brand-sub">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <p className="text-2xl font-extrabold font-sans text-brand-main leading-none uppercase">{value}</p>
            {trend && (
              <span className={`text-[9px] font-bold ${
                trend.startsWith('+') ? 'text-brand-low' : 'text-brand-high'
              }`}>
                {trend}
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-[8px] text-brand-sub mt-2 leading-normal uppercase tracking-wider">{subtext}</p>
          )}
        </div>
        <div className={`p-2.5 border flex-shrink-0 rounded-lg shadow-xs ${iconBgClass}`}>
          {Icon && <Icon className="w-4 h-4" strokeWidth={2.2} />}
        </div>
      </div>
    </div>
  );
};
