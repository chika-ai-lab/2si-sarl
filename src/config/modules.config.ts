import { ModuleConfig, User, NavigationItem } from "@/types";
import { hasPermission, hasModuleAccess } from "@/core/auth/services/permissionService";
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
    enabled: isModuleEnabled('achats') ?? true,
  },
};

/**
 * Récupère les modules actifs pour l'utilisateur courant
 */
export function getActiveModules(user: User | null): ModuleConfig[] {
  if (!user) return [];

  return Object.values(MODULES_REGISTRY)
    .filter((module) => {
      // 1. Vérifier si le module est activé
      if (!module.enabled) return false;

      // 2. Les modules core sont toujours accessibles
      if (module.isCore) return true;

      // 3. Vérifier si l'utilisateur a accès au module (admin bypass dans hasModuleAccess)
      if (!hasModuleAccess(user, module.id)) return false;

      // 4. Vérifier si l'utilisateur a les permissions requises
      if (module.requiredPermissions.length > 0) {
        const hasAllPermissions = module.requiredPermissions.every((permission) =>
          hasPermission(user, permission)
        );
        if (!hasAllPermissions) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Trier par ordre (si défini dans navigation)
      const orderA = a.navigation[0]?.order || 999;
      const orderB = b.navigation[0]?.order || 999;
      return orderA - orderB;
    });
}

/**
 * Récupère la navigation pour les modules actifs
 */
export function getModuleNavigation(user: User | null): NavigationItem[] {
  if (!user) return [];

  const activeModules = getActiveModules(user);

  const navigationItems = activeModules
    .flatMap((module) =>
      module.navigation.filter((navItem) => {
        // Vérifier si l'utilisateur a les permissions pour cet item de navigation
        if (!navItem.requiresPermission || navItem.requiresPermission.length === 0) {
          return true;
        }

        return navItem.requiresPermission.every((permission) =>
          hasPermission(user, permission)
        );
      })
    )
    .sort((a, b) => {
      const orderA = a.order || 999;
      const orderB = b.order || 999;
      return orderA - orderB;
    });

  return navigationItems;
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
