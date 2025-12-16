/**
 * ============================================================================
 * INTERNATIONALIZATION (I18N) PROVIDER & HOOK
 * ============================================================================
 * Purpose: Manage multi-language UI with Vietnamese (vi) and English (en)
 * 
 * Features:
 * - Context-based language management
 * - Automatic language switching (Vi ↔ En)
 * - Persistent language preference (localStorage + user preferences)
 * - Variable interpolation in translations: t('key', { name: 'John' })
 * - Server-side language preference support
 * 
 * Usage:
 *   import { useI18n } from '../utils/i18n';
 *   const { t, lang } = useI18n();
 *   <h1>{t('appName')}</h1>
 *   <p>{t('tasks.emptyTitle')}</p>
 * 
 * ⚠️ IMPORTANT: TRANSLATION RULES
 *   ✅ ALWAYS translate: UI text, labels, buttons, messages
 *   ❌ NEVER translate: User-generated content (task titles, descriptions, notes)
 *   
 *   Examples:
 *   ✅ t('nav.dashboard') - UI element
 *   ✅ t('auth.loginButton') - System message
 *   ❌ task.title - User input, do NOT translate
 *   ❌ user.name - User data, do NOT translate
 *   ❌ notification.message - User-generated, do NOT translate
 * 
 * Language Preference Priority:
 *   1. User preferences (from database)
 *   2. localStorage ('lang' key)
 *   3. Default: Vietnamese (vi)
 * 
 * Supported Languages:
 *   - vi: Tiếng Việt
 *   - en: English
 * 
 * Author: System Implementation
 * Last Updated: December 16, 2025
 * ============================================================================
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useAuthStore } from '../features/useStore';

const dictionaries = {
  // content copied from i18n.js
};

const getStoredLang = () => {
  try {
    return localStorage.getItem('lang');
  } catch (e) {
    return null;
  }
};

const I18nContext = createContext({ t: (key) => key, lang: 'vi', locale: 'vi-VN' });

export const I18nProvider = ({ children }) => {
  const { user } = useAuthStore();
  const storedLang = getStoredLang();
  const langPref = user?.preferences?.language || storedLang;
  const lang = langPref === 'en' ? 'en' : 'vi';
  const locale = lang === 'en' ? 'en-US' : 'vi-VN';

  const dict = dictionaries[lang] || dictionaries.vi;

  const t = (key, vars) => {
    const parts = key.split('.');
    let cur = dict;
    for (const p of parts) {
      cur = cur?.[p];
      if (cur === undefined) return key;
    }
    if (typeof cur === 'string' && vars) {
      return cur.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
    }
    return cur;
  };

  const value = useMemo(() => ({ t, lang, locale }), [t, lang, locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);