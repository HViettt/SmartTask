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
import { InitializationLoader } from '../common/InitializationLoader.jsx';

export const Layout = () => {
  const { user, logout, darkMode, toggleDarkMode, toggleLanguage } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasShownDeadlineAlert, setHasShownDeadlineAlert] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();

  const [isInitializing, setIsInitializing] = useState(() => {
    // Show startup sequence only when the user just logged in/registered
    return sessionStorage.getItem('justLoggedIn') === 'true';
  });

  useEffect(() => {
    if (!isInitializing) return;

    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [isInitializing]);

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
      
      sessionStorage.removeItem('justLoggedIn'); // Clear immediately to prevent multiple runs
      
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

        // ✅ Filter out deleted tasks before checking deadline
        const activeTasks = tasks.filter(t => !t.isDeleted);

        // ✅ Dùng helper functions thay vì manual parsing
        const overdue = activeTasks.filter(isTaskExpired);
        const dueSoon24h = activeTasks.filter(t => isTaskDueSoon(t, 24)); // Còn ≤ 24 giờ

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks.length, hasShownDeadlineAlert]);

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={({ isActive }) =>
        `relative flex items-center gap-3.5 px-6 py-3.5 transition-all duration-300 ${
          isActive
            ? 'bg-brand-primary/10 text-brand-primary font-bold'
            : 'text-brand-sub hover:bg-brand-base/50 hover:text-brand-main'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-primary shadow-[0_0_8px_rgba(6,182,212,0.8)] rounded-r-md" />
          )}
          <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} className={isActive ? 'text-brand-primary' : 'text-brand-sub'} />
          <span className="font-bold text-[9px] uppercase tracking-widest">{label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {isInitializing && <InitializationLoader message={t('common.loading').toUpperCase()} />}
      <div className="flex h-screen bg-brand-base overflow-hidden font-sans scan-lines relative">
      {/* Ambient gradient glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-60 w-[400px] h-[400px] bg-brand-low/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Sidebar for Desktop - Cockpit Telemetry Console */}
      <aside className="hidden md:flex flex-col w-60 bg-brand-card border-r border-brand-border select-none shrink-0 z-10">
        {/* Logo Header - Instrument Panel Vibe */}
        <div className="h-16 px-6 border-b border-brand-border flex items-center gap-3 shrink-0 bg-brand-card">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-primary/30 text-white dark:text-brand-card flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse">
            <span className="font-extrabold text-sm tracking-widest">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-brand-main tracking-widest uppercase">{t('appName')}</span>
            <span className="text-[7px] font-mono text-brand-sub/50 uppercase tracking-widest">v2.6.0 // AETHER</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-px overflow-y-auto py-2">
          <NavItem to="/dashboard" icon={LayoutDashboard} label={t('nav.dashboard')} />
          <NavItem to="/tasks" icon={ListTodo} label={t('nav.tasks')} />
          <NavItem to="/profile" icon={User} label={t('nav.profile')} />
        </nav>

        {/* User profile widget at bottom (Pilot Card) */}
        <div className="p-4 border-t border-brand-border bg-brand-base/10">
          <div className="flex items-center gap-3 mb-4 p-2.5 rounded-lg border border-brand-border bg-brand-card hover:border-brand-primary/30 transition-all duration-300 shadow-sm">
            {user?.avatar && !user.avatar.includes('ui-avatars.com') ? (
              <img 
                src={user.avatar}
                alt={user.name || 'User'} 
                className="w-9 h-9 rounded-full border border-brand-border object-cover shadow-xs"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary/20 to-brand-primary/5 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-brand-primary/10">
                {(() => {
                  if (!user?.name) return 'U';
                  return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                })()}
              </div>
            )}
            <div className="flex-1 min-w-0 font-sans">
              <p className="text-[10px] font-bold text-brand-main truncate uppercase tracking-widest leading-none mb-1">{user?.name}</p>
              <p className="text-[8px] text-brand-sub font-mono truncate leading-none">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-[9px] text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 border border-red-500/20 transition-all duration-300 font-bold uppercase tracking-wider rounded-lg cursor-pointer"
          >
            <LogOut size={12} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header - Technical Command Strip */}
        <header className="h-16 bg-brand-card border-b border-brand-border flex items-center justify-between px-4 md:px-8 shrink-0">
          <button 
            className="md:hidden p-2 border border-brand-border text-brand-main hover:bg-brand-base transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>
          
          <div className="ml-auto flex items-center gap-2.5 font-mono">
            {/* Notification Center */}
            <NotificationCenter />

            {/* Settings Switcher */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg border border-brand-border bg-brand-card text-brand-sub hover:text-brand-primary hover:border-brand-primary/30 hover:bg-brand-base transition-all duration-300 shadow-sm cursor-pointer"
              title={t('nav.settings')}
            >
              <Settings size={14} />
            </button>
            
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-border bg-brand-card text-[9px] font-bold text-brand-sub hover:text-brand-primary hover:border-brand-primary/30 hover:bg-brand-base transition-all duration-300 shadow-sm cursor-pointer"
              title={t('nav.changeLanguage')}
            >
              <Globe size={12} />
              <span className="uppercase">{user?.preferences?.language || 'vi'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-brand-border bg-brand-card text-brand-sub hover:text-brand-primary hover:border-brand-primary/30 hover:bg-brand-base transition-all duration-300 shadow-sm cursor-pointer"
              title={t('nav.toggleTheme')}
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-brand-base">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-brand-base/85 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-60 bg-brand-card border-r border-brand-border shadow-xl p-4 flex flex-col z-10 animate-in slide-in-from-left duration-200">
             <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-border">
                <span className="text-xs font-bold font-display text-brand-main uppercase tracking-widest">{t('appName')}</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 border border-brand-border text-brand-sub hover:text-brand-main hover:bg-brand-base"
                >
                  <X size={14} />
                </button>
             </div>
             <nav className="space-y-px flex-1">
                <NavItem to="/dashboard" icon={LayoutDashboard} label={t('nav.dashboard')} />
                <NavItem to="/tasks" icon={ListTodo} label={t('nav.tasks')} />
                <NavItem to="/profile" icon={User} label={t('nav.profile')} />
             </nav>
             <button 
                onClick={handleLogout}
                className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-red-500 border border-red-500/20 hover:bg-red-500/10 transition-all font-bold uppercase tracking-wider"
              >
                <LogOut size={14} />
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
    </>
  );
};