import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../features/useStore";
import { Loader2, AlertCircle, Lock, Key, CheckCircle2, Mail } from "lucide-react";
import { useI18n } from "../../utils/i18n";

export const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const location = useLocation();
  const [email, setEmail] = useState(location?.state?.email || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    clearError();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !code) {
      alert(t('auth.reset.missingFields'));
      return;
    }
    if (newPassword !== confirmPassword) {
      alert(t('auth.reset.passwordMismatch'));
      return;
    }

    try {
      const res = await resetPassword(email, code, newPassword);
      setSuccess(true);
      // ✅ Auto redirect khi đã nhận token + user (đã set trong store)
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      // Lỗi đã được xử lý trong store
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
            [SYS-RESET-05]
          </div>

          <div className="text-center mb-8">
            <div className="w-10 h-10 bg-brand-primary/10 border border-brand-primary text-brand-primary flex items-center justify-center mx-auto mb-4 hover:scale-105 transition-transform animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.1)]">
              <Lock size={16} />
            </div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-brand-main mb-1.5">
              {t('auth.reset.title')}
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-wider text-brand-sub leading-normal">
              {t('auth.reset.subtitle')}
            </p>
          </div>
          
          {/* SUCCESS MESSAGE */}
          {success ? (
            <div className="text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-10 h-10 bg-brand-low/10 border border-brand-low text-brand-low-text flex items-center justify-center mx-auto mb-4 animate-in bounce duration-500 shadow-[0_0_10px_rgba(0,230,118,0.1)]">
                <CheckCircle2 size={16} />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-main mb-1">{t('auth.reset.successTitle')}</h2>
              <p className="text-[10px] uppercase font-mono tracking-wider text-brand-sub mb-6 leading-relaxed">{t('auth.reset.successDesc')}</p>
              <div className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-brand-primary bg-brand-primary/10 text-brand-primary font-mono text-[10px] uppercase tracking-wider animate-pulse">
                {t('common.loading')}...
              </div>
            </div>
          ) : (
            /* OTP PASSWORD RESET FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 border border-brand-high bg-brand-high/5 text-brand-high-text text-xs mb-6 font-mono">
                  <AlertCircle size={14} className="flex-shrink-0 text-brand-high" />
                  <span className="uppercase tracking-wide">ERR_RESET: {error}</span>
                </div>
              )}
              {/* Registered Email */}
              <div>
                <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
                  {t('auth.forgot.email')}
                </label>
                <div className="relative group">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-sub/60 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-brand-border bg-brand-base text-brand-main focus:border-brand-primary text-xs outline-none transition-colors placeholder-brand-sub/40 font-sans rounded-none"
                    placeholder={t('auth.register.emailPlaceholder')}
                  />
                </div>
              </div>

              {/* OTP Code */}
              <div>
                <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
                  {t('auth.verify.codeLabel')}
                </label>
                <div className="relative group">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-sub/60 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-brand-border bg-brand-base text-brand-main focus:border-brand-primary text-xs outline-none transition-colors placeholder-brand-sub/40 font-mono tracking-widest text-center rounded-none"
                    placeholder="123456"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
                  {t('auth.reset.newPassword')}
                </label>
                <div className="relative group">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-sub/60 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-brand-border bg-brand-base text-brand-main focus:border-brand-primary text-xs outline-none transition-colors placeholder-brand-sub/40 font-sans rounded-none"
                    placeholder={t('auth.register.passwordPlaceholder')}
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
                  {t('auth.reset.confirmPassword')}
                </label>
                <div className="relative group">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-sub/60 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-brand-border bg-brand-base text-brand-main focus:border-brand-primary text-xs outline-none transition-colors placeholder-brand-sub/40 font-sans rounded-none"
                    placeholder={t('auth.register.passwordPlaceholder')}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white dark:text-brand-card font-bold transition-all text-xs disabled:opacity-50 uppercase tracking-widest rounded-none shadow-[0_0_12px_rgba(0,240,255,0.15)] border border-brand-primary"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={13} />
                ) : (
                  <Lock size={13} />
                )}
                {isLoading ? t('auth.reset.processing') : t('auth.reset.submit')}
              </button>
              <div className="text-center mt-2.5 font-mono">
                <Link to="/forgot-password" className="text-[9px] text-brand-primary-text hover:text-brand-primary font-bold uppercase tracking-wider transition-colors underline underline-offset-4">
                  {t('auth.verify.resend')}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};