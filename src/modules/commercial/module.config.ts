import { lazy } from "react";
import { ModuleConfig } from "@/types";

export const commercialModuleConfig: ModuleConfig = {
  id: "commercial",
  name: "Commercial",
  version: "1.0.0",
  description: "Gestion commerciale et paramètres",
  icon: "Settings",

  enabled: true,
  isCore: false,

  requiredPermissions: ["COMMERCIAL:SETTINGS:READ"],
  dependencies: [],

  basePath: "/admin/settings",
  routes: [
    {
      path: "/",
      component: lazy(() => import("../../pages/admin/SettingsPage")),
      requiresPermission: ["COMMERCIAL:SETTINGS:READ"],
      exact: true
    }
  ],

  navigation: [
    {
      label: "Paramètres",
      path: "/admin/settings",
      icon: "Settings",
      section: "system",
      requiresPermission: ["COMMERCIAL:SETTINGS:READ"],
      order: 13
    }
  ],

  settings: {}
};

export default commercialModuleConfig;
