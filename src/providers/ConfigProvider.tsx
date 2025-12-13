import React, { createContext, useContext, ReactNode } from "react";
import { appConfig, type AppConfig } from "@/config/app.config";

const ConfigContext = createContext<AppConfig | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
  config?: Partial<AppConfig>;
}

export function ConfigProvider({ children, config }: ConfigProviderProps) {
  // Merge provided config with default config
  const mergedConfig: AppConfig = {
    ...appConfig,
    ...config,
    branding: { ...appConfig.branding, ...config?.branding },
    company: { ...appConfig.company, ...config?.company },
    payments: { ...appConfig.payments, ...config?.payments },
    i18n: { ...appConfig.i18n, ...config?.i18n },
    features: { ...appConfig.features, ...config?.features },
    app: { ...appConfig.app, ...config?.app },
  };

  return (
    <ConfigContext.Provider value={mergedConfig}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}

export function useBranding() {
  const config = useConfig();
  return config.branding;
}

export function useCompany() {
  const config = useConfig();
  return config.company;
}

export function usePaymentConfig() {
  const config = useConfig();
  return config.payments;
}

export function useFeatures() {
  const config = useConfig();
  return config.features;
}
