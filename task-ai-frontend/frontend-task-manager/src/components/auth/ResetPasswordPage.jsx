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
      alert("Vui lòng nhập email và mã xác minh");
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
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-violet-500/30 animate-in zoom-in duration-500">
              <Lock size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('auth.reset.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('auth.reset.subtitle')}
            </p>
          </div>
          
          {/* HIỂN THỊ THÔNG BÁO THÀNH CÔNG */}
          {success ? (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-in bounce duration-500">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.reset.successTitle')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">{t('auth.reset.successDesc')}</p>
              <div className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg">
                {t('common.loading')}...
              </div>
            </div>
          ) : (
            /* FORM ĐẶT LẠI MẬT KHẨU BẰNG MÃ OTP */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800/50 animate-in shake duration-300">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {/* Email đăng ký */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.forgot.email')}
                </label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder={t('auth.register.emailPlaceholder')}
                  />
                </div>
              </div>

              {/* Mã xác minh (OTP) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.verify.codeLabel')}
                </label>
                <div className="relative group">
                  <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="123456"
                  />
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.reset.newPassword')}
                </label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder={t('auth.register.passwordPlaceholder')}
                  />
                </div>
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.reset.confirmPassword')}
                </label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder={t('auth.register.passwordPlaceholder')}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Lock size={20} />
                )}
                {isLoading ? t('auth.reset.processing') : t('auth.reset.submit')}
              </button>
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                <Link to="/forgot-password" className="text-violet-600 dark:text-violet-400 hover:underline">
                  {/* Hướng người dùng quay lại trang gửi mã nếu chưa có */}
                  Gửi lại mã xác minh
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};