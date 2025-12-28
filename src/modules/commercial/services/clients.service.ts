/**
 * Service de gestion des clients
 * Architecture API-ready avec mocks
 */

import type {
  Client,
  CreateClientDTO,
  UpdateClientDTO,
  ClientFilters,
  PaginatedResponse,
  ApiResponse,
} from '../types';
import { USE_MOCK_API, simulateNetworkDelay } from './api.config';

// ============================================
// MOCK DATA
// ============================================

const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    code: 'CLT-001',
    nom: 'Diallo',
    prenom: 'Mamadou',
    type: 'particulier',
    email: 'mamadou.diallo@email.com',
    telephone: '+221 77 123 45 67',
    adresse: {
      rue: 'Avenue Cheikh Anta Diop',
      ville: 'Dakar',
      codePostal: '10200',
      pays: 'Sénégal',
    },
    categorie: 'A',
    credit: {
      limite: 5000000,
      utilise: 2300000,
      disponible: 2700000,
    },
    banquePartenaire: 'CBAO',
    numeroCompte: 'SN12345678901234567890',
    statut: 'actif',
    dateCreation: '2024-01-15',
    dernierAchat: '2024-12-20',
    totalAchats: 15600000,
    nombreCommandes: 23,
  },
  {
    id: '2',
    code: 'CLT-002',
    raisonSociale: 'Tech Solutions SARL',
    type: 'entreprise',
    email: 'contact@techsolutions.sn',
    telephone: '+221 33 822 45 67',
    adresse: {
      rue: 'Plateau, Rue 12',
      ville: 'Dakar',
      codePostal: '10100',
      pays: 'Sénégal',
    },
    categorie: 'A',
    credit: {
      limite: 20000000,
      utilise: 8500000,
      disponible: 11500000,
    },
    banquePartenaire: 'CMS',
    statut: 'actif',
    dateCreation: '2023-06-10',
    dernierAchat: '2024-12-25',
    totalAchats: 45800000,
    nombreCommandes: 67,
  },
  {
    id: '3',
    code: 'CLT-003',
    nom: 'Ndiaye',
    prenom: 'Fatou',
    type: 'particulier',
    email: 'fatou.ndiaye@email.com',
    telephone: '+221 76 987 65 43',
    adresse: {
      rue: 'Almadies, Villa 45',
      ville: 'Dakar',
      codePostal: '10300',
      pays: 'Sénégal',
    },
    categorie: 'B',
    credit: {
      limite: 2000000,
      utilise: 450000,
      disponible: 1550000,
    },
    banquePartenaire: 'CBAO',
    statut: 'actif',
    dateCreation: '2024-03-22',
    dernierAchat: '2024-11-10',
    totalAchats: 3200000,
    nombreCommandes: 8,
  },
];

// ============================================
// API FUNCTIONS (Mock)
// ============================================

/**
 * Récupère la liste des clients avec filtres et pagination
 */
export async function getClients(
  filters: ClientFilters = {}
): Promise<PaginatedResponse<Client>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    let filtered = [...MOCK_CLIENTS];

    // Filtres
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nom?.toLowerCase().includes(search) ||
          c.prenom?.toLowerCase().includes(search) ||
          c.raisonSociale?.toLowerCase().includes(search) ||
          c.code.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search)
      );
    }

    if (filters.statut) {
      filtered = filtered.filter((c) => c.statut === filters.statut);
    }

    if (filters.categorie) {
      filtered = filtered.filter((c) => c.categorie === filters.categorie);
    }

    if (filters.banque) {
      filtered = filtered.filter((c) => c.banquePartenaire === filters.banque);
    }

    // Tri
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[filters.sortBy!];
        const bVal = b[filters.sortBy!];
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
  const response = await fetch(`/api/commercial/clients?${new URLSearchParams(filters as any)}`);
  return response.json();
}

/**
 * Récupère un client par son ID
 */
export async function getClientById(id: string): Promise<ApiResponse<Client>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const client = MOCK_CLIENTS.find((c) => c.id === id);

    if (!client) {
      return {
        success: false,
        message: 'Client non trouvé',
      };
    }

    return {
      success: true,
      data: client,
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/clients/${id}`);
  return response.json();
}

/**
 * Crée un nouveau client
 */
export async function createClient(
  data: CreateClientDTO
): Promise<ApiResponse<Client>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    // Validation basique
    if (!data.nom && !data.raisonSociale) {
      return {
        success: false,
        message: 'Le nom ou la raison sociale est requis',
        errors: {
          nom: ['Le nom est requis pour un particulier'],
          raisonSociale: ['La raison sociale est requise pour une entreprise'],
        },
      };
    }

    const newClient: Client = {
      id: `${MOCK_CLIENTS.length + 1}`,
      code: `CLT-${String(MOCK_CLIENTS.length + 1).padStart(3, '0')}`,
      nom: data.nom,
      prenom: data.prenom,
      raisonSociale: data.raisonSociale,
      type: data.type,
      email: data.email,
      telephone: data.telephone,
      telephoneSecondaire: data.telephoneSecondaire,
      adresse: data.adresse,
      categorie: data.categorie,
      credit: {
        limite: data.creditLimite,
        utilise: 0,
        disponible: data.creditLimite,
      },
      banquePartenaire: data.banquePartenaire,
      numeroCompte: data.numeroCompte,
      statut: 'actif',
      dateCreation: new Date().toISOString(),
      totalAchats: 0,
      nombreCommandes: 0,
      notes: data.notes,
    };

    MOCK_CLIENTS.push(newClient);

    return {
      success: true,
      data: newClient,
      message: 'Client créé avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch('/api/commercial/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Met à jour un client
 */
export async function updateClient(
  id: string,
  data: UpdateClientDTO
): Promise<ApiResponse<Client>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const index = MOCK_CLIENTS.findIndex((c) => c.id === id);

    if (index === -1) {
      return {
        success: false,
        message: 'Client non trouvé',
      };
    }

    MOCK_CLIENTS[index] = {
      ...MOCK_CLIENTS[index],
      ...data,
    };

    return {
      success: true,
      data: MOCK_CLIENTS[index],
      message: 'Client mis à jour avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Supprime un client
 */
export async function deleteClient(id: string): Promise<ApiResponse<void>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const index = MOCK_CLIENTS.findIndex((c) => c.id === id);

    if (index === -1) {
      return {
        success: false,
        message: 'Client non trouvé',
      };
    }

    MOCK_CLIENTS.splice(index, 1);

    return {
      success: true,
      message: 'Client supprimé avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/clients/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

/**
 * Récupère les statistiques clients
 */
export async function getClientsStats() {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    return {
      total: MOCK_CLIENTS.length,
      actifs: MOCK_CLIENTS.filter((c) => c.statut === 'actif').length,
      categorieA: MOCK_CLIENTS.filter((c) => c.categorie === 'A').length,
      categorieB: MOCK_CLIENTS.filter((c) => c.categorie === 'B').length,
      categorieC: MOCK_CLIENTS.filter((c) => c.categorie === 'C').length,
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch('/api/commercial/stats/clients');
  return response.json();
}
