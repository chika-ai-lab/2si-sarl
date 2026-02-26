/**
 * Service de gestion des accréditifs (lettres de crédit)
 * Architecture API-ready avec mocks
 */

import type {
  Accreditif,
  AccreditifStatut,
  DocumentAccreditif,
  PaginatedResponse,
  ApiResponse,
  BanquePartenaire,
} from '../types';
import { USE_MOCK_API, simulateNetworkDelay } from './api.config';

// ============================================
// MOCK DATA
// ============================================

const MOCK_ACCREDITIFS: Accreditif[] = [
  {
    id: 'acc-001',
    reference: 'LC-2024-001',
    numeroAccreditif: 'CBAO/LC/2024/0001',

    // Banque
    banqueEmettrice: 'CBAO',
    banqueBeneficiaire: 'Citibank Paris',

    // Montants
    montant: 15000000,
    devise: 'FCFA',

    // Client
    clientId: 'cli-001',

    // Commandes
    commandeIds: ['cmd-001'],

    // Dates
    dateEmission: '2024-12-01',
    dateExpiration: '2025-02-28',

    // Documents
    documents: [
      {
        type: 'lettre_credit',
        nom: 'Lettre_Credit_CBAO_001.pdf',
        url: '/documents/lc-001.pdf',
        dateUpload: '2024-12-01',
      },
      {
        type: 'garantie',
        nom: 'Garantie_Bancaire.pdf',
        url: '/documents/garantie-001.pdf',
        dateUpload: '2024-12-02',
      },
    ],

    // Statut
    statut: 'approuve',

    // Métadonnées
    creePar: 'user-001',
    notes: 'Accréditif pour achat équipement informatique',
  },
  {
    id: 'acc-002',
    reference: 'LC-2024-002',
    numeroAccreditif: 'CMS/LC/2024/0002',

    banqueEmettrice: 'CMS',
    banqueBeneficiaire: 'BNP Paribas',

    montant: 25000000,
    devise: 'FCFA',

    clientId: 'cli-002',

    commandeIds: ['cmd-002', 'cmd-003'],

    dateEmission: '2024-12-15',
    dateExpiration: '2025-03-15',

    documents: [
      {
        type: 'lettre_credit',
        nom: 'LC_CMS_002.pdf',
        url: '/documents/lc-002.pdf',
        dateUpload: '2024-12-15',
      },
    ],

    statut: 'execute',

    creePar: 'user-002',
    notes: 'Accréditif pour importation mobilier bureau',
  },
  {
    id: 'acc-003',
    reference: 'LC-2024-003',
    numeroAccreditif: 'CBAO/LC/2024/0003',

    banqueEmettrice: 'CBAO',
    banqueBeneficiaire: 'HSBC London',

    montant: 8500000,
    devise: 'FCFA',

    clientId: 'cli-003',

    commandeIds: [],

    dateEmission: '2024-12-20',
    dateExpiration: '2025-01-31',

    documents: [],

    statut: 'en_attente',

    creePar: 'user-001',
    notes: 'En attente validation direction',
  },
];

// ============================================
// API FUNCTIONS (Mock)
// ============================================

/**
 * Récupère la liste des accréditifs avec filtres et pagination
 */
export async function getAccreditifs(filters: {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  banqueEmettrice?: BanquePartenaire;
  statut?: AccreditifStatut;
  dateDebut?: string;
  dateFin?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<PaginatedResponse<Accreditif>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    let filtered = [...MOCK_ACCREDITIFS];

    // Filtres
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.reference.toLowerCase().includes(search) ||
          a.numeroAccreditif.toLowerCase().includes(search) ||
          a.notes?.toLowerCase().includes(search)
      );
    }

    if (filters.clientId) {
      filtered = filtered.filter((a) => a.clientId === filters.clientId);
    }

    if (filters.banqueEmettrice) {
      filtered = filtered.filter((a) => a.banqueEmettrice === filters.banqueEmettrice);
    }

    if (filters.statut) {
      filtered = filtered.filter((a) => a.statut === filters.statut);
    }

    if (filters.dateDebut) {
      filtered = filtered.filter((a) => a.dateEmission >= filters.dateDebut!);
    }

    if (filters.dateFin) {
      filtered = filtered.filter((a) => a.dateEmission <= filters.dateFin!);
    }

    // Tri
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[filters.sortBy as keyof Accreditif];
        const bVal = b[filters.sortBy as keyof Accreditif];
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
  const response = await fetch(`/api/commercial/accreditifs?${new URLSearchParams(filters as any)}`);
  return response.json();
}

/**
 * Récupère un accréditif par son ID
 */
export async function getAccreditifById(id: string): Promise<ApiResponse<Accreditif>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const accreditif = MOCK_ACCREDITIFS.find((a) => a.id === id);

    if (!accreditif) {
      return {
        success: false,
        message: 'Accréditif non trouvé',
      };
    }

    return {
      success: true,
      data: accreditif,
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/accreditifs/${id}`);
  return response.json();
}

/**
 * Crée un nouvel accréditif
 */
export async function createAccreditif(data: {
  numeroAccreditif: string;
  banqueEmettrice: BanquePartenaire;
  banqueBeneficiaire: string;
  montant: number;
  devise: 'FCFA' | 'EUR' | 'USD';
  clientId?: string;
  commandeIds?: string[];
  dateExpiration: string;
  notes?: string;
}): Promise<ApiResponse<Accreditif>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const newAccreditif: Accreditif = {
      id: `acc-${Date.now()}`,
      reference: `LC-${new Date().getFullYear()}-${String(MOCK_ACCREDITIFS.length + 1).padStart(3, '0')}`,
      numeroAccreditif: data.numeroAccreditif,

      banqueEmettrice: data.banqueEmettrice,
      banqueBeneficiaire: data.banqueBeneficiaire,

      montant: data.montant,
      devise: data.devise,

      clientId: data.clientId,

      commandeIds: data.commandeIds || [],

      dateEmission: new Date().toISOString().split('T')[0],
      dateExpiration: data.dateExpiration,

      documents: [],

      statut: 'en_attente',

      creePar: 'current-user',
      notes: data.notes,
    };

    MOCK_ACCREDITIFS.push(newAccreditif);

    return {
      success: true,
      data: newAccreditif,
      message: 'Accréditif créé avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch('/api/commercial/accreditifs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Met à jour un accréditif
 */
export async function updateAccreditif(
  id: string,
  data: Partial<Accreditif>
): Promise<ApiResponse<Accreditif>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const index = MOCK_ACCREDITIFS.findIndex((a) => a.id === id);

    if (index === -1) {
      return {
        success: false,
        message: 'Accréditif non trouvé',
      };
    }

    MOCK_ACCREDITIFS[index] = {
      ...MOCK_ACCREDITIFS[index],
      ...data,
    };

    return {
      success: true,
      data: MOCK_ACCREDITIFS[index],
      message: 'Accréditif mis à jour avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/accreditifs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Supprime un accréditif
 */
export async function deleteAccreditif(id: string): Promise<ApiResponse<void>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const index = MOCK_ACCREDITIFS.findIndex((a) => a.id === id);

    if (index === -1) {
      return {
        success: false,
        message: 'Accréditif non trouvé',
      };
    }

    MOCK_ACCREDITIFS.splice(index, 1);

    return {
      success: true,
      message: 'Accréditif supprimé avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/accreditifs/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

/**
 * Change le statut d'un accréditif
 */
export async function changeAccreditifStatut(
  id: string,
  statut: AccreditifStatut
): Promise<ApiResponse<Accreditif>> {
  return updateAccreditif(id, { statut });
}

/**
 * Upload un document pour un accréditif
 */
export async function uploadDocument(
  id: string,
  file: File,
  type: 'lettre_credit' | 'garantie' | 'autre'
): Promise<ApiResponse<DocumentAccreditif>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay(2000); // Simule upload

    const document: DocumentAccreditif = {
      type,
      nom: file.name,
      url: `/documents/${id}/${file.name}`,
      dateUpload: new Date().toISOString().split('T')[0],
    };

    // Ajouter le document à l'accréditif
    const index = MOCK_ACCREDITIFS.findIndex((a) => a.id === id);
    if (index !== -1) {
      MOCK_ACCREDITIFS[index].documents.push(document);
    }

    return {
      success: true,
      data: document,
      message: 'Document uploadé avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch(`/api/commercial/accreditifs/${id}/documents`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

/**
 * Récupère les accréditifs expirant bientôt (alertes)
 */
export async function getAccreditifsExpirantBientot(jours: number = 30) {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const today = new Date();
    const limitDate = new Date();
    limitDate.setDate(today.getDate() + jours);

    const expirants = MOCK_ACCREDITIFS.filter((a) => {
      const expiration = new Date(a.dateExpiration);
      return expiration >= today && expiration <= limitDate && a.statut !== 'expire' && a.statut !== 'annule';
    });

    return {
      data: expirants,
      count: expirants.length,
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/accreditifs/alertes?jours=${jours}`);
  return response.json();
}

/**
 * Récupère les statistiques des accréditifs
 */
export async function getAccreditifsStats() {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    return {
      total: MOCK_ACCREDITIFS.length,
      enAttente: MOCK_ACCREDITIFS.filter((a) => a.statut === 'en_attente').length,
      approuve: MOCK_ACCREDITIFS.filter((a) => a.statut === 'approuve').length,
      execute: MOCK_ACCREDITIFS.filter((a) => a.statut === 'execute').length,
      expire: MOCK_ACCREDITIFS.filter((a) => a.statut === 'expire').length,
      montantTotal: MOCK_ACCREDITIFS.reduce((acc, a) => acc + a.montant, 0),
      montantActif: MOCK_ACCREDITIFS
        .filter((a) => a.statut === 'approuve' || a.statut === 'execute')
        .reduce((acc, a) => acc + a.montant, 0),
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch('/api/commercial/stats/accreditifs');
  return response.json();
}
