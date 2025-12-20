import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toastUtils';
import { 
  LayoutDashboard, 
  ListTodo, 
  LogOut, 
  Menu, 
  Moon, 
  Sun, 
  X,
  Globe,
  Settings,
  User
} from 'lucide-react';
import { useAuthStore } from '../../features/useStore';
import { useTaskStore } from '../../features/taskStore';
import { TaskStatus } from '../../types';
import { NotificationCenter } from '../notification/NotificationCenter';
import { NotificationSettings } from '../notification/NotificationSettings';
import api from '../../services/api';
import { useI18n } from '../../utils/i18n';
import { isTaskExpired, isTaskDueSoon } from '../../utils/deadlineHelpers';

export const Layout = () => {
  const { user, logout, darkMode, toggleDarkMode, toggleLanguage } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasShownDeadlineAlert, setHasShownDeadlineAlert] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check deadline warnings ONCE when LOGIN (not on reload)
  useEffect(() => {
    const checkDeadlineOnce = async () => {
      // ✅ Chỉ show toast khi LOGIN, không show khi reload
      const isJustLoggedIn = sessionStorage.getItem('justLoggedIn');
      if (!isJustLoggedIn) return;
      
      if (hasShownDeadlineAlert) return;
      
      // Fetch tasks if not loaded
      if (tasks.length === 0) {
        await fetchTasks();
        return;
      }

      try {
        const res = await api.get('/user/settings');
        const settings = res.data.notificationSettings;
        
        if (!settings.webEntryAlerts) return;
        
        // ✅ Ensure tasks is an array
        if (!Array.isArray(tasks)) return;

        // ✅ Dùng helper functions thay vì manual parsing
        const overdue = tasks.filter(isTaskExpired);
        const dueSoon24h = tasks.filter(t => isTaskDueSoon(t, 24)); // Còn ≤ 24 giờ

        // ✅ Clear flag NGAY để tránh toast spam khi navigate
        sessionStorage.removeItem('justLoggedIn');
        setHasShownDeadlineAlert(true);
        
        // Show toast theo priority: overdue > due soon
        if (overdue.length > 0) {
          showToast.error(t('alerts.overdue', { count: overdue.length }));
        } else if (dueSoon24h.length > 0) {
          showToast.warning(t('alerts.dueSoon', { count: dueSoon24h.length }));
        }
      } catch (error) {
        console.error('Lỗi kiểm tra deadline:', error);
      }
    };

    // Small delay to ensure tasks are loaded
    const timer = setTimeout(checkDeadlineOnce, 1000);
    return () => clearTimeout(timer);
  }, [tasks, hasShownDeadlineAlert, fetchTasks, t]);

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`
      }
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar for Desktop - Cải thiện alignment */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Logo Header - Consistent height với nav items */}
        <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white">{t('appName')}</span>
        </div>

        {/* Navigation Menu - Thẳng hàng với logo header */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem to="/dashboard" icon={LayoutDashboard} label={t('nav.dashboard')} />
          <NavItem to="/tasks" icon={ListTodo} label={t('nav.tasks')} />
          <NavItem to="/profile" icon={User} label={t('nav.profile')} />
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
              src={user?.avatar}
              alt={user?.name || 'Avatar'} 
              className="w-10 h-10 rounded-full border border-gray-200 bg-gray-100 object-cover"
              onError={(e) => {
                // Fallback nếu avatar URL không load được
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&color=fff&bold=true&size=96`;
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-8">
          <button 
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center gap-2">
            {/* Notification Center */}
            <NotificationCenter />

            {/* Settings Icon */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={t('nav.settings')}
            >
              <Settings size={20} />
            </button>
            
             <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={t('nav.changeLanguage')}
            >
              <Globe size={18} />
              <span className="uppercase">{user?.preferences?.language || 'vi'}</span>
            </button>
             <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={t('nav.toggleTheme')}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl p-4 flex flex-col">
             <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-gray-800 dark:text-white">{t('appName')}</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} className="text-gray-500" />
                </button>
             </div>
             <nav className="space-y-2 flex-1">
                <NavItem to="/dashboard" icon={LayoutDashboard} label={t('nav.dashboard')} />
                <NavItem to="/tasks" icon={ListTodo} label={t('nav.tasks')} />
                <NavItem to="/profile" icon={User} label={t('nav.profile')} />
             </nav>
             <button 
                onClick={handleLogout}
                className="mt-auto flex items-center gap-2 px-4 py-3 text-red-600 dark:text-red-400"
              >
                <LogOut size={20} />
                {t('nav.logout')}
              </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <NotificationSettings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};