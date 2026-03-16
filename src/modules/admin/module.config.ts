import { lazy } from "react";
import { ModuleConfig } from "@/types";

export const adminModuleConfig: ModuleConfig = {
    id: "admin",
    name: "Administration",
    version: "1.0.0",
    description: "Gestion des utilisateurs, rôles, et permissions système",
    icon: "Settings",

    enabled: true,
    isCore: false,

    // Requiert le rôle admin ou une permission spécifique
    requiredPermissions: ["ADMIN:USERS:READ"],

    dependencies: [],

    basePath: "/admin/settings",
    routes: [
        {
            path: "/",
            component: lazy(() => import("./pages/UsersPage")),
            exact: true
        },
        {
            path: "users",
            component: lazy(() => import("./pages/UsersPage"))
        }
    ],

    navigation: [
        {
            label: "Utilisateurs",
            path: "/admin/settings/users",
            icon: "Users",
            section: "admin",
            order: 1
        }
    ],

    settings: {}
};

export default adminModuleConfig;
