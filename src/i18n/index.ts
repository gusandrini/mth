import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import es from './locales/es-ES';
import pt from './locales/pt-BR';

const i18n = new I18n({
  es,
  'es-ES': es,
  pt,
  'pt-BR': pt,
});

i18n.enableFallback = true;
i18n.defaultLocale = 'pt-BR';

try {
  const locales = Localization.getLocales();
  const languageTag = Array.isArray(locales) && locales.length ? locales[0].languageTag : 'pt-BR';
  i18n.locale = languageTag || 'pt-BR';
} catch {
  i18n.locale = 'pt-BR';
}

export function t(key: string, options = {}) {
  return i18n.t(key, options);
}

export default i18n;
