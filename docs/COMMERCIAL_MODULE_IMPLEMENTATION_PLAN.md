# Plan d'Implémentation du Module Commercial

## Vue d'ensemble

Ce document détaille le plan d'implémentation complet du module Commercial, organisé par phases et par fonctionnalité.

---

## Phase 1: Infrastructure de Base (Priorité: Haute)

### 1.1 Modèles de Données

**Types TypeScript à créer dans `src/types/entities/`:**

#### Client.ts
```typescript
interface Client {
  id: string;
  code: string; // Code client unique (ex: CLT-001)
  nom: string;
  prenom?: string;
  raisonSociale?: string; // Pour les entreprises
  type: 'particulier' | 'entreprise';

  // Contact
  email: string;
  telephone: string;
  telephoneSecondaire?: string;
  adresse: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
  };

  // Commercial
  categorie: 'A' | 'B' | 'C'; // Catégorie client (importance)
  credit: {
    limite: number; // Limite de crédit en FCFA
    utilise: number; // Crédit utilisé
    disponible: number; // Crédit disponible
  };

  // Banque partenaire
  banquePartenaire: 'CBAO' | 'CMS' | 'Autre';
  numeroCompte?: string;

  // Métadonnées
  statut: 'actif' | 'inactif' | 'suspendu';
  dateCreation: string;
  dernierAchat?: string;
  totalAchats: number; // CA total généré
  nombreCommandes: number;

  // Relation commerciale
  commercialAssigne?: string; // ID du commercial
  notes?: string;
}
```

#### CommandeCommerciale.ts
```typescript
interface CommandeCommerciale {
  id: string;
  reference: string; // Ex: CMD-2024-001

  // Client
  clientId: string;
  client?: Client; // Populated

  // Statut
  statut: 'brouillon' | 'en_attente' | 'validee' | 'en_cours' | 'livree' | 'annulee';
  dateCommande: string;
  dateValidation?: string;
  dateLivraison?: string;

  // Produits
  lignes: LigneCommande[];

  // Montants
  sousTotal: number;
  taxe: number; // TVA
  fraisLivraison: number;
  remise: number;
  total: number;

  // Livraison
  adresseLivraison: Adresse;
  modeLivraison: 'retrait' | 'livraison_express' | 'livraison_standard';

  // Paiement
  modePaiement: 'especes' | 'virement' | 'cheque' | 'credit' | 'accreditif';
  statutPaiement: 'en_attente' | 'partiel' | 'complet';
  montantPaye: number;

  // Documents associés
  bonLivraison?: string; // ID du BL scanné
  accreditif?: string; // ID de l'accréditif si applicable
  facture?: string; // ID de la facture

  // Métadonnées
  creePar: string; // User ID
  modifiePar?: string;
  notes?: string;
}

interface LigneCommande {
  id: string;
  produitId: string;
  produit?: Produit; // Populated
  quantite: number;
  prixUnitaire: number;
  remise: number;
  sousTotal: number;
}
```

#### ProduitCatalogue.ts
```typescript
interface ProduitCatalogue {
  id: string;
  reference: string; // SKU
  nom: string;
  description: string;

  // Classification
  categorie: string;
  sousCategorie?: string;
  marque?: string;

  // Banque
  banque: 'CBAO' | 'CMS'; // Produit de quelle banque

  // Prix
  prixAchat: number;
  prixVente: number;
  prixPromo?: number;
  marge: number; // Calculé automatiquement

  // Stock
  stock: {
    quantite: number;
    seuilAlerte: number;
    unite: 'piece' | 'carton' | 'palette';
  };

  // Caractéristiques
  specifications?: Record<string, string>;
  images: string[]; // URLs des images

  // Métadonnées
  statut: 'actif' | 'inactif' | 'rupture';
  dateAjout: string;
  derniereModification: string;
}
```

#### BonLivraison.ts
```typescript
interface BonLivraison {
  id: string;
  numero: string;

  // Commande associée
  commandeId: string;
  commande?: CommandeCommerciale;

  // Scan
  fichierScan: string; // URL du PDF/image scanné
  dateScan: string;
  scannePar: string; // User ID

  // Détails
  dateLivraison: string;
  livreur?: string;
  signature?: string; // URL de la signature

  // Statut
  statut: 'scanne' | 'valide' | 'traite';
  notes?: string;
}
```

#### Accreditif.ts
```typescript
interface Accreditif {
  id: string;
  reference: string;

  // Commande/Client
  commandeId?: string;
  clientId: string;

  // Banque
  banqueEmettrice: 'CBAO' | 'CMS' | 'Autre';
  numeroCreditif: string;

  // Montants
  montant: number;
  devise: 'FCFA' | 'EUR' | 'USD';

  // Dates
  dateEmission: string;
  dateExpiration: string;

  // Documents
  documents: {
    type: 'lettre_credit' | 'garantie' | 'autre';
    nom: string;
    url: string;
    dateUpload: string;
  }[];

  // Statut
  statut: 'en_attente' | 'approuve' | 'execute' | 'expire' | 'annule';

  // Métadonnées
  creePar: string;
  notes?: string;
}
```

#### Simulation.ts
```typescript
interface Simulation {
  id: string;
  reference: string;

  // Client (optionnel pour devis)
  clientId?: string;
  client?: Client;

  // Produits simulés
  produits: {
    produitId: string;
    produit?: ProduitCatalogue;
    quantite: number;
    prixUnitaire: number;
    remisePercentage: number;
    remiseMontant: number;
  }[];

  // Calculs
  sousTotal: number;
  remiseTotale: number;
  taxe: number;
  fraisAdditionnels: number;
  total: number;
  marge: number;
  pourcentageMarge: number;

  // Options de paiement
  conditionsPaiement: 'comptant' | 'credit_30j' | 'credit_60j' | 'echelonne';
  echeancier?: {
    date: string;
    montant: number;
  }[];

  // Métadonnées
  dateCreation: string;
  creePar: string;
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'converti';

  // Conversion
  commandeId?: string; // Si converti en commande
}
```

#### TicketSAV.ts
```typescript
interface TicketSAV {
  id: string;
  numero: string; // Ex: SAV-2024-001

  // Client et produit
  clientId: string;
  client?: Client;
  produitId?: string;
  produit?: ProduitCatalogue;
  commandeId?: string; // Commande d'origine

  // Type de demande
  type: 'reparation' | 'remplacement' | 'retour' | 'reclamation' | 'garantie';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';

  // Description
  sujet: string;
  description: string;
  symptomes?: string;

  // Pièces jointes
  photos: string[]; // URLs des photos du problème
  documents: string[];

  // Statut
  statut: 'ouvert' | 'en_cours' | 'en_attente_pieces' | 'resolu' | 'ferme' | 'annule';

  // Interventions
  interventions: {
    id: string;
    date: string;
    technicienId: string;
    technicien?: string; // Nom
    description: string;
    piecesUtilisees?: {
      nom: string;
      reference: string;
      quantite: number;
      prix: number;
    }[];
    tempsIntervention: number; // en minutes
    cout: number;
  }[];

  // Dates
  dateOuverture: string;
  datePrevueResolution?: string;
  dateResolution?: string;

  // Garantie
  sousGarantie: boolean;
  dateFinGarantie?: string;

  // Coûts
  coutPieces: number;
  coutMainOeuvre: number;
  coutTotal: number;

  // Satisfaction
  noteSatisfaction?: 1 | 2 | 3 | 4 | 5;
  commentaireSatisfaction?: string;

  // Métadonnées
  assigneA?: string; // Technicien assigné
  creePar: string;
  notes?: string;
}
```

---

## Phase 2: Implémentation des Pages

### 2.1 Dashboard Commercial

**Fichier**: `src/modules/commercial/pages/CommercialDashboard.tsx`

**Fonctionnalités:**
- ✅ Statistiques en temps réel (déjà fait)
- [ ] Graphiques d'activité (CA mensuel, commandes par statut)
- [ ] Alertes et notifications (commandes en attente, stock faible, SAV urgents)
- [ ] Liste des dernières commandes
- [ ] Liste des derniers clients
- [ ] Indicateurs de performance (KPIs)

**Hooks à créer:**
- `useCommercialStats()` - Récupère les statistiques
- `useRecentOrders()` - Dernières commandes
- `useRecentClients()` - Derniers clients

**Composants:**
- `StatCard` - Carte de statistique (déjà existant)
- `OrdersChart` - Graphique des commandes
- `RevenueChart` - Graphique du CA
- `AlertsList` - Liste des alertes

---

### 2.2 Gestion des Clients

**Fichier**: `src/modules/commercial/pages/ClientsPage.tsx`

**Fonctionnalités:**
- [ ] Liste paginée des clients avec filtres
  - Recherche par nom/email/code
  - Filtre par statut (actif/inactif/suspendu)
  - Filtre par catégorie (A/B/C)
  - Filtre par banque partenaire
- [ ] Tri par colonnes (nom, CA total, dernière commande)
- [ ] Actions en masse (exporter, désactiver)
- [ ] Bouton "Nouveau client"

**Composants:**
- `ClientsTable` - Tableau des clients
- `ClientFilters` - Filtres de recherche
- `CreateClientDialog` - Modal de création
- `ClientQuickActions` - Actions rapides (voir détails, nouvelle commande)

**API Mock:**
```typescript
// src/modules/commercial/services/clientsService.ts
export async function getClients(params: {
  page: number;
  limit: number;
  search?: string;
  statut?: string;
  categorie?: string;
  banque?: string;
}) {
  // Mock data pour l'instant
}
```

---

**Fichier**: `src/modules/commercial/pages/ClientDetailPage.tsx`

**Fonctionnalités:**
- [ ] Informations complètes du client (éditable)
- [ ] Historique des commandes (tableau)
- [ ] Historique des paiements
- [ ] Tickets SAV associés
- [ ] Graphique du CA client sur 12 mois
- [ ] Notes et commentaires
- [ ] Documents attachés
- [ ] Actions: Nouvelle commande, Éditer, Désactiver, Supprimer

**Composants:**
- `ClientHeader` - En-tête avec infos principales
- `ClientTabs` - Onglets (Général, Commandes, SAV, Documents, Notes)
- `EditClientForm` - Formulaire d'édition
- `ClientOrdersHistory` - Historique commandes
- `ClientRevenueChart` - Graphique CA client

---

### 2.3 Gestion des Commandes

**Fichier**: `src/modules/commercial/pages/CommandesPage.tsx`

**Fonctionnalités:**
- [ ] Liste paginée avec filtres avancés
  - Recherche par référence/client
  - Filtre par statut
  - Filtre par date (plage)
  - Filtre par mode de paiement
  - Filtre par banque
- [ ] Vue kanban optionnelle (par statut)
- [ ] Export Excel/PDF
- [ ] Statistiques en haut: Total, Validées, En cours, Livrées
- [ ] Bouton "Nouvelle commande"

**Composants:**
- `OrdersTable` - Tableau des commandes
- `OrdersKanban` - Vue kanban (optionnel)
- `OrderFilters` - Filtres
- `OrderStatusBadge` - Badge de statut coloré
- `CreateOrderWizard` - Assistant création commande

---

**Fichier**: `src/modules/commercial/pages/CommandeDetailPage.tsx`

**Fonctionnalités:**
- [ ] Informations complètes de la commande
- [ ] Liste des produits commandés
- [ ] Informations client (lien vers fiche)
- [ ] Chronologie des événements (création, validation, livraison)
- [ ] Documents associés (BL, facture, accréditif)
- [ ] Paiements et échéancier
- [ ] Actions: Modifier, Valider, Annuler, Générer facture, Imprimer

**Composants:**
- `OrderHeader` - En-tête commande
- `OrderProductsTable` - Produits commandés
- `OrderTimeline` - Chronologie
- `OrderPayments` - Paiements
- `OrderDocuments` - Documents
- `UpdateOrderStatusDialog` - Changer statut

---

### 2.4 Scan BL

**Fichier**: `src/modules/commercial/pages/ScanBLPage.tsx`

**Fonctionnalités:**
- [ ] Upload de fichier (PDF/Image)
- [ ] Scan via webcam/caméra (optionnel)
- [ ] OCR pour extraire données automatiquement (optionnel phase 2)
- [ ] Association à une commande
- [ ] Prévisualisation du document
- [ ] Liste des BL scannés récemment
- [ ] Recherche par numéro BL/commande

**Composants:**
- `BLUploader` - Zone d'upload drag & drop
- `BLScanner` - Scanner via caméra (optionnel)
- `BLPreview` - Aperçu du document
- `BLList` - Liste des BL
- `AssociateOrderDialog` - Associer à une commande

**Librairies nécessaires:**
- `react-dropzone` - Upload de fichiers
- `tesseract.js` - OCR (optionnel)

---

### 2.5 Catalogue

**Fichier**: `src/modules/commercial/pages/CataloguePage.tsx`

**Fonctionnalités:**
- [ ] Organisation par banque (CBAO / CMS)
- [ ] Onglets ou sections pour chaque banque
- [ ] Grille de produits avec images
- [ ] Filtres: Catégorie, Prix, Stock, Statut
- [ ] Recherche par nom/référence
- [ ] Vue liste / grille
- [ ] Détails produit en modal
- [ ] Actions: Ajouter au panier (simulation), Voir détails

**Composants:**
- `BankTabs` - Onglets CBAO/CMS
- `ProductGrid` - Grille de produits
- `ProductCard` - Carte produit
- `ProductFilters` - Filtres
- `ProductDetailDialog` - Modal détails
- `AddToSimulationButton` - Ajouter à simulation

**Structure suggérée:**
```
[CBAO]  [CMS]
+------------------------+
| [Filtres]              |
| Catégorie: [Tous]      |
| Prix: [Min - Max]      |
| Stock: [Disponible]    |
+------------------------+
|  [Grid de produits]    |
|  [Card] [Card] [Card]  |
|  [Card] [Card] [Card]  |
+------------------------+
```

---

### 2.6 Accréditif

**Fichier**: `src/modules/commercial/pages/AccreditifPage.tsx`

**Fonctionnalités:**
- [ ] Liste des accréditifs avec statuts
- [ ] Filtres: Banque, Statut, Date, Client
- [ ] Création d'accréditif (formulaire)
- [ ] Upload de documents
- [ ] Association à commande
- [ ] Suivi des dates d'expiration (alertes)
- [ ] Génération de documents PDF

**Composants:**
- `AccreditifsTable` - Liste des accréditifs
- `CreateAccreditifForm` - Formulaire de création
- `AccreditifDocuments` - Gestion documents
- `AccreditifTimeline` - Suivi chronologique
- `ExpirationAlert` - Alerte d'expiration

---

### 2.7 Tableau de Simulation

**Fichier**: `src/modules/commercial/pages/SimulationPage.tsx`

**Fonctionnalités:**
- [ ] Calculateur interactif
- [ ] Sélection produits depuis catalogue
- [ ] Ajout quantités
- [ ] Application remises (% ou montant)
- [ ] Calcul taxes automatique
- [ ] Conditions de paiement
- [ ] Génération échéancier
- [ ] Calcul de marge
- [ ] Sauvegarde simulation
- [ ] Conversion en commande
- [ ] Export PDF (devis)

**Composants:**
- `SimulationBuilder` - Interface de construction
- `ProductSelector` - Sélecteur de produits
- `SimulationSummary` - Résumé calculs
- `PaymentSchedule` - Échéancier
- `SaveSimulationDialog` - Sauvegarder
- `ConvertToOrderDialog` - Convertir en commande

**Calculs à implémenter:**
```typescript
// Calcul du total
sousTotal = sum(produit.prix * quantite)
remise = sousTotal * remisePercentage / 100
baseCalcul = sousTotal - remise
taxe = baseCalcul * 18 / 100 // TVA 18%
frais = fraisLivraison + autresFrais
total = baseCalcul + taxe + frais

// Marge
marge = sousTotal - sum(produit.prixAchat * quantite)
pourcentageMarge = (marge / sousTotal) * 100
```

---

### 2.8 Service Après-Vente

**Fichier**: `src/modules/commercial/pages/SAVPage.tsx`

**Fonctionnalités:**
- [ ] Liste tickets SAV avec filtres
  - Statut
  - Priorité
  - Type
  - Client
  - Technicien
  - Date
- [ ] Vue kanban par statut
- [ ] Création de ticket
- [ ] Statistiques: Ouverts, En cours, Résolus, Temps moyen résolution
- [ ] Notifications tickets urgents

**Composants:**
- `SAVTicketsTable` - Liste tickets
- `SAVKanban` - Vue kanban
- `CreateTicketDialog` - Création ticket
- `SAVFilters` - Filtres
- `SAVStats` - Statistiques

---

**Fichier**: `src/modules/commercial/pages/SAVDetailPage.tsx`

**Fonctionnalités:**
- [ ] Détails complets du ticket
- [ ] Informations client/produit
- [ ] Chronologie des interventions
- [ ] Ajout d'intervention
- [ ] Gestion pièces utilisées
- [ ] Calcul coûts (pièces + main d'œuvre)
- [ ] Upload photos/documents
- [ ] Changement statut
- [ ] Attribution technicien
- [ ] Note de satisfaction client
- [ ] Génération rapport intervention

**Composants:**
- `TicketHeader` - En-tête ticket
- `TicketTimeline` - Chronologie
- `AddInterventionForm` - Ajouter intervention
- `TicketDocuments` - Photos/docs
- `AssignTechnicianDialog` - Assigner technicien
- `CloseTicketDialog` - Clôture avec satisfaction

---

### 2.9 Rapports

**Fichier**: `src/modules/commercial/pages/RapportsPage.tsx`

**Fonctionnalités:**
- [ ] Sélection période (jour, semaine, mois, trimestre, année, personnalisé)
- [ ] Rapports disponibles:
  - CA par période
  - CA par client
  - CA par produit
  - CA par banque
  - Commandes par statut
  - Performance commerciale
  - Analyse des marges
  - Tickets SAV (volume, temps résolution)
  - Top clients
  - Top produits
- [ ] Graphiques interactifs (Chart.js ou Recharts)
- [ ] Export PDF/Excel
- [ ] Tableaux de données détaillés

**Composants:**
- `ReportSelector` - Sélection type de rapport
- `PeriodSelector` - Sélection période
- `RevenueChart` - Graphique CA
- `OrdersChart` - Graphique commandes
- `TopClientsTable` - Top clients
- `TopProductsTable` - Top produits
- `ExportButton` - Export données

**Librairies:**
- `recharts` ou `chart.js` - Graphiques
- `jspdf` - Export PDF
- `xlsx` - Export Excel

---

## Phase 3: Services et Hooks

### Services à créer dans `src/modules/commercial/services/`

```
services/
├── clientsService.ts          # CRUD clients
├── commandesService.ts        # CRUD commandes
├── produitsService.ts         # CRUD produits catalogue
├── bonLivraisonService.ts     # CRUD BL
├── accreditifService.ts       # CRUD accréditifs
├── simulationService.ts       # CRUD simulations
├── savService.ts              # CRUD tickets SAV
├── rapportsService.ts         # Génération rapports
└── commercialStatsService.ts  # Statistiques dashboard
```

### Hooks personnalisés dans `src/modules/commercial/hooks/`

```
hooks/
├── useClients.ts              # Gestion clients
├── useCommandes.ts            # Gestion commandes
├── useProduits.ts             # Gestion produits
├── useBonLivraison.ts         # Gestion BL
├── useAccreditifs.ts          # Gestion accréditifs
├── useSimulations.ts          # Gestion simulations
├── useSAV.ts                  # Gestion SAV
├── useRapports.ts             # Génération rapports
└── useCommercialStats.ts      # Stats dashboard
```

---

## Phase 4: Composants Réutilisables

### Créer dans `src/modules/commercial/components/`

```
components/
├── shared/
│   ├── DataTable.tsx          # Tableau de données réutilisable
│   ├── StatusBadge.tsx        # Badge de statut
│   ├── PriceDisplay.tsx       # Affichage prix formaté
│   ├── DateRangePicker.tsx    # Sélecteur période
│   └── ExportButton.tsx       # Bouton export
├── clients/
│   ├── ClientCard.tsx
│   ├── ClientForm.tsx
│   └── ClientSelector.tsx
├── commandes/
│   ├── OrderCard.tsx
│   ├── OrderForm.tsx
│   ├── OrderStatusStepper.tsx
│   └── ProductLineItem.tsx
├── produits/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   └── ProductSelector.tsx
└── charts/
    ├── RevenueChart.tsx
    ├── OrdersChart.tsx
    └── PerformanceChart.tsx
```

---

## Phase 5: Intégration Backend

### API Endpoints à créer (futur)

```
POST   /api/commercial/clients              # Créer client
GET    /api/commercial/clients              # Liste clients
GET    /api/commercial/clients/:id          # Détails client
PUT    /api/commercial/clients/:id          # Modifier client
DELETE /api/commercial/clients/:id          # Supprimer client

POST   /api/commercial/commandes            # Créer commande
GET    /api/commercial/commandes            # Liste commandes
GET    /api/commercial/commandes/:id        # Détails commande
PUT    /api/commercial/commandes/:id        # Modifier commande
PATCH  /api/commercial/commandes/:id/status # Changer statut

GET    /api/commercial/catalogue            # Catalogue produits
GET    /api/commercial/catalogue/banque/:banque # Produits par banque

POST   /api/commercial/bl                   # Upload BL
GET    /api/commercial/bl                   # Liste BL

POST   /api/commercial/accreditifs          # Créer accréditif
GET    /api/commercial/accreditifs          # Liste accréditifs

POST   /api/commercial/simulations          # Créer simulation
GET    /api/commercial/simulations          # Liste simulations
POST   /api/commercial/simulations/:id/convert # Convertir en commande

POST   /api/commercial/sav                  # Créer ticket SAV
GET    /api/commercial/sav                  # Liste tickets
PATCH  /api/commercial/sav/:id/intervention # Ajouter intervention

GET    /api/commercial/rapports/:type       # Générer rapport
GET    /api/commercial/stats                # Stats dashboard
```

---

## Phase 6: Tests

### Tests unitaires
- [ ] Tests des services (clients, commandes, etc.)
- [ ] Tests des hooks personnalisés
- [ ] Tests des calculs (simulation, marges)

### Tests d'intégration
- [ ] Flux complet création commande
- [ ] Flux SAV (ouverture → intervention → clôture)
- [ ] Flux simulation → commande

### Tests E2E
- [ ] Parcours utilisateur commercial
- [ ] Création client → création commande → validation

---

## Priorisation des Fonctionnalités

### Sprint 1 (2 semaines) - MVP
1. ✅ Dashboard (déjà fait)
2. Clients - Liste et création basique
3. Catalogue - Affichage par banque
4. Simulation - Calculateur basique

### Sprint 2 (2 semaines) - Core Business
5. Commandes - Création et gestion complète
6. BL - Upload et association
7. Clients - Page détails avec historique

### Sprint 3 (2 semaines) - Compléments
8. Accréditifs - Gestion complète
9. SAV - Création et suivi tickets
10. Rapports - Rapports basiques

### Sprint 4 (1 semaine) - Polish
11. Rapports avancés avec graphiques
12. Améliorations UX
13. Tests et corrections bugs

---

## Technologies et Librairies Recommandées

### Déjà installées
- React 18
- TypeScript
- TanStack Query (React Query)
- React Router v6
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### À installer
```bash
# Graphiques
npm install recharts

# Upload fichiers
npm install react-dropzone

# Export Excel
npm install xlsx

# Export PDF
npm install jspdf jspdf-autotable

# Dates
npm install date-fns

# Formulaires (si pas déjà installé)
npm install react-hook-form @hookform/resolvers zod

# Tables avancées
npm install @tanstack/react-table
```

---

## Notes d'Implémentation

### Gestion des données
- Utiliser React Query pour le cache et la synchronisation
- Mock data en attendant le backend
- LocalStorage pour persistence temporaire

### Performance
- Lazy loading des images produits
- Pagination côté serveur
- Virtualisation pour longues listes (react-window)

### Sécurité
- Validation Zod pour tous les formulaires
- Vérification permissions côté client ET serveur
- Sanitization des uploads

### Accessibilité
- Labels aria sur tous les contrôles
- Navigation clavier
- Contraste couleurs (WCAG AA)

---

## Dépendances entre Fonctionnalités

```
Clients ────┐
            ├──> Commandes ──> BL ──> Factures
Produits ───┘                  │
                               ├──> Accréditifs
                               └──> SAV

Simulations ──> Commandes

Tout ───> Rapports
```

---

## Checklist avant Mise en Production

- [ ] Tous les formulaires validés avec Zod
- [ ] Toutes les erreurs gérées (try/catch + toast)
- [ ] Loading states sur toutes les actions async
- [ ] Permissions vérifiées sur toutes les routes
- [ ] Responsive mobile testé
- [ ] Navigation clavier fonctionnelle
- [ ] Messages d'erreur clairs et en français
- [ ] Documentation utilisateur créée
- [ ] Tests E2E passent
- [ ] Performance optimisée (Lighthouse > 90)
