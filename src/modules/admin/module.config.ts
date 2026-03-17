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
        },
        {
            path: "roles",
            component: lazy(() => import("./pages/RolesPage"))
        }
    ],

    navigation: [
        {
            label: "Utilisateurs",
            path: "/admin/settings/users",
            icon: "Users",
            section: "admin",
            order: 20
        },
        {
            label: "Rôles",
            path: "/admin/settings/roles",
            icon: "Shield",
            section: "admin",
            order: 21
        }
    ],

    settings: {}
};

export default adminModuleConfig;
