// Main application configuration
// Aggregates all config modules

import { brandingConfig, type BrandingConfig } from "./branding.config";
import { companyConfig, type CompanyConfig } from "./company.config";
import { paymentConfig, type PaymentConfig } from "./payments.config";
import { i18nConfig, type I18nConfig } from "./i18n.config";
import { featuresConfig, type FeaturesConfig } from "./features.config";

export interface AppConfig {
  branding: BrandingConfig;
  company: CompanyConfig;
  payments: PaymentConfig;
  i18n: I18nConfig;
  features: FeaturesConfig;
  app: {
    name: string;
    version: string;
    environment: "development" | "staging" | "production";
  };
}

export const appConfig: AppConfig = {
  branding: brandingConfig,
  company: companyConfig,
  payments: paymentConfig,
  i18n: i18nConfig,
  features: featuresConfig,
  app: {
    name: "2SI.Sarl Platform",
    version: "1.0.0",
    environment: "development",
  },
};

export {
  brandingConfig,
  companyConfig,
  paymentConfig,
  i18nConfig,
  featuresConfig,
};
