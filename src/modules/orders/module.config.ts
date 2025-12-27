import { lazy } from "react";
import { ModuleConfig } from "@/types";

export const ordersModuleConfig: ModuleConfig = {
  id: "orders",
  name: "Commandes",
  version: "1.0.0",
  description: "Gestion des commandes",
  icon: "ShoppingCart",

  enabled: true,
  isCore: false,

  requiredPermissions: ["ORDERS:ORDER:READ"],
  dependencies: [],

  basePath: "/admin/orders",
  routes: [
    {
      path: "/",
      component: lazy(() => import("../../pages/admin/OrdersPage")),
      requiresPermission: ["ORDERS:ORDER:READ"],
      exact: true
    }
  ],

  navigation: [
    {
      label: "Commandes",
      path: "/admin/orders",
      icon: "ShoppingCart",
      requiresPermission: ["ORDERS:ORDER:READ"],
      order: 3
    }
  ],

  settings: {}
};

export default ordersModuleConfig;
