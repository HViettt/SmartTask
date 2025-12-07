import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore, MOCK_USER_DATA } from '../store/useStore';
import { Loader2, AlertCircle, Mail, Lock, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loginWithPassword, isLoading, error, clearError } = useStore();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    clearError();
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithPassword({ email, password });
      navigate('/dashboard');
    } catch (err) {
      // Error handled in store
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await login(MOCK_USER_DATA);
      navigate('/dashboard');
    } catch (err) {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-6">
           <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
              <span className="text-white font-bold text-2xl">S</span>
           </div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chào mừng trở lại!</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Đăng nhập để tiếp tục quản lý công việc</p>
        </div>

        {error && (
           <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm mb-6 border border-red-100">
              <AlertCircle size={16} />
              {error}
           </div>
        )}

        <form onSubmit={handlePasswordLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</label>
               <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700">Quên mật khẩu?</Link>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            Đăng nhập
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Hoặc</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium py-2.5 px-4 rounded-xl transition-all duration-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
             <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
             <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
             <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
             <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google (Dev)
        </button>
        
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};