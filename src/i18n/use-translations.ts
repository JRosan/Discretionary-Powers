import en from './messages/en.json';
import es from './messages/es.json';

const messages = { en, es };

function getLocale(): 'en' | 'es' {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('dpms-locale');
    if (stored === 'en' || stored === 'es') return stored;
  }
  return 'en';
}

export function useTranslations<T extends keyof typeof en>(section: T) {
  const locale = getLocale();
  const sectionMessages = (messages[locale] as typeof en)[section];

  const t = (key: keyof (typeof en)[T], params?: Record<string, string | number>) => {
    let value =
      (sectionMessages as Record<string, string>)[key as string] ??
      (en[section] as Record<string, string>)[key as string] ??
      (key as string);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }
    return value;
  };
  return t;
}

export function setLocale(locale: 'en' | 'es') {
  localStorage.setItem('dpms-locale', locale);
  window.location.reload();
}
