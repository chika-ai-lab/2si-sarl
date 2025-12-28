import { lazy } from "react";
import { ModuleConfig } from "@/types";

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

  // Routes
  basePath: "/admin/commercial",
  routes: [
    // Vue principale
    {
      path: "/",
      component: lazy(() => import("./pages/CommercialDashboard")),
      exact: true
    },
    // Clients
    {
      path: "/clients",
      component: lazy(() => import("./pages/ClientsPage")),
      requiresPermission: ["COMMERCIAL:CLIENTS:READ"]
    },
    {
      path: "/clients/:id",
      component: lazy(() => import("./pages/ClientDetailPage")),
      requiresPermission: ["COMMERCIAL:CLIENTS:READ"]
    },
    // Commandes
    {
      path: "/commandes",
      component: lazy(() => import("./pages/CommandesPage")),
      requiresPermission: ["COMMERCIAL:ORDERS:READ"]
    },
    {
      path: "/commandes/:id",
      component: lazy(() => import("./pages/CommandeDetailPage")),
      requiresPermission: ["COMMERCIAL:ORDERS:READ"]
    },
    // Scan BL
    {
      path: "/scan-bl",
      component: lazy(() => import("./pages/ScanBLPage")),
      requiresPermission: ["COMMERCIAL:SCAN:READ"]
    },
    // Catalogue (groupé par banque)
    {
      path: "/catalogue",
      component: lazy(() => import("./pages/CataloguePage")),
      requiresPermission: ["COMMERCIAL:CATALOG:READ"]
    },
    // Accréditif (intégré dans les commandes/documents)
    {
      path: "/accreditif",
      component: lazy(() => import("./pages/AccreditifPage")),
      requiresPermission: ["COMMERCIAL:ACCREDITIF:READ"]
    },
    // Tableau de simulation
    {
      path: "/simulation",
      component: lazy(() => import("./pages/SimulationPage")),
      requiresPermission: ["COMMERCIAL:SIMULATION:READ"]
    },
    // SAV - Service Après-Vente
    {
      path: "/sav",
      component: lazy(() => import("./pages/SAVPage")),
      requiresPermission: ["COMMERCIAL:SAV:READ"]
    },
    {
      path: "/sav/:id",
      component: lazy(() => import("./pages/SAVDetailPage")),
      requiresPermission: ["COMMERCIAL:SAV:READ"]
    },
    // Rapports
    {
      path: "/rapports",
      component: lazy(() => import("./pages/RapportsPage")),
      requiresPermission: ["COMMERCIAL:REPORTS:READ"]
    }
  ],

  // Navigation
  navigation: [
    {
      label: "Commercial",
      path: "/admin/commercial",
      icon: "ShoppingBag",
      section: "sales",
      order: 7
    },
    {
      label: "Clients",
      path: "/admin/commercial/clients",
      icon: "Users",
      section: "sales",
      requiresPermission: ["COMMERCIAL:CLIENTS:READ"],
      order: 8
    },
    {
      label: "Commandes",
      path: "/admin/commercial/commandes",
      icon: "ShoppingCart",
      section: "sales",
      requiresPermission: ["COMMERCIAL:ORDERS:READ"],
      order: 9
    },
    {
      label: "Scan BL",
      path: "/admin/commercial/scan-bl",
      icon: "ScanLine",
      section: "sales",
      requiresPermission: ["COMMERCIAL:SCAN:READ"],
      order: 10
    },
    {
      label: "Catalogue",
      path: "/admin/commercial/catalogue",
      icon: "BookOpen",
      section: "sales",
      requiresPermission: ["COMMERCIAL:CATALOG:READ"],
      order: 11
    },
    {
      label: "Accréditif",
      path: "/admin/commercial/accreditif",
      icon: "FileText",
      section: "sales",
      requiresPermission: ["COMMERCIAL:ACCREDITIF:READ"],
      order: 12
    },
    {
      label: "Tableau de Simulation",
      path: "/admin/commercial/simulation",
      icon: "Calculator",
      section: "sales",
      requiresPermission: ["COMMERCIAL:SIMULATION:READ"],
      order: 13
    },
    {
      label: "S.A.V",
      path: "/admin/commercial/sav",
      icon: "Wrench",
      section: "sales",
      requiresPermission: ["COMMERCIAL:SAV:READ"],
      order: 14
    },
    {
      label: "Rapports",
      path: "/admin/commercial/rapports",
      icon: "BarChart3",
      section: "sales",
      requiresPermission: ["COMMERCIAL:REPORTS:READ"],
      order: 15
    }
  ],

  // Configuration
  settings: {}
};

export default commercialModuleConfig;
