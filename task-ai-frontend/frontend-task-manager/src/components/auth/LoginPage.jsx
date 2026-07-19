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
    <div className="min-h-screen bg-brand-base flex items-center justify-center p-4 relative overflow-hidden font-sans cyber-grid auth-page">
      {/* Background decoration cockpit grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-brand-primary/10 rounded-full blur-[140px] animate-glow-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-brand-primary/10 rounded-full blur-[140px] animate-glow-pulse"
          style={{ animationDelay: "-5s" }}
        />
      </div>

      {/* Technical Telemetry Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 hidden md:block font-mono">
        {/* Floating Card 1 - Technical Readout */}
        <div className="absolute top-[15%] left-[8%] w-52 bg-brand-card/40 border border-brand-border/60 p-3 shadow-lg animate-float-card-1 opacity-50">
          <div className="flex items-center justify-between border-b border-brand-border/40 pb-1.5 mb-1.5">
            <span className="text-[8px] font-bold text-brand-high-text">WARN: HIGH_PRIORITY</span>
            <span className="w-1.5 h-1.5 bg-brand-high animate-pulse" />
          </div>
          <p className="text-[9px] font-bold text-brand-main line-clamp-1 uppercase">RELEASE BETA VERSION</p>
          <div className="mt-2 flex items-center justify-between text-[7px] text-brand-sub">
            <span>SYS_LOC: C-04</span>
            <span>TIME_LEFT: 2.4H</span>
          </div>
        </div>

        {/* Floating Card 2 - System Normal */}
        <div className="absolute bottom-[18%] left-[10%] w-48 bg-brand-card/40 border border-brand-border/60 p-3 shadow-lg animate-float-card-2 opacity-50">
          <div className="flex items-center justify-between border-b border-brand-border/40 pb-1.5 mb-1.5">
            <span className="text-[8px] font-bold text-brand-low-text">SYS_OK: NOMINAL</span>
            <span className="w-1.5 h-1.5 bg-brand-low" />
          </div>
          <p className="text-[9px] font-bold text-brand-main line-clamp-1 uppercase">UI REDESIGN COMPLETE</p>
          <div className="mt-2 flex items-center justify-between text-[7px] text-brand-sub">
            <span>COCKPIT_ID: 10A</span>
            <span>STAT: LANDED</span>
          </div>
        </div>

        {/* Floating Card 3 - Pending Command */}
        <div className="absolute top-[22%] right-[8%] w-48 bg-brand-card/40 border border-brand-border/60 p-3 shadow-lg animate-float-card-3 opacity-50">
          <div className="flex items-center justify-between border-b border-brand-border/40 pb-1.5 mb-1.5">
            <span className="text-[8px] font-bold text-brand-medium-text">SYS_BUSY: ACTIVE</span>
            <span className="w-1.5 h-1.5 bg-brand-medium animate-bounce" />
          </div>
          <p className="text-[9px] font-bold text-brand-main line-clamp-1 uppercase">RESOLVE DEADLINE API</p>
          <div className="mt-2 flex items-center justify-between text-[7px] text-brand-sub">
            <span>LAYER: CORE_PROCESS</span>
            <span>STANDBY</span>
          </div>
        </div>
      </div>

      <div className="max-w-sm w-full relative z-10">
        <div className="bg-brand-card border border-brand-border p-8 shadow-2xl relative overflow-hidden hud-border scan-lines animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* HUD Tech Corner Tag */}
          <div className="absolute top-2 right-3 text-[7px] font-mono text-brand-sub/50 uppercase tracking-widest">
            [SYS-SECURE-01]
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-10 h-10 bg-brand-primary/10 border border-brand-primary text-brand-primary flex items-center justify-center mx-auto mb-4 hover:scale-105 transition-transform animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.1)]">
              <span className="font-bold font-display text-sm tracking-wider">S</span>
            </div>
            <h1 className="text-sm font-bold font-display uppercase tracking-widest text-brand-main mb-1.5">
              {t('auth.login.title')}
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-wider text-brand-sub">
              {t('auth.login.subtitle')}
            </p>
          </div>

          {/* Error message in console box */}
          {error && (
            <div className="flex items-center gap-2 p-3 border border-brand-high bg-brand-high/5 text-brand-high-text text-xs mb-6 font-mono">
              <AlertCircle size={14} className="flex-shrink-0 text-brand-high" />
              <span className="uppercase tracking-wide">ERR_AUTH: {error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handlePasswordLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
                {t('auth.login.email')}
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-sub/60 group-focus-within:text-brand-primary transition-colors" size={13} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.login.emailPlaceholder')}
                  className="w-full pl-9 pr-4 py-2 border border-brand-border bg-brand-base text-brand-main focus:border-brand-primary text-xs outline-none transition-colors placeholder-brand-sub/40 font-sans rounded-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub">
                  {t('auth.login.password')}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[9px] text-brand-primary-text hover:text-brand-primary font-bold uppercase tracking-wider transition-colors font-mono"
                >
                  {t('auth.login.forgot')}
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-sub/60 group-focus-within:text-brand-primary transition-colors" size={13} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  className="w-full pl-9 pr-4 py-2 border border-brand-border bg-brand-base text-brand-main focus:border-brand-primary text-xs outline-none transition-colors placeholder-brand-sub/40 font-sans rounded-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white dark:text-brand-card font-bold transition-all text-xs disabled:opacity-50 uppercase tracking-widest rounded-none shadow-[0_0_12px_rgba(0,240,255,0.15)] border border-brand-primary"
            >
              {isLoading ? <Loader2 size={13} className="animate-spin" /> : <LogIn size={13} />}
              {t('auth.login.submit')}
            </button>
          </form>

          {/* Google Login */}
          {isGoogleEnabled && GOOGLE_CLIENT_ID && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-brand-border" />
                <span className="text-[8px] font-bold font-mono text-brand-sub uppercase tracking-wider">
                  {t('auth.login.or')}
                </span>
                <div className="flex-1 h-px bg-brand-border" />
              </div>

              <div ref={googleButtonRef} className="flex justify-center" />
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-brand-sub">
            {t('auth.login.noAccount')}{" "}
            <Link to="/register" className="text-brand-primary-text hover:text-brand-primary font-bold transition-colors underline underline-offset-4">
              {t('auth.login.registerNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
