/**
 * ============================================================================
 * APP ICON COMPONENT - CENTRALIZED ICON SYSTEM
 * ============================================================================
 * Purpose: Unified icon component for the entire SmartTask application
 * 
 * Benefits:
 *   - Consistent icon size, stroke width, and styling
 *   - Single source of truth for all icons
 *   - Easy to change icon library or customize
 *   - Accessibility friendly
 *   - Supports color variants (success, error, warning, info, default)
 * 
 * Library: lucide-react (all icons)
 * Usage: <AppIcon name="check-circle" size="md" variant="success" />
 * 
 * Author: Senior Frontend Engineer
 * Last Updated: December 18, 2025
 * ============================================================================
 */

import React from 'react';
import {
  // Navigation & Basic
  Home,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  LogOut,
  Settings,
  
  // User & Account
  User,
  UserCircle,
  Mail,
  Lock,
  KeyRound,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  
  // Status & Feedback
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  
  // Actions
  Save,
  Edit2,
  Trash2,
  Copy,
  Share2,
  Plus,
  Minus,
  Check,
  
  // Task & Productivity
  CheckSquare2,
  Square,
  ClipboardList,
  Calendar,
  Clock,
  
  // Communication
  MessageSquare,
  Send,
  Bell,
  Search,
  
  // Profile Specific
  Camera,
  Upload,
  Download,
  
  // Others
  Github,
  Chrome,
  Zap,
} from 'lucide-react';

// Icon map - tất cả icons sử dụng trong app
const ICON_MAP = {
  // Navigation
  home: Home,
  menu: Menu,
  close: X,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  arrow: ArrowRight,
  logout: LogOut,
  settings: Settings,

  // User & Auth
  user: User,
  userCircle: UserCircle,
  mail: Mail,
  lock: Lock,
  key: KeyRound,
  shield: Shield,
  shieldCheck: ShieldCheck,
  eye: Eye,
  eyeOff: EyeOff,

  // Status & Feedback
  checkCircle: CheckCircle2,
  alert: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loader: Loader2,

  // Actions
  save: Save,
  edit: Edit2,
  delete: Trash2,
  copy: Copy,
  share: Share2,
  plus: Plus,
  minus: Minus,
  check: Check,

  // Task Related
  checkSquare: CheckSquare2,
  square: Square,
  clipboardList: ClipboardList,
  calendar: Calendar,
  clock: Clock,

  // Communication
  message: MessageSquare,
  send: Send,
  bell: Bell,
  search: Search,

  // Profile
  camera: Camera,
  upload: Upload,
  download: Download,

  // External
  github: Github,
  chrome: Chrome,
  zap: Zap,
};

// Size presets
const SIZE_MAP = {
  xs: 16,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
};

// Variant colors
const VARIANT_COLORS = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
  default: 'text-gray-600 dark:text-gray-400',
  muted: 'text-gray-500 dark:text-gray-500',
  white: 'text-white',
  inherit: '',
};

/**
 * AppIcon Component
 * @param {string} name - Icon name from ICON_MAP
 * @param {string} size - Size: xs|sm|md|lg|xl|2xl (default: md)
 * @param {string} variant - Color variant: success|error|warning|info|default|muted|white|inherit
 * @param {string} className - Additional Tailwind classes
 * @param {number} strokeWidth - Custom stroke width (default: 2)
 * @param {boolean} animated - Add spin animation (for loaders)
 * @param {string} label - Aria label for accessibility
 */
export const AppIcon = ({
  name,
  size = 'md',
  variant = 'default',
  className = '',
  strokeWidth = 2,
  animated = false,
  label,
}) => {
  // Get icon component
  const IconComponent = ICON_MAP[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in ICON_MAP`);
    return null;
  }

  // Resolve size
  const sizeValue = SIZE_MAP[size] || size;

  // Build class name
  const variantClass = VARIANT_COLORS[variant] || VARIANT_COLORS.default;
  const animationClass = animated ? 'animate-spin' : '';
  const finalClassName = `${variantClass} ${animationClass} ${className}`.trim();

  return (
    <IconComponent
      size={sizeValue}
      strokeWidth={strokeWidth}
      className={finalClassName}
      aria-label={label}
    />
  );
};

/**
 * Export icon map for advanced use cases
 */
export { ICON_MAP, SIZE_MAP, VARIANT_COLORS };

export default AppIcon;
