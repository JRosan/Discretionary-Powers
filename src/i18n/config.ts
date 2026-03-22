export const defaultLocale = 'en';
export const supportedLocales = ['en'] as const;
export type Locale = (typeof supportedLocales)[number];
