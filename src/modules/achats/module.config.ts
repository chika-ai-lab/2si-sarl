import { lazy } from "react";
import { ModuleConfig } from "@/types";

export const achatsModuleConfig: ModuleConfig = {
    id: "achats",
    name: "Achats",
    version: "1.0.0",
    description: "Gestion des fournisseurs et commandes fournisseurs",
    icon: "ShoppingCart",

    enabled: true,
    isCore: false,

    requiredPermissions: [],

    dependencies: [],

    basePath: "/admin/achats",
    routes: [
        {
            path: "/",
            component: lazy(() => import("./pages/FournisseursPage")),
            exact: true
        },
        {
            path: "fournisseurs",
            component: lazy(() => import("./pages/FournisseursPage"))
        },
        {
            path: "commandes",
            component: lazy(() => import("./pages/CommandesFournisseursPage"))
        }
    ],

    navigation: [
        {
            label: "Fournisseurs",
            path: "/admin/achats/fournisseurs",
            icon: "Building2",
            section: "achats",
            order: 1
        },
        {
            label: "Commandes Achat",
            path: "/admin/achats/commandes",
            icon: "ShoppingCart",
            section: "achats",
            order: 2
        }
    ],

    settings: {}
};

export default achatsModuleConfig;
