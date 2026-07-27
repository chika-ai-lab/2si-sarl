/**
 * Configuration centralisée des variables d'environnement
 * Utilise import.meta.env pour Vite
 */
import { MODULES_ENABLED, COMMERCIAL_FEATURES } from "@/config/features.config";

/**
 * Helper pour lire une variable d'environnement booléenne
 */
function getEnvBoolean(key: string, defaultValue = false): boolean {
  const value = import.meta.env[key];
  if (value === undefined || value === '') return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Helper pour lire une variable d'environnement string
 */
function getEnvString(key: string, defaultValue = ''): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * Helper pour lire une variable d'environnement number
 */
function getEnvNumber(key: string, defaultValue = 0): number {
  const value = import.meta.env[key];
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Configuration de l'application
 */
const _env = getEnvString('VITE_APP_ENV', 'development');

export const appConfig = {
  name: getEnvString('VITE_APP_NAME', 'Sen Service International'),
  version: getEnvString('VITE_APP_VERSION', '2.0.0'),
  env: _env,
  isDevelopment: _env === 'development',
  isProduction:  _env === 'production',
};

/**
 * Configuration API
 */
export const apiConfig = {
  baseUrl: getEnvString('VITE_API_URL', 'https://api.sen-services.com/api/v2'),
  timeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
};

/**
 * Configuration des modules
 */
export const modulesConfig = {
  // Core modules (toujours actifs)
  dashboard: {
    enabled: MODULES_ENABLED.dashboard, // Toujours activé
    isCore: true,
  },

  // Business modules — activation en dur (voir features.config.ts)
  crm: {
    enabled: MODULES_ENABLED.crm,
    isCore: false,
  },
  orders: {
    enabled: MODULES_ENABLED.orders,
    isCore: false,
  },
  products: {
    enabled: MODULES_ENABLED.products,
    isCore: false,
  },
  reports: {
    enabled: MODULES_ENABLED.reports,
    isCore: false,
  },
  commercial: {
    enabled: MODULES_ENABLED.commercial,
    isCore: false,
  },
};

/**
 * Feature flags pour le module Commercial.
 * Activation en dur — source unique : features.config.ts (ni env, ni base).
 */
export const commercialFeatures = COMMERCIAL_FEATURES;

/**
 * Configuration des uploads
 */
export const uploadConfig = {
  maxFileSize: getEnvNumber('VITE_MAX_FILE_SIZE', 10485760), // 10MB par défaut
  allowedFileTypes: getEnvString(
    'VITE_ALLOWED_FILE_TYPES',
    'image/jpeg,image/png,image/jpg,application/pdf'
  ).split(','),
};

/**
 * Mode maintenance
 */
export const maintenanceConfig = {
  enabled: getEnvBoolean('VITE_MAINTENANCE_MODE', false),
  message: getEnvString(
    'VITE_MAINTENANCE_MESSAGE',
    'Le système est en maintenance. Veuillez réessayer plus tard.'
  ),
};

/**
 * Vérifie si un module est activé
 */
export function isModuleEnabled(moduleId: string): boolean {
  const module = modulesConfig[moduleId as keyof typeof modulesConfig];
  return module?.enabled ?? false;
}

/**
 * Vérifie si une fonctionnalité du module commercial est activée
 */
export function isCommercialFeatureEnabled(featureId: string): boolean {
  // Si le module commercial est désactivé, toutes les features sont désactivées
  if (!modulesConfig.commercial.enabled) {
    return false;
  }

  const feature = commercialFeatures[featureId as keyof typeof commercialFeatures];
  return feature ?? false;
}

/**
 * Developer flags — visibles uniquement en développement
 * Mettre VITE_SHOW_WIP_BADGES=false en production pour masquer les badges
 */
export const devConfig = {
  showWipBadges: getEnvBoolean('VITE_SHOW_WIP_BADGES', true),
};

/**
 * Export de toutes les configs
 */
export const config = {
  app: appConfig,
  api: apiConfig,
  modules: modulesConfig,
  commercialFeatures,
  upload: uploadConfig,
  maintenance: maintenanceConfig,
};

export default config;
