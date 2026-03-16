import { lazy } from "react";
import { ModuleConfig } from "@/types";

export const dashboardModuleConfig: ModuleConfig = {
  // Identité
  id: "dashboard",
  name: "Tableau de Bord",
  version: "1.0.0",
  description: "Vue d'ensemble des statistiques et activités",
  icon: "LayoutDashboard",

  // Activation
  enabled: true,
  isCore: true, // Module core, toujours actif

  // Permissions (aucune requise pour voir le dashboard)
  requiredPermissions: [],

  // Dépendances
  dependencies: [],

  // Routes
  basePath: "/admin",
  routes: [
    {
      path: "/",
      component: lazy(() => import("../../pages/admin/DashboardPage")),
      exact: true
    },
    {
      path: "dashboard",
      component: lazy(() => import("../../pages/admin/DashboardPage"))
    }
  ],

  // Navigation
  navigation: [
    {
      label: "Tableau de Bord",
      path: "/admin",
      icon: "LayoutDashboard",
      section: "general",
      order: 1
    }
  ],

  // Configuration
  settings: {}
};

export default dashboardModuleConfig;
