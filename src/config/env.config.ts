/**
 * Configuration centralisée des variables d'environnement
 * Utilise import.meta.env pour Vite
 */

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
export const appConfig = {
  name: getEnvString('VITE_APP_NAME', '2SI SARL - Commerce Hub'),
  version: getEnvString('VITE_APP_VERSION', '2.0.0'),
  env: getEnvString('VITE_APP_ENV', 'development'),
  isDevelopment: getEnvString('VITE_APP_ENV', 'development') === 'development',
  isProduction: getEnvString('VITE_APP_ENV', 'development') === 'production',
};

/**
 * Configuration API
 */
export const apiConfig = {
  baseUrl: getEnvString('VITE_API_URL', 'http://localhost:3000/api'),
  timeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
};

/**
 * Configuration des modules
 */
export const modulesConfig = {
  // Core modules (toujours actifs)
  dashboard: {
    enabled: true, // Toujours activé
    isCore: true,
  },

  // Business modules
  crm: {
    enabled: getEnvBoolean('VITE_MODULE_CRM_ENABLED', false),
    isCore: false,
  },
  orders: {
    enabled: getEnvBoolean('VITE_MODULE_ORDERS_ENABLED', false),
    isCore: false,
  },
  products: {
    enabled: getEnvBoolean('VITE_MODULE_PRODUCTS_ENABLED', false),
    isCore: false,
  },
  reports: {
    enabled: getEnvBoolean('VITE_MODULE_REPORTS_ENABLED', false),
    isCore: false,
  },
  commercial: {
    enabled: getEnvBoolean('VITE_MODULE_COMMERCIAL_ENABLED', true),
    isCore: false,
  },
};

/**
 * Feature flags pour le module Commercial
 */
export const commercialFeatures = {
  clients: getEnvBoolean('VITE_COMMERCIAL_CLIENTS_ENABLED', true),
  commandes: getEnvBoolean('VITE_COMMERCIAL_COMMANDES_ENABLED', true),
  scanBL: getEnvBoolean('VITE_COMMERCIAL_SCAN_BL_ENABLED', false),
  catalogue: getEnvBoolean('VITE_COMMERCIAL_CATALOGUE_ENABLED', true),
  accreditif: getEnvBoolean('VITE_COMMERCIAL_ACCREDITIF_ENABLED', false),
  simulation: getEnvBoolean('VITE_COMMERCIAL_SIMULATION_ENABLED', true),
  sav: getEnvBoolean('VITE_COMMERCIAL_SAV_ENABLED', false),
  rapports: getEnvBoolean('VITE_COMMERCIAL_RAPPORTS_ENABLED', false),
};

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
