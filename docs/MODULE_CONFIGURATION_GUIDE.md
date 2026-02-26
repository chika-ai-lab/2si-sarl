# Guide de Configuration des Modules

## Vue d'ensemble

Le système de modules de **2SI Commerce Hub** permet d'activer ou de désactiver des modules entiers ou des fonctionnalités spécifiques via des variables d'environnement. Cela permet de contrôler précisément quelles fonctionnalités sont disponibles pour les clients, facilitant ainsi la monétisation et les licences par fonctionnalité.

---

## Configuration via .env

### Fichiers de configuration

- **`.env`** - Configuration pour le développement local (ignoré par git)
- **`.env.example`** - Template de configuration (versionné dans git)

### Structure des variables

Toutes les variables d'environnement utilisent le préfixe `VITE_` car nous utilisons Vite comme bundler.

---

## Configuration des Modules

### Modules Principaux

#### Dashboard (Core - Toujours activé)
```bash
VITE_MODULE_DASHBOARD_ENABLED=true  # Ne peut pas être désactivé
```

#### CRM
```bash
VITE_MODULE_CRM_ENABLED=false       # true = activé, false = désactivé
```

#### Commandes (Orders)
```bash
VITE_MODULE_ORDERS_ENABLED=false    # true = activé, false = désactivé
```

#### Produits
```bash
VITE_MODULE_PRODUCTS_ENABLED=false  # true = activé, false = désactivé
```

#### Rapports
```bash
VITE_MODULE_REPORTS_ENABLED=false   # true = activé, false = désactivé
```

#### Module Commercial
```bash
VITE_MODULE_COMMERCIAL_ENABLED=true # true = activé, false = désactivé
```

---

## Configuration Granulaire du Module Commercial

Le module Commercial possède des **feature flags** pour activer/désactiver chaque fonctionnalité individuellement. Cela permet une monétisation fine et un contrôle précis.

### Feature Flags Disponibles

#### Clients
```bash
VITE_COMMERCIAL_CLIENTS_ENABLED=true
```
- Gestion des clients
- Création, modification, suppression
- Fiche client détaillée
- Historique des transactions

#### Commandes
```bash
VITE_COMMERCIAL_COMMANDES_ENABLED=true
```
- Gestion des commandes clients
- Création de commandes
- Suivi des statuts
- Validation et livraison

#### Scan BL
```bash
VITE_COMMERCIAL_SCAN_BL_ENABLED=false
```
- Numérisation des bons de livraison
- Upload de documents
- Association aux commandes
- Historique des scans

#### Catalogue
```bash
VITE_COMMERCIAL_CATALOGUE_ENABLED=true
```
- Consultation du catalogue produits
- Organisation par banque (CBAO, CMS)
- Recherche et filtres
- Détails produits

#### Accréditif
```bash
VITE_COMMERCIAL_ACCREDITIF_ENABLED=false
```
- Gestion des documents accréditifs
- Suivi des lettres de crédit
- Documents bancaires
- Dates d'expiration

#### Tableau de Simulation
```bash
VITE_COMMERCIAL_SIMULATION_ENABLED=true
```
- Calculateur de devis
- Simulation de prix
- Calcul de marges
- Génération de devis PDF

#### S.A.V (Service Après-Vente)
```bash
VITE_COMMERCIAL_SAV_ENABLED=false
```
- Gestion des tickets SAV
- Suivi des interventions
- Gestion des pièces
- Satisfaction client

#### Rapports Commerciaux
```bash
VITE_COMMERCIAL_RAPPORTS_ENABLED=false
```
- Rapports d'activité
- Graphiques de performance
- Export Excel/PDF
- Analyses par période

---

## Comportement du Système

### Hiérarchie des Activations

1. **Module désactivé** → Toutes les fonctionnalités du module sont inaccessibles
2. **Module activé + Feature désactivée** → La fonctionnalité spécifique est masquée
3. **Module activé + Feature activée** → La fonctionnalité est accessible

### Exemple de Configuration

```bash
# Module commercial activé
VITE_MODULE_COMMERCIAL_ENABLED=true

# Fonctionnalités gratuites (activées)
VITE_COMMERCIAL_CLIENTS_ENABLED=true
VITE_COMMERCIAL_COMMANDES_ENABLED=true
VITE_COMMERCIAL_CATALOGUE_ENABLED=true
VITE_COMMERCIAL_SIMULATION_ENABLED=true

# Fonctionnalités premium (désactivées jusqu'au paiement)
VITE_COMMERCIAL_SCAN_BL_ENABLED=false
VITE_COMMERCIAL_ACCREDITIF_ENABLED=false
VITE_COMMERCIAL_SAV_ENABLED=false
VITE_COMMERCIAL_RAPPORTS_ENABLED=false
```

Dans cet exemple, le client a accès au module commercial de base (clients, commandes, catalogue, simulation) mais doit payer pour débloquer les fonctionnalités avancées (scan BL, accréditif, SAV, rapports).

---

## Impact sur l'Interface

### Navigation Sidebar

Quand une fonctionnalité est désactivée:
- ❌ L'item de navigation disparaît complètement de la sidebar
- ✅ Les items de navigation des fonctionnalités activées restent visibles

### Routes

Quand une fonctionnalité est désactivée:
- ❌ Les routes associées ne sont pas montées dans React Router
- ❌ Tenter d'accéder directement à l'URL retourne une 404
- ✅ Les routes activées restent accessibles

### Dashboard Commercial

Le dashboard commercial affiche uniquement les **accès rapides** vers les fonctionnalités activées.

---

## Utilisation dans le Code

### Vérifier si un module est activé

```typescript
import { isModuleEnabled } from "@/config/env.config";

if (isModuleEnabled('commercial')) {
  // Le module commercial est activé
}
```

### Vérifier si une feature commerciale est activée

```typescript
import { isCommercialFeatureEnabled } from "@/config/env.config";

if (isCommercialFeatureEnabled('sav')) {
  // La fonctionnalité SAV est activée
}
```

### Affichage conditionnel dans les composants

```tsx
import { isCommercialFeatureEnabled } from "@/config/env.config";

function MyComponent() {
  return (
    <div>
      {isCommercialFeatureEnabled('rapports') && (
        <Button onClick={openReports}>
          Voir les rapports
        </Button>
      )}
    </div>
  );
}
```

---

## Cas d'Usage

### 1. Version d'Essai Gratuite

```bash
# Modules de base activés
VITE_MODULE_DASHBOARD_ENABLED=true
VITE_MODULE_COMMERCIAL_ENABLED=true

# Fonctionnalités limitées
VITE_COMMERCIAL_CLIENTS_ENABLED=true
VITE_COMMERCIAL_COMMANDES_ENABLED=true
VITE_COMMERCIAL_CATALOGUE_ENABLED=true
VITE_COMMERCIAL_SIMULATION_ENABLED=true

# Fonctionnalités premium désactivées
VITE_COMMERCIAL_SCAN_BL_ENABLED=false
VITE_COMMERCIAL_ACCREDITIF_ENABLED=false
VITE_COMMERCIAL_SAV_ENABLED=false
VITE_COMMERCIAL_RAPPORTS_ENABLED=false
```

### 2. Version Complète Payée

```bash
# Tous les modules activés
VITE_MODULE_DASHBOARD_ENABLED=true
VITE_MODULE_CRM_ENABLED=true
VITE_MODULE_ORDERS_ENABLED=true
VITE_MODULE_PRODUCTS_ENABLED=true
VITE_MODULE_REPORTS_ENABLED=true
VITE_MODULE_COMMERCIAL_ENABLED=true

# Toutes les fonctionnalités commerciales activées
VITE_COMMERCIAL_CLIENTS_ENABLED=true
VITE_COMMERCIAL_COMMANDES_ENABLED=true
VITE_COMMERCIAL_SCAN_BL_ENABLED=true
VITE_COMMERCIAL_CATALOGUE_ENABLED=true
VITE_COMMERCIAL_ACCREDITIF_ENABLED=true
VITE_COMMERCIAL_SIMULATION_ENABLED=true
VITE_COMMERCIAL_SAV_ENABLED=true
VITE_COMMERCIAL_RAPPORTS_ENABLED=true
```

### 3. Packages par Fonctionnalité

#### Package "Starter" (19 000 FCFA/mois)
```bash
VITE_COMMERCIAL_CLIENTS_ENABLED=true
VITE_COMMERCIAL_COMMANDES_ENABLED=true
VITE_COMMERCIAL_CATALOGUE_ENABLED=true
VITE_COMMERCIAL_SIMULATION_ENABLED=true
```

#### Package "Business" (39 000 FCFA/mois)
Starter + :
```bash
VITE_COMMERCIAL_SCAN_BL_ENABLED=true
VITE_COMMERCIAL_RAPPORTS_ENABLED=true
```

#### Package "Enterprise" (79 000 FCFA/mois)
Business + :
```bash
VITE_COMMERCIAL_ACCREDITIF_ENABLED=true
VITE_COMMERCIAL_SAV_ENABLED=true
VITE_MODULE_CRM_ENABLED=true
VITE_MODULE_REPORTS_ENABLED=true
```

---

## Déploiement

### Variables d'Environnement par Environnement

#### Développement Local
Utilisez `.env` pour votre configuration locale.

#### Staging/Test
Configurez les variables dans votre plateforme de déploiement (Vercel, Netlify, etc.):
```bash
VITE_APP_ENV=staging
VITE_MODULE_COMMERCIAL_ENABLED=true
# ... autres variables
```

#### Production
Configurez les variables en production selon le package acheté par le client:
```bash
VITE_APP_ENV=production
VITE_LICENSE_KEY=abc123...
VITE_MODULE_COMMERCIAL_ENABLED=true
# ... activation selon le package
```

---

## Gestion des Licences (Futur)

### Variables de Licence

```bash
VITE_LICENSE_KEY=votre-clé-licence
VITE_LICENSE_EXPIRY=2025-12-31
```

### Validation de Licence

Dans une version future, un système de validation de licence vérifiera:
1. La clé de licence est valide
2. La licence n'a pas expiré
3. Les modules activés correspondent à la licence

Exemple de vérification:
```typescript
import { validateLicense } from "@/core/license/licenseService";

const licenseValid = await validateLicense();
if (!licenseValid) {
  // Désactiver l'accès ou afficher un message
}
```

---

## Meilleures Pratiques

### 1. Ne jamais commiter .env
Le fichier `.env` est dans `.gitignore` et ne doit jamais être versionné.

### 2. Documenter les changements
Quand vous ajoutez une nouvelle variable, mettez à jour `.env.example` et ce document.

### 3. Valeurs par défaut sécurisées
Les valeurs par défaut doivent être **restrictives** (désactivé par défaut).

### 4. Tests
Testez toujours avec les deux configurations:
- Toutes les features activées
- Toutes les features désactivées

### 5. Messages clairs
Si une fonctionnalité est désactivée mais que l'utilisateur essaie d'y accéder, affichez un message clair expliquant comment l'activer.

---

## Troubleshooting

### Le module ne se désactive pas

**Problème**: Vous avez mis `VITE_MODULE_COMMERCIAL_ENABLED=false` mais le module est toujours visible.

**Solution**:
1. Redémarrez le serveur de développement (`npm run dev`)
2. Videz le cache du navigateur
3. Vérifiez que la variable est bien dans `.env` (pas `.env.example`)

### Les changements ne sont pas pris en compte

**Problème**: Vous modifiez `.env` mais rien ne change.

**Solution**:
1. Les variables Vite sont chargées au démarrage uniquement
2. Redémarrez avec `npm run dev`
3. Ne modifiez jamais `.env` pendant que le serveur tourne

### Erreur "module is not defined"

**Problème**: Erreur lors de l'accès à un module désactivé.

**Solution**:
Vérifiez que vous utilisez bien `isModuleEnabled()` ou `isCommercialFeatureEnabled()` avant d'afficher des composants conditionnels.

---

## Checklist de Configuration Client

Avant de déployer pour un nouveau client:

- [ ] Copier `.env.example` vers `.env`
- [ ] Définir `VITE_APP_ENV=production`
- [ ] Configurer l'URL de l'API (`VITE_API_URL`)
- [ ] Activer uniquement les modules payés par le client
- [ ] Activer uniquement les features du package acheté
- [ ] Tester toutes les fonctionnalités activées
- [ ] Vérifier que les fonctionnalités désactivées ne sont pas accessibles
- [ ] Configurer les variables sur la plateforme de déploiement
- [ ] Documenter la configuration client

---

## Support

Pour toute question sur la configuration des modules:
- Documentation: `/docs/`
- Support technique: support@2si.sarl

---

**Dernière mise à jour**: 2024-12-28
**Version**: 2.0.0
