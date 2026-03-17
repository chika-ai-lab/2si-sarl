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
    },
    {
      path: "/categories",
      component: lazy(() => import("../../pages/admin/CategoriesPage")),
      requiresPermission: ["PRODUCTS:PRODUCT:READ"]
    },
    {
      path: "/inventory",
      component: lazy(() => import("../../pages/admin/InventoryPage")),
      requiresPermission: ["PRODUCTS:PRODUCT:READ"]
    }
  ],

  navigation: [
    {
      label: "Catégories",
      path: "/admin/products/categories",
      icon: "FolderOpen",
      section: "sales",
      requiresPermission: ["PRODUCTS:PRODUCT:READ"],
      order: 10
    },
    {
      label: "Inventaire",
      path: "/admin/products/inventory",
      icon: "Warehouse",
      section: "sales",
      requiresPermission: ["PRODUCTS:PRODUCT:READ"],
      order: 11
    }
  ],

  settings: {}
};

export default productsModuleConfig;
