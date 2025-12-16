import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Settings } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useI18n } from '../../utils/i18n';

export const NotificationSettings = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    taskActionToasts: true,
    webEntryAlerts: true,
    taskStatusNotifications: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/settings');
      setSettings(res.data.notificationSettings);
    } catch (error) {
      console.error('Lỗi tải cài đặt:', error);
      toast.error(t('notifications.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/user/settings', settings);
      toast.success(t('notifications.saveSuccess'));
      onClose();
    } catch (error) {
      console.error('Lỗi lưu cài đặt:', error);
      toast.error(t('notifications.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Đóng"
        >
          <X size={18} className="text-gray-600 dark:text-gray-300" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Settings className="text-indigo-600 dark:text-indigo-400" size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('notifications.settingsModal.title')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('notifications.settingsModal.subtitle')}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">{t('notifications.loading')}</div>
        ) : (
          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-blue-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {t('notifications.settingsModal.email.title')}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('notifications.settingsModal.email.desc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Task Action Toasts */}
            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-green-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {t('notifications.settingsModal.taskAction.title')}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('notifications.settingsModal.taskAction.desc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.taskActionToasts}
                  onChange={(e) => setSettings({ ...settings, taskActionToasts: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Web Entry Alerts */}
            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-amber-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {t('notifications.settingsModal.webEntry.title')}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('notifications.settingsModal.webEntry.desc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.webEntryAlerts}
                  onChange={(e) => setSettings({ ...settings, webEntryAlerts: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Task Status Notifications */}
            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-purple-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {t('notifications.settingsModal.taskStatus.title')}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('notifications.settingsModal.taskStatus.desc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.taskStatusNotifications}
                  onChange={(e) => setSettings({ ...settings, taskStatusNotifications: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('notifications.settingsModal.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50"
          >
            {saving ? t('notifications.settingsModal.saving') : t('notifications.settingsModal.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
