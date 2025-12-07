
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Loader2, AlertCircle, Send, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { forgotPassword, isLoading, error, clearError } = useStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  React.useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      // Error in store
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
           <ArrowLeft size={16} className="mr-1"/> Quay lại đăng nhập
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quên mật khẩu?</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Nhập email của bạn, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
        </p>

        {sent ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-green-700 dark:text-green-300 text-sm">
             Đã gửi hướng dẫn đến <b>{email}</b>. Vui lòng kiểm tra (Console Log Server) để tiếp tục.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
             {error && (
               <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                  <AlertCircle size={16} />
                  {error}
               </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email đăng ký</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="email@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
              Gửi yêu cầu
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
