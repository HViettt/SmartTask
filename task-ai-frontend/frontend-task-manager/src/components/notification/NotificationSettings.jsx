import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Settings, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { showToast } from '../../utils/toastUtils';
import { useI18n } from '../../utils/i18n';
import { useAuthStore } from '../../features/useStore';

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  taskActionToasts: true,
  webEntryAlerts: true,
  taskStatusNotifications: true
};

export const NotificationSettings = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { t } = useI18n();
  const { user, updateUserInfo } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const res = await api.get('/user/settings');
      // Đảm bảo lấy đúng structure từ backend
      const backendSettings = res.data?.notificationSettings || res.data || {};
      const mergedSettings = { ...DEFAULT_SETTINGS, ...backendSettings };
      setSettings(mergedSettings);
      // Đồng bộ vào user trong store để các nơi khác đọc được settings
      if (user) {
        updateUserInfo({ ...user, notificationSettings: mergedSettings });
      }
    } catch (error) {
      console.error('Load settings error:', error);
      // Keep default settings on error
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Gửi settings phẳng (backend hỗ trợ cả 2 dạng)
      await api.put('/user/settings', settings);
      showToast.success(t('notifications.saveSuccess'));
      // Reload lại settings để đảm bảo sync với server
      await loadSettings();
      onClose();
    } catch (error) {
      console.error('Save settings error:', error);
      showToast.error(t('notifications.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-base/80 backdrop-blur-xs px-4 animate-in fade-in duration-200 font-sans text-xs">
      <div className="relative w-full max-w-md bg-brand-card border border-brand-border p-6 animate-in fade-in zoom-in-95 duration-200 z-10 hud-border scan-lines">
        {/* HUD Corner Tag */}
        <div className="absolute top-2 right-10 text-[7px] font-mono text-brand-sub/40 uppercase tracking-widest">[SYS-SETTINGS-09]</div>
        
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 border border-brand-border bg-brand-card text-brand-sub hover:text-brand-main transition-colors"
          aria-label="Đóng"
        >
          <X size={14} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 border border-brand-primary bg-brand-primary/10 flex items-center justify-center text-brand-primary-text">
            <Settings size={14} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-main">
              {t('notifications.settingsModal.title')}
            </h3>
            <p className="text-[9px] font-mono uppercase tracking-wider text-brand-sub mt-0.5">
              {t('notifications.settingsModal.subtitle')}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
          </div>
        ) : (
          <div className="space-y-2.5 font-mono text-[9px]">
            <div className="flex items-start justify-between p-3.5 bg-brand-base/20 border border-brand-border/60">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-brand-primary-text font-bold">
                  <Bell size={12} />
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-main">
                    {t('notifications.settingsModal.email.title')}
                  </h4>
                </div>
                <p className="text-[9px] text-brand-sub mt-1 leading-normal uppercase tracking-wide">
                  {t('notifications.settingsModal.email.desc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <div className="w-9 h-5 bg-brand-border rounded-none peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-main after:h-4 after:w-4 after:transition-transform peer-checked:bg-brand-primary transition-colors border border-brand-border"></div>
              </label>
            </div>

            <div className="flex items-start justify-between p-3.5 bg-brand-base/20 border border-brand-border/60">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-brand-low-text font-bold">
                  <Check size={12} />
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-main">
                    {t('notifications.settingsModal.taskAction.title')}
                  </h4>
                </div>
                <p className="text-[9px] text-brand-sub mt-1 leading-normal uppercase tracking-wide">
                  {t('notifications.settingsModal.taskAction.desc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.taskActionToasts}
                  onChange={() => handleToggle('taskActionToasts')}
                />
                <div className="w-9 h-5 bg-brand-border rounded-none peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-main after:h-4 after:w-4 after:transition-transform peer-checked:bg-brand-primary transition-colors border border-brand-border"></div>
              </label>
            </div>

            <div className="flex items-start justify-between p-3.5 bg-brand-base/20 border border-brand-border/60">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-brand-medium-text font-bold">
                  <Bell size={12} />
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-main">
                    {t('notifications.settingsModal.webEntry.title')}
                  </h4>
                </div>
                <p className="text-[9px] text-brand-sub mt-1 leading-normal uppercase tracking-wide">
                  {t('notifications.settingsModal.webEntry.desc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.webEntryAlerts}
                  onChange={() => handleToggle('webEntryAlerts')}
                />
                <div className="w-9 h-5 bg-brand-border rounded-none peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-main after:h-4 after:w-4 after:transition-transform peer-checked:bg-brand-primary transition-colors border border-brand-border"></div>
              </label>
            </div>

            <div className="flex items-start justify-between p-3.5 bg-brand-base/20 border border-brand-border/60">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-brand-primary-text font-bold">
                  <Bell size={12} />
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-main">
                    {t('notifications.settingsModal.taskStatus.title')}
                  </h4>
                </div>
                <p className="text-[9px] text-brand-sub mt-1 leading-normal uppercase tracking-wide">
                  {t('notifications.settingsModal.taskStatus.desc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.taskStatusNotifications}
                  onChange={() => handleToggle('taskStatusNotifications')}
                />
                <div className="w-9 h-5 bg-brand-border rounded-none peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-main after:h-4 after:w-4 after:transition-transform peer-checked:bg-brand-primary transition-colors border border-brand-border"></div>
              </label>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5 shrink-0 font-mono">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-[9px] font-bold text-brand-sub hover:text-brand-main bg-brand-card border border-brand-border hover:bg-brand-base transition-colors rounded-none uppercase tracking-wider"
          >
            {t('notifications.settingsModal.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || isLoading}
            className="px-4 py-2 text-[9px] font-bold text-white dark:text-brand-card bg-brand-primary hover:bg-brand-primary/90 transition-colors border border-brand-primary shadow-[0_0_10px_rgba(0,240,255,0.1)] rounded-none uppercase tracking-wider"
          >
            {saving ? t('notifications.settingsModal.saving') : t('notifications.settingsModal.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
