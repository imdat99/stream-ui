import i18next, { type i18n as I18nInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import I18NextHttpBackend from 'i18next-http-backend';
import { tryGetContext } from 'hono/context-storage';

import { defaultLocale, localeCookieKey, supportedLocales, type SupportedLocale } from '@/i18n/constants';

const runtimeNamespace = 'translation';

let clientI18n: I18nInstance | undefined;

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

const createInstance = () => {
  const instance = i18next.createInstance();

  instance.use(I18NextHttpBackend);
  if (!import.meta.env.SSR) {
    instance.use(LanguageDetector);
  }

  return instance;
};

const initInstance = async (instance: I18nInstance, language?: string) => {
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
      ...(import.meta.env.SSR
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

export const createI18nForRuntime = async (language?: string) => {
  if (import.meta.env.SSR) {
    const serverI18n = await initInstance(createInstance(), language);
    const context = tryGetContext<any>();
    context?.set?.('i18n', serverI18n);
    return serverI18n;
  }

  if (!clientI18n) {
    clientI18n = createInstance();
  }

  return initInstance(clientI18n, language);
};

export const getActiveI18nInstance = () => {
  if (!import.meta.env.SSR) {
    return clientI18n;
  }

  const context = tryGetContext<any>();
  return context?.get?.('i18n') as I18nInstance | undefined;
};
