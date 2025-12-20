/**
 * ============================================================================
 * MAIN APP COMPONENT & ROUTING
 * ============================================================================
 * Purpose: Application root with route configuration and auth protection
 * 
 * Features:
 * - Token validation on app startup
 * - Protected routes (require authentication)
 * - Public routes (login, register, etc)
 * - Dark mode support
 * - Automatic session restoration
 * 
 * Route Structure:
 *   - /login - Login page (public)
 *   - /register - Registration page (public)
 *   - /verify-email - Email verification (public)
 *   - /forgot-password - Password reset request (public)
 *   - /reset-password - Password reset form (public)
 *   - / (protected) - Main app layout with nested routes:
 *     - /dashboard - Dashboard (protected)
 *     - /tasks - Task list (protected)
 * 
 * Auth Flow:
 *   1. App loads, appInitialized = false
 *   2. Check localStorage for token
 *   3. If token exists, validate via API (/auth/profile)
 *   4. If valid: set user, redirect /dashboard
 *   5. If invalid/expired: logout, redirect /login
 *   6. Once done: appInitialized = true, render routes
 * 
 * Security:
 *   - ProtectedRoute checks user authentication
 *   - ProtectedRoute shows loading while validating
 *   - Redirect unauthenticated users to /login
 *   - Validate on every app load (session restoration)
 * 
 * Usage:
 *   <App /> is rendered in main.jsx
 *   No props needed, uses Zustand for state
 * 
 * Author: System Implementation
 * Last Updated: December 16, 2025
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './features/useStore.js';
import { Layout } from './components/layout/Layout.jsx';
import { Dashboard } from './pages/DashboardPage.jsx';
import { Task } from './pages/Task.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { LoginPage } from './components/auth/LoginPage.jsx';
import { RegisterPage } from './components/auth/Register.jsx';
import { VerifyEmailPage } from './components/auth/VerifyEmail.jsx';
import { ForgotPasswordPage } from './components/auth/ForgotPassword.jsx';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage.jsx';
import { ToasterProvider } from './components/ui/ToasterProvider.jsx';

/**
 * ProtectedRoute: Ensure user is authenticated before rendering
 * Shows loading state while validating token, redirects to login if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();

  // Đang tải user (validate token)
  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div>Đang khôi phục phiên…</div>
      </div>
    );
  }

  // Không có user = chưa login
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => {
  const { darkMode, user, isLoading, fetchUser, logout } = useAuthStore();
  const [appInitialized, setAppInitialized] = useState(false);

  /**
   * Restore dark mode on mount
   * Adds/removes 'dark' class to document root for Tailwind CSS
   */
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  /**
   * Initialize authentication on app load
   * Validate stored token and restore user session
   * Shows loading screen while validating
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Có token: fetch user profile để validate
        await fetchUser();
      }
      
      // Đánh dấu app đã khởi tạo xong
      setAppInitialized(true);
    };

    initializeAuth();
  }, [fetchUser]);

  // Đợi app khởi tạo xong mới render routes
  if (!appInitialized) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div>Khởi tạo ứng dụng…</div>
      </div>
    );
  }

  return (
    <>
      <ToasterProvider />
      <Routes>
      {/* Auth Routes - Không cần protect vì chúng là public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<Task />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback: Nếu không match route nào */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
    </>
  );
};

export default App;
