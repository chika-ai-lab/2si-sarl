/**
 * Service pour les rapports commerciaux
 * Agrégation de données, statistiques et analyses
 */

import type { ApiResponse } from "@/types/api";

// ============================================
// TYPES
// ============================================

export interface RapportFilters {
  dateDebut?: string;
  dateFin?: string;
  clientId?: string;
  produitId?: string;
  banque?: string;
}

export interface ChiffreAffaire {
  periode: string;
  montant: number;
  nombreCommandes: number;
  montantMoyen: number;
}

export interface VenteParProduit {
  produitId: string;
  produitNom: string;
  quantiteVendue: number;
  chiffreAffaire: number;
  nombreCommandes: number;
}

export interface VenteParClient {
  clientId: string;
  clientNom: string;
  chiffreAffaire: number;
  nombreCommandes: number;
  dernierAchat: string;
}

export interface VenteParBanque {
  banque: string;
  chiffreAffaire: number;
  nombreCommandes: number;
  nombreClients: number;
}

export interface StatistiquesGlobales {
  chiffreAffaireTotal: number;
  chiffreAffaireMois: number;
  evolutionCA: number; // Pourcentage vs mois précédent
  nombreCommandesTotal: number;
  nombreCommandesMois: number;
  evolutionCommandes: number;
  panierMoyen: number;
  evolutionPanierMoyen: number;
  nombreClientsActifs: number;
  tauxConversion: number;
  nombreAccreditifsActifs: number;
  montantAccreditifsActifs: number;
}

export interface RapportEvolutionCA {
  evolutionMensuelle: ChiffreAffaire[];
  evolutionHebdomadaire: ChiffreAffaire[];
  topProduits: VenteParProduit[];
  topClients: VenteParClient[];
  repartitionBanques: VenteParBanque[];
  statistiques: StatistiquesGlobales;
}

// ============================================
// MOCK DATA
// ============================================

const mockEvolutionMensuelle: ChiffreAffaire[] = [
  {
    periode: "2024-07",
    montant: 1250000,
    nombreCommandes: 45,
    montantMoyen: 27778,
  },
  {
    periode: "2024-08",
    montant: 1450000,
    nombreCommandes: 52,
    montantMoyen: 27885,
  },
  {
    periode: "2024-09",
    montant: 1680000,
    nombreCommandes: 58,
    montantMoyen: 28966,
  },
  {
    periode: "2024-10",
    montant: 1520000,
    nombreCommandes: 54,
    montantMoyen: 28148,
  },
  {
    periode: "2024-11",
    montant: 1890000,
    nombreCommandes: 65,
    montantMoyen: 29077,
  },
  {
    periode: "2024-12",
    montant: 2150000,
    nombreCommandes: 72,
    montantMoyen: 29861,
  },
];

const mockEvolutionHebdomadaire: ChiffreAffaire[] = [
  {
    periode: "S48",
    montant: 485000,
    nombreCommandes: 16,
    montantMoyen: 30313,
  },
  {
    periode: "S49",
    montant: 520000,
    nombreCommandes: 18,
    montantMoyen: 28889,
  },
  {
    periode: "S50",
    montant: 560000,
    nombreCommandes: 19,
    montantMoyen: 29474,
  },
  {
    periode: "S51",
    montant: 585000,
    nombreCommandes: 19,
    montantMoyen: 30789,
  },
];

const mockTopProduits: VenteParProduit[] = [
  {
    produitId: "prod-001",
    produitNom: "Ordinateur portable Dell XPS 15",
    quantiteVendue: 145,
    chiffreAffaire: 3625000,
    nombreCommandes: 98,
  },
  {
    produitId: "prod-002",
    produitNom: "MacBook Pro 16 pouces",
    quantiteVendue: 89,
    chiffreAffaire: 3115000,
    nombreCommandes: 76,
  },
  {
    produitId: "prod-003",
    produitNom: "iPhone 15 Pro Max",
    quantiteVendue: 234,
    chiffreAffaire: 2574000,
    nombreCommandes: 134,
  },
  {
    produitId: "prod-004",
    produitNom: "Samsung Galaxy S24 Ultra",
    quantiteVendue: 198,
    chiffreAffaire: 2178000,
    nombreCommandes: 112,
  },
  {
    produitId: "prod-005",
    produitNom: "iPad Pro 12.9 pouces",
    quantiteVendue: 167,
    chiffreAffaire: 1837000,
    nombreCommandes: 95,
  },
];

const mockTopClients: VenteParClient[] = [
  {
    clientId: "client-001",
    clientNom: "Orange Sénégal",
    chiffreAffaire: 4250000,
    nombreCommandes: 23,
    dernierAchat: "2024-12-15",
  },
  {
    clientId: "client-002",
    clientNom: "Sonatel",
    chiffreAffaire: 3890000,
    nombreCommandes: 19,
    dernierAchat: "2024-12-18",
  },
  {
    clientId: "client-003",
    clientNom: "CBAO Groupe Attijariwafa Bank",
    chiffreAffaire: 3450000,
    nombreCommandes: 17,
    dernierAchat: "2024-12-10",
  },
  {
    clientId: "client-004",
    clientNom: "Ecobank Sénégal",
    chiffreAffaire: 2980000,
    nombreCommandes: 15,
    dernierAchat: "2024-12-12",
  },
  {
    clientId: "client-005",
    clientNom: "Total Sénégal",
    chiffreAffaire: 2670000,
    nombreCommandes: 14,
    dernierAchat: "2024-12-16",
  },
];

const mockRepartitionBanques: VenteParBanque[] = [
  {
    banque: "CBAO",
    chiffreAffaire: 8750000,
    nombreCommandes: 156,
    nombreClients: 45,
  },
  {
    banque: "CMS",
    chiffreAffaire: 6420000,
    nombreCommandes: 128,
    nombreClients: 38,
  },
  {
    banque: "Autre",
    chiffreAffaire: 4770000,
    nombreCommandes: 89,
    nombreClients: 27,
  },
];

const mockStatistiques: StatistiquesGlobales = {
  chiffreAffaireTotal: 19940000,
  chiffreAffaireMois: 2150000,
  evolutionCA: 13.76, // +13.76% vs mois précédent
  nombreCommandesTotal: 373,
  nombreCommandesMois: 72,
  evolutionCommandes: 10.77,
  panierMoyen: 29861,
  evolutionPanierMoyen: 2.69,
  nombreClientsActifs: 110,
  tauxConversion: 65.45, // Taux de conversion devis → commande
  nombreAccreditifsActifs: 8,
  montantAccreditifsActifs: 12500000,
};

// ============================================
// SERVICE FUNCTIONS
// ============================================

const USE_MOCK_API = true;

/**
 * Récupère le rapport d'évolution du chiffre d'affaires
 */
export async function getRapportEvolutionCA(
  filters: RapportFilters = {}
): Promise<ApiResponse<RapportEvolutionCA>> {
  if (USE_MOCK_API) {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      data: {
        evolutionMensuelle: mockEvolutionMensuelle,
        evolutionHebdomadaire: mockEvolutionHebdomadaire,
        topProduits: mockTopProduits,
        topClients: mockTopClients,
        repartitionBanques: mockRepartitionBanques,
        statistiques: mockStatistiques,
      },
      message: "Rapport récupéré avec succès",
    };
  }

  // TODO: Implémenter l'appel API réel
  const queryParams = new URLSearchParams();
  if (filters.dateDebut) queryParams.append("dateDebut", filters.dateDebut);
  if (filters.dateFin) queryParams.append("dateFin", filters.dateFin);
  if (filters.clientId) queryParams.append("clientId", filters.clientId);
  if (filters.produitId) queryParams.append("produitId", filters.produitId);
  if (filters.banque) queryParams.append("banque", filters.banque);

  const response = await fetch(`/api/commercial/rapports/evolution-ca?${queryParams}`);
  return response.json();
}

/**
 * Récupère les statistiques globales
 */
export async function getStatistiquesGlobales(): Promise<ApiResponse<StatistiquesGlobales>> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      data: mockStatistiques,
      message: "Statistiques récupérées avec succès",
    };
  }

  const response = await fetch("/api/commercial/rapports/statistiques");
  return response.json();
}

/**
 * Récupère le top des produits
 */
export async function getTopProduits(
  filters: RapportFilters = {},
  limit: number = 10
): Promise<ApiResponse<VenteParProduit[]>> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      data: mockTopProduits.slice(0, limit),
      message: "Top produits récupérés avec succès",
    };
  }

  const queryParams = new URLSearchParams();
  if (filters.dateDebut) queryParams.append("dateDebut", filters.dateDebut);
  if (filters.dateFin) queryParams.append("dateFin", filters.dateFin);
  queryParams.append("limit", limit.toString());

  const response = await fetch(`/api/commercial/rapports/top-produits?${queryParams}`);
  return response.json();
}

/**
 * Récupère le top des clients
 */
export async function getTopClients(
  filters: RapportFilters = {},
  limit: number = 10
): Promise<ApiResponse<VenteParClient[]>> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      data: mockTopClients.slice(0, limit),
      message: "Top clients récupérés avec succès",
    };
  }

  const queryParams = new URLSearchParams();
  if (filters.dateDebut) queryParams.append("dateDebut", filters.dateDebut);
  if (filters.dateFin) queryParams.append("dateFin", filters.dateFin);
  queryParams.append("limit", limit.toString());

  const response = await fetch(`/api/commercial/rapports/top-clients?${queryParams}`);
  return response.json();
}

/**
 * Récupère la répartition par banque
 */
export async function getRepartitionBanques(
  filters: RapportFilters = {}
): Promise<ApiResponse<VenteParBanque[]>> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      data: mockRepartitionBanques,
      message: "Répartition par banque récupérée avec succès",
    };
  }

  const queryParams = new URLSearchParams();
  if (filters.dateDebut) queryParams.append("dateDebut", filters.dateDebut);
  if (filters.dateFin) queryParams.append("dateFin", filters.dateFin);

  const response = await fetch(`/api/commercial/rapports/repartition-banques?${queryParams}`);
  return response.json();
}

/**
 * Exporte les données de rapport en CSV
 */
export async function exporterRapportCSV(
  type: "ca" | "produits" | "clients" | "banques",
  filters: RapportFilters = {}
): Promise<Blob> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Générer un CSV de démonstration
    let csvContent = "";

    if (type === "ca") {
      csvContent = "Période,Montant,Nombre de commandes,Montant moyen\n";
      mockEvolutionMensuelle.forEach((item) => {
        csvContent += `${item.periode},${item.montant},${item.nombreCommandes},${item.montantMoyen}\n`;
      });
    }

    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  }

  const queryParams = new URLSearchParams();
  if (filters.dateDebut) queryParams.append("dateDebut", filters.dateDebut);
  if (filters.dateFin) queryParams.append("dateFin", filters.dateFin);

  const response = await fetch(`/api/commercial/rapports/export/${type}?${queryParams}`);
  return response.blob();
}
