# Architecture Modulaire V2 - Guide de Démarrage Rapide

## 🎯 Vue d'Ensemble

Cette branche (`feature/modular-architecture`) implémente la fondation de l'architecture modulaire V2 pour la plateforme 2SI.Sarl.

## ✅ Ce qui a été implémenté

### 1. Système de Types

✅ **Types de base** créés dans `src/types/entities/`:
- `Permission.ts` - Permissions avec format `MODULE:RESOURCE:ACTION`
- `Role.ts` - Rôles avec accès modulaire
- `User.ts` - Utilisateur V2 avec rôles et permissions

✅ **Types de modules** créés dans `src/types/module/`:
- `ModuleConfig.ts` - Configuration des modules avec routes et navigation

### 2. Système d'Authentification & Permissions

✅ **Service de permissions** (`src/core/auth/services/permissionService.ts`):
- `hasPermission()` - Vérifie une permission
- `hasAllPermissions()` - Vérifie toutes les permissions
- `hasAnyPermission()` - Vérifie au moins une permission
- `hasModuleAccess()` - Vérifie l'accès à un module
- Support des wildcards (`CRM:*:*`, `*:*:*`)

✅ **AuthProviderV2** (`src/core/auth/providers/AuthProviderV2.tsx`):
- Compatible avec V1 (adapte automatiquement l'ancien format)
- Support des rôles multiples
- Permissions granulaires
- Accès modulaire

✅ **Hook usePermissions** (`src/core/auth/hooks/usePermissions.ts`):
```tsx
const { hasPermission, hasPermissions, hasModuleAccess } = usePermissions();

if (hasPermission("CRM:CUSTOMER:WRITE")) {
  // Afficher bouton "Ajouter Client"
}
```

✅ **Composant PermissionGate** (`src/core/auth/components/PermissionGate.tsx`):
```tsx
<PermissionGate permissions={["PRODUCTS:PRODUCT:WRITE"]}>
  <Button>Ajouter Produit</Button>
</PermissionGate>
```

### 3. Système de Modules

✅ **Configurations des modules** créées:
- `modules/dashboard/module.config.ts` - Tableau de bord
- `modules/crm/module.config.ts` - Gestion clients
- `modules/orders/module.config.ts` - Commandes
- `modules/products/module.config.ts` - Produits
- `modules/reports/module.config.ts` - Rapports
- `modules/commercial/module.config.ts` - Commercial/Paramètres

✅ **Registre des modules** (`src/config/modules.config.ts`):
- `MODULES_REGISTRY` - Tous les modules disponibles
- `getActiveModules(user)` - Modules accessibles par l'utilisateur
- `getModuleNavigation(user)` - Navigation dynamique

### 4. Interface Admin Dynamique

✅ **AdminLayoutV2** (`src/components/layout/AdminLayoutV2.tsx`):
- **Navigation dynamique** basée sur les permissions
- **Affichage des rôles** de l'utilisateur
- **Compteur de modules** actifs
- **Badges** sur les items de navigation
- **Icônes dynamiques** pour chaque module

#### Fonctionnalités du Sidebar:

1. **Génération automatique** des menus selon les modules accessibles
2. **Tri automatique** par ordre défini dans chaque module
3. **Affichage conditionnel** basé sur les permissions
4. **Support des badges** (nombre, état, etc.)
5. **Icônes lucide** dynamiques
6. **Rétractable** (pleine largeur ⟷ icônes uniquement)

## 🚀 Comment utiliser

### Activer la nouvelle architecture

**Option 1: Tester AdminLayoutV2**

Dans `src/App.tsx`, importer et utiliser `AdminLayoutV2`:

```tsx
// Remplacer
import { AdminLayout } from "@/components/layout/AdminLayout";

// Par
import { AdminLayoutV2 } from "@/components/layout/AdminLayoutV2";
import { AuthProviderV2 } from "@/core/auth/providers/AuthProviderV2";

// Et dans les providers, remplacer AuthProvider par AuthProviderV2
<AuthProviderV2>
  {/* ... */}
</AuthProviderV2>

// Dans les routes admin, utiliser AdminLayoutV2
<Route path="/admin" element={<AdminLayoutV2 />}>
  {/* ... */}
</Route>
```

### Se connecter

**Credentials de test:**
- Email: `admin@2si.sarl`
- Password: `admin123`
- Rôle: `super_admin` (toutes les permissions)

### Vérifier les permissions

L'utilisateur admin aura:
- **Rôle**: Super Admin
- **Permissions**: `*:*:*` (toutes)
- **Modules actifs**: Tous les modules (6 modules)

### Navigation visible

Avec le compte admin, vous verrez tous les modules:
1. 📊 Tableau de Bord (`/admin`)
2. 👥 Clients (`/admin/crm/customers`)
3. 🛒 Commandes (`/admin/orders`)
4. 📦 Produits (`/admin/products`)
5. 📈 Rapports (`/admin/reports`)
6. ⚙️ Paramètres (`/admin/settings`)

## 📁 Structure des Fichiers

```
src/
├── types/
│   ├── entities/          # Types de base (User, Permission, Role)
│   └── module/            # Types pour modules
├── core/
│   └── auth/
│       ├── services/      # permissionService.ts
│       ├── hooks/         # usePermissions.ts
│       ├── providers/     # AuthProviderV2.tsx
│       └── components/    # PermissionGate.tsx
├── modules/
│   ├── dashboard/         # Module tableau de bord
│   ├── crm/               # Module CRM
│   ├── orders/            # Module commandes
│   ├── products/          # Module produits
│   ├── reports/           # Module rapports
│   └── commercial/        # Module commercial
├── config/
│   └── modules.config.ts  # Registre des modules
└── components/
    └── layout/
        └── AdminLayoutV2.tsx  # Layout admin dynamique
```

## 🔧 Ajouter un Nouveau Module

### 1. Créer la structure

```bash
mkdir -p src/modules/mon-module/{components,pages,services,hooks,types}
```

### 2. Créer module.config.ts

```tsx
// src/modules/mon-module/module.config.ts
import { lazy } from "react";
import { ModuleConfig } from "@/types";

export const monModuleConfig: ModuleConfig = {
  id: "mon-module",
  name: "Mon Module",
  version: "1.0.0",
  description: "Description de mon module",
  icon: "Star", // Icône Lucide

  enabled: true,
  isCore: false,

  requiredPermissions: ["MON_MODULE:RESOURCE:READ"],
  dependencies: [],

  basePath: "/admin/mon-module",
  routes: [
    {
      path: "/",
      component: lazy(() => import("./pages/MaPage")),
      requiresPermission: ["MON_MODULE:RESOURCE:READ"]
    }
  ],

  navigation: [
    {
      label: "Mon Module",
      path: "/admin/mon-module",
      icon: "Star",
      requiresPermission: ["MON_MODULE:RESOURCE:READ"],
      order: 10 // Ordre d'affichage
    }
  ],

  settings: {}
};

export default monModuleConfig;
```

### 3. Enregistrer le module

```tsx
// src/config/modules.config.ts
import monModule from "@/modules/mon-module/module.config";

export const MODULES_REGISTRY: Record<string, ModuleConfig> = {
  // ... modules existants
  "mon-module": monModule
};
```

### 4. Donner les permissions à l'utilisateur

Modifier `AuthProviderV2.tsx` pour ajouter les permissions:

```tsx
customPermissions: [
  "*:*:*", // ou
  "MON_MODULE:RESOURCE:READ",
  "MON_MODULE:RESOURCE:WRITE"
],
moduleAccess: [
  // ... modules existants
  { moduleId: "mon-module", enabled: true }
]
```

**Le module apparaîtra automatiquement dans la navigation !** 🎉

## 🎨 Personnalisation du Sidebar

### Ajouter un badge

```tsx
navigation: [
  {
    label: "Commandes",
    path: "/admin/orders",
    icon: "ShoppingCart",
    badge: {
      value: 12,              // Nombre ou texte
      variant: "primary"      // primary, success, warning, danger, default
    },
    order: 3
  }
]
```

### Organiser l'ordre

L'ordre d'affichage est défini par la propriété `order`:

```tsx
navigation: [
  {
    label: "Tableau de Bord",
    order: 1  // Affiché en premier
  },
  {
    label: "Mon Module",
    order: 10 // Affiché après
  }
]
```

### Navigation avec sous-menus (future)

```tsx
navigation: [
  {
    label: "CRM",
    icon: "Users",
    children: [
      {
        label: "Clients",
        path: "/admin/crm/customers",
        icon: "UserCheck"
      },
      {
        label: "Prospects",
        path: "/admin/crm/leads",
        icon: "UserPlus"
      }
    ]
  }
]
```

## 🔒 Gestion des Permissions

### Format des permissions

`MODULE:RESOURCE:ACTION`

Exemples:
- `CRM:CUSTOMER:READ` - Lire les clients
- `CRM:CUSTOMER:WRITE` - Créer/modifier les clients
- `ORDERS:ORDER:ADMIN` - Administration complète des commandes
- `*:*:*` - Super Admin (toutes les permissions)

### Wildcards supportés

- `CRM:*:*` - Toutes les permissions CRM
- `*:CUSTOMER:READ` - Lire les clients dans tous les modules
- `CRM:CUSTOMER:*` - Toutes les actions sur les clients CRM

### Utilisation dans le code

```tsx
import { usePermissions } from "@/core/auth/hooks/usePermissions";

function MaPage() {
  const { hasPermission, hasModuleAccess } = usePermissions();

  const canWrite = hasPermission("CRM:CUSTOMER:WRITE");
  const canAccess = hasModuleAccess("crm");

  return (
    <div>
      {canAccess && <h1>CRM</h1>}
      {canWrite && <Button>Ajouter Client</Button>}
    </div>
  );
}
```

## 🧪 Tester l'Architecture

### Build

```bash
npm run build
```

✅ Le build fonctionne sans erreurs !

### Développement

```bash
npm run dev
```

### Vérifier la navigation

1. Se connecter en admin
2. Vérifier que tous les modules apparaissent dans le sidebar
3. Vérifier que le rôle s'affiche dans le header
4. Vérifier que le compteur de modules est correct

## 📋 Prochaines Étapes

### Phase 1 ✅ TERMINÉ
- [x] Types de base (Permission, Role, User, Module)
- [x] Service de permissions
- [x] Hook usePermissions
- [x] PermissionGate component
- [x] AuthProviderV2
- [x] Configurations des modules
- [x] Registre des modules
- [x] AdminLayoutV2 avec navigation dynamique

### Phase 2 - À FAIRE
- [ ] Créer les routes dynamiques par module
- [ ] Migrer les pages vers les modules
- [ ] Ajouter la couche API
- [ ] Créer les hooks React Query par module
- [ ] Implémenter le système de rôles complet

### Phase 3 - V2 Modules
- [ ] Préparer les modules V2 (Suppliers, Logistics, Users, Settings)
- [ ] Définir les permissions pour chaque module
- [ ] Créer les interfaces utilisateur

## 🐛 Debug

### La navigation ne s'affiche pas

Vérifier:
1. L'utilisateur est bien connecté
2. Le module est `enabled: true`
3. L'utilisateur a `moduleAccess` pour ce module
4. L'utilisateur a les `requiredPermissions`

### Un module ne charge pas

Vérifier:
1. Le lazy import est correct
2. Le composant est bien exporté
3. Les permissions sont correctes

### Les permissions ne fonctionnent pas

Vérifier:
1. `AuthProviderV2` est bien utilisé (pas `AuthProvider`)
2. L'utilisateur a bien les permissions dans `customPermissions`
3. Le format de la permission est correct (`MODULE:RESOURCE:ACTION`)

## 📞 Support

Pour toute question:
- Consulter `/docs/ARCHITECTURE_V2.md` pour l'architecture complète
- Consulter `/docs/MIGRATION_GUIDE.md` pour la migration détaillée
- Ouvrir une issue GitHub

---

**Version**: 2.0.0-alpha
**Branche**: `feature/modular-architecture`
**Date**: 2025-12-27
