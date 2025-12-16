/**
 * ============================================================================
 * API SERVICE MODULE
 * ============================================================================
 * Purpose: Centralized HTTP client for all backend API calls
 * 
 * Features:
 * - Automatic token injection in request headers
 * - Global error handling with automatic logout on 401/403
 * - Configurable base URL (from environment or localhost:5000)
 * - Axios instance with sensible defaults
 * 
 * Auto-injected Headers:
 *   - Authorization: Bearer {token} (from localStorage)
 *   - Content-Type: application/json
 * 
 * Error Handling:
 *   - 401 (Unauthorized): Auto-logout, redirect to /login
 *   - 403 (Forbidden): Auto-logout, redirect to /login
 *   - Other errors: Reject promise for component handling
 * 
 * Usage:
 *   import api from '../../services/api';
 *   const response = await api.get('/tasks');
 *   const data = await api.post('/tasks', { title: 'Task' });
 * 
 * Environment Variables:
 *   VITE_API_URL: API base URL (default: http://127.0.0.1:5000/api)
 * 
 * Author: System Implementation
 * Last Updated: December 16, 2025
 * ============================================================================
 */

import axios from "axios";

// Auto detect API URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ADD TOKEN TO EVERY REQUEST
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// GLOBAL ERROR HANDLER
let logoutInProgress = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    // Xử lý 401 (Unauthorized) và 403 (Forbidden)
    if ((status === 401 || status === 403) && !logoutInProgress) {
      // Tránh gọi logout nhiều lần
      logoutInProgress = true;

      // Chỉ logout nếu không phải ở trang login/register
      if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("lang");

        // Redirect tới /login
        window.location.href = "/login";
      }

      logoutInProgress = false;
    }

    return Promise.reject(error);
  }
);

export default api;
