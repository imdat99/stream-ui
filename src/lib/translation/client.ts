import type { i18n as I18nInstance } from 'i18next';

import { createI18nInstance, initI18nInstance } from '@/lib/translation';

let clientI18n: I18nInstance | undefined;

export const createI18nForClient = async (language?: string) => {
  if (!clientI18n) {
    clientI18n = createI18nInstance(false);
  }

  return initI18nInstance(clientI18n, language, false);
};

export const getClientI18nInstance = () => clientI18n;
