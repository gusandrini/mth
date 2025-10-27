import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/i18n";

type Ctx = {
  locale: string;
  setLocale: (loc: string) => Promise<void>;
  t: (k: string, opts?: Record<string, any>) => string;
};

const I18nCtx = createContext<Ctx | null>(null);
const KEY = "appLanguage";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, _setLocale] = useState(i18n.locale);

  // restaura idioma salvo (se houver)
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(KEY);
      if (saved && saved !== locale) {
        i18n.locale = saved;
        _setLocale(saved);
      }
    })();
  }, []);

  const setLocale = async (loc: string) => {
    i18n.locale = loc;
    _setLocale(loc);                 // <- força re-render
    await AsyncStorage.setItem(KEY, loc);
  };

  const value = useMemo<Ctx>(() => ({
    locale,
    setLocale,
    t: (k, opts) => i18n.t(k, opts),
  }), [locale]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n precisa do <I18nProvider> no topo da árvore");
  return ctx;
}
