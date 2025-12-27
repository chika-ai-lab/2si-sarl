# Architecture V2 - Plateforme Modulaire 2SI.Sarl

## 📋 Vue d'ensemble

Ce document décrit l'architecture cible pour la **Version 2** de la plateforme e-commerce 2SI.Sarl, conçue comme un système modulaire évolutif avec gestion avancée des rôles et permissions.

### Objectifs V2

1. **Architecture modulaire** - Modules indépendants activables/désactivables
2. **Système de permissions granulaires** - Contrôle d'accès par module, ressource et action
3. **Livraison progressive** - Modules livrés par phases
4. **Scalabilité** - Faciliter l'ajout de nouveaux modules
5. **Stabilité V1** - Maintenir toutes les fonctionnalités existantes

---

## 🏗️ Architecture Modulaire

### Structure des Dossiers V2

```
src/
├── core/                          # Fonctionnalités core (toujours actives)
│   ├── auth/                     # Authentification & autorisation
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── PermissionGate.tsx
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   └── permissionService.ts
│   │   ├── providers/
│   │   │   └── AuthProvider.tsx
│   │   ├── types/
│   │   │   ├── User.ts
│   │   │   ├── Role.ts
│   │   │   └── Permission.ts
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── usePermissions.ts
│   │       └── useRoles.ts
│   │
│   ├── api/                      # Couche d'abstraction API
│   │   ├── client.ts            # Configuration axios/fetch
│   │   ├── endpoints.ts         # Constantes d'endpoints
│   │   ├── interceptors.ts      # Auth, errors, logging
│   │   └── types.ts             # Types API (Request, Response)
│   │
│   ├── layout/                   # Layouts principaux
│   │   ├── MainLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── ModularSidebar.tsx   # Navigation dynamique
│   │   └── Header.tsx
│   │
│   ├── router/                   # Système de routing modulaire
│   │   ├── ModuleRouter.tsx
│   │   ├── RouteRegistry.ts
│   │   └── ProtectedModuleRoute.tsx
│   │
│   └── registry/                 # Registre des modules
│       ├── ModuleRegistry.ts
│       ├── ModuleLoader.ts
│       └── ModuleContext.tsx
│
├── modules/                       # Modules métier
│   │
│   ├── dashboard/                # Module Tableau de Bord (V1)
│   │   ├── index.ts             # Module entry point
│   │   ├── module.config.ts     # Configuration du module
│   │   ├── components/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RecentOrders.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── pages/
│   │   │   └── DashboardPage.tsx
│   │   ├── services/
│   │   │   └── dashboardService.ts
│   │   ├── hooks/
│   │   │   └── useDashboardStats.ts
│   │   └── types/
│   │       └── DashboardTypes.ts
│   │
│   ├── crm/                      # Module G.R Client (V1 + V2)
│   │   ├── index.ts
│   │   ├── module.config.ts
│   │   ├── components/
│   │   │   ├── CustomerCard.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── LeadKanban.tsx   # V2
│   │   │   └── CustomerTimeline.tsx
│   │   ├── pages/
│   │   │   ├── CustomersListPage.tsx
│   │   │   ├── CustomerDetailPage.tsx
│   │   │   ├── LeadsPage.tsx    # V2
│   │   │   └── PipelinePage.tsx # V2
│   │   ├── services/
│   │   │   ├── customerService.ts
│   │   │   ├── leadService.ts
│   │   │   └── crmApi.ts
│   │   ├── hooks/
│   │   │   ├── useCustomers.ts
│   │   │   └── useLeads.ts
│   │   └── types/
│   │       ├── Customer.ts
│   │       ├── Lead.ts
│   │       └── CRMTypes.ts
│   │
│   ├── orders/                   # Module Commandes (V1)
│   │   ├── index.ts
│   │   ├── module.config.ts
│   │   ├── components/
│   │   │   ├── OrderTable.tsx
│   │   │   ├── OrderDetails.tsx
│   │   │   ├── OrderStatus.tsx
│   │   │   └── OrderPDF.tsx
│   │   ├── pages/
│   │   │   ├── OrdersListPage.tsx
│   │   │   └── OrderDetailPage.tsx
│   │   ├── services/
│   │   │   ├── orderService.ts
│   │   │   └── ordersApi.ts
│   │   ├── hooks/
│   │   │   └── useOrders.ts
│   │   └── types/
│   │       ├── Order.ts
│   │       └── OrderTypes.ts
│   │
│   ├── products/                 # Module Produits (V1)
│   │   ├── index.ts
│   │   ├── module.config.ts
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   └── ProductImport.tsx
│   │   ├── pages/
│   │   │   ├── ProductsListPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   └── CategoriesPage.tsx
│   │   ├── services/
│   │   │   ├── productService.ts
│   │   │   ├── categoryService.ts
│   │   │   └── productsApi.ts
│   │   ├── hooks/
│   │   │   ├── useProducts.ts
│   │   │   └── useCategories.ts
│   │   └── types/
│   │       ├── Product.ts
│   │       ├── Category.ts
│   │       └── ProductTypes.ts
│   │
│   ├── commercial/               # Module Commercial (V1 + V2)
│   │   ├── index.ts
│   │   ├── module.config.ts
│   │   ├── components/
│   │   │   ├── PaymentPlanSelector.tsx
│   │   │   ├── PromoManager.tsx
│   │   │   ├── QuoteGenerator.tsx    # V2
│   │   │   └── CommissionTracker.tsx # V2
│   │   ├── pages/
│   │   │   ├── PaymentPlansPage.tsx
│   │   │   ├── PromotionsPage.tsx
│   │   │   ├── QuotesPage.tsx        # V2
│   │   │   └── CommissionsPage.tsx   # V2
│   │   ├── services/
│   │   │   ├── paymentService.ts
│   │   │   ├── promoService.ts
│   │   │   └── commercialApi.ts
│   │   └── types/
│   │       ├── PaymentPlan.ts
│   │       ├── Promotion.ts
│   │       └── CommercialTypes.ts
│   │
│   ├── reports/                  # Module Rapports (V1)
│   │   ├── index.ts
│   │   ├── module.config.ts
│   │   ├── components/
│   │   │   ├── ReportBuilder.tsx
│   │   │   ├── ChartWidget.tsx
│   │   │   └── ReportPDF.tsx
│   │   ├── pages/
│   │   │   ├── ReportsListPage.tsx
│   │   │   └── ReportDetailPage.tsx
│   │   ├── services/
│   │   │   ├── reportService.ts
│   │   │   └── reportsApi.ts
│   │   └── types/
│   │       └── ReportTypes.ts
│   │
│   ├── suppliers/                # Module Fournisseurs (V2 - préparé)
│   │   ├── index.ts
│   │   ├── module.config.ts     # enabled: false (pour l'instant)
│   │   ├── types/                # Types uniquement pour V2
│   │   │   └── Supplier.ts
│   │   └── README.md             # Documentation pour future implémentation
│   │
│   ├── logistics/                # Module Logistique (V2 - préparé)
│   │   ├── index.ts
│   │   ├── module.config.ts     # enabled: false
│   │   ├── types/
│   │   │   ├── Shipment.ts
│   │   │   └── Reception.ts
│   │   └── README.md
│   │
│   ├── users/                    # Module Utilisateurs (V2 - préparé)
│   │   ├── index.ts
│   │   ├── module.config.ts     # enabled: false
│   │   ├── types/
│   │   │   ├── User.ts
│   │   │   ├── Role.ts
│   │   │   └── Permission.ts
│   │   └── README.md
│   │
│   └── settings/                 # Module Paramètres (V2 - préparé)
│       ├── index.ts
│       ├── module.config.ts     # enabled: false
│       ├── types/
│       │   ├── Region.ts
│       │   ├── Agency.ts
│       │   └── Commission.ts
│       └── README.md
│
├── shared/                        # Code partagé entre modules
│   ├── components/               # Composants UI réutilisables
│   │   └── ui/                  # shadcn/ui components
│   ├── hooks/                   # Hooks communs
│   ├── utils/                   # Utilitaires
│   ├── types/                   # Types partagés
│   └── constants/               # Constantes globales
│
├── config/                        # Configuration globale
│   ├── app.config.ts
│   ├── modules.config.ts        # Configuration des modules
│   ├── permissions.config.ts    # Définition des permissions
│   └── roles.config.ts          # Définition des rôles
│
└── types/                         # Types TypeScript globaux
    ├── entities/                 # Entités métier centralisées
    │   ├── User.ts
    │   ├── Order.ts
    │   ├── Product.ts
    │   ├── Customer.ts
    │   └── index.ts
    └── api/                      # Types API
        ├── requests.ts
        ├── responses.ts
        └── index.ts
```

---

## 🔐 Système de Permissions

### Modèle de Permissions

```typescript
// types/entities/Permission.ts

/**
 * Structure d'une permission
 * Format: "MODULE:RESOURCE:ACTION"
 * Exemple: "CRM:CUSTOMER:WRITE"
 */
export interface Permission {
  id: string;
  module: string;        // Module concerné (CRM, ORDERS, etc.)
  resource: string;      // Ressource (CUSTOMER, ORDER, PRODUCT, etc.)
  action: PermissionAction;
  description: string;
}

export enum PermissionAction {
  READ = "READ",         // Lecture seule
  WRITE = "WRITE",       // Création et modification
  DELETE = "DELETE",     // Suppression
  ADMIN = "ADMIN"        // Administration complète
}

/**
 * Format string simplifié pour les vérifications
 */
export type PermissionString = `${string}:${string}:${PermissionAction}`;

// Exemples
type Examples =
  | "CRM:CUSTOMER:READ"
  | "CRM:CUSTOMER:WRITE"
  | "ORDERS:ORDER:ADMIN"
  | "PRODUCTS:PRODUCT:DELETE";
```

### Modèle de Rôles

```typescript
// types/entities/Role.ts

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: PermissionString[];
  isSystemRole: boolean;     // Rôle système non modifiable
  moduleAccess: ModuleAccess[];
  createdAt: string;
  updatedAt: string;
}

export interface ModuleAccess {
  moduleId: string;
  enabled: boolean;
  permissions: PermissionString[];
}

/**
 * Rôles prédéfinis du système
 */
export enum SystemRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MANAGER = "manager",
  STAFF = "staff",
  CLIENT = "client"
}
```

### Modèle Utilisateur Étendu

```typescript
// types/entities/User.ts

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;

  // Rôles et permissions
  roles: string[];                    // IDs des rôles assignés
  customPermissions: PermissionString[]; // Permissions additionnelles

  // Accès aux modules
  moduleAccess: {
    moduleId: string;
    enabled: boolean;
  }[];

  // Métadonnées
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended"
}
```

### Configuration des Permissions par Module

```typescript
// config/permissions.config.ts

export const PERMISSIONS_REGISTRY: Record<string, Permission[]> = {
  // Module CRM
  CRM: [
    {
      id: "crm_customer_read",
      module: "CRM",
      resource: "CUSTOMER",
      action: PermissionAction.READ,
      description: "Voir la liste des clients et leurs détails"
    },
    {
      id: "crm_customer_write",
      module: "CRM",
      resource: "CUSTOMER",
      action: PermissionAction.WRITE,
      description: "Créer et modifier des clients"
    },
    {
      id: "crm_customer_delete",
      module: "CRM",
      resource: "CUSTOMER",
      action: PermissionAction.DELETE,
      description: "Supprimer des clients"
    },
    {
      id: "crm_lead_read",
      module: "CRM",
      resource: "LEAD",
      action: PermissionAction.READ,
      description: "Voir les prospects"
    },
    {
      id: "crm_lead_write",
      module: "CRM",
      resource: "LEAD",
      action: PermissionAction.WRITE,
      description: "Gérer les prospects"
    }
  ],

  // Module ORDERS
  ORDERS: [
    {
      id: "orders_order_read",
      module: "ORDERS",
      resource: "ORDER",
      action: PermissionAction.READ,
      description: "Voir les commandes"
    },
    {
      id: "orders_order_write",
      module: "ORDERS",
      resource: "ORDER",
      action: PermissionAction.WRITE,
      description: "Créer et modifier des commandes"
    },
    {
      id: "orders_order_admin",
      module: "ORDERS",
      resource: "ORDER",
      action: PermissionAction.ADMIN,
      description: "Administration complète des commandes"
    }
  ],

  // Module PRODUCTS
  PRODUCTS: [
    {
      id: "products_product_read",
      module: "PRODUCTS",
      resource: "PRODUCT",
      action: PermissionAction.READ,
      description: "Voir le catalogue produits"
    },
    {
      id: "products_product_write",
      module: "PRODUCTS",
      resource: "PRODUCT",
      action: PermissionAction.WRITE,
      description: "Gérer les produits"
    },
    {
      id: "products_category_admin",
      module: "PRODUCTS",
      resource: "CATEGORY",
      action: PermissionAction.ADMIN,
      description: "Gérer les catégories"
    }
  ],

  // Module REPORTS
  REPORTS: [
    {
      id: "reports_view",
      module: "REPORTS",
      resource: "REPORT",
      action: PermissionAction.READ,
      description: "Consulter les rapports"
    },
    {
      id: "reports_export",
      module: "REPORTS",
      resource: "EXPORT",
      action: PermissionAction.WRITE,
      description: "Exporter les rapports"
    }
  ],

  // Module SETTINGS
  SETTINGS: [
    {
      id: "settings_admin",
      module: "SETTINGS",
      resource: "SETTINGS",
      action: PermissionAction.ADMIN,
      description: "Administration des paramètres système"
    }
  ]
};
```

### Configuration des Rôles Prédéfinis

```typescript
// config/roles.config.ts

export const SYSTEM_ROLES: Record<SystemRole, Role> = {
  // Super Admin - Accès total
  [SystemRole.SUPER_ADMIN]: {
    id: "super_admin",
    name: "Super Administrateur",
    description: "Accès complet à toutes les fonctionnalités",
    permissions: ["*:*:*"], // Wildcard = toutes les permissions
    isSystemRole: true,
    moduleAccess: [], // Accès à tous les modules
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Admin - Gestion complète sauf paramètres système
  [SystemRole.ADMIN]: {
    id: "admin",
    name: "Administrateur",
    description: "Gestion de la plateforme",
    permissions: [
      "CRM:*:*",
      "ORDERS:*:*",
      "PRODUCTS:*:*",
      "REPORTS:*:READ",
      "COMMERCIAL:*:*"
    ],
    isSystemRole: true,
    moduleAccess: [
      { moduleId: "dashboard", enabled: true, permissions: [] },
      { moduleId: "crm", enabled: true, permissions: ["CRM:*:*"] },
      { moduleId: "orders", enabled: true, permissions: ["ORDERS:*:*"] },
      { moduleId: "products", enabled: true, permissions: ["PRODUCTS:*:*"] },
      { moduleId: "reports", enabled: true, permissions: ["REPORTS:*:READ"] },
      { moduleId: "commercial", enabled: true, permissions: ["COMMERCIAL:*:*"] }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Manager - Gestion opérationnelle
  [SystemRole.MANAGER]: {
    id: "manager",
    name: "Responsable",
    description: "Gestion des opérations quotidiennes",
    permissions: [
      "CRM:CUSTOMER:READ",
      "CRM:CUSTOMER:WRITE",
      "CRM:LEAD:*",
      "ORDERS:ORDER:READ",
      "ORDERS:ORDER:WRITE",
      "PRODUCTS:PRODUCT:READ",
      "REPORTS:REPORT:READ"
    ],
    isSystemRole: true,
    moduleAccess: [
      { moduleId: "dashboard", enabled: true, permissions: [] },
      { moduleId: "crm", enabled: true, permissions: ["CRM:CUSTOMER:READ", "CRM:CUSTOMER:WRITE"] },
      { moduleId: "orders", enabled: true, permissions: ["ORDERS:ORDER:READ", "ORDERS:ORDER:WRITE"] },
      { moduleId: "products", enabled: true, permissions: ["PRODUCTS:PRODUCT:READ"] },
      { moduleId: "reports", enabled: true, permissions: ["REPORTS:REPORT:READ"] }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Staff - Personnel opérationnel
  [SystemRole.STAFF]: {
    id: "staff",
    name: "Personnel",
    description: "Accès opérationnel limité",
    permissions: [
      "CRM:CUSTOMER:READ",
      "ORDERS:ORDER:READ",
      "ORDERS:ORDER:WRITE",
      "PRODUCTS:PRODUCT:READ"
    ],
    isSystemRole: true,
    moduleAccess: [
      { moduleId: "dashboard", enabled: true, permissions: [] },
      { moduleId: "crm", enabled: true, permissions: ["CRM:CUSTOMER:READ"] },
      { moduleId: "orders", enabled: true, permissions: ["ORDERS:ORDER:READ", "ORDERS:ORDER:WRITE"] },
      { moduleId: "products", enabled: true, permissions: ["PRODUCTS:PRODUCT:READ"] }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Client - Utilisateur final
  [SystemRole.CLIENT]: {
    id: "client",
    name: "Client",
    description: "Accès client - Site vitrine uniquement",
    permissions: [],
    isSystemRole: true,
    moduleAccess: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};
```

---

## 📦 Système de Modules

### Configuration d'un Module

```typescript
// Module configuration interface

export interface ModuleConfig {
  // Identité
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;              // Lucide icon name

  // Activation
  enabled: boolean;
  isCore: boolean;           // Module core (ne peut pas être désactivé)

  // Permissions requises
  requiredPermissions: PermissionString[];

  // Dépendances
  dependencies: string[];    // IDs d'autres modules requis

  // Routes
  basePath: string;         // Base path (ex: "/admin/crm")
  routes: ModuleRoute[];

  // Navigation
  navigation: NavigationItem[];

  // Configuration
  settings?: Record<string, any>;

  // Métadonnées
  author?: string;
  license?: string;
}

export interface ModuleRoute {
  path: string;
  component: React.LazyExoticComponent<any>;
  requiresPermission?: PermissionString[];
  exact?: boolean;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  requiresPermission?: PermissionString[];
  badge?: {
    value: string | number;
    variant: "default" | "primary" | "success" | "warning" | "danger";
  };
  children?: NavigationItem[];
}
```

### Exemple: Configuration du Module CRM

```typescript
// modules/crm/module.config.ts

import { lazy } from "react";
import { ModuleConfig } from "@/types";

export const crmModuleConfig: ModuleConfig = {
  // Identité
  id: "crm",
  name: "Gestion Relation Client",
  version: "2.0.0",
  description: "Module de gestion des clients, prospects et opportunités",
  icon: "Users",

  // Activation
  enabled: true,
  isCore: false,

  // Permissions
  requiredPermissions: ["CRM:CUSTOMER:READ"],

  // Dépendances
  dependencies: ["dashboard"], // Nécessite le module dashboard

  // Routes
  basePath: "/admin/crm",
  routes: [
    {
      path: "/",
      component: lazy(() => import("./pages/CustomersListPage")),
      requiresPermission: ["CRM:CUSTOMER:READ"],
      exact: true
    },
    {
      path: "/customers",
      component: lazy(() => import("./pages/CustomersListPage")),
      requiresPermission: ["CRM:CUSTOMER:READ"]
    },
    {
      path: "/customers/:id",
      component: lazy(() => import("./pages/CustomerDetailPage")),
      requiresPermission: ["CRM:CUSTOMER:READ"]
    },
    {
      path: "/leads",
      component: lazy(() => import("./pages/LeadsPage")),
      requiresPermission: ["CRM:LEAD:READ"]
    },
    {
      path: "/pipeline",
      component: lazy(() => import("./pages/PipelinePage")),
      requiresPermission: ["CRM:LEAD:WRITE"]
    }
  ],

  // Navigation
  navigation: [
    {
      label: "CRM",
      path: "/admin/crm",
      icon: "Users",
      requiresPermission: ["CRM:CUSTOMER:READ"],
      children: [
        {
          label: "Clients",
          path: "/admin/crm/customers",
          icon: "UserCheck",
          requiresPermission: ["CRM:CUSTOMER:READ"]
        },
        {
          label: "Prospects",
          path: "/admin/crm/leads",
          icon: "UserPlus",
          requiresPermission: ["CRM:LEAD:READ"],
          badge: {
            value: 12,
            variant: "primary"
          }
        },
        {
          label: "Pipeline",
          path: "/admin/crm/pipeline",
          icon: "TrendingUp",
          requiresPermission: ["CRM:LEAD:WRITE"]
        }
      ]
    }
  ],

  // Configuration spécifique au module
  settings: {
    defaultView: "list", // list | grid | kanban
    enableLeads: true,
    enablePipeline: true,
    customFields: []
  },

  // Métadonnées
  author: "2SI.Sarl",
  license: "Proprietary"
};

export default crmModuleConfig;
```

### Registre Central des Modules

```typescript
// config/modules.config.ts

import { ModuleConfig } from "@/types";
import dashboardModule from "@/modules/dashboard/module.config";
import crmModule from "@/modules/crm/module.config";
import ordersModule from "@/modules/orders/module.config";
import productsModule from "@/modules/products/module.config";
import commercialModule from "@/modules/commercial/module.config";
import reportsModule from "@/modules/reports/module.config";

// Modules V2 (préparés mais désactivés)
import suppliersModule from "@/modules/suppliers/module.config";
import logisticsModule from "@/modules/logistics/module.config";
import usersModule from "@/modules/users/module.config";
import settingsModule from "@/modules/settings/module.config";

/**
 * Registre central de tous les modules de la plateforme
 */
export const MODULES_REGISTRY: Record<string, ModuleConfig> = {
  // Modules V1 (actifs)
  dashboard: dashboardModule,
  crm: crmModule,
  orders: ordersModule,
  products: productsModule,
  commercial: commercialModule,
  reports: reportsModule,

  // Modules V2 (préparés - à activer progressivement)
  suppliers: suppliersModule,
  logistics: logisticsModule,
  users: usersModule,
  settings: settingsModule
};

/**
 * Récupère les modules actifs pour l'utilisateur courant
 */
export function getActiveModules(user: User): ModuleConfig[] {
  return Object.values(MODULES_REGISTRY).filter(module => {
    // Vérifie si le module est activé
    if (!module.enabled) return false;

    // Vérifie si l'utilisateur a accès au module
    const hasModuleAccess = user.moduleAccess.some(
      access => access.moduleId === module.id && access.enabled
    );
    if (!hasModuleAccess && !module.isCore) return false;

    // Vérifie si l'utilisateur a les permissions requises
    const hasRequiredPermissions = module.requiredPermissions.every(
      permission => hasPermission(user, permission)
    );

    return hasRequiredPermissions;
  });
}

/**
 * Récupère la navigation pour les modules actifs
 */
export function getModuleNavigation(user: User): NavigationItem[] {
  const activeModules = getActiveModules(user);

  return activeModules.flatMap(module =>
    module.navigation.filter(navItem => {
      if (!navItem.requiresPermission) return true;
      return navItem.requiresPermission.every(p => hasPermission(user, p));
    })
  );
}
```

---

## 🔌 Couche d'Abstraction API

### Configuration du Client API

```typescript
// core/api/client.ts

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

/**
 * Configuration du client API principal
 */
const apiConfig: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
};

/**
 * Instance axios principale
 */
export const apiClient: AxiosInstance = axios.create(apiConfig);

/**
 * Intercepteur pour ajouter le token d'authentification
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Intercepteur pour gérer les erreurs globalement
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Gestion du refresh token
    if (error.response?.status === 401) {
      // Token expiré - tenter le refresh
      try {
        const refreshToken = localStorage.getItem("refresh-token");
        const response = await axios.post(`${apiConfig.baseURL}/auth/refresh`, {
          refreshToken
        });

        const newToken = response.data.token;
        localStorage.setItem("auth-token", newToken);

        // Réessayer la requête originale
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios(error.config);
      } catch (refreshError) {
        // Refresh échoué - déconnecter l'utilisateur
        localStorage.removeItem("auth-token");
        localStorage.removeItem("refresh-token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
```

### Endpoints Registry

```typescript
// core/api/endpoints.ts

/**
 * Registry centralisé de tous les endpoints API
 */
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me"
  },

  // CRM
  crm: {
    customers: {
      list: "/crm/customers",
      detail: (id: string) => `/crm/customers/${id}`,
      create: "/crm/customers",
      update: (id: string) => `/crm/customers/${id}`,
      delete: (id: string) => `/crm/customers/${id}`
    },
    leads: {
      list: "/crm/leads",
      detail: (id: string) => `/crm/leads/${id}`,
      create: "/crm/leads",
      update: (id: string) => `/crm/leads/${id}`,
      convert: (id: string) => `/crm/leads/${id}/convert`
    }
  },

  // Orders
  orders: {
    list: "/orders",
    detail: (id: string) => `/orders/${id}`,
    create: "/orders",
    update: (id: string) => `/orders/${id}`,
    updateStatus: (id: string) => `/orders/${id}/status`,
    pdf: (id: string) => `/orders/${id}/pdf`
  },

  // Products
  products: {
    list: "/products",
    detail: (id: string) => `/products/${id}`,
    create: "/products",
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
    import: "/products/import",
    categories: "/products/categories"
  },

  // Reports
  reports: {
    dashboard: "/reports/dashboard",
    sales: "/reports/sales",
    products: "/reports/products",
    customers: "/reports/customers",
    export: (type: string) => `/reports/export/${type}`
  },

  // Settings
  settings: {
    get: "/settings",
    update: "/settings",
    company: "/settings/company"
  }
};
```

### Services par Module

```typescript
// modules/crm/services/crmApi.ts

import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Customer, Lead } from "../types";

/**
 * Service API pour le module CRM
 */
export const crmApi = {
  // Customers
  customers: {
    getAll: async () => {
      const response = await apiClient.get<Customer[]>(
        API_ENDPOINTS.crm.customers.list
      );
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get<Customer>(
        API_ENDPOINTS.crm.customers.detail(id)
      );
      return response.data;
    },

    create: async (data: Partial<Customer>) => {
      const response = await apiClient.post<Customer>(
        API_ENDPOINTS.crm.customers.create,
        data
      );
      return response.data;
    },

    update: async (id: string, data: Partial<Customer>) => {
      const response = await apiClient.put<Customer>(
        API_ENDPOINTS.crm.customers.update(id),
        data
      );
      return response.data;
    },

    delete: async (id: string) => {
      await apiClient.delete(API_ENDPOINTS.crm.customers.delete(id));
    }
  },

  // Leads
  leads: {
    getAll: async () => {
      const response = await apiClient.get<Lead[]>(
        API_ENDPOINTS.crm.leads.list
      );
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get<Lead>(
        API_ENDPOINTS.crm.leads.detail(id)
      );
      return response.data;
    },

    create: async (data: Partial<Lead>) => {
      const response = await apiClient.post<Lead>(
        API_ENDPOINTS.crm.leads.create,
        data
      );
      return response.data;
    },

    update: async (id: string, data: Partial<Lead>) => {
      const response = await apiClient.put<Lead>(
        API_ENDPOINTS.crm.leads.update(id),
        data
      );
      return response.data;
    },

    convertToCustomer: async (id: string) => {
      const response = await apiClient.post<Customer>(
        API_ENDPOINTS.crm.leads.convert(id)
      );
      return response.data;
    }
  }
};
```

### Hooks React Query

```typescript
// modules/crm/hooks/useCustomers.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "../services/crmApi";
import { Customer } from "../types";

/**
 * Hook pour récupérer la liste des clients
 */
export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => crmApi.customers.getAll()
  });
}

/**
 * Hook pour récupérer un client par ID
 */
export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => crmApi.customers.getById(id),
    enabled: !!id
  });
}

/**
 * Hook pour créer un client
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Customer>) => crmApi.customers.create(data),
    onSuccess: () => {
      // Invalider le cache pour recharger la liste
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });
}

/**
 * Hook pour mettre à jour un client
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      crmApi.customers.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
    }
  });
}

/**
 * Hook pour supprimer un client
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmApi.customers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });
}
```

---

## 🛣️ Routing Modulaire

### Module Router

```typescript
// core/router/ModuleRouter.tsx

import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ModuleConfig } from "@/types";
import { ProtectedModuleRoute } from "./ProtectedModuleRoute";
import { Loader2 } from "lucide-react";

interface ModuleRouterProps {
  module: ModuleConfig;
}

export function ModuleRouter({ module }: ModuleRouterProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <Routes>
        {module.routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedModuleRoute
                permissions={route.requiresPermission}
                component={route.component}
              />
            }
          />
        ))}

        {/* Fallback */}
        <Route path="*" element={<Navigate to={module.basePath} replace />} />
      </Routes>
    </Suspense>
  );
}
```

### Protected Module Route

```typescript
// core/router/ProtectedModuleRoute.tsx

import { useAuth } from "@/core/auth/hooks/useAuth";
import { usePermissions } from "@/core/auth/hooks/usePermissions";
import { PermissionString } from "@/types";
import { Navigate } from "react-router-dom";

interface ProtectedModuleRouteProps {
  permissions?: PermissionString[];
  component: React.LazyExoticComponent<any>;
}

export function ProtectedModuleRoute({
  permissions,
  component: Component
}: ProtectedModuleRouteProps) {
  const { isAuthenticated } = useAuth();
  const { hasPermissions } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permissions && !hasPermissions(permissions)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Accès refusé</h1>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return <Component />;
}
```

### App Router avec Modules Dynamiques

```typescript
// App.tsx (version V2)

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { getActiveModules } from "@/config/modules.config";
import { ModuleRouter } from "@/core/router/ModuleRouter";
import { MainLayout } from "@/core/layout/MainLayout";
import { AdminLayout } from "@/core/layout/AdminLayout";
import { LoginPage } from "@/pages/LoginPage";

export function App() {
  const { user } = useAuth();

  // Récupérer les modules actifs pour l'utilisateur
  const activeModules = user ? getActiveModules(user) : [];

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          {/* ... autres routes publiques */}
        </Route>

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Routes admin avec modules dynamiques */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout modules={activeModules} />
            </ProtectedRoute>
          }
        >
          {/* Routes des modules actifs */}
          {activeModules.map((module) => (
            <Route
              key={module.id}
              path={`${module.basePath.replace("/admin/", "")}/*`}
              element={<ModuleRouter module={module} />}
            />
          ))}

          {/* Redirection par défaut vers le premier module */}
          <Route
            index
            element={
              <Navigate
                to={activeModules[0]?.basePath || "/admin/dashboard"}
                replace
              />
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🎨 Navigation Dynamique

### Sidebar Modulaire

```typescript
// core/layout/ModularSidebar.tsx

import { Link, useLocation } from "react-router-dom";
import { usePermissions } from "@/core/auth/hooks/usePermissions";
import { ModuleConfig, NavigationItem } from "@/types";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

interface ModularSidebarProps {
  modules: ModuleConfig[];
}

export function ModularSidebar({ modules }: ModularSidebarProps) {
  const location = useLocation();
  const { hasPermissions } = usePermissions();

  // Flatten navigation from all modules
  const navigationItems = modules.flatMap((module) =>
    module.navigation.filter((item) => {
      if (!item.requiresPermission) return true;
      return hasPermissions(item.requiresPermission);
    })
  );

  return (
    <aside className="w-64 border-r bg-card">
      <nav className="space-y-1 p-4">
        {navigationItems.map((item) => (
          <NavigationItemComponent
            key={item.path}
            item={item}
            currentPath={location.pathname}
          />
        ))}
      </nav>
    </aside>
  );
}

function NavigationItemComponent({
  item,
  currentPath
}: {
  item: NavigationItem;
  currentPath: string;
}) {
  const { hasPermissions } = usePermissions();
  const Icon = Icons[item.icon as keyof typeof Icons] as any;
  const isActive = currentPath.startsWith(item.path);

  // Si l'item a des enfants
  if (item.children && item.children.length > 0) {
    const visibleChildren = item.children.filter((child) => {
      if (!child.requiresPermission) return true;
      return hasPermissions(child.requiresPermission);
    });

    if (visibleChildren.length === 0) return null;

    return (
      <div className="space-y-1">
        <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
          <Icon className="mr-2 inline-block h-4 w-4" />
          {item.label}
        </div>
        {visibleChildren.map((child) => {
          const ChildIcon = Icons[child.icon as keyof typeof Icons] as any;
          const isChildActive = currentPath === child.path;

          return (
            <Link
              key={child.path}
              to={child.path}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                isChildActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span className="flex items-center">
                <ChildIcon className="mr-2 h-4 w-4" />
                {child.label}
              </span>
              {child.badge && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    child.badge.variant === "primary" && "bg-primary text-primary-foreground"
                  )}
                >
                  {child.badge.value}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  // Item sans enfants
  return (
    <Link
      to={item.path}
      className={cn(
        "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <span className="flex items-center">
        <Icon className="mr-2 h-4 w-4" />
        {item.label}
      </span>
      {item.badge && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs",
            item.badge.variant === "primary" && "bg-primary text-primary-foreground"
          )}
        >
          {item.badge.value}
        </span>
      )}
    </Link>
  );
}
```

---

## 📋 Plan de Migration V1 → V2

### Phase 1: Fondations (Semaines 1-2)

#### Semaine 1: Système de Permissions
- [ ] Créer les types Permission, Role, User étendus
- [ ] Implémenter permissionService.ts
- [ ] Créer le hook usePermissions
- [ ] Implémenter PermissionGate component
- [ ] Créer roles.config.ts avec rôles prédéfinis
- [ ] Créer permissions.config.ts

#### Semaine 2: Registre de Modules
- [ ] Créer l'interface ModuleConfig
- [ ] Implémenter ModuleRegistry.ts
- [ ] Créer modules.config.ts
- [ ] Implémenter ModuleLoader.ts
- [ ] Créer ModuleContext provider
- [ ] Créer ModuleRouter component

### Phase 2: Couche API (Semaines 3-4)

#### Semaine 3: Infrastructure API
- [ ] Configurer axios client
- [ ] Créer API_ENDPOINTS registry
- [ ] Implémenter intercepteurs (auth, errors)
- [ ] Créer types API (Request, Response)
- [ ] Implémenter gestion tokens (access + refresh)

#### Semaine 4: Services par Module
- [ ] Créer crmApi.ts
- [ ] Créer ordersApi.ts
- [ ] Créer productsApi.ts
- [ ] Créer reportsApi.ts
- [ ] Créer hooks React Query par module

### Phase 3: Refactoring Modules (Semaines 5-6)

#### Semaine 5: Extraction Modules V1
- [ ] Créer structure modules/dashboard
- [ ] Migrer DashboardPage vers module
- [ ] Créer structure modules/crm
- [ ] Migrer CustomersPage vers module CRM
- [ ] Créer structure modules/orders
- [ ] Migrer OrdersPage vers module Orders

#### Semaine 6: Finaliser Modules V1
- [ ] Créer structure modules/products
- [ ] Migrer ProductsPage vers module Products
- [ ] Créer structure modules/reports
- [ ] Migrer ReportsPage vers module Reports
- [ ] Créer structure modules/commercial
- [ ] Migrer fonctionnalités commercial

### Phase 4: Préparation Modules V2 (Semaines 7-8)

#### Semaine 7: Structure Modules V2
- [ ] Créer modules/suppliers (structure seulement)
- [ ] Créer modules/logistics (structure seulement)
- [ ] Créer modules/users (structure seulement)
- [ ] Créer modules/settings (structure seulement)
- [ ] Définir types pour tous les modules V2
- [ ] Créer module.config.ts (enabled: false)

#### Semaine 8: Navigation et Polish
- [ ] Implémenter ModularSidebar
- [ ] Mettre à jour AdminLayout avec navigation dynamique
- [ ] Implémenter ProtectedModuleRoute
- [ ] Tester isolation des modules
- [ ] Documentation complète
- [ ] Tests end-to-end

---

## ✅ Checklist de Validation

### Critères de Succès V2

#### Architecture
- [ ] Tous les modules sont isolés dans leur dossier
- [ ] Aucun import croisé entre modules (sauf shared)
- [ ] Navigation générée dynamiquement
- [ ] Routes enregistrées dynamiquement

#### Permissions
- [ ] Système de permissions granulaires fonctionnel
- [ ] Au moins 4 rôles définis (Super Admin, Admin, Manager, Staff)
- [ ] Permissions testées pour chaque module
- [ ] PermissionGate component fonctionnel

#### API
- [ ] Client API configuré avec intercepteurs
- [ ] Gestion tokens (access + refresh)
- [ ] Services API créés pour modules V1
- [ ] Hooks React Query fonctionnels
- [ ] Gestion d'erreurs centralisée

#### Modules V1
- [ ] Dashboard migré et fonctionnel
- [ ] CRM migré et fonctionnel
- [ ] Orders migré et fonctionnel
- [ ] Products migré et fonctionnel
- [ ] Reports migré et fonctionnel
- [ ] Commercial migré et fonctionnel

#### Modules V2
- [ ] Suppliers: structure + types créés
- [ ] Logistics: structure + types créés
- [ ] Users: structure + types créés
- [ ] Settings: structure + types créés

#### Documentation
- [ ] ARCHITECTURE_V2.md complet
- [ ] README par module
- [ ] Guide de développement module
- [ ] Guide de migration V1→V2

---

## 🔮 Vision Future

### Modules Additionnels Potentiels

1. **Module Comptabilité**
   - Facturation
   - Paiements
   - Rapports financiers

2. **Module RH**
   - Gestion des employés
   - Congés
   - Paie

3. **Module Marketing**
   - Campaigns
   - Email marketing
   - Analytics

4. **Module Support Client**
   - Tickets
   - Chat
   - Base de connaissances

### Système de Plugins

```typescript
// Future: Plugin system
interface PluginManifest {
  id: string;
  name: string;
  author: string;
  module: ModuleConfig;
  hooks: PluginHooks;
}

// Permet aux développeurs tiers d'ajouter des modules
```

---

## 📞 Support

Pour toute question sur l'architecture V2:
- Email: dev@2si.sarl
- Documentation: /docs
- Issues: GitHub Issues

---

**Version**: 2.0.0
**Dernière mise à jour**: 2025-12-27
**Auteur**: 2SI.Sarl Development Team
