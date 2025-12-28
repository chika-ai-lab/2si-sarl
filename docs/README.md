# Documentation - 2SI.Sarl E-Commerce Platform

Bienvenue dans la documentation de la plateforme e-commerce 2SI.Sarl V2.

## 📚 Index des Documents

### 🚀 Démarrage Rapide

**Pour commencer avec l'architecture V2**, lisez ces documents dans l'ordre :

1. **[MODULAR_ARCH_README.md](../MODULAR_ARCH_README.md)** ⭐ **COMMENCEZ ICI**
   - Guide de démarrage rapide
   - Ce qui a été implémenté (Phase 1)
   - Comment utiliser la nouvelle architecture
   - Comment ajouter un nouveau module
   - Exemples de code pratiques
   - Debugging et troubleshooting

2. **[ROADMAP.md](./ROADMAP.md)** 📅
   - Plan complet des 8 phases
   - Phase 1 ✅ terminée
   - Phases 2-8 détaillées avec tasks
   - Timeline de 10-12 semaines
   - Stratégie de branches
   - Priorités et livrables

### 📖 Architecture Complète

3. **[ARCHITECTURE_V2.md](./ARCHITECTURE_V2.md)** 🏗️
   - Architecture modulaire détaillée
   - Système de permissions (MODULE:RESOURCE:ACTION)
   - Modèle de rôles (5 rôles système)
   - Configuration des modules
   - Couche d'abstraction API
   - Routing et navigation dynamiques
   - Plan de migration V1→V2

4. **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** 🔧
   - Guide étape par étape de migration
   - Code complet pour permissions et rôles
   - Configuration client API avec intercepteurs
   - Exemple de migration du module Dashboard
   - Checklist par module
   - Résolution de problèmes
   - Tableau de suivi de migration

### 📚 Guides Fonctionnels

5. **[AUTH_GUIDE.md](./AUTH_GUIDE.md)** 🔐
   - Système d'authentification
   - Gestion des sessions
   - Protection des routes

6. **[IMPORT_PRODUCTS_GUIDE.md](./IMPORT_PRODUCTS_GUIDE.md)** 📦
   - Import de produits par CSV/Excel
   - Format des fichiers
   - Validation des données

7. **[PROMOTIONS_GUIDE.md](./PROMOTIONS_GUIDE.md)** 🎉
   - Configuration des promotions saisonnières
   - Gestion des dates
   - Affichage conditionnel

---

## 🗺️ Parcours de Lecture par Profil

### Pour les Développeurs (Nouveau sur le projet)

```
1. MODULAR_ARCH_README.md     (20 min)  - Vue d'ensemble
2. ROADMAP.md                  (15 min)  - Comprendre le plan
3. ARCHITECTURE_V2.md          (45 min)  - Architecture détaillée
4. MIGRATION_GUIDE.md          (30 min)  - Comment migrer du code
```

### Pour les Lead Developers / Architectes

```
1. ARCHITECTURE_V2.md          (45 min)  - Architecture complète
2. ROADMAP.md                  (30 min)  - Planning et phases
3. MIGRATION_GUIDE.md          (30 min)  - Stratégie de migration
4. MODULAR_ARCH_README.md      (15 min)  - Guide pratique
```

### Pour les Product Owners / Managers

```
1. ROADMAP.md                  (30 min)  - Timeline et livrables
2. MODULAR_ARCH_README.md      (20 min)  - Fonctionnalités V2
```

---

## 📁 Structure de la Documentation

```
docs/
├── README.md                      # ← Vous êtes ici
│
├── 🚀 Quick Start
│   └── ../MODULAR_ARCH_README.md  # Guide de démarrage rapide
│
├── 📅 Planning
│   └── ROADMAP.md                 # Roadmap 8 phases (10-12 semaines)
│
├── 🏗️ Architecture
│   ├── ARCHITECTURE_V2.md         # Architecture modulaire V2
│   └── MIGRATION_GUIDE.md         # Guide de migration détaillé
│
└── 📚 Functional Guides
    ├── AUTH_GUIDE.md              # Authentification
    ├── IMPORT_PRODUCTS_GUIDE.md   # Import produits
    └── PROMOTIONS_GUIDE.md        # Promotions saisonnières
```

---

## 🎯 État Actuel du Projet

### ✅ Phase 1 Complétée (Architecture Foundation)

**Branche**: `feature/modular-architecture`

**Ce qui fonctionne**:
- ✅ Système de types (Permission, Role, User, Module)
- ✅ Service de permissions avec wildcards
- ✅ Hook `usePermissions` et composant `PermissionGate`
- ✅ `AuthProviderV2` avec migration automatique V1→V2
- ✅ Configuration de 6 modules (Dashboard, CRM, Orders, Products, Reports, Commercial)
- ✅ Registre des modules avec filtrage par permissions
- ✅ `AdminLayoutV2` avec navigation dynamique
- ✅ Build testé et fonctionnel ✅

**Statistiques**:
- 20 fichiers créés (~1,600 lignes)
- 6 modules configurés
- 4 guides de documentation
- 3 commits

### 🔄 Prochaine Phase

**Phase 2**: Intégration et Routing Dynamique (2-3 jours)

**Objectifs**:
1. Activer V2 dans `App.tsx`
2. Créer le routing dynamique
3. Tester la navigation
4. Valider la compatibilité V1

Voir [ROADMAP.md](./ROADMAP.md) pour les détails complets.

---

## 🔑 Concepts Clés V2

### Permissions

**Format**: `MODULE:RESOURCE:ACTION`

```typescript
"CRM:CUSTOMER:READ"        // Lire les clients
"CRM:CUSTOMER:WRITE"       // Créer/modifier
"ORDERS:ORDER:ADMIN"       // Admin complet
"*:*:*"                    // Super admin (tout)
"CRM:*:*"                  // Toutes permissions CRM
```

### Rôles Système

| Rôle | Permissions | Modules Accessibles |
|------|-------------|---------------------|
| **Super Admin** | `*:*:*` | Tous |
| **Admin** | Gestion plateforme | Dashboard, CRM, Orders, Products, Commercial, Reports |
| **Manager** | Opérations | Dashboard, CRM, Orders (limité), Products (lecture) |
| **Staff** | Lecture limitée | Dashboard, CRM (lecture), Orders (lecture) |
| **Client** | Aucune | Site public uniquement |

### Modules

**6 modules V1** (actifs):
- Dashboard - Tableau de bord
- CRM - Gestion clients
- Orders - Commandes
- Products - Catalogue produits
- Reports - Rapports
- Commercial - Paramètres

**4 modules V2** (à créer - Phases 5-6):
- Suppliers - Fournisseurs
- Logistics - Logistique
- Users - Gestion utilisateurs et rôles
- Settings - Paramètres système

---

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** - Build tool
- **React Router v6** - Routing
- **TanStack Query** - Server state
- **Radix UI** + **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zod** - Validation
- **React PDF** - PDF generation

### Backend (À intégrer - Phase 4)
- **Node.js** / **Express** (recommandé)
- **PostgreSQL** ou **MySQL** (à définir)
- **JWT** pour authentification
- **REST API** ou **GraphQL** (à définir)

---

## 📦 Structure du Projet

```
src/
├── core/                    # Fonctionnalités core
│   ├── auth/               # Authentification V2
│   │   ├── services/       # permissionService.ts
│   │   ├── hooks/          # usePermissions.ts
│   │   ├── providers/      # AuthProviderV2.tsx
│   │   └── components/     # PermissionGate.tsx
│   ├── api/                # API client (Phase 4)
│   └── router/             # Routing dynamique (Phase 2)
│
├── modules/                 # Modules métier
│   ├── dashboard/          # Tableau de bord
│   ├── crm/                # CRM
│   ├── orders/             # Commandes
│   ├── products/           # Produits
│   ├── reports/            # Rapports
│   ├── commercial/         # Commercial
│   └── [v2-modules]/       # Suppliers, Logistics, Users, Settings
│
├── types/                   # Types TypeScript
│   ├── entities/           # Permission, Role, User
│   └── module/             # ModuleConfig
│
├── config/                  # Configuration
│   ├── modules.config.ts   # Registre des modules
│   ├── app.config.ts       # Config globale
│   └── [autres configs]
│
├── components/              # Composants partagés
│   ├── layout/             # AdminLayoutV2, Header, Footer
│   └── ui/                 # shadcn/ui components
│
└── shared/                  # Code partagé
    ├── components/         # Composants réutilisables
    ├── hooks/              # Hooks communs
    └── utils/              # Utilitaires
```

---

## 🧪 Tests et Qualité

### Tests Actuels
- ✅ Build successful sans erreurs
- ✅ TypeScript compilation OK
- ✅ Navigation dynamique testée manuellement

### Tests À Ajouter (Phase 7)
- [ ] Tests unitaires (Vitest)
- [ ] Tests d'intégration (React Testing Library)
- [ ] Tests E2E (Playwright)
- [ ] Tests de permissions
- [ ] Tests de routing

---

## 🔒 Sécurité

### Implémenté
- ✅ Permissions granulaires
- ✅ Protection des routes
- ✅ Vérification des accès par composant

### À Implémenter (Phase 4)
- [ ] JWT avec refresh tokens
- [ ] HTTPS en production
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] XSS protection
- [ ] SQL injection prevention

---

## 🚀 Déploiement

### Environnements

**Development** (Local)
- URL: `http://localhost:5173`
- API: Mock data
- Build: `npm run dev`

**Staging** (À configurer - Phase 8)
- URL: TBD
- API: Staging backend
- Build: `npm run build`

**Production** (À configurer - Phase 8)
- URL: TBD
- API: Production backend
- Build: `npm run build`

---

## 📞 Support et Contact

### Questions sur l'Architecture
- Consulter [ARCHITECTURE_V2.md](./ARCHITECTURE_V2.md)
- Ouvrir une issue GitHub avec label `architecture`

### Questions sur la Migration
- Consulter [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Ouvrir une issue GitHub avec label `migration`

### Questions Générales
- Consulter [MODULAR_ARCH_README.md](../MODULAR_ARCH_README.md)
- Ouvrir une issue GitHub

### Bugs
- Vérifier les issues existantes
- Ouvrir une nouvelle issue avec:
  - Description du problème
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots si applicable

---

## 📝 Contribution

Avant de contribuer:
1. Lire [ROADMAP.md](./ROADMAP.md) pour comprendre le plan
2. Lire [ARCHITECTURE_V2.md](./ARCHITECTURE_V2.md) pour l'architecture
3. Suivre la stratégie de branches (une branche par phase/module)
4. Créer une PR avec description détaillée

### Standards de Code
- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- Tests requis pour nouvelles fonctionnalités

---

## 🎓 Ressources Complémentaires

### Documentation Externe
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Patterns et Best Practices
- [React Patterns](https://www.patterns.dev/)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Module Pattern](https://www.patterns.dev/posts/module-pattern)

---

## 📊 Métriques du Projet

### Code
- **Lignes de code**: ~15,000
- **Composants**: ~50+
- **Modules**: 6 (V1) + 4 (V2 à venir)
- **Types**: ~30+

### Documentation
- **Pages**: 7
- **Mots**: ~20,000
- **Exemples de code**: ~100+

### Timeline
- **Phase 1**: ✅ 3 jours (Terminé)
- **Phases 2-8**: 10-12 semaines (Planifié)
- **Total**: ~3 mois

---

**Dernière mise à jour**: 2025-12-27
**Version**: 2.0.0-alpha
**Branche active**: `feature/modular-architecture`
**Statut**: Phase 1 complétée ✅
