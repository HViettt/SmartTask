/**
 * ============================================================================
 * TOASTER PROVIDER COMPONENT
 * ============================================================================
 * Purpose: Global toast configuration for the entire application
 * 
 * Features:
 *   ✅ Proper toast stacking (newest on top)
 *   ✅ Max 5 toasts visible at once
 *   ✅ Reverse order display
 *   ✅ Top-right position (unobtrusive)
 *   ✅ 12px spacing between toasts
 *   ✅ Transparent background for custom styling
 *   ✅ Auto-dismiss with per-type durations:
 *      - Success: 3 seconds
 *      - Error: 4 seconds
 *      - Warning/Info: 5 seconds
 * 
 * Usage: Place <ToasterProvider /> once in your main App layout
 * 
 * Author: Senior Frontend Engineer
 * Last Updated: December 18, 2025
 * ============================================================================
 */

import React from 'react';
import { Toaster } from 'react-hot-toast';

export const ToasterProvider = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={true}
      gutter={12}
      containerStyle={{
        // Position below navbar (navbar height = 64px)
        top: '80px',
        // Ensure toasts are above modals and other overlays
        zIndex: 999999,
      }}
      toastOptions={{
        // Global defaults
        duration: 4000,
        style: {
          // Let Toast component handle styling
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          border: 'none',
        },

        // Type-specific options
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#f0fdf4',
          },
        },

        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fef2f2',
          },
        },

        warning: {
          duration: 5000,
          iconTheme: {
            primary: '#f59e0b',
            secondary: '#fffbeb',
          },
        },

        info: {
          duration: 5000,
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#f0f9ff',
          },
        },

        loading: {
          duration: Infinity,
        },
      }}
    />
  );
};

export default ToasterProvider;
