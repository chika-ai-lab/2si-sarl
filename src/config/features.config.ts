// Feature flags configuration
// Enable/disable features without code changes

export interface FeaturesConfig {
  enableOnlinePayment: boolean;
  enableCustomerAccount: boolean;
  enableAdminDashboard: boolean;
  enableProductReviews: boolean;
  enableWishlist: boolean;
  enableProductComparison: boolean;
  enableChatSupport: boolean;
  enableNewsletterSignup: boolean;
  enableSocialLogin: boolean;
  enableOrderTracking: boolean;
  enableMultiCurrency: boolean;
  maintenanceMode: boolean;
}

export const featuresConfig: FeaturesConfig = {
  enableOnlinePayment: false,
  enableCustomerAccount: false,
  enableAdminDashboard: true,
  enableProductReviews: false,
  enableWishlist: false,
  enableProductComparison: false,
  enableChatSupport: false,
  enableNewsletterSignup: true,
  enableSocialLogin: false,
  enableOrderTracking: false,
  enableMultiCurrency: false,
  maintenanceMode: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Activation des modules & fonctionnalités métier (back-office /admin)
// SOURCE UNIQUE, en dur : ni variables d'environnement, ni base de données.
// Pour masquer une fonctionnalité : passer sa valeur à false ici (seul endroit).
// État actuel : tout est activé.
// ─────────────────────────────────────────────────────────────────────────────

// Modules top-niveau
export const MODULES_ENABLED = {
  dashboard: true, // core, toujours actif
  crm: true,
  orders: true,
  products: true,
  reports: true,
  commercial: true,
} as const;

// Fonctionnalités du module Commercial
export const COMMERCIAL_FEATURES = {
  clients: true,
  commandes: true,
  catalogue: true,
  accreditif: true,
  simulation: true,
  sav: true,
  rapports: true,
  promotions: true,
  leads: true,
} as const;

export type ModuleId = keyof typeof MODULES_ENABLED;
export type CommercialFeatureId = keyof typeof COMMERCIAL_FEATURES;
