# Migration V1 vers V2 - Architecture Modulaire

## Vue d'ensemble

Ce document détaille la migration de l'architecture V1 (monolithique) vers l'architecture V2 (modulaire) du backoffice administrateur de 2SI.Sarl.

## Statut de la Migration

### ✅ Complètement Migré

#### 1. Système d'Authentification
- **V1**: `AuthProvider` (src/providers/AuthProvider.tsx)
- **V2**: `AuthProviderV2` (src/core/auth/providers/AuthProviderV2.tsx)
- **Améliorations**:
  - Support des rôles granulaires (super_admin, admin, manager, staff)
  - Système de permissions par module (ex: CRM:CUSTOMER:READ)
  - Gestion des accès modules par utilisateur
  - Migration automatique V1→V2 avec `migrateV1User()`

#### 2. Layout Administrateur
- **V1**: `AdminLayout` - Layout simple avec sidebar basique
- **V2**: `AdminLayoutV2` (src/components/layout/AdminLayoutV2.tsx)
- **Améliorations**:
  - Navigation organisée par sections (Général, CRM, Ventes, Rapports, Système)
  - Sections collapsibles avec état sauvegardé
  - Scrollbar personnalisé et esthétique
  - Affichage dynamique basé sur les permissions
  - Indicateurs de rôle utilisateur
  - Support sidebar réduite/étendue

#### 3. Routing
- **V1**: Routes statiques hardcodées dans App.tsx
- **V2**: Routing dynamique basé sur les modules
- **Composants clés**:
  - `ModuleRouter`: Gère le routing d'un module
  - `ProtectedModuleRoute`: Protection par permissions
  - Routes générées automatiquement depuis `modules.config.ts`

#### 4. Pages Administrateur

##### Pages Migrées
| Page V1 | Page V2 | Statut |
|---------|---------|--------|
| AdminPage.tsx | DashboardPage.tsx | ✅ Migré + Amélioré |
| N/A | CustomersPage.tsx | ✅ Nouveau |
| N/A | OrdersPage.tsx | ✅ Nouveau |
| N/A | ProductsPage.tsx | ✅ Nouveau |
| N/A | ReportsPage.tsx | ✅ Nouveau |
| N/A | SettingsPage.tsx | ✅ Nouveau |

##### Pages Placeholder (En Développement)
- AnalyticsPage.tsx
- ContactsPage.tsx
- LeadsPage.tsx
- QuotesPage.tsx
- InvoicesPage.tsx
- CategoriesPage.tsx
- InventoryPage.tsx
- NotFoundAdminPage.tsx (404 personnalisée)

#### 5. Services Partagés
- **settingsService.ts**: ✅ Utilisé tel quel par SettingsPage V2
  - Gestion des paramètres entreprise
  - Paramètres de paiement
  - Notifications
  - Paramètres système (mode maintenance, etc.)

### 🔄 Conservés (Compatibilité)

#### Providers Publics
Ces providers restent actifs pour le frontend public:
- `CartProvider`: Gestion du panier
- `WishlistProvider`: Liste de souhaits
- `I18nProvider`: Internationalisation
- `ConfigProvider`: Configuration globale

#### Pages Publiques
Pages e-commerce conservées:
- HomePage.tsx
- CatalogPage.tsx
- ProductDetailPage.tsx
- WishlistPage.tsx
- CartPage.tsx
- OrderPage.tsx
- NotFound.tsx
- MaintenancePage.tsx

## Architecture V2

### Structure Modulaire

```
src/
├── core/                           # Cœur de l'architecture V2
│   ├── auth/
│   │   ├── providers/
│   │   │   └── AuthProviderV2.tsx  # Provider d'authentification
│   │   ├── hooks/
│   │   │   └── usePermissions.ts   # Hook pour permissions
│   │   └── services/
│   │       └── permissionService.ts # Logique permissions
│   └── router/
│       ├── ModuleRouter.tsx        # Router modulaire
│       └── ProtectedModuleRoute.tsx # Protection par permissions
│
├── modules/                        # Modules fonctionnels
│   ├── dashboard/
│   │   └── module.config.ts        # Configuration module
│   ├── crm/
│   ├── orders/
│   ├── products/
│   ├── reports/
│   └── commercial/
│
├── config/
│   └── modules.config.ts           # Registre central des modules
│
└── types/
    ├── entities/                   # Types métiers
    │   ├── User.ts
    │   ├── Role.ts
    │   └── Permission.ts
    └── module/
        └── ModuleConfig.ts         # Types de configuration
```

### Configuration des Modules

Chaque module est défini par un fichier `module.config.ts`:

```typescript
export const moduleConfig: ModuleConfig = {
  id: "dashboard",
  name: "Tableau de Bord",
  version: "1.0.0",
  description: "Vue d'ensemble",
  icon: "LayoutDashboard",

  enabled: true,
  isCore: true,

  requiredPermissions: [],
  dependencies: [],

  basePath: "/admin",
  routes: [
    {
      path: "/",
      component: lazy(() => import("../../pages/admin/DashboardPage")),
      exact: true
    }
  ],

  navigation: [
    {
      label: "Tableau de Bord",
      path: "/admin",
      icon: "LayoutDashboard",
      section: "general",
      order: 1
    }
  ],

  settings: {}
};
```

### Système de Permissions

#### Format des Permissions
`MODULE:RESOURCE:ACTION`

Exemples:
- `CRM:CUSTOMER:READ`
- `CRM:CUSTOMER:WRITE`
- `ORDERS:ORDER:READ`
- `PRODUCTS:PRODUCT:WRITE`

#### Rôles et Permissions

| Rôle | Permissions | Description |
|------|-------------|-------------|
| `super_admin` | Toutes | Accès complet au système |
| `admin` | Toutes sauf système critique | Gestion quotidienne |
| `manager` | READ + Gestion équipe | Supervision |
| `staff` | READ uniquement | Consultation |

### Sections de Navigation

La navigation est organisée en 5 sections:

1. **Général** (order: 1)
   - Tableau de Bord
   - Analytiques

2. **CRM** (order: 2)
   - Clients
   - Contacts
   - Prospects

3. **Ventes** (order: 3)
   - Commandes
   - Devis
   - Factures
   - Produits
   - Catégories
   - Inventaire

4. **Rapports** (order: 4)
   - Rapports

5. **Système** (order: 5)
   - Paramètres

## Avantages de V2

### 1. Modularité
- Modules indépendants et réutilisables
- Ajout/Suppression de modules sans toucher au core
- Configuration centralisée

### 2. Sécurité
- Permissions granulaires par action
- Vérification à plusieurs niveaux (route, component, UI)
- Isolation des modules

### 3. Performance
- Code splitting automatique par module
- Lazy loading des composants
- Taille de bundle optimisée

### 4. Maintenabilité
- Code organisé par domaine métier
- Types TypeScript stricts
- Configuration déclarative

### 5. Expérience Utilisateur
- Navigation intuitive par sections
- Feedback visuel (permissions, badges)
- Pages placeholder professionnelles
- 404 personnalisée dans le layout

## Migration des Données

### Utilisateurs V1 → V2

Les utilisateurs V1 sont automatiquement migrés au premier login:

```typescript
function migrateV1User(v1User: V1User): V2User {
  return {
    ...v1User,
    roles: v1User.isAdmin ? ["admin"] : ["staff"],
    permissions: v1User.isAdmin ? getAllPermissions() : getStaffPermissions(),
    moduleAccess: getAllModules().map(moduleId => ({
      moduleId,
      enabled: true,
      customPermissions: []
    }))
  };
}
```

### Settings

Le service `settingsService` est compatible V1/V2:
- Même interface localStorage
- Mêmes types de données
- Aucune migration nécessaire

## Checklist de Migration

### Phase 1: Fondations ✅
- [x] Types et interfaces V2
- [x] AuthProviderV2
- [x] Système de permissions
- [x] Configuration des modules
- [x] AdminLayoutV2

### Phase 2: Intégration ✅
- [x] Routing dynamique
- [x] Pages administrateur de base
- [x] Navigation par sections
- [x] Pages placeholder
- [x] Page 404 personnalisée

### Phase 3: Nettoyage ✅
- [x] Suppression AdminPage V1
- [x] Vérification services partagés
- [x] Documentation migration

### Phase 4: À Venir
- [ ] Tests unitaires des modules
- [ ] Tests d'intégration
- [ ] Documentation utilisateur
- [ ] Formation équipe

## Déprécations

### Supprimé
- ✅ `src/pages/AdminPage.tsx` - Remplacé par DashboardPage.tsx

### Déprécié (à supprimer après transition complète)
- `src/providers/AuthProvider.tsx` - Utiliser AuthProviderV2

### À Conserver
- `src/services/settingsService.ts` - Utilisé par V2
- Providers publics (Cart, Wishlist, I18n, Config)
- Pages publiques e-commerce

## Résolution de Problèmes

### "useAuth must be used within an AuthProvider"
**Cause**: Composant utilise encore V1 AuthProvider
**Solution**: Importer depuis `@/core/auth/providers/AuthProviderV2`

### Routes 404 en boucle
**Cause**: Ordre des routes catch-all
**Solution**: 404 admin avant 404 public dans App.tsx

### Module non affiché dans navigation
**Cause**: Permissions ou enabled=false
**Solution**: Vérifier `module.config.ts` et permissions utilisateur

## Ressources

- [Architecture V2](./ARCHITECTURE_V2.md)
- [Guide des Permissions](./PERMISSIONS.md)
- [Configuration des Modules](./MODULES.md)
- [Roadmap](./ROADMAP.md)

## Support

Pour toute question sur la migration:
- 📧 Email: dev@2si.sarl
- 📝 Issues: GitHub repository
- 📖 Documentation: /docs

---

**Dernière mise à jour**: 28 Décembre 2025
**Version**: 2.0.0
**Statut**: ✅ Migration V1→V2 Complète
