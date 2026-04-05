import { ModuleConfig, User, NavigationItem } from "@/types";
import { hasModuleAccess } from "@/core/auth/services/permissionService";
import { isModuleEnabled, isCommercialFeatureEnabled } from "@/config/env.config";

// Import modules configurations
import dashboardModule from "@/modules/dashboard/module.config";
import crmModule from "@/modules/crm/module.config";
import ordersModule from "@/modules/orders/module.config";
import productsModule from "@/modules/products/module.config";
import reportsModule from "@/modules/reports/module.config";
import commercialModule from "@/modules/commercial/module.config";
import adminModule from "@/modules/admin/module.config";
import achatsModule from "@/modules/achats/module.config";

/**
 * Registre central de tous les modules de la plateforme
 * L'activation des modules est contrôlée par les variables d'environnement
 */
export const MODULES_REGISTRY: Record<string, ModuleConfig> = {
  dashboard: {
    ...dashboardModule,
    enabled: true, // Toujours activé (core module)
  },
  crm: {
    ...crmModule,
    enabled: isModuleEnabled('crm') && crmModule.enabled,
  },
  orders: {
    ...ordersModule,
    enabled: isModuleEnabled('orders') && ordersModule.enabled,
  },
  products: {
    ...productsModule,
    enabled: isModuleEnabled('products') && productsModule.enabled,
  },
  reports: {
    ...reportsModule,
    enabled: isModuleEnabled('reports') && reportsModule.enabled,
  },
  commercial: {
    ...commercialModule,
    enabled: isModuleEnabled('commercial') && commercialModule.enabled,
  },
  admin: {
    ...adminModule,
    enabled: true,
  },
  achats: {
    ...achatsModule,
    enabled: true,
  },
};

/**
 * Récupère les modules actifs pour l'utilisateur courant
 */
export function getActiveModules(user: User | null): ModuleConfig[] {
  if (!user) return [];

  return Object.values(MODULES_REGISTRY)
    .filter((module) => {
      // 1. Vérifier si le module est activé globalement
      if (!module.enabled) return false;

      // 2. Les modules core (dashboard) sont toujours accessibles aux utilisateurs connectés
      if (module.isCore) return true;

      // 3. Accès au module défini par user.moduleAccess (construit au login via ROLE_CONFIG)
      //    La protection fine est assurée par requiresPermission sur chaque route.
      return hasModuleAccess(user, module.id);
    })
    .sort((a, b) => {
      // Trier par ordre (si défini dans navigation)
      const orderA = a.navigation[0]?.order || 999;
      const orderB = b.navigation[0]?.order || 999;
      return orderA - orderB;
    });
}

// ─────────────────────────────────────────────────────────────
// Navigation par rôle — source unique de vérité pour le sidebar
// ─────────────────────────────────────────────────────────────
const NAV_GENERAL: NavigationItem[] = [
  { label: "Tableau de Bord", path: "/admin", icon: "LayoutDashboard", section: "general", order: 0 },
];

// Nav for commercial users (their own sales)
const NAV_COMMERCIAL: NavigationItem[] = [
  { label: "Mes Ventes",  path: "/admin/commercial/ventes",      icon: "TrendingUp",  section: "commercial", order: 1 },
  { label: "Clients",     path: "/admin/commercial/clients",     icon: "Users",       section: "commercial", order: 2 },
  { label: "Accréditif",  path: "/admin/commercial/accreditif",  icon: "CreditCard",  section: "commercial", order: 3 },
  { label: "SAV",         path: "/admin/commercial/sav",         icon: "Wrench",      section: "commercial", order: 4 },
  { label: "Rapports",    path: "/admin/commercial/rapports",    icon: "BarChart3",   section: "commercial", order: 5 },
];

// Nav for admin — shows team overview instead of personal sales
const NAV_COMMERCIAL_ADMIN: NavigationItem[] = [
  { label: "Commerciales", path: "/admin/commercial/commerciaux", icon: "Users2",     section: "commercial", order: 1 },
  { label: "Clients",      path: "/admin/commercial/clients",     icon: "Users",      section: "commercial", order: 2 },
  { label: "Accréditif",   path: "/admin/commercial/accreditif",  icon: "CreditCard", section: "commercial", order: 3 },
  { label: "SAV",          path: "/admin/commercial/sav",         icon: "Wrench",     section: "commercial", order: 4 },
  { label: "Rapports",     path: "/admin/commercial/rapports",    icon: "BarChart3",  section: "commercial", order: 5 },
];

const NAV_LOGISTIQUE: NavigationItem[] = [
  { label: "Livraisons",             path: "/admin/achats/livraisons",      icon: "Truck",       section: "logistique", order: 1 },
  { label: "Catalogue",              path: "/admin/commercial/catalogue",   icon: "BookOpen",    section: "logistique", order: 2 },
  { label: "Fournisseurs",           path: "/admin/achats/fournisseurs",    icon: "Building2",   section: "logistique", order: 3 },
  { label: "Commandes Fournisseurs", path: "/admin/achats/commandes",       icon: "ShoppingCart",section: "logistique", order: 4 },
  { label: "Clients",                path: "/admin/commercial/clients",     icon: "Users",       section: "logistique", order: 5 },
  { label: "SAV",                    path: "/admin/commercial/sav",         icon: "Wrench",      section: "logistique", order: 6 },
];

const NAV_COMPTABILITE: NavigationItem[] = [
  { label: "Devis",        path: "/admin/orders/quotes",          icon: "FileText",    section: "comptabilite", order: 1 },
  { label: "Factures",     path: "/admin/orders/invoices",        icon: "Receipt",     section: "comptabilite", order: 2 },
  { label: "Fournisseurs", path: "/admin/achats/fournisseurs",    icon: "Building2",   section: "comptabilite", order: 3 },
  { label: "Clients",      path: "/admin/commercial/clients",     icon: "Users",       section: "comptabilite", order: 4 },
];

const NAV_PRODUITS: NavigationItem[] = [
  { label: "Catalogue",  path: "/admin/commercial/catalogue", icon: "BookOpen", section: "produits", order: 1 },
  { label: "Inventaire", path: "/admin/products/inventory",   icon: "Warehouse", section: "produits", order: 2 },
];

const NAV_ADMIN: NavigationItem[] = [
  { label: "Utilisateurs", path: "/admin/settings/users", icon: "Users",  section: "admin", order: 1 },
  { label: "Rôles",        path: "/admin/settings/roles", icon: "Shield", section: "admin", order: 2 },
];

/**
 * Récupère la navigation selon le rôle de l'utilisateur.
 * Admin → tout, groupé par rôle.
 * Autres → uniquement leur section + tableau de bord.
 */
export function getModuleNavigation(user: User | null): NavigationItem[] {
  if (!user) return [];

  const rolesLower = user.roles.map((r) => r.toLowerCase().trim());
  const isAdmin       = rolesLower.some(r => ["admin", "super_admin"].includes(r));
  const isCommercial  = rolesLower.some(r => ["commercial", "vendeur", "vendeuse", "sales"].includes(r));
  const isLogistique  = rolesLower.some(r => ["logistique", "logistic"].includes(r));
  const isComptable   = rolesLower.some(r => ["comptabilite", "comptable"].includes(r));

  if (isAdmin) {
    return [
      ...NAV_GENERAL,
      ...NAV_COMMERCIAL_ADMIN,
      ...NAV_LOGISTIQUE,
      ...NAV_COMPTABILITE,
      ...NAV_PRODUITS,
      ...NAV_ADMIN,
    ];
  }

  if (isCommercial)  return [...NAV_GENERAL, ...NAV_COMMERCIAL];
  if (isLogistique)  return [...NAV_GENERAL, ...NAV_LOGISTIQUE];
  if (isComptable)   return [...NAV_GENERAL, ...NAV_COMPTABILITE];

  // Fallback : dashboard uniquement
  return NAV_GENERAL;
}

/**
 * Récupère un module par son ID
 */
export function getModuleById(moduleId: string): ModuleConfig | undefined {
  return MODULES_REGISTRY[moduleId];
}

/**
 * Vérifie si un module est actif
 */
export function isModuleActive(moduleId: string): boolean {
  const module = MODULES_REGISTRY[moduleId];
  return module?.enabled ?? false;
}
