import i18next, { type i18n as I18nInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import I18NextHttpBackend from 'i18next-http-backend';

import { defaultLocale, localeCookieKey, supportedLocales, type SupportedLocale } from '@/i18n/constants';

const runtimeNamespace = 'translation';

const normalizeLanguage = (language?: string): SupportedLocale => {
  if (!language) return defaultLocale;
  const normalized = language.toLowerCase().split('-')[0] as SupportedLocale;
  return supportedLocales.includes(normalized) ? normalized : defaultLocale;
};

const getLoadPath = () => {
  const cdnBase = import.meta.env.VITE_I18N_CDN_BASE_URL?.trim().replace(/\/+$/, '');
  if (cdnBase) {
    return `${cdnBase}/locales/{{lng}}/{{lng}}.json`;
  }
  return '/locales/{{lng}}/{{lng}}.json';
};

export const createI18nInstance = (forServer: boolean) => {
  const instance = i18next.createInstance();

  instance.use(I18NextHttpBackend);
  if (!forServer) {
    instance.use(LanguageDetector);
  }

  return instance;
};

export const initI18nInstance = async (
  instance: I18nInstance,
  language?: string,
  forServer: boolean = import.meta.env.SSR,
) => {
  const lng = normalizeLanguage(language);

  if (!instance.isInitialized) {
    await instance.init({
      supportedLngs: [...supportedLocales],
      fallbackLng: defaultLocale,
      load: 'languageOnly',
      lng,
      ns: [runtimeNamespace],
      defaultNS: runtimeNamespace,
      fallbackNS: runtimeNamespace,
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: getLoadPath(),
      },
      ...(forServer
        ? {}
        : {
            detection: {
              order: ['cookie', 'navigator', 'htmlTag'],
              lookupCookie: localeCookieKey,
              caches: ['cookie'],
            },
          }),
    });

    return instance;
  }

  if (instance.resolvedLanguage !== lng) {
    await instance.changeLanguage(lng);
  }

  return instance;
};
