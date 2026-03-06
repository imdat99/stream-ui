import type { i18n as I18nInstance } from 'i18next';

import { getClientI18nInstance } from '@/lib/translation/client';

import { defaultLocale, supportedLocales, type SupportedLocale } from './constants';

export { supportedLocales, defaultLocale } from './constants';
export type { SupportedLocale } from './constants';
export { localeCookieKey } from './constants';

export const normalizeLocale = (locale?: string): SupportedLocale => {
  if (!locale) return defaultLocale;
  const normalized = locale.toLowerCase().split('-')[0] as SupportedLocale;
  return supportedLocales.includes(normalized) ? normalized : defaultLocale;
};

export const getActiveI18n = (): I18nInstance | undefined => {
  return import.meta.env.SSR ? undefined : getClientI18nInstance();
};
