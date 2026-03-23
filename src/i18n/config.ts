export const defaultLocale = 'en';
export const supportedLocales = ['en', 'es'] as const;
export type Locale = (typeof supportedLocales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};
