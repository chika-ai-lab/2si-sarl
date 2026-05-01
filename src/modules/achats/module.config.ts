import { lazy } from "react";
import { ModuleConfig } from "@/types";

export const achatsModuleConfig: ModuleConfig = {
    id: "achats",
    name: "Logistique",
    version: "2.0.0",
    description: "BDC → Commandes fournisseurs → Livraisons",
    icon: "Truck",

    enabled: true,
    isCore: false,
    requiredPermissions: [],
    dependencies: [],

    basePath: "/admin/achats",
    routes: [
        {
            path: "/",
            component: lazy(() => import("./pages/BonCommandesPage")),
            exact: true,
        },
        {
            path: "bon-commandes",
            component: lazy(() => import("./pages/BonCommandesPage")),
        },
        {
            path: "commandes",
            component: lazy(() => import("./pages/CommandesFournisseursPage")),
        },
        {
            path: "livraisons",
            component: lazy(() => import("./pages/BLPage")),
        },
        {
            path: "fournisseurs",
            component: lazy(() => import("./pages/FournisseursPage")),
        },
    ],

    navigation: [
        {
            label: "Bons de Commande",
            path: "/admin/achats/bon-commandes",
            icon: "ClipboardList",
            section: "achats",
            order: 1,
        },
        {
            label: "Commandes Fournisseurs",
            path: "/admin/achats/commandes",
            icon: "ShoppingCart",
            section: "achats",
            order: 2,
        },
        {
            label: "Livraisons",
            path: "/admin/achats/livraisons",
            icon: "Truck",
            section: "achats",
            order: 3,
        },
        {
            label: "Fournisseurs",
            path: "/admin/achats/fournisseurs",
            icon: "Building2",
            section: "achats",
            order: 4,
        },
    ],

    settings: {},
};

export default achatsModuleConfig;
