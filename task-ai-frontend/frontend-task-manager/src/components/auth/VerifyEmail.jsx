// TRONG: VerifyEmail.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/useStore";
import { showToast } from "../../utils/toastUtils";
import { 
    Loader2, 
    AlertCircle, 
    CheckCircle2, 
    ArrowRight, 
    Mail 
} from "lucide-react"; // ⬅️ Thêm Mail
import { useI18n } from "../../utils/i18n";

export const VerifyEmailPage = () => {
    const { verifyEmail, resendVerification, isLoading, error, clearError } = useAuthStore();
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
                        [SYS-VERIFY-04]
                    </div>

                    {success ? (
                        <div className="text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-10 h-10 bg-brand-low/10 border border-brand-low text-brand-low-text flex items-center justify-center mx-auto mb-4 animate-in bounce duration-500 shadow-[0_0_10px_rgba(0,230,118,0.1)]">
                                <CheckCircle2 size={16} />
                            </div>
                            <h1 className="text-sm font-bold uppercase tracking-widest text-brand-main mb-1">{t('auth.verify.successTitle')}</h1>
                            <p className="text-[10px] uppercase font-mono tracking-wider text-brand-sub mb-6 leading-relaxed">
                                {t('auth.verify.successDesc')}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-10 h-10 bg-brand-primary/10 border border-brand-primary text-brand-primary flex items-center justify-center mx-auto mb-4 hover:scale-105 transition-transform animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                                    <Mail size={16} />
                                </div>
                                <h1 className="text-sm font-bold uppercase tracking-widest text-brand-main mb-1.5">{t('auth.verify.title')}</h1>
                                <p className="text-[10px] uppercase font-mono tracking-wider text-brand-sub leading-normal">
                                    {t('auth.verify.subtitle')}
                                    <br />
                                    <strong className="text-brand-primary-text">{userEmail}</strong>
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 border border-brand-high bg-brand-high/5 text-brand-high-text text-xs mb-6 font-mono">
                                    <AlertCircle size={14} className="flex-shrink-0 text-brand-high" />
                                    <span className="uppercase tracking-wide">ERR_VERIFY: {error}</span>
                                </div>
                            )}

                            <form onSubmit={handleVerify} className="space-y-4">
                                <div>
                                    <label className="block text-[8px] font-bold font-mono uppercase tracking-widest text-brand-sub mb-1.5">
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
                                        className="w-full px-4 py-3 text-center text-xl tracking-widest font-mono border border-brand-border bg-brand-base text-brand-main placeholder-brand-sub/30 focus:border-brand-primary outline-none transition-colors rounded-none"
                                        placeholder="● ● ● ● ● ●"
                                        maxLength={6}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || code.length !== 6}
                                    className="w-full py-2.5 flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white dark:text-brand-card font-bold transition-all text-xs disabled:opacity-50 uppercase tracking-widest rounded-none shadow-[0_0_12px_rgba(0,240,255,0.15)] border border-brand-primary"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" size={13} />
                                    ) : (
                                        <ArrowRight size={13} />
                                    )}
                                    {t('auth.verify.submit')}
                                </button>
                            </form>

                            <button
                                onClick={async () => {
                                    if (!userEmail) return;
                                    try {
                                        const res = await resendVerification(userEmail);
                                        showToast.success(res?.message || 'Đã gửi lại mã xác minh.');
                                    } catch (e) {
                                        const msg = e?.response?.data?.message || 'Gửi lại mã thất bại.';
                                        showToast.error(msg);
                                    }
                                }}
                                className="mt-4 w-full text-[9px] text-brand-primary-text hover:text-brand-primary transition-colors font-bold uppercase tracking-wider py-1.5 font-mono"
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