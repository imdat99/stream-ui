import { createI18n as createVueI18n } from 'vue-i18n';
import type { SupportedLocale } from './constants';
import { defaultLocale, supportedLocales } from './constants';
import en from './messages/en';
import vi from './messages/vi';

export const i18nMessages = {
  en,
  vi,
} as const;

let activeI18n: ReturnType<typeof createI18n> | null = null;

const normalizeLocaleToken = (locale?: string | null): string | undefined => {
  if (!locale) return undefined;
  return locale
    .trim()
    .toLowerCase()
    .replace('_', '-');
};

export const toSupportedLocale = (locale?: string | null): SupportedLocale | undefined => {
  const normalized = normalizeLocaleToken(locale);
  if (!normalized) return undefined;

  const direct = supportedLocales.find(item => item === normalized);
  if (direct) return direct;

  const base = normalized.split('-')[0];
  return supportedLocales.find(item => item === base);
};

export const normalizeLocale = (locale?: string | null): SupportedLocale => {
  return toSupportedLocale(locale) ?? defaultLocale;
};

export const resolveLocaleFromAcceptLanguage = (acceptLanguage?: string | null): SupportedLocale | undefined => {
  if (!acceptLanguage) return undefined;

  const candidates = acceptLanguage
    .split(',')
    .map((part) => {
      const [rawLocale, ...params] = part.trim().split(';');
      const qParam = params.find(param => param.trim().startsWith('q='));
      const quality = qParam ? Number.parseFloat(qParam.split('=')[1] ?? '1') : 1;
      return {
        locale: rawLocale,
        quality: Number.isFinite(quality) ? quality : 1,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const candidate of candidates) {
    const matched = toSupportedLocale(candidate.locale);
    if (matched) return matched;
  }

  return undefined;
};

export const createI18n = (initialLocale?: string | null) => {
  const locale = normalizeLocale(initialLocale);
  const i18n = createVueI18n({
    legacy: false,
    locale,
    fallbackLocale: defaultLocale,
    messages: i18nMessages,
  });
  activeI18n = i18n;
  return i18n;
};

export const getActiveI18n = () => activeI18n;

export type AppI18n = ReturnType<typeof createI18n>;
