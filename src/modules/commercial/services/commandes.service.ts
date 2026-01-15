/**
 * Service de gestion des commandes commerciales
 * Architecture API-ready avec mocks
 */

import type {
  CommandeCommerciale,
  CommandeStatut,
  CreateCommandeDTO,
  PaginatedResponse,
  ApiResponse,
  ModePaiement,
  BanquePartenaire,
} from '../types';
import { USE_MOCK_API, simulateNetworkDelay } from './api.config';

// ============================================
// MOCK DATA
// ============================================

const MOCK_COMMANDES: CommandeCommerciale[] = [
  {
    id: 'cmd-001',
    numero: 'CMD-2024-001',
    reference: 'CMD-2024-001',

    // Client
    clientId: 'cli-001',

    // Lignes de commande
    lignes: [
      {
        id: 'ligne-001-1',
        produitId: 'prod-001',
        quantite: 3,
        prixUnitaire: 1243000,
        remise: 10,
        sousTotal: 3356100,
      },
      {
        id: 'ligne-001-2',
        produitId: 'prod-003',
        quantite: 1,
        prixUnitaire: 425000,
        remise: 0,
        sousTotal: 425000,
      },
    ],

    // Montants
    sousTotal: 3781100,
    taxe: 680598,
    remise: 372900,
    fraisLivraison: 50000,
    total: 4138798,

    // Livraison
    adresseLivraison: {
      rue: '25 Avenue Léopold Sédar Senghor',
      ville: 'Dakar',
      codePostal: '12500',
      pays: 'Sénégal',
    },
    modeLivraison: 'express',
    dateLivraisonPrevue: '2024-12-30',

    // Paiement
    modePaiement: 'virement',
    statutPaiement: 'partiel',
    montantPaye: 2000000,

    // Statut
    statut: 'en_cours',
    dateCommande: '2024-12-20',

    // Métadonnées
    creePar: 'user-001',
    notes: 'Livraison urgente',
  },
  {
    id: 'cmd-002',
    numero: 'CMD-2024-002',
    reference: 'CMD-2024-002',

    clientId: 'cli-002',

    lignes: [
      {
        id: 'ligne-002-1',
        produitId: 'prod-008',
        quantite: 5,
        prixUnitaire: 589000,
        remise: 15,
        sousTotal: 2503250,
      },
    ],

    sousTotal: 2503250,
    taxe: 450585,
    remise: 441488,
    fraisLivraison: 25000,
    total: 2537347,

    adresseLivraison: {
      rue: 'Zone Industrielle de Mbao',
      ville: 'Dakar',
      codePostal: '12000',
      pays: 'Sénégal',
    },
    modeLivraison: 'standard',
    dateLivraisonPrevue: '2025-01-05',

    modePaiement: 'comptant',
    statutPaiement: 'paye',
    montantPaye: 2537347,

    statut: 'validee',
    dateCommande: '2024-12-22',

    creePar: 'user-002',
  },
];

// ============================================
// API FUNCTIONS (Mock)
// ============================================

/**
 * Récupère la liste des commandes avec filtres et pagination
 */
export async function getCommandes(filters: {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  statut?: CommandeStatut;
  statutPaiement?: string;
  modePaiement?: ModePaiement;
  banque?: BanquePartenaire;
  dateDebut?: string;
  dateFin?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<PaginatedResponse<CommandeCommerciale>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    let filtered = [...MOCK_COMMANDES];

    // Filtres
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.numero.toLowerCase().includes(search) ||
          c.notes?.toLowerCase().includes(search)
      );
    }

    if (filters.clientId) {
      filtered = filtered.filter((c) => c.clientId === filters.clientId);
    }

    if (filters.statut) {
      filtered = filtered.filter((c) => c.statut === filters.statut);
    }

    if (filters.statutPaiement) {
      filtered = filtered.filter((c) => c.statutPaiement === filters.statutPaiement);
    }

    if (filters.modePaiement) {
      filtered = filtered.filter((c) => c.modePaiement === filters.modePaiement);
    }

    if (filters.dateDebut) {
      filtered = filtered.filter((c) => c.dateCommande >= filters.dateDebut!);
    }

    if (filters.dateFin) {
      filtered = filtered.filter((c) => c.dateCommande <= filters.dateFin!);
    }

    // Tri
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[filters.sortBy as keyof CommandeCommerciale];
        const bVal = b[filters.sortBy as keyof CommandeCommerciale];
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        return aVal > bVal ? order : -order;
      });
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filtered.slice(start, end);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/commandes?${new URLSearchParams(filters as any)}`);
  return response.json();
}

/**
 * Récupère une commande par son ID
 */
export async function getCommandeById(id: string): Promise<ApiResponse<CommandeCommerciale>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const commande = MOCK_COMMANDES.find((c) => c.id === id);

    if (!commande) {
      return {
        success: false,
        message: 'Commande non trouvée',
      };
    }

    return {
      success: true,
      data: commande,
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/commandes/${id}`);
  return response.json();
}

/**
 * Crée une nouvelle commande
 */
export async function createCommande(data: CreateCommandeDTO): Promise<ApiResponse<CommandeCommerciale>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    // Calcul des montants
    let sousTotal = 0;
    let remiseTotale = 0;

    const lignes = data.lignes.map((ligne) => {
      const total = ligne.prixUnitaire * ligne.quantite;
      const remiseLigne = (total * ligne.remise) / 100;

      sousTotal += total;
      remiseTotale += remiseLigne;

      return {
        ...ligne,
        sousTotal: total - remiseLigne,
      };
    });

    const montantHT = sousTotal - remiseTotale + data.fraisLivraison;
    const taxe = montantHT * 0.18; // TVA 18%
    const total = montantHT + taxe;

    const newCommande: CommandeCommerciale = {
      id: `cmd-${Date.now()}`,
      numero: `CMD-${new Date().getFullYear()}-${String(MOCK_COMMANDES.length + 1).padStart(3, '0')}`,

      clientId: data.clientId,

      lignes,

      sousTotal,
      taxe,
      remise: remiseTotale,
      fraisLivraison: data.fraisLivraison,
      total,

      adresseLivraison: data.adresseLivraison,
      modeLivraison: data.modeLivraison,
      dateLivraisonPrevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

      modePaiement: data.modePaiement,
      statutPaiement: 'impaye',
      montantPaye: 0,

      statut: 'brouillon',
      dateCommande: new Date().toISOString().split('T')[0],

      creePar: 'current-user',
      notes: data.notes,
    };

    MOCK_COMMANDES.push(newCommande);

    return {
      success: true,
      data: newCommande,
      message: 'Commande créée avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch('/api/commercial/commandes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Met à jour une commande
 */
export async function updateCommande(
  id: string,
  data: Partial<CommandeCommerciale>
): Promise<ApiResponse<CommandeCommerciale>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const index = MOCK_COMMANDES.findIndex((c) => c.id === id);

    if (index === -1) {
      return {
        success: false,
        message: 'Commande non trouvée',
      };
    }

    MOCK_COMMANDES[index] = {
      ...MOCK_COMMANDES[index],
      ...data,
    };

    return {
      success: true,
      data: MOCK_COMMANDES[index],
      message: 'Commande mise à jour avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/commandes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Supprime une commande
 */
export async function deleteCommande(id: string): Promise<ApiResponse<void>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const index = MOCK_COMMANDES.findIndex((c) => c.id === id);

    if (index === -1) {
      return {
        success: false,
        message: 'Commande non trouvée',
      };
    }

    MOCK_COMMANDES.splice(index, 1);

    return {
      success: true,
      message: 'Commande supprimée avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/commandes/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

/**
 * Change le statut d'une commande
 */
export async function changeCommandeStatut(
  id: string,
  statut: CommandeStatut
): Promise<ApiResponse<CommandeCommerciale>> {
  return updateCommande(id, { statut });
}

/**
 * Génère une facture pour la commande
 */
export async function genererFacture(id: string): Promise<ApiResponse<{ url: string }>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay(1500);

    return {
      success: true,
      data: {
        url: `/api/commercial/commandes/${id}/facture.pdf`,
      },
      message: 'Facture générée avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/commandes/${id}/facture`, {
    method: 'POST',
  });
  return response.json();
}

/**
 * Récupère les statistiques des commandes
 */
export async function getCommandesStats() {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    return {
      total: MOCK_COMMANDES.length,
      brouillon: MOCK_COMMANDES.filter((c) => c.statut === 'brouillon').length,
      enCours: MOCK_COMMANDES.filter((c) => c.statut === 'en_cours').length,
      livree: MOCK_COMMANDES.filter((c) => c.statut === 'livree').length,
      annulee: MOCK_COMMANDES.filter((c) => c.statut === 'annulee').length,
      chiffreAffaires: MOCK_COMMANDES
        .filter((c) => c.statut === 'livree')
        .reduce((acc, c) => acc + c.total, 0),
      montantImpaye: MOCK_COMMANDES
        .filter((c) => c.statutPaiement !== 'paye')
        .reduce((acc, c) => acc + (c.total - c.montantPaye), 0),
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch('/api/commercial/stats/commandes');
  return response.json();
}
