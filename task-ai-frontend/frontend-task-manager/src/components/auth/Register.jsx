import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../features/useStore";
import { Loader2, AlertCircle, UserPlus, Mail, Lock, User } from "lucide-react";
import { useI18n } from "../../utils/i18n";

export const RegisterPage = () => {
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert(t('auth.register.passwordMismatch'));
      return;
    }

    try {
      const response = await register({ // Lấy response từ hàm register
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // LƯU EMAIL VÀO LOCAL STORAGE
      if (response && response.registeredEmail) {
        localStorage.setItem('verification_email', response.registeredEmail);
      } else {
        // Trường hợp fallback: dùng email từ form
        localStorage.setItem('verification_email', formData.email); 
      }
      
      navigate("/verify-email");
    } catch (err) {
      // lỗi xử lý trong store
    }
  };

  return (
    <div className="min-h-screen bg-brand-base flex items-center justify-center p-4 relative overflow-hidden font-sans text-xs cyber-grid auth-page">
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
      </div>

      <div className="max-w-sm w-full relative z-10">
        <div className="bg-brand-card border border-brand-border p-8 shadow-2xl relative overflow-hidden hud-border scan-lines animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* HUD Tech Corner Tag */}
          <div className="absolute top-2 right-3 text-[7px] font-mono text-brand-sub/50 uppercase tracking-widest">
            [SYS-REG-02]
          </div>

          <div className="text-center mb-8">
            <div className="w-10 h-10 bg-brand-primary/10 border border-brand-primary text-brand-primary flex items-center justify-center mx-auto mb-4 hover:scale-105 transition-transform animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.1)]">
              <span className="font-bold font-display text-sm tracking-wider">S</span>
            </div>
            <h1 className="text-sm font-bold font-display uppercase tracking-widest text-brand-main mb-1.5">
              {t('auth.register.title')}
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-wider text-brand-sub">
              {t('auth.register.subtitle')}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 border border-brand-high bg-brand-high/5 text-brand-high-text text-xs mb-6 font-mono">
              <AlertCircle size={14} className="flex-shrink-0 text-brand-high" />
              <span className="uppercase tracking-wide">ERR_REG: {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
                {t('auth.register.name')}
              </label>
              <div className="relative group">
                <User
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-sub/60 group-focus-within:text-brand-primary transition-colors"
                />
                <input
                  type="text"
                  required
                  className="w-full pl-9 pr-4 py-2 border border-brand-border bg-brand-base text-brand-main focus:border-brand-primary text-xs outline-none transition-colors placeholder-brand-sub/40 font-sans rounded-none"
                  placeholder={t('auth.register.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
                {t('auth.register.email')}
              </label>
              <div className="relative group">
                <Mail
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-sub/60 group-focus-within:text-brand-primary transition-colors"
                />
                <input
                  type="email"
                  required
                  className="w-full pl-9 pr-4 py-2 border border-brand-border bg-brand-base text-brand-main focus:border-brand-primary text-xs outline-none transition-colors placeholder-brand-sub/40 font-sans rounded-none"
                  placeholder={t('auth.register.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
                {t('auth.register.password')}
              </label>
              <div className="relative group">
                <Lock
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-sub/60 group-focus-within:text-brand-primary transition-colors"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-4 py-2 border border-brand-border bg-brand-base text-brand-main focus:border-brand-primary text-xs outline-none transition-colors placeholder-brand-sub/40 font-sans rounded-none"
                  placeholder={t('auth.register.passwordPlaceholder')}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
                {t('auth.register.confirmPassword')}
              </label>
              <div className="relative group">
                <Lock
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-sub/60 group-focus-within:text-brand-primary transition-colors"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-4 py-2 border border-brand-border bg-brand-base text-brand-main focus:border-brand-primary text-xs outline-none transition-colors placeholder-brand-sub/40 font-sans rounded-none"
                  placeholder={t('auth.register.passwordPlaceholder')}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white dark:text-brand-card font-bold transition-all text-xs disabled:opacity-50 uppercase tracking-widest rounded-none shadow-[0_0_12px_rgba(0,240,255,0.15)] border border-brand-primary mt-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={13} />
              ) : (
                <UserPlus size={13} />
              )}
              {t('auth.register.submit')}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-brand-sub">
            {t('auth.register.haveAccount')}{" "}
            <Link
              to="/login"
              className="text-brand-primary-text hover:text-brand-primary font-bold transition-colors underline underline-offset-4"
            >
              {t('auth.register.loginNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
