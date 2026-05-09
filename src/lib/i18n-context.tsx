"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { LANGUAGE_KEY, type Language } from "./i18n";
import { translations, t } from "./translations";

type I18nContextType = {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(LANGUAGE_KEY) as Language | null;
      if (stored && (stored === "en" || stored === "ne")) {
        setLangState(stored);
      }
    } catch {}
  }, []);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    try { localStorage.setItem(LANGUAGE_KEY, l); } catch {}
  }, []);

  const translate = useCallback(
    (key: string) => (mounted ? t(key, lang) : t(key, "en")),
    [lang, mounted]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translate }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}