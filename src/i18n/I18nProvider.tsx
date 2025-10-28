// src/i18n/I18nProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/i18n";

type SupportedLocale = "pt-BR" | "es-ES";

type Ctx = {
  locale: SupportedLocale;
  setLocale: (loc: SupportedLocale | string) => Promise<void>;
  t: (k: string, opts?: Record<string, any>) => string;
};

const I18nCtx = createContext<Ctx | null>(null);
const KEY = "appLanguage";

// Garante que qualquer variante (ex.: es-MX, pt-PT) caia em um dos suportados
function normalizeLocale(tag?: string): SupportedLocale {
  if (!tag) return "pt-BR";
  const lower = tag.toLowerCase();
  if (lower.startsWith("es")) return "es-ES";
  if (lower.startsWith("pt")) return "pt-BR";
  return "pt-BR";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // i18n.locale já vem definido no index.ts (respeitando deviceTag)
  const initial = normalizeLocale(String(i18n.locale));
  const [locale, setLocaleState] = useState<SupportedLocale>(initial);

  // Carrega idioma salvo (se existir) na 1ª montagem
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY);
        if (saved) {
          const norm = normalizeLocale(saved);
          if (norm !== locale) {
            i18n.locale = norm;
            setLocaleState(norm);
          }
        }
      } catch (e) {
        // Silencia erro de leitura; segue com o locale atual
        console.warn("I18nProvider: erro ao ler AsyncStorage", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // apenas na montagem

  const setLocale = async (loc: SupportedLocale | string) => {
    const norm = normalizeLocale(loc);
    if (norm === locale) return;
    i18n.locale = norm;          // atualiza o i18n global
    setLocaleState(norm);        // força re-render
    try {
      await AsyncStorage.setItem(KEY, norm);
    } catch (e) {
      console.warn("I18nProvider: erro ao salvar AsyncStorage", e);
    }
  };

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      t: (k, opts) => i18n.t(k, opts),
    }),
    [locale]
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n precisa do <I18nProvider> no topo da árvore");
  return ctx;
}
