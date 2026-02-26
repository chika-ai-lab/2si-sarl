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
    },
    {
      path: "quotes",
      component: lazy(() => import("../../pages/admin/QuotesPage")),
      requiresPermission: ["ORDERS:ORDER:READ"]
    },
    {
      path: "invoices",
      component: lazy(() => import("../../pages/admin/InvoicesPage")),
      requiresPermission: ["ORDERS:ORDER:READ"]
    }
  ],

  navigation: [
    {
      label: "Commandes",
      path: "/admin/orders",
      icon: "ShoppingCart",
      section: "sales",
      requiresPermission: ["ORDERS:ORDER:READ"],
      order: 6
    },
    {
      label: "Devis",
      path: "/admin/orders/quotes",
      icon: "FileText",
      section: "sales",
      requiresPermission: ["ORDERS:ORDER:READ"],
      order: 7
    },
    {
      label: "Factures",
      path: "/admin/orders/invoices",
      icon: "Receipt",
      section: "sales",
      requiresPermission: ["ORDERS:ORDER:READ"],
      order: 8
    }
  ],

  settings: {}
};

export default ordersModuleConfig;
