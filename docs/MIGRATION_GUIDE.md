# Guide de Migration V1 → V2

Ce guide détaille les étapes pratiques pour migrer de l'architecture monolithique V1 vers l'architecture modulaire V2.

---

## 📌 Principes de Migration

### Règles d'Or

1. **Aucune perte de fonctionnalité V1** - Tout ce qui fonctionne actuellement doit continuer de fonctionner
2. **Migration progressive** - Migrer module par module, pas tout d'un coup
3. **Tests continus** - Tester après chaque module migré
4. **Backward compatibility** - Maintenir les imports existants pendant la transition
5. **Documentation** - Documenter chaque changement majeur

### Stratégie

```
V1 (Actuel)          Transition              V2 (Cible)
─────────────        ──────────             ─────────────
Monolithique    →    Dual Support    →      Modulaire
    100%                V1 + V2                  100%
```

**Phase de Transition** = Les deux architectures coexistent temporairement

---

## 🚀 Phase 1: Préparation (Semaine 1)

### 1.1 Créer la Structure de Base

```bash
# Créer les dossiers core
mkdir -p src/core/{auth,api,router,registry,layout}

# Créer le dossier modules
mkdir -p src/modules

# Créer le dossier shared
mkdir -p src/shared/{components,hooks,utils,types}

# Créer le dossier docs
mkdir -p docs
```

### 1.2 Créer les Types de Base

**Fichier**: `src/types/entities/Permission.ts`

```typescript
export interface Permission {
  id: string;
  module: string;
  resource: string;
  action: PermissionAction;
  description: string;
}

export enum PermissionAction {
  READ = "READ",
  WRITE = "WRITE",
  DELETE = "DELETE",
  ADMIN = "ADMIN"
}

export type PermissionString = `${string}:${string}:${PermissionAction}`;
```

**Fichier**: `src/types/entities/Role.ts`

```typescript
import { PermissionString } from "./Permission";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: PermissionString[];
  isSystemRole: boolean;
  moduleAccess: ModuleAccess[];
  createdAt: string;
  updatedAt: string;
}

export interface ModuleAccess {
  moduleId: string;
  enabled: boolean;
  permissions: PermissionString[];
}

export enum SystemRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MANAGER = "manager",
  STAFF = "staff",
  CLIENT = "client"
}
```

**Fichier**: `src/types/entities/User.ts`

```typescript
import { PermissionString } from "./Permission";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;

  // V2: Rôles et permissions
  roles: string[];
  customPermissions: PermissionString[];
  moduleAccess: {
    moduleId: string;
    enabled: boolean;
  }[];

  // Status
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

**Fichier**: `src/types/entities/index.ts`

```typescript
export * from "./Permission";
export * from "./Role";
export * from "./User";
```

### 1.3 Créer le Type ModuleConfig

**Fichier**: `src/types/module/ModuleConfig.ts`

```typescript
import { PermissionString } from "../entities";

export interface ModuleConfig {
  // Identité
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;

  // Activation
  enabled: boolean;
  isCore: boolean;

  // Permissions
  requiredPermissions: PermissionString[];

  // Dépendances
  dependencies: string[];

  // Routes
  basePath: string;
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

**Fichier**: `src/types/index.ts`

```typescript
export * from "./entities";
export * from "./module/ModuleConfig";
```

---

## 🔐 Phase 2: Système de Permissions (Semaine 1-2)

### 2.1 Créer le Service de Permissions

**Fichier**: `src/core/auth/services/permissionService.ts`

```typescript
import { User, PermissionString, Permission } from "@/types";

/**
 * Vérifie si l'utilisateur possède une permission spécifique
 */
export function hasPermission(
  user: User,
  permission: PermissionString
): boolean {
  // Super admin a toutes les permissions
  if (user.roles.includes("super_admin")) {
    return true;
  }

  // Vérifier les permissions custom de l'utilisateur
  if (user.customPermissions.includes(permission)) {
    return true;
  }

  // Vérifier les permissions via les rôles
  // TODO: Implémenter la résolution des permissions via les rôles
  // Cette partie nécessite un appel API pour récupérer les permissions du rôle

  return false;
}

/**
 * Vérifie si l'utilisateur possède toutes les permissions
 */
export function hasAllPermissions(
  user: User,
  permissions: PermissionString[]
): boolean {
  return permissions.every((permission) => hasPermission(user, permission));
}

/**
 * Vérifie si l'utilisateur possède au moins une des permissions
 */
export function hasAnyPermission(
  user: User,
  permissions: PermissionString[]
): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Vérifie si l'utilisateur a accès à un module
 */
export function hasModuleAccess(user: User, moduleId: string): boolean {
  // Super admin a accès à tout
  if (user.roles.includes("super_admin")) {
    return true;
  }

  const moduleAccess = user.moduleAccess.find((m) => m.moduleId === moduleId);
  return moduleAccess?.enabled ?? false;
}

/**
 * Parse une permission string
 */
export function parsePermission(permission: PermissionString): {
  module: string;
  resource: string;
  action: string;
} {
  const [module, resource, action] = permission.split(":");
  return { module, resource, action };
}
```

### 2.2 Créer le Hook usePermissions

**Fichier**: `src/core/auth/hooks/usePermissions.ts`

```typescript
import { useAuth } from "./useAuth";
import { PermissionString } from "@/types";
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasModuleAccess
} from "../services/permissionService";

export function usePermissions() {
  const { user } = useAuth();

  return {
    /**
     * Vérifie si l'utilisateur a une permission
     */
    hasPermission: (permission: PermissionString) => {
      if (!user) return false;
      return hasPermission(user, permission);
    },

    /**
     * Vérifie si l'utilisateur a toutes les permissions
     */
    hasPermissions: (permissions: PermissionString[]) => {
      if (!user) return false;
      return hasAllPermissions(user, permissions);
    },

    /**
     * Vérifie si l'utilisateur a au moins une permission
     */
    hasAnyPermissions: (permissions: PermissionString[]) => {
      if (!user) return false;
      return hasAnyPermission(user, permissions);
    },

    /**
     * Vérifie si l'utilisateur a accès à un module
     */
    hasModuleAccess: (moduleId: string) => {
      if (!user) return false;
      return hasModuleAccess(user, moduleId);
    },

    /**
     * Vérifie si l'utilisateur est super admin
     */
    isSuperAdmin: () => {
      if (!user) return false;
      return user.roles.includes("super_admin");
    },

    /**
     * Vérifie si l'utilisateur a un rôle spécifique
     */
    hasRole: (role: string) => {
      if (!user) return false;
      return user.roles.includes(role);
    }
  };
}
```

### 2.3 Créer le Composant PermissionGate

**Fichier**: `src/core/auth/components/PermissionGate.tsx`

```typescript
import { usePermissions } from "../hooks/usePermissions";
import { PermissionString } from "@/types";

interface PermissionGateProps {
  permissions: PermissionString[];
  requireAll?: boolean; // true = AND, false = OR
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Composant pour afficher du contenu conditionnellement basé sur les permissions
 */
export function PermissionGate({
  permissions,
  requireAll = true,
  fallback = null,
  children
}: PermissionGateProps) {
  const { hasPermissions, hasAnyPermissions } = usePermissions();

  const hasAccess = requireAll
    ? hasPermissions(permissions)
    : hasAnyPermissions(permissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

### 2.4 Adapter AuthProvider pour V2

**Fichier**: `src/core/auth/providers/AuthProvider.tsx`

```typescript
import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem("2si-auth-user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Adapter l'ancien format V1 vers V2
        const adaptedUser: User = adaptUserV1ToV2(parsedUser);
        setUser(adaptedUser);
      } catch (error) {
        console.error("Erreur parsing user:", error);
        localStorage.removeItem("2si-auth-user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Remplacer par appel API réel
      // Simulation pour la transition
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email === "admin@2si.sarl" && password === "admin123") {
        const user: User = {
          id: "1",
          email: email,
          name: "Administrateur",
          roles: ["super_admin"],
          customPermissions: [],
          moduleAccess: [
            { moduleId: "dashboard", enabled: true },
            { moduleId: "crm", enabled: true },
            { moduleId: "orders", enabled: true },
            { moduleId: "products", enabled: true },
            { moduleId: "reports", enabled: true },
            { moduleId: "commercial", enabled: true }
          ],
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setUser(user);
        localStorage.setItem("2si-auth-user", JSON.stringify(user));
      } else {
        throw new Error("Identifiants invalides");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("2si-auth-user");
    localStorage.removeItem("auth-token");
    localStorage.removeItem("refresh-token");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("2si-auth-user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

/**
 * Adapter les utilisateurs V1 vers V2
 */
function adaptUserV1ToV2(oldUser: any): User {
  const isAdmin = oldUser.role === "admin";

  return {
    id: oldUser.id,
    email: oldUser.email,
    name: oldUser.name,
    roles: isAdmin ? ["admin"] : ["client"],
    customPermissions: [],
    moduleAccess: isAdmin
      ? [
          { moduleId: "dashboard", enabled: true },
          { moduleId: "crm", enabled: true },
          { moduleId: "orders", enabled: true },
          { moduleId: "products", enabled: true },
          { moduleId: "reports", enabled: true },
          { moduleId: "commercial", enabled: true }
        ]
      : [],
    status: "active",
    createdAt: oldUser.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
```

### 2.5 Créer les Configurations de Rôles

**Fichier**: `src/config/roles.config.ts`

```typescript
import { Role, SystemRole, PermissionAction } from "@/types";

export const SYSTEM_ROLES: Record<SystemRole, Role> = {
  [SystemRole.SUPER_ADMIN]: {
    id: "super_admin",
    name: "Super Administrateur",
    description: "Accès complet à toutes les fonctionnalités",
    permissions: ["*:*:*"],
    isSystemRole: true,
    moduleAccess: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

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

  [SystemRole.MANAGER]: {
    id: "manager",
    name: "Responsable",
    description: "Gestion des opérations quotidiennes",
    permissions: [
      "CRM:CUSTOMER:READ",
      "CRM:CUSTOMER:WRITE",
      "ORDERS:ORDER:READ",
      "ORDERS:ORDER:WRITE",
      "PRODUCTS:PRODUCT:READ"
    ],
    isSystemRole: true,
    moduleAccess: [
      { moduleId: "dashboard", enabled: true, permissions: [] },
      { moduleId: "crm", enabled: true, permissions: ["CRM:CUSTOMER:READ", "CRM:CUSTOMER:WRITE"] },
      { moduleId: "orders", enabled: true, permissions: ["ORDERS:ORDER:READ", "ORDERS:ORDER:WRITE"] },
      { moduleId: "products", enabled: true, permissions: ["PRODUCTS:PRODUCT:READ"] }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  [SystemRole.STAFF]: {
    id: "staff",
    name: "Personnel",
    description: "Accès opérationnel limité",
    permissions: [
      "CRM:CUSTOMER:READ",
      "ORDERS:ORDER:READ",
      "PRODUCTS:PRODUCT:READ"
    ],
    isSystemRole: true,
    moduleAccess: [
      { moduleId: "dashboard", enabled: true, permissions: [] },
      { moduleId: "crm", enabled: true, permissions: ["CRM:CUSTOMER:READ"] },
      { moduleId: "orders", enabled: true, permissions: ["ORDERS:ORDER:READ"] },
      { moduleId: "products", enabled: true, permissions: ["PRODUCTS:PRODUCT:READ"] }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

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

## 🌐 Phase 3: Couche API (Semaine 2-3)

### 3.1 Configurer le Client API

**Fichier**: `src/core/api/client.ts`

```typescript
import axios, { AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Intercepteur pour ajouter le token
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

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré - tenter refresh
      try {
        const refreshToken = localStorage.getItem("refresh-token");
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        const newToken = response.data.token;
        localStorage.setItem("auth-token", newToken);

        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios(error.config);
      } catch (refreshError) {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("refresh-token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
```

### 3.2 Créer l'Endpoints Registry

**Fichier**: `src/core/api/endpoints.ts`

```typescript
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me"
  },

  crm: {
    customers: {
      list: "/crm/customers",
      detail: (id: string) => `/crm/customers/${id}`,
      create: "/crm/customers",
      update: (id: string) => `/crm/customers/${id}`,
      delete: (id: string) => `/crm/customers/${id}`
    }
  },

  orders: {
    list: "/orders",
    detail: (id: string) => `/orders/${id}`,
    create: "/orders",
    update: (id: string) => `/orders/${id}`,
    updateStatus: (id: string) => `/orders/${id}/status`
  },

  products: {
    list: "/products",
    detail: (id: string) => `/products/${id}`,
    create: "/products",
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`
  }
};
```

---

## 📦 Phase 4: Migration Premier Module (Semaine 3)

### Exemple: Module Dashboard

#### 4.1 Créer la Structure

```bash
mkdir -p src/modules/dashboard/{components,pages,services,hooks,types}
```

#### 4.2 Créer module.config.ts

**Fichier**: `src/modules/dashboard/module.config.ts`

```typescript
import { lazy } from "react";
import { ModuleConfig } from "@/types";

export const dashboardModuleConfig: ModuleConfig = {
  id: "dashboard",
  name: "Tableau de Bord",
  version: "1.0.0",
  description: "Vue d'ensemble des statistiques",
  icon: "LayoutDashboard",

  enabled: true,
  isCore: true,

  requiredPermissions: [],
  dependencies: [],

  basePath: "/admin/dashboard",
  routes: [
    {
      path: "/",
      component: lazy(() => import("./pages/DashboardPage")),
      exact: true
    }
  ],

  navigation: [
    {
      label: "Tableau de Bord",
      path: "/admin/dashboard",
      icon: "LayoutDashboard"
    }
  ],

  settings: {}
};

export default dashboardModuleConfig;
```

#### 4.3 Migrer DashboardPage

```bash
# Copier la page existante
cp src/pages/admin/DashboardPage.tsx src/modules/dashboard/pages/DashboardPage.tsx
```

**Modifier les imports** dans le fichier copié:

```typescript
// Avant (V1)
import { useAuth } from "@/providers/AuthProvider";

// Après (V2)
import { useAuth } from "@/core/auth/hooks/useAuth";
import { usePermissions } from "@/core/auth/hooks/usePermissions";
```

#### 4.4 Créer index.ts

**Fichier**: `src/modules/dashboard/index.ts`

```typescript
export { default as dashboardModuleConfig } from "./module.config";
export { default as DashboardPage } from "./pages/DashboardPage";
```

---

## 🔄 Phase 5: Mise à Jour App.tsx (Semaine 4)

### 5.1 Créer modules.config.ts

**Fichier**: `src/config/modules.config.ts`

```typescript
import { ModuleConfig } from "@/types";
import dashboardModule from "@/modules/dashboard/module.config";
// Import autres modules au fur et à mesure

export const MODULES_REGISTRY: Record<string, ModuleConfig> = {
  dashboard: dashboardModule
  // Ajouter autres modules progressivement
};
```

### 5.2 Mettre à Jour App.tsx

```typescript
import { useAuth } from "@/core/auth/providers/AuthProvider";
import { MODULES_REGISTRY } from "@/config/modules.config";

export function App() {
  const { user } = useAuth();

  // Filtrer les modules actifs pour l'utilisateur
  const activeModules = user
    ? Object.values(MODULES_REGISTRY).filter((module) => {
        if (!module.enabled) return false;
        // Vérifier accès module
        const hasAccess = user.moduleAccess.some(
          (access) => access.moduleId === module.id && access.enabled
        );
        return hasAccess || module.isCore;
      })
    : [];

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques (inchangées) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          {/* ... */}
        </Route>

        {/* Routes admin avec modules */}
        <Route path="/admin" element={<AdminLayout modules={activeModules} />}>
          {activeModules.map((module) => (
            <Route
              key={module.id}
              path={module.basePath.replace("/admin/", "")}
              element={<ModuleRouter module={module} />}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## ✅ Checklist de Migration par Module

Pour chaque module à migrer, suivre cette checklist:

- [ ] Créer la structure du module `modules/[nom]/`
- [ ] Créer `module.config.ts` avec routes et navigation
- [ ] Copier les pages existantes dans `pages/`
- [ ] Copier les composants dans `components/`
- [ ] Créer les types dans `types/`
- [ ] Créer l'API service dans `services/`
- [ ] Créer les hooks React Query dans `hooks/`
- [ ] Mettre à jour les imports (V1 → V2)
- [ ] Ajouter le module dans `config/modules.config.ts`
- [ ] Tester le module isolément
- [ ] Tester l'intégration avec les autres modules
- [ ] Documenter le module (README.md)

---

## 🐛 Résolution de Problèmes

### Problème: Imports cassés après migration

**Solution**: Utiliser les alias TypeScript

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@core/*": ["./src/core/*"],
      "@modules/*": ["./src/modules/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}
```

### Problème: Module ne s'affiche pas dans la navigation

**Vérifications**:
1. Module `enabled: true` dans config
2. Utilisateur a `moduleAccess` pour ce module
3. Utilisateur a les `requiredPermissions`
4. Navigation item n'a pas de `requiresPermission` bloquante

### Problème: Erreur "Module not found"

**Solution**: Vérifier le lazy loading

```typescript
// module.config.ts
routes: [
  {
    path: "/",
    // ✅ Bon: Import relatif depuis le module
    component: lazy(() => import("./pages/DashboardPage")),

    // ❌ Mauvais: Import absolu
    component: lazy(() => import("@/modules/dashboard/pages/DashboardPage"))
  }
]
```

---

## 📊 Suivi de la Migration

### Tableau de Bord Migration

| Module | Structure | Config | Migration Code | Tests | Status |
|--------|-----------|--------|----------------|-------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | Terminé |
| CRM | ✅ | ✅ | 🔄 | ⏳ | En cours |
| Orders | ✅ | ⏳ | ⏳ | ⏳ | À faire |
| Products | ⏳ | ⏳ | ⏳ | ⏳ | À faire |
| Reports | ⏳ | ⏳ | ⏳ | ⏳ | À faire |
| Commercial | ⏳ | ⏳ | ⏳ | ⏳ | À faire |

Légende: ✅ Terminé | 🔄 En cours | ⏳ À faire

---

## 🎯 Prochaines Étapes

Après avoir migré tous les modules V1:

1. **Activer les modules V2 progressivement**
   - Suppliers
   - Logistics
   - Users
   - Settings

2. **Intégrer le backend réel**
   - Remplacer les mocks par de vrais appels API
   - Implémenter l'authentification JWT
   - Tester tous les flux

3. **Optimisations**
   - Code splitting avancé
   - Lazy loading des modules
   - Optimisation bundle

4. **Documentation finale**
   - Guide développeur
   - Guide utilisateur
   - API documentation

---

**Dernière mise à jour**: 2025-12-27
**Auteur**: 2SI.Sarl Development Team
