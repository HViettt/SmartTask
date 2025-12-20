import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Settings } from 'lucide-react';
import api from '../../services/api';
import { showToast } from '../../utils/toastUtils';
import { useI18n } from '../../utils/i18n';

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  taskActionToasts: true,
  webEntryAlerts: true,
  taskStatusNotifications: true
};

export const NotificationSettings = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const res = await api.get('/user/settings');
      const backendSettings = { ...DEFAULT_SETTINGS, ...(res.data.notificationSettings || {}) };
      setSettings(backendSettings);
    } catch (error) {
      // Silent error - keep default settings
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/user/settings', settings);
      showToast.success(t('notifications.saveSuccess'));
      onClose();
    } catch (error) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-in fade-in zoom-in-95 duration-200">
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

        <div className="space-y-4">
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
                  onChange={() => handleToggle('emailNotifications')}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

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
                  onChange={() => handleToggle('taskActionToasts')}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

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
                  onChange={() => handleToggle('webEntryAlerts')}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

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
                  onChange={() => handleToggle('taskStatusNotifications')}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t('notifications.settingsModal.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-all"
          >
            {saving ? t('notifications.settingsModal.saving') : t('notifications.settingsModal.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
