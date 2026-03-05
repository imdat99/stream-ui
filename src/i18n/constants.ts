export const supportedLocales = ['en', 'vi'] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = 'en';

export const localeCookieKey = 'lang';
