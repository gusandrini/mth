// src/i18n/index.ts
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

// dicionários
import ptBR from './locales/pt-BR';
import esES from './locales/es-ES';

const i18n = new I18n({
  'pt-BR': ptBR,
  'es-ES': esES,
});

// idioma padrão
i18n.defaultLocale = 'pt-BR';

// pega o languageTag atual do dispositivo (ex.: "pt-BR", "es-ES", "pt-PT", "es-MX")
const deviceTag =
  typeof Localization.getLocales === 'function'
    ? Localization.getLocales()[0]?.languageTag
    // compat (caso esteja com versão antiga – evita erro de tipo)
    : (Localization as any)?.locale;

// mapeia para os idiomas suportados do app
function resolveSupportedLocale(tag?: string): 'pt-BR' | 'es-ES' {
  if (!tag) return 'pt-BR';
  const lower = tag.toLowerCase();
  if (lower.startsWith('es')) return 'es-ES';
  // qualquer outro "pt-*" cai em pt-BR; demais caem no default
  if (lower.startsWith('pt')) return 'pt-BR';
  return 'pt-BR';
}

i18n.locale = resolveSupportedLocale(deviceTag);

// habilita fallback para quando faltar alguma chave
i18n.enableFallback = true;

export default i18n;

// helper opcional
export const t = (key: string, options?: any) => i18n.t(key, options);
