
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const { verifyEmail, isLoading, error, clearError } = useStore();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    clearError();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyEmail(token);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      // Error in store
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 text-center">
        
        {success ? (
          <div className="animate-in fade-in zoom-in duration-300">
             <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Xác thực thành công!</h2>
             <p className="text-gray-500 dark:text-gray-400 mb-6">
               Tài khoản của bạn đã được kích hoạt. Đang chuyển hướng đến trang đăng nhập...
             </p>
             <button 
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium"
             >
                Đăng nhập ngay
             </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Xác thực tài khoản</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Vui lòng kiểm tra Server Console để lấy <b>Verification Token</b> (Mô phỏng Email).
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm mb-6 border border-red-100 text-left">
                  <AlertCircle size={16} />
                  {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <input 
                type="text" 
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 text-center text-lg tracking-widest rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nhập mã xác thực"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                Xác thực ngay
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
