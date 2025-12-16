// TRONG: VerifyEmail.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/useStore";
import { 
    Loader2, 
    AlertCircle, 
    CheckCircle2, 
    ArrowRight, 
    Mail 
} from "lucide-react"; // ⬅️ Thêm Mail
import { useI18n } from "../../utils/i18n";

export const VerifyEmailPage = () => {
    const { verifyEmail, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();
    const { t } = useI18n();
    
    // 🛑 Dùng code thay vì token
    const [code, setCode] = useState(""); 
    const [success, setSuccess] = useState(false);
    
    // 🛑 Lấy email từ Local Storage (từ bước đăng ký)
    const storedEmail = localStorage.getItem('verification_email');
    const [userEmail, setUserEmail] = useState(storedEmail || "");

    useEffect(() => {
        clearError();
        // 🛑 Nếu không có email, chuyển về đăng ký
        if (!storedEmail) {
            navigate("/register", { replace: true });
        }
    }, [storedEmail, navigate]); 
    
    // 🛑 Cập nhật handleVerify
    const handleVerify = async (e) => {
        e.preventDefault();

        if (!userEmail) {
            alert(t('auth.verify.missingEmail'));
            navigate("/register");
            return;
        }

        try {
            // 🛑 Gửi cả email và code lên store
            await verifyEmail(userEmail, code); 
            setSuccess(true);
            
            // 🛑 Xóa email tạm khỏi local storage sau khi thành công
            localStorage.removeItem('verification_email'); 

            setTimeout(() => {
                navigate("/dashboard"); // ⬅️ Chuyển thẳng về dashboard vì đã verified và đăng nhập
            }, 3000);
        } catch (err) {
            // Error handled in store
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/30">
                    {success ? (
                        <div className="text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-in bounce duration-500">
                                <CheckCircle2 size={40} />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.verify.successTitle')}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                {t('auth.verify.successDesc')}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-blue-500/30 animate-in zoom-in duration-500">
                                    <Mail size={32} className="text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{t('auth.verify.title')}</h1>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {t('auth.verify.subtitle')}
                                    <br />
                                    <strong className="text-indigo-600 dark:text-indigo-400">{userEmail}</strong>
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm mb-6 border border-red-200 dark:border-red-800/50 animate-in shake duration-300">
                                    <AlertCircle size={18} className="flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleVerify} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        {t('auth.verify.codeLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={code}
                                        onChange={(e) => {
                                            const newCode = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setCode(newCode);
                                        }}
                                        className="w-full px-4 py-4 text-center text-3xl tracking-widest font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="● ● ● ● ● ●"
                                        maxLength={6}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || code.length !== 6}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <ArrowRight size={20} />
                                    )}
                                    {t('auth.verify.submit')}
                                </button>
                            </form>

                            <button
                                onClick={() => { /* TODO: Thêm logic gửi lại mã tại đây */ }}
                                className="mt-6 w-full text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium py-2"
                                disabled={isLoading}
                            >
                                    {t('auth.verify.resend')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};