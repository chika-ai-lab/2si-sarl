import { lazy } from "react";
import { ModuleConfig } from "@/types";

export const reportsModuleConfig: ModuleConfig = {
  id: "reports",
  name: "Rapports",
  version: "1.0.0",
  description: "Rapports et statistiques",
  icon: "BarChart3",

  enabled: true,
  isCore: false,

  requiredPermissions: ["REPORTS:REPORT:READ"],
  dependencies: [],

  basePath: "/admin/reports",
  routes: [
    {
      path: "/",
      component: lazy(() => import("../../pages/admin/ReportsPage")),
      requiresPermission: ["REPORTS:REPORT:READ"],
      exact: true
    }
  ],

  navigation: [],

  settings: {}
};

export default reportsModuleConfig;
