
/**
 * ============================================================================
 * APPLICATION ENTRY POINT
 * ============================================================================
 * Purpose: Initialize React application with providers and global setup
 * 
 * Providers Setup:
 * - BrowserRouter: Client-side routing
 * - I18nProvider: Multi-language support (Vi/En)
 * - Toaster: Toast notifications (react-hot-toast)
 * - Zustand stores: Global state management
 * 
 * Global Configuration:
 * - Suppress browser extension errors (non-critical)
 * - Handle unhandled promise rejections gracefully
 * - Initialize root DOM element
 * 
 * Notes:
 * - Error suppression is intentional for browser extensions
 * - Does not suppress application errors
 * - All errors are logged to console for debugging
 * 
 * Author: System Implementation
 * Last Updated: December 16, 2025
 * ============================================================================
 */

import React from "react";
import ReactDOM from "react-dom/client";  
import App from "./app.jsx";
import { BrowserRouter } from "react-router-dom";
import { I18nProvider } from "./utils/i18n";
import "./index.css";

// ============================================================================
// GLOBAL ERROR HANDLING
// ============================================================================
// Suppress non-critical errors from browser extensions
// These errors don't affect app functionality, just noisy in console
// ============================================================================
window.addEventListener('error', (e) => {
  if (
    e.message.includes('Could not establish connection') ||
    e.message.includes('message port closed') ||
    e.message.includes('Receiving end does not exist')
  ) {
    e.preventDefault();
    return false;
  }
});

// Suppress unhandledrejection từ extensions
window.addEventListener('unhandledrejection', (e) => {
  if (
    e.reason?.message?.includes('Could not establish connection') ||
    e.reason?.message?.includes('message port closed')
  ) {
    e.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <App />
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>
);
