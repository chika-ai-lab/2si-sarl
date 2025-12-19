/**
 * Settings Service
 * Gère les paramètres de l'application avec localStorage
 */

const SETTINGS_STORAGE_KEY = "2si-app-settings";

export interface CompanySettings {
  name: string;
  legalName: string;
  email: string;
  phone: string;
  address: string;
  ninea: string;
}

export interface PaymentSettings {
  minAmount: number;
  maxAmount: number;
  defaultPlanId: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  orderNotifications: boolean;
  stockAlerts: boolean;
  marketingEmails: boolean;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireApproval: boolean;
}

export interface AppSettings {
  company: CompanySettings;
  payment: PaymentSettings;
  notifications: NotificationSettings;
  system: SystemSettings;
}

// Paramètres par défaut
const DEFAULT_SETTINGS: AppSettings = {
  company: {
    name: "2SI",
    legalName: "Sen Services International",
    email: "contact@sen-services.com",
    phone: "+221 33 864 48 48",
    address: "En face Auto Pont BRT Liberté 5 Villa N°5492, Dakar, Sénégal",
    ninea: "007835162",
  },
  payment: {
    minAmount: 100000,
    maxAmount: 10000000,
    defaultPlanId: "12",
  },
  notifications: {
    emailNotifications: true,
    orderNotifications: true,
    stockAlerts: true,
    marketingEmails: false,
  },
  system: {
    maintenanceMode: false,
    allowRegistration: true,
    requireApproval: false,
  },
};

/**
 * Charger les paramètres depuis localStorage
 */
export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Fusionner avec les paramètres par défaut pour garantir que toutes les clés existent
      return {
        company: { ...DEFAULT_SETTINGS.company, ...parsed.company },
        payment: { ...DEFAULT_SETTINGS.payment, ...parsed.payment },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
        system: { ...DEFAULT_SETTINGS.system, ...parsed.system },
      };
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage:", error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Sauvegarder les paramètres dans localStorage
 */
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error);
    throw new Error("Impossible de sauvegarder les paramètres");
  }
}

/**
 * Mettre à jour les paramètres de l'entreprise
 */
export function updateCompanySettings(company: CompanySettings): void {
  const settings = loadSettings();
  settings.company = company;
  saveSettings(settings);
}

/**
 * Mettre à jour les paramètres de paiement
 */
export function updatePaymentSettings(payment: PaymentSettings): void {
  const settings = loadSettings();
  settings.payment = payment;
  saveSettings(settings);
}

/**
 * Mettre à jour les paramètres de notification
 */
export function updateNotificationSettings(notifications: NotificationSettings): void {
  const settings = loadSettings();
  settings.notifications = notifications;
  saveSettings(settings);
}

/**
 * Mettre à jour les paramètres système
 */
export function updateSystemSettings(system: SystemSettings): void {
  const settings = loadSettings();
  settings.system = system;
  saveSettings(settings);
}

/**
 * Obtenir un paramètre spécifique
 */
export function getSetting<K extends keyof AppSettings>(
  category: K
): AppSettings[K] {
  const settings = loadSettings();
  return settings[category];
}

/**
 * Vérifier si le mode maintenance est activé
 */
export function isMaintenanceModeEnabled(): boolean {
  const settings = loadSettings();
  return settings.system.maintenanceMode;
}

/**
 * Activer/Désactiver le mode maintenance
 */
export function setMaintenanceMode(enabled: boolean): void {
  const settings = loadSettings();
  settings.system.maintenanceMode = enabled;
  saveSettings(settings);
}

/**
 * Réinitialiser tous les paramètres aux valeurs par défaut
 */
export function resetSettings(): void {
  saveSettings(DEFAULT_SETTINGS);
}

/**
 * Exporter les paramètres (pour backup)
 */
export function exportSettings(): string {
  const settings = loadSettings();
  return JSON.stringify(settings, null, 2);
}

/**
 * Importer les paramètres (depuis backup)
 */
export function importSettings(jsonString: string): void {
  try {
    const settings = JSON.parse(jsonString);
    // Valider la structure basique
    if (
      settings.company &&
      settings.payment &&
      settings.notifications &&
      settings.system
    ) {
      saveSettings(settings);
    } else {
      throw new Error("Format de paramètres invalide");
    }
  } catch (error) {
    console.error("Failed to import settings:", error);
    throw new Error("Impossible d'importer les paramètres");
  }
}
