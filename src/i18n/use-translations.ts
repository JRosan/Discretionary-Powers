import messages from './messages/en.json';

type Messages = typeof messages;
type Section = keyof Messages;

export function useTranslations<T extends Section>(section: T) {
  const t = (key: keyof Messages[T], params?: Record<string, string | number>) => {
    let value = messages[section][key] as string;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }
    return value;
  };
  return t;
}
