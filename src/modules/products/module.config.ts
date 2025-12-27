import { lazy } from "react";
import { ModuleConfig } from "@/types";

export const productsModuleConfig: ModuleConfig = {
  id: "products",
  name: "Produits",
  version: "1.0.0",
  description: "Gestion du catalogue produits",
  icon: "Package",

  enabled: true,
  isCore: false,

  requiredPermissions: ["PRODUCTS:PRODUCT:READ"],
  dependencies: [],

  basePath: "/admin/products",
  routes: [
    {
      path: "/",
      component: lazy(() => import("../../pages/admin/ProductsPage")),
      requiresPermission: ["PRODUCTS:PRODUCT:READ"],
      exact: true
    }
  ],

  navigation: [
    {
      label: "Produits",
      path: "/admin/products",
      icon: "Package",
      requiresPermission: ["PRODUCTS:PRODUCT:READ"],
      order: 4
    }
  ],

  settings: {}
};

export default productsModuleConfig;
