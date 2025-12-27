import { lazy } from "react";
import { ModuleConfig } from "@/types";

export const crmModuleConfig: ModuleConfig = {
  // Identité
  id: "crm",
  name: "Gestion Clients",
  version: "1.0.0",
  description: "Gestion de la relation client (CRM)",
  icon: "Users",

  // Activation
  enabled: true,
  isCore: false,

  // Permissions requises
  requiredPermissions: ["CRM:CUSTOMER:READ"],

  // Dépendances
  dependencies: [],

  // Routes
  basePath: "/admin/crm",
  routes: [
    {
      path: "/",
      component: lazy(() => import("../../pages/admin/CustomersPage")),
      requiresPermission: ["CRM:CUSTOMER:READ"],
      exact: true
    },
    {
      path: "/customers",
      component: lazy(() => import("../../pages/admin/CustomersPage")),
      requiresPermission: ["CRM:CUSTOMER:READ"]
    }
  ],

  // Navigation
  navigation: [
    {
      label: "Clients",
      path: "/admin/crm/customers",
      icon: "Users",
      requiresPermission: ["CRM:CUSTOMER:READ"],
      order: 2
    }
  ],

  // Configuration
  settings: {
    defaultView: "list"
  }
};

export default crmModuleConfig;
