import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import frLocale from "@/locales/fr.json";
import enLocale from "@/locales/en.json";
import { i18nConfig } from "@/config/i18n.config";

type LocaleData = typeof frLocale;

const locales: Record<string, LocaleData> = {
  fr: frLocale,
  en: enLocale,
};

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  supportedLocales: string[];
  localeNames: Record<string, string>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return typeof current === "string" ? current : undefined;
}

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: string;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState(initialLocale || i18nConfig.defaultLocale);

  const setLocale = useCallback((newLocale: string) => {
    if (i18nConfig.supportedLocales.includes(newLocale)) {
      setLocaleState(newLocale);
      // Store preference
      localStorage.setItem("locale", newLocale);
      // Update document lang attribute
      document.documentElement.lang = newLocale;
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const currentLocale = locales[locale] || locales[i18nConfig.fallbackLocale];
      let value = getNestedValue(currentLocale as unknown as Record<string, unknown>, key);
      
      // Fallback to default locale if key not found
      if (!value && locale !== i18nConfig.fallbackLocale) {
        value = getNestedValue(locales[i18nConfig.fallbackLocale] as unknown as Record<string, unknown>, key);
      }
      
      // Return key if still not found
      if (!value) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      
      // Replace parameters
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value!.replace(new RegExp(`{${paramKey}}`, "g"), String(paramValue));
        });
      }
      
      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        supportedLocales: i18nConfig.supportedLocales,
        localeNames: i18nConfig.localeNames,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}
