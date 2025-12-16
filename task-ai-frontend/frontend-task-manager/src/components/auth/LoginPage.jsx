import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Mail, Lock, LogIn } from "lucide-react";
import { useAuthStore } from "../../features/useStore";
import { useI18n } from "../../utils/i18n";

export const LoginPage = () => {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const { t, lang } = useI18n();

  const {
    loginGoogle,
    loginWithPassword,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  // Bật Google Sign-In
  const [isGoogleEnabled] = useState(true);

  // Clear auth error on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Initialize Google Sign-In
  useEffect(() => {
    if (!isGoogleEnabled || !GOOGLE_CLIENT_ID) {
      console.warn("Google Sign-In disabled or missing GOOGLE_CLIENT_ID");
      return;
    }

    const initGoogle = () => {
      if (!window.google || !googleButtonRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async ({ credential }) => {
            try {
              await loginGoogle(credential);
              navigate("/dashboard");
            } catch (err) {
              console.error("Google sign-in failed:", err);
            }
          },
          // Dùng popup để tránh load lại trang /login (tránh 404 nếu router không có route file-system)
          ux_mode: "popup",
          context: "signin",
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          locale: lang,
        });

        // Suppress runtime.lastError từ browser extensions
        // Lỗi này không ảnh hưởng đến chức năng Google Sign-In
        window.addEventListener('error', (e) => {
          if (e.message && e.message.includes('Could not establish connection')) {
            e.preventDefault();
            return false;
          }
        });
      } catch (err) {
        console.error("Google Sign-In init failed:", err);
        if (googleButtonRef.current) {
          googleButtonRef.current.style.display = "none";
        }
      }
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      script.onerror = () => {
        console.error("Cannot load Google Sign-In script");
        if (googleButtonRef.current) {
          googleButtonRef.current.style.display = "none";
        }
      };
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    } else {
      initGoogle();
    }
  }, [isGoogleEnabled, GOOGLE_CLIENT_ID, loginGoogle, navigate]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    try {
      await loginWithPassword({ email, password });
      navigate("/dashboard");
    } catch {
      // error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-indigo-500/30 animate-in zoom-in duration-500">
              <span className="text-white font-bold text-3xl">S</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('auth.login.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('auth.login.subtitle')}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm mb-6 border border-red-200 dark:border-red-800/50 animate-in shake duration-300">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handlePasswordLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                {t('auth.login.email')}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.login.emailPlaceholder')}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('auth.login.password')}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  {t('auth.login.forgot')}
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-70"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
              {t('auth.login.submit')}
            </button>
          </form>

          {/* Google login */}
          {isGoogleEnabled && GOOGLE_CLIENT_ID && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('auth.login.or')}
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <div ref={googleButtonRef} className="flex justify-center" />
    
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.login.noAccount')} {" "}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold">
              {t('auth.login.registerNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
