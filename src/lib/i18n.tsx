"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { kioskTranslations } from "./mockData";

export type Language = "en" | "hi" | "bn";

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "govehr-language";

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start with "en" to avoid SSR/client hydration mismatch
  const [language, setLanguageState] = useState<Language>("en");
  

  // After hydration, read the persisted language from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "hi" || stored === "bn") {
        setLanguageState(stored);
      }
    } catch {
      // localStorage unavailable
    }
    
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Sync <html lang>
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key: string): string => {
      return kioskTranslations[language]?.[key] ?? kioskTranslations.en[key] ?? key;
    },
    [language],
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
