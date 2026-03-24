/**
 * Types pour le module Commercial
 * Architecture API-ready pour faciliter l'intégration backend
 */

// ============================================
// CLIENT
// ============================================

export type ClientType = 'particulier' | 'entreprise';
export type ClientCategorie = 'A' | 'B' | 'C';
export type ClientStatut = 'actif' | 'inactif' | 'suspendu';
export type BanquePartenaire = 'CBAO' | 'CMS' | 'Autre';

export interface Adresse {
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
}

export interface CreditClient {
  limite: number;
  utilise: number;
  disponible: number;
}

export interface Client {
  id: string;
  code: string;
  nom: string;
  prenom?: string;
  raisonSociale?: string;
  type: ClientType;

  // Contact
  email: string;
  telephone: string;
  telephoneSecondaire?: string;
  adresse: Adresse;

  // Commercial
  categorie: ClientCategorie;
  credit: CreditClient;
  banquePartenaire: BanquePartenaire;
  numeroCompte?: string;

  // Métadonnées
  statut: ClientStatut;
  dateCreation: string;
  dernierAchat?: string;
  totalAchats: number;
  nombreCommandes: number;
  commercialAssigne?: string;
  notes?: string;
}

export interface CreateClientDTO {
  nom: string;
  prenom?: string;
  raisonSociale?: string;
  type: ClientType;
  email: string;
  telephone: string;
  telephoneSecondaire?: string;
  adresse: Adresse;
  categorie: ClientCategorie;
  creditLimite: number;
  banquePartenaire: BanquePartenaire;
  numeroCompte?: string;
  notes?: string;
}

export interface UpdateClientDTO extends Partial<CreateClientDTO> {
  statut?: ClientStatut;
}

// ============================================
// PRODUIT CATALOGUE
// ============================================

export type ProduitStatut = 'actif' | 'inactif' | 'rupture';
export type UniteStock = 'piece' | 'carton' | 'palette';

export interface StockProduit {
  quantite: number;
  seuilAlerte: number;
  unite: UniteStock;
}

export interface ProduitCatalogue {
  id: string;
  reference: string;
  nom: string;
  description: string;

  // Classification
  categorie: string;
  categoriesIds: number[];   // multi-catégories
  sousCategorie?: string;
  marque?: string;
  banque: BanquePartenaire;

  // Prix
  prixAchat: number;
  prixVente: number;
  prixPromo?: number;
  marge: number;

  // Stock
  stock: StockProduit;

  // Caractéristiques
  specifications?: Record<string, string>;
  images: string[];

  // Métadonnées
  statut: ProduitStatut;
  dateAjout: string;
  derniereModification: string;
}

// ============================================
// COMMANDE
// ============================================

export type CommandeStatut =
  | 'brouillon'
  | 'en_attente'
  | 'validee'
  | 'en_cours'
  | 'livree'
  | 'annulee';

export type ModeLivraison = 'retrait' | 'livraison_express' | 'livraison_standard';

export type ModePaiement = 'especes' | 'virement' | 'cheque' | 'credit' | 'accreditif';

export type StatutPaiement = 'en_attente' | 'partiel' | 'complet';

export type TypeLivraison = 'agence' | 'destination';

export interface LigneCommande {
  id: string;
  produitId: string;
  produit?: ProduitCatalogue;
  quantite: number;
  prixUnitaire: number;       // prix de vente
  prixAchat: number;
  fraisLivraisonFournisseur: number;
  fraisLivraisonClient: number;
  typeLivraison: 'agence' | 'destination';
  tauxCommission: number;     // ex: 0.05
  commission: number;
  cTotal: number;
  marge: number;
  statut: 'livré' | 'attente';
  remise: number;
  sousTotal: number;
}

export interface CommandeCommerciale {
  id: string;
  reference: string;

  // Client
  clientId: string;
  client?: Client;

  // Statut
  statut: CommandeStatut;
  dateCommande: string;
  dateValidation?: string;
  dateLivraison?: string;

  // Produits
  lignes: LigneCommande[];

  // Montants
  sousTotal: number;
  taxe: number;
  fraisLivraison: number;
  remise: number;
  total: number;

  // Livraison
  adresseLivraison: Adresse;
  modeLivraison: ModeLivraison;

  // Paiement
  modePaiement: ModePaiement;
  statutPaiement: StatutPaiement;
  montantPaye: number;

  // Documents
  bonLivraison?: string;
  accreditif?: string;
  facture?: string;

  // Métadonnées
  creePar: string;
  modifiePar?: string;
  notes?: string;
}

export interface CreateCommandeDTO {
  clientId: string;
  lignes: {
    produitId: string;
    quantite: number;
    prixUnitaire: number;
    prixAchat: number;
    fraisLivraisonFournisseur: number;
    fraisLivraisonClient: number;
    typeLivraison: 'agence' | 'destination';
    tauxCommission: number;
    remise: number;
  }[];
  modeLivraison: ModeLivraison;
  modePaiement: ModePaiement;
  fraisLivraison: number;
  remise: number;
  notes?: string;
}

// ============================================
// BON DE LIVRAISON
// ============================================

export type BonLivraisonStatut = 'scanne' | 'valide' | 'traite';

export interface BonLivraison {
  id: string;
  numero: string;
  commandeId: string;
  commande?: CommandeCommerciale;

  // Scan
  fichierScan: string;
  dateScan: string;
  scannePar: string;

  // Détails
  dateLivraison: string;
  livreur?: string;
  signature?: string;

  // Statut
  statut: BonLivraisonStatut;
  notes?: string;
}

// ============================================
// ACCRÉDITIF
// ============================================

export type AccreditifStatut =
  | 'en_attente'
  | 'approuve'
  | 'execute'
  | 'expire'
  | 'annule';

export type TypeDocumentAccreditif = 'lettre_credit' | 'garantie' | 'autre';
export type DeviseAccreditif = 'FCFA' | 'EUR' | 'USD';

export interface DocumentAccreditif {
  type: TypeDocumentAccreditif;
  nom: string;
  url: string;
  dateUpload: string;
}

export interface Accreditif {
  id: string;
  reference: string;

  // Commande/Client
  commandeId?: string;
  clientId: string;

  // Banque
  banqueEmettrice: BanquePartenaire;
  numeroCreditif: string;

  // Montants
  montant: number;
  devise: DeviseAccreditif;

  // Dates
  dateEmission: string;
  dateExpiration: string;

  // Documents
  documents: DocumentAccreditif[];

  // Statut
  statut: AccreditifStatut;

  // Métadonnées
  creePar: string;
  notes?: string;
}

// ============================================
// SIMULATION
// ============================================

export type SimulationStatut = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'converti';
export type ConditionsPaiement = 'comptant' | 'credit_30j' | 'credit_60j' | 'echelonne';

export interface ProduitSimulation {
  produitId: string;
  produit?: ProduitCatalogue;
  quantite: number;
  prixUnitaire: number;
  remisePercentage: number;
  remiseMontant: number;
}

export interface Echeance {
  date: string;
  montant: number;
}

export interface Simulation {
  id: string;
  reference: string;

  // Client
  clientId?: string;
  client?: Client;

  // Produits
  produits: ProduitSimulation[];

  // Calculs
  sousTotal: number;
  remiseTotale: number;
  taxe: number;
  fraisAdditionnels: number;
  total: number;
  marge: number;
  pourcentageMarge: number;

  // Paiement
  conditionsPaiement: ConditionsPaiement;
  echeancier?: Echeance[];

  // Métadonnées
  dateCreation: string;
  creePar: string;
  statut: SimulationStatut;
  commandeId?: string;
}

// ============================================
// SERVICE APRÈS-VENTE (SAV)
// ============================================

export type TypeTicketSAV =
  | 'reparation'
  | 'remplacement'
  | 'retour'
  | 'reclamation'
  | 'garantie';

export type PrioriteTicket = 'basse' | 'normale' | 'haute' | 'urgente';

export type StatutTicketSAV =
  | 'ouvert'
  | 'en_cours'
  | 'en_attente_pieces'
  | 'resolu'
  | 'ferme'
  | 'annule';

export interface PieceUtilisee {
  nom: string;
  reference: string;
  quantite: number;
  prix: number;
}

export interface InterventionSAV {
  id: string;
  date: string;
  technicienId: string;
  technicien?: string;
  description: string;
  piecesUtilisees?: PieceUtilisee[];
  tempsIntervention: number;
  cout: number;
}

export interface TicketSAV {
  id: string;
  numero: string;

  // Client et produit
  clientId: string;
  client?: Client;
  produitId?: string;
  produit?: ProduitCatalogue;
  commandeId?: string;

  // Type
  type: TypeTicketSAV;
  priorite: PrioriteTicket;

  // Description
  sujet: string;
  description: string;
  symptomes?: string;

  // Pièces jointes
  photos: string[];
  documents: string[];

  // Statut
  statut: StatutTicketSAV;

  // Interventions
  interventions: InterventionSAV[];

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
  assigneA?: string;
  creePar: string;
  notes?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ============================================
// QUERY PARAMS
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ClientFilters extends PaginationParams {
  search?: string;
  statut?: ClientStatut;
  categorie?: ClientCategorie;
  banque?: BanquePartenaire;
  sortBy?: 'nom' | 'totalAchats' | 'dateCreation';
  sortOrder?: 'asc' | 'desc';
}

export interface CommandeFilters extends PaginationParams {
  search?: string;
  statut?: CommandeStatut;
  clientId?: string;
  dateDebut?: string;
  dateFin?: string;
  modePaiement?: ModePaiement;
  sortBy?: 'reference' | 'dateCommande' | 'total';
  sortOrder?: 'asc' | 'desc';
}

export interface ProduitFilters extends PaginationParams {
  search?: string;
  banque?: BanquePartenaire;
  categorie?: string;
  statut?: ProduitStatut;
  prixMin?: number;
  prixMax?: number;
  sortBy?: 'nom' | 'prixVente' | 'stock';
  sortOrder?: 'asc' | 'desc';
}

export interface SAVFilters extends PaginationParams {
  search?: string;
  statut?: StatutTicketSAV;
  priorite?: PrioriteTicket;
  type?: TypeTicketSAV;
  clientId?: string;
  assigneA?: string;
  sortBy?: 'numero' | 'dateOuverture' | 'priorite';
  sortOrder?: 'asc' | 'desc';
}
