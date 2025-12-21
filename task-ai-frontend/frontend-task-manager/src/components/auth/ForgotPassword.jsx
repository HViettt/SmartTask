import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/useStore";
import { Loader2, AlertCircle, Send, ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { useI18n } from "../../utils/i18n";

export const ForgotPasswordPage = () => {
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      // ✅ Sau khi gửi OTP thành công: chuyển sang trang Verify OTP
      // Truyền kèm email để prefill ở trang xác minh
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      // Error handled inside store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors mb-8"
          >
            <ArrowLeft size={16} className="flex-shrink-0" /> {t('auth.forgot.back')}
          </Link>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-orange-500/30 animate-in zoom-in duration-500">
              <Send size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {t('auth.forgot.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('auth.forgot.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800/50 animate-in shake duration-300">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.forgot.email')}
                </label>
                <div className="relative group">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={t('auth.register.emailPlaceholder')}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
                {t('auth.forgot.submit')}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};
