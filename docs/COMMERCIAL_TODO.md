# TODO - Implémentation Module Commercial

## ✅ Travaux Terminés

### 1. Architecture de Base
- ✅ Structure des dossiers (types/, services/, hooks/, components/, pages/)
- ✅ Types TypeScript complets pour toutes les entités
- ✅ Configuration API avec flag mock/réel (api.config.ts)
- ✅ Service clients avec mock data et structure API-ready
- ✅ Hooks React Query pour clients (useClients, useCreateClient, etc.)

### 2. Dashboard Principal
- ✅ Fusion dashboard principal + commercial dashboard
- ✅ Cartes d'accès rapide responsives
- ✅ Filtrage automatique selon feature flags (.env)
- ✅ Suppression de la page Commercial (redondante)

### 3. Système de Configuration
- ✅ Variables d'environnement (.env) pour activer/désactiver modules
- ✅ Feature flags granulaires pour chaque fonctionnalité
- ✅ Documentation complète (MODULE_CONFIGURATION_GUIDE.md)

---

## 🔄 Travaux à Adapter depuis V1

### Pages V1 Existantes à Réutiliser

#### 1. CustomersPage → ClientsPage
**Fichier V1:** `src/pages/admin/CustomersPage.tsx`
**Fichier V2:** `src/modules/commercial/pages/ClientsPage.tsx`

**Travail à faire:**
1. Copier CustomersPage.tsx vers ClientsPage.tsx
2. Adapter pour utiliser les nouveaux types (Client au lieu de Customer)
3. Remplacer les appels API par les hooks React Query (useClients, useCreateClient)
4. Ajouter les filtres: statut, catégorie, banque partenaire
5. Ajouter tri par nom, CA total, date création
6. Garder le design et la structure de la table

**Changements principaux:**
```typescript
// Avant (V1)
const { data: customers } = useQuery('/api/customers');

// Après (V2)
import { useClients } from '../hooks/useClients';
const { data: clients } = useClients({ page: 1, limit: 10 });
```

---

#### 2. ProductsPage → CataloguePage
**Fichier V1:** `src/pages/admin/ProductsPage.tsx`
**Fichier V2:** `src/modules/commercial/pages/CataloguePage.tsx`

**Travail à faire:**
1. Copier ProductsPage.tsx vers CataloguePage.tsx
2. **AJOUT IMPORTANT**: Organisation par onglets CBAO / CMS
3. Adapter pour utiliser ProduitCatalogue (type)
4. Créer service produits.service.ts (similaire à clients.service.ts)
5. Créer hook useProduits.ts
6. Ajouter filtrage par banque, catégorie, prix, stock
7. Vue grille (cards) ET vue liste (table)

**Structure de la page:**
```tsx
<Tabs defaultValue="tous">
  <TabsList>
    <TabsTrigger value="tous">Tous les produits</TabsTrigger>
    <TabsTrigger value="cbao">CBAO</TabsTrigger>
    <TabsTrigger value="cms">CMS</TabsTrigger>
  </TabsList>

  <TabsContent value="tous">
    {/* Grille de tous les produits */}
  </TabsContent>

  <TabsContent value="cbao">
    {/* Produits CBAO uniquement */}
  </TabsContent>

  <TabsContent value="cms">
    {/* Produits CMS uniquement */}
  </TabsContent>
</Tabs>
```

---

#### 3. OrdersPage → CommandesPage
**Fichier V1:** `src/pages/admin/OrdersPage.tsx`
**Fichier V2:** `src/modules/commercial/pages/CommandesPage.tsx`

**Travail à faire:**
1. Copier OrdersPage.tsx vers CommandesPage.tsx
2. Adapter pour utiliser CommandeCommerciale (type)
3. Créer service commandes.service.ts
4. Créer hook useCommandes.ts
5. Ajouter filtres: statut, client, date, mode paiement, banque
6. Ajouter badges colorés pour les statuts
7. **AJOUT**: Vue kanban optionnelle (par colonnes de statut)
8. Export Excel/PDF

**Statuts avec couleurs:**
```typescript
const statusColors = {
  brouillon: 'gray',
  en_attente: 'yellow',
  validee: 'blue',
  en_cours: 'purple',
  livree: 'green',
  annulee: 'red',
};
```

---

### Pages Nouvelles à Créer (Pas de V1)

#### 4. Scan BL
**Fichier:** `src/modules/commercial/pages/ScanBLPage.tsx`

**Fonctionnalités:**
- Zone d'upload drag & drop (react-dropzone)
- Prévisualisation PDF/Image
- Association à une commande (select/autocomplete)
- Liste des BL récents

**Librairies:**
```bash
npm install react-dropzone
```

**Composants à créer:**
- `BLUploader` - Zone upload
- `BLPreview` - Aperçu document
- `BLList` - Liste historique

---

#### 5. Tableau de Simulation
**Fichier:** `src/modules/commercial/pages/SimulationPage.tsx`

**Fonctionnalités:**
- Sélecteur de produits depuis catalogue
- Saisie quantités et remises
- Calcul automatique (sous-total, taxe, total, marge)
- Conditions de paiement (comptant, crédit, échéancier)
- Sauvegarde simulation
- Conversion en commande
- Export PDF (devis)

**Composants à créer:**
- `SimulationBuilder` - Interface principale
- `ProductSelector` - Sélection produits
- `SimulationSummary` - Résumé calculs
- `PaymentSchedule` - Échéancier

---

#### 6. Accréditif
**Fichier:** `src/modules/commercial/pages/AccreditifPage.tsx`

**Fonctionnalités:**
- Liste des accréditifs (tableau)
- Filtres: banque, statut, date, client
- Formulaire création accréditif
- Upload documents (lettres de crédit, garanties)
- Alertes expiration
- Association à commandes

---

#### 7. Service Après-Vente
**Fichier:** `src/modules/commercial/pages/SAVPage.tsx`

**Fonctionnalités:**
- Liste tickets SAV (tableau + kanban)
- Filtres: statut, priorité, type, client, technicien
- Création ticket
- Statistiques: ouverts, en cours, résolus, temps moyen

**Fichier:** `src/modules/commercial/pages/SAVDetailPage.tsx`

**Fonctionnalités:**
- Détails ticket
- Chronologie interventions
- Ajout intervention (formulaire)
- Upload photos
- Gestion pièces utilisées
- Calcul coûts
- Note satisfaction client

---

#### 8. Rapports Commerciaux
**Fichier:** `src/modules/commercial/pages/RapportsPage.tsx`

**Fonctionnalités:**
- Sélection période (jour, semaine, mois, trim, année, perso)
- Graphiques: CA, commandes, top clients, top produits
- Tableaux de données détaillés
- Export PDF/Excel

**Librairies:**
```bash
npm install recharts jspdf xlsx
```

---

## 📝 Services et Hooks à Créer

### Services Mock (pattern: clients.service.ts)

1. ✅ `clients.service.ts` - Déjà fait
2. ⏳ `produits.service.ts` - À créer
3. ⏳ `commandes.service.ts` - À créer
4. ⏳ `bonLivraison.service.ts` - À créer
5. ⏳ `accreditifs.service.ts` - À créer
6. ⏳ `simulations.service.ts` - À créer
7. ⏳ `sav.service.ts` - À créer
8. ⏳ `rapports.service.ts` - À créer

### Hooks React Query (pattern: useClients.ts)

1. ✅ `useClients.ts` - Déjà fait
2. ⏳ `useProduits.ts` - À créer
3. ⏳ `useCommandes.ts` - À créer
4. ⏳ `useBonLivraison.ts` - À créer
5. ⏳ `useAccreditifs.ts` - À créer
6. ⏳ `useSimulations.ts` - À créer
7. ⏳ `useSAV.ts` - À créer
8. ⏳ `useRapports.ts` - À créer

---

## 🎯 Plan d'Exécution Recommandé

### Sprint 1 (MVP - 2 semaines)

**Semaine 1:**
1. ✅ Architecture (types, services, hooks) - FAIT
2. Adapter CustomersPage → ClientsPage
3. Créer produits.service.ts + useProduits.ts
4. Adapter ProductsPage → CataloguePage (avec onglets CBAO/CMS)

**Semaine 2:**
5. Créer simulations.service.ts + useSimulations.ts
6. Développer SimulationPage (calculateur basique)
7. Tests et corrections bugs
8. Documentation utilisateur

**Livrable Sprint 1:** Clients, Catalogue, Simulation fonctionnels

---

### Sprint 2 (Core Business - 2 semaines)

**Semaine 1:**
1. Créer commandes.service.ts + useCommandes.ts
2. Adapter OrdersPage → CommandesPage
3. Ajouter vue kanban (optionnel)
4. Export Excel/PDF

**Semaine 2:**
5. Créer bonLivraison.service.ts + useBonLivraison.ts
6. Développer ScanBLPage
7. Intégration react-dropzone
8. Association BL ↔ Commande

**Livrable Sprint 2:** Commandes + BL fonctionnels

---

### Sprint 3 (Compléments - 2 semaines)

**Semaine 1:**
1. Créer accreditifs.service.ts + useAccreditifs.ts
2. Développer AccreditifPage
3. Upload documents
4. Alertes expiration

**Semaine 2:**
5. Créer sav.service.ts + useSAV.ts
6. Développer SAVPage + SAVDetailPage
7. Chronologie interventions
8. Calcul coûts

**Livrable Sprint 3:** Accréditif + SAV fonctionnels

---

### Sprint 4 (Polish - 1 semaine)

1. Créer rapports.service.ts + useRapports.ts
2. Développer RapportsPage
3. Intégrer Recharts (graphiques)
4. Export PDF/Excel
5. Tests complets
6. Corrections bugs
7. Optimisations performance

**Livrable Sprint 4:** Application complète prête pour production

---

## 📦 Librairies à Installer

```bash
# Graphiques
npm install recharts

# Upload fichiers
npm install react-dropzone

# Export Excel
npm install xlsx

# Export PDF
npm install jspdf jspdf-autotable

# Dates (si pas déjà installé)
npm install date-fns

# Tables avancées (optionnel)
npm install @tanstack/react-table
```

---

## 🔧 Comment Adapter une Page V1 vers V2

### Exemple: CustomersPage → ClientsPage

**Étape 1:** Copier le fichier
```bash
cp src/pages/admin/CustomersPage.tsx src/modules/commercial/pages/ClientsPage.tsx
```

**Étape 2:** Changer les imports
```typescript
// Avant
import { Customer } from '@/types/entities/Customer';

// Après
import type { Client } from '../types';
import { useClients, useCreateClient } from '../hooks/useClients';
```

**Étape 3:** Remplacer les appels API
```typescript
// Avant
const { data } = useQuery('/api/customers');

// Après
const { data } = useClients({ page, limit, search });
```

**Étape 4:** Adapter les types
```typescript
// Avant
const customer: Customer = {...};

// Après
const client: Client = {...};
```

**Étape 5:** Tester
- Vérifier l'affichage
- Tester les filtres
- Tester create/update/delete
- Vérifier les notifications (toast)

---

## ✅ Checklist Avant Déploiement

### Code
- [ ] Tous les services créés avec mocks
- [ ] Tous les hooks React Query créés
- [ ] Toutes les pages adaptées/créées
- [ ] TypeScript strict (pas de `any`)
- [ ] Validation Zod sur tous les formulaires
- [ ] Gestion des erreurs (try/catch + toast)

### UX/UI
- [ ] Responsive mobile testé
- [ ] Loading states sur toutes les actions async
- [ ] Messages d'erreur clairs en français
- [ ] Navigation intuitive
- [ ] Accessibilité (labels, aria, clavier)

### Performance
- [ ] Images lazy loading
- [ ] Pagination côté serveur
- [ ] Cache React Query optimisé
- [ ] Bundle size < 500KB

### Documentation
- [ ] README mis à jour
- [ ] Guide utilisateur créé
- [ ] Commentaires sur code complexe
- [ ] Types documentés

---

## 🚀 Pour Intégrer le Backend Réel

### Configuration
1. Dans `.env`, changer `VITE_API_URL` vers l'URL du backend
2. Dans `api.config.ts`, changer `USE_MOCK_API = false`

### Services
Pour chaque service (ex: clients.service.ts):

1. Retirer les mocks (MOCK_CLIENTS, etc.)
2. Implémenter les `fetch()` dans les TODO:

```typescript
// Avant (mock)
if (USE_MOCK_API) {
  await simulateNetworkDelay();
  return { data: MOCK_CLIENTS };
}

// Après (API réelle)
const response = await fetch(`${API_BASE_URL}/commercial/clients`);
const data = await response.json();
return data;
```

3. **Aucun changement dans les hooks ou les composants!**

---

## 📊 Estimation Temps de Développement

| Tâche | Temps estimé |
|-------|--------------|
| Sprint 1 (MVP) | 2 semaines |
| Sprint 2 (Core) | 2 semaines |
| Sprint 3 (Compléments) | 2 semaines |
| Sprint 4 (Polish) | 1 semaine |
| **Total** | **7 semaines** |

---

## 📞 Support

En cas de questions:
- Documentation: `/docs/`
- Plan d'implémentation: `COMMERCIAL_MODULE_IMPLEMENTATION_PLAN.md`
- Guide config: `MODULE_CONFIGURATION_GUIDE.md`

---

**Dernière mise à jour:** 2024-12-28
**Version:** 2.0.0
**Statut:** Architecture prête, adaptation V1→V2 en cours
