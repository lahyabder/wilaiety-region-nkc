import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "ar" | "fr";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  dir: "rtl" | "ltr";
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

/**
 * Minimal safe dictionary.
 * If your app already uses keys, you can extend this later.
 */
const DICT: Record<Language, Record<string, string>> = {
  ar: {
    "app.name": "المنصة الجهوية",
    "nav.login": "تسجيل الدخول",
    "nav.users": "المستخدمون",
  },
  fr: {
    "app.name": "Plateforme régionale",
    "nav.login": "Connexion",
    "nav.users": "Utilisateurs",
  },
};

function normalizeLanguage(value: unknown): Language {
  return value === "fr" ? "fr" : "ar";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return normalizeLanguage(localStorage.getItem("language"));
    } catch {
      return "ar";
    }
  });

  const dir: "rtl" | "ltr" = language === "ar" ? "rtl" : "ltr";

  const setLanguage = (lang: Language) => {
    const normalized = normalizeLanguage(lang);
    setLanguageState(normalized);
    try {
      localStorage.setItem("language", normalized);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => setLanguage(language === "ar" ? "fr" : "ar");

  const t = (key: string) => {
    const table = DICT[language] || DICT.ar;
    return table[key] ?? key;
  };

  // Keep <html> dir/lang in sync (prevents layout weirdness)
  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", dir);
  }, [language, dir]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, toggleLanguage, dir, t }),
    [language, dir]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Instead of crashing the whole app, throw a clear error:
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
