import { lazy } from "react";
import { ModuleConfig } from "@/types";
import { isCommercialFeatureEnabled } from "@/config/env.config";

// Fonction helper pour filtrer les routes selon les feature flags
function filterRoutesByFeatureFlags() {
  const allRoutes = [
    // Clients
    {
      path: "/clients",
      component: lazy(() => import("./pages/ClientsPage")),
      requiresPermission: ["COMMERCIAL:CLIENTS:READ"],
      enabled: isCommercialFeatureEnabled("clients"),
    },
    {
      path: "/clients/:id",
      component: lazy(() => import("./pages/ClientDetailPage")),
      requiresPermission: ["COMMERCIAL:CLIENTS:READ"],
      enabled: isCommercialFeatureEnabled("clients"),
    },
    // Catalogue
    {
      path: "/catalogue",
      component: lazy(() => import("./pages/CataloguePage")),
      requiresPermission: ["COMMERCIAL:CATALOG:READ"],
      enabled: isCommercialFeatureEnabled("catalogue"),
    },
    // Accréditif
    {
      path: "/accreditif",
      component: lazy(() => import("./pages/AccreditifPage")),
      requiresPermission: ["COMMERCIAL:ACCREDITIF:READ"],
      enabled: isCommercialFeatureEnabled("accreditif"),
    },
    // SAV
    {
      path: "/sav",
      component: lazy(() => import("./pages/SAVPage")),
      requiresPermission: ["COMMERCIAL:SAV:READ"],
      enabled: isCommercialFeatureEnabled("sav"),
    },
    {
      path: "/sav/:id",
      component: lazy(() => import("./pages/SAVDetailPage")),
      requiresPermission: ["COMMERCIAL:SAV:READ"],
      enabled: isCommercialFeatureEnabled("sav"),
    },
    // Rapports
    {
      path: "/rapports",
      component: lazy(() => import("./pages/RapportsPage")),
      requiresPermission: ["COMMERCIAL:REPORTS:READ"],
      enabled: isCommercialFeatureEnabled("rapports"),
    },
    // Promotions
    {
      path: "/promotions",
      component: lazy(() => import("./pages/PromotionsPage")),
      requiresPermission: ["ADMIN:PROMOTIONS:WRITE"] as any,
      enabled: isCommercialFeatureEnabled("promotions"),
    },
    // Ventes (leads + devis + commandes)
    {
      path: "/ventes",
      component: lazy(() => import("./pages/VentesPage")),
      requiresPermission: ["COMMERCIAL:ORDERS:READ"],
      enabled: true,
    },
    // Vue admin — catalogue des commerciaux
    {
      path: "/commerciaux",
      component: lazy(() => import("./pages/CommerciauxPage")),
      requiresPermission: ["COMMERCIAL:ORDERS:READ"],
      enabled: true,
    },
    {
      path: "/commerciaux/:id",
      component: lazy(() => import("./pages/CommercialDetailPage")),
      requiresPermission: ["COMMERCIAL:ORDERS:READ"],
      enabled: true,
    },
  ];

  // Filtrer uniquement les routes activées
  return allRoutes
    .filter((route) => route.enabled)
    .map(({ enabled, ...route }) => route); // Retirer la propriété enabled
}

// Fonction helper pour filtrer la navigation selon les feature flags
function filterNavigationByFeatureFlags() {
  const allNavigation = [
    {
      label: "Mes Ventes",
      path: "/admin/commercial/ventes",
      icon: "TrendingUp",
      section: "sales",
      requiresPermission: ["COMMERCIAL:ORDERS:READ"],
      order: 7,
      enabled: true,
    },
    {
      label: "Clients",
      path: "/admin/commercial/clients",
      icon: "Users",
      section: "sales",
      requiresPermission: ["COMMERCIAL:CLIENTS:READ"],
      order: 8,
      enabled: isCommercialFeatureEnabled("clients"),
    },
    {
      label: "Catalogue",
      path: "/admin/commercial/catalogue",
      icon: "BookOpen",
      section: "sales",
      requiresPermission: ["COMMERCIAL:CATALOG:READ"],
      order: 11,
      enabled: isCommercialFeatureEnabled("catalogue"),
    },
    {
      label: "Accréditif",
      path: "/admin/commercial/accreditif",
      icon: "FileText",
      section: "sales",
      requiresPermission: ["COMMERCIAL:ACCREDITIF:READ"],
      order: 12,
      enabled: isCommercialFeatureEnabled("accreditif"),
    },
    {
      label: "S.A.V",
      path: "/admin/commercial/sav",
      icon: "Wrench",
      section: "sales",
      requiresPermission: ["COMMERCIAL:SAV:READ"],
      order: 14,
      enabled: isCommercialFeatureEnabled("sav"),
    },
    {
      label: "Rapports",
      path: "/admin/commercial/rapports",
      icon: "BarChart3",
      section: "sales",
      requiresPermission: ["COMMERCIAL:REPORTS:READ"],
      order: 15,
      enabled: isCommercialFeatureEnabled("rapports"),
    },
    {
      label: "Promotions",
      path: "/admin/commercial/promotions",
      icon: "Tag",
      section: "sales",
      requiresPermission: ["ADMIN:PROMOTIONS:WRITE"] as any,
      order: 16,
      enabled: isCommercialFeatureEnabled("promotions"),
    },
  ];

  // Filtrer uniquement les items de navigation activés
  return allNavigation
    .filter((item) => item.enabled)
    .map(({ enabled, ...item }) => item); // Retirer la propriété enabled
}

export const commercialModuleConfig: ModuleConfig = {
  // Identité
  id: "commercial",
  name: "Commercial",
  version: "2.0.0",
  description: "Module de gestion commerciale complète",
  icon: "ShoppingBag",

  // Activation
  enabled: true,
  isCore: false,

  // Permissions
  requiredPermissions: ["COMMERCIAL:*:READ"],

  // Dépendances
  dependencies: [],

  // Routes (filtrées par feature flags)
  basePath: "/admin/commercial",
  routes: filterRoutesByFeatureFlags(),

  // Navigation (filtrée par feature flags)
  navigation: filterNavigationByFeatureFlags(),

  // Configuration
  settings: {},
};

export default commercialModuleConfig;
