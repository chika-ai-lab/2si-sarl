// Internationalization configuration

export interface I18nConfig {
  defaultLocale: string;
  supportedLocales: string[];
  localeNames: Record<string, string>;
  fallbackLocale: string;
}

export const i18nConfig: I18nConfig = {
  defaultLocale: "fr",
  supportedLocales: ["fr", "en"],
  localeNames: {
    fr: "Français",
    en: "English",
  },
  fallbackLocale: "fr",
};
