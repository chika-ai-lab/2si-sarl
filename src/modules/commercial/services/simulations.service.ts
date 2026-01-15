/**
 * Service de gestion des simulations/devis
 * Architecture API-ready avec mocks
 */

import type {
  Simulation,
  SimulationStatut,
  ProduitSimulation,
  PaginatedResponse,
  ApiResponse,
} from '../types';
import { USE_MOCK_API, simulateNetworkDelay } from './api.config';
import { MOCK_PRODUITS } from './produits.service';

// ============================================
// MOCK DATA
// ============================================

const MOCK_SIMULATIONS: Simulation[] = [
  {
    id: 'sim-001',
    reference: 'SIM-2024-001',

    clientId: 'cli-001',

    produits: [
      {
        produitId: 'prod-001',
        quantite: 5,
        prixUnitaire: 1243000,
        remisePercentage: 10,
        remiseMontant: 621500,
      },
      {
        produitId: 'prod-003',
        quantite: 2,
        prixUnitaire: 425000,
        remisePercentage: 5,
        remiseMontant: 42500,
      },
    ],

    sousTotal: 7065000,
    remiseTotale: 664000,
    taxe: 1152180, // TVA 18%
    fraisAdditionnels: 0,
    total: 7553180,
    marge: 2019540,
    pourcentageMarge: 26.7,

    conditionsPaiement: 'comptant',

    statut: 'envoye',
    dateCreation: '2024-12-15',
    derniereModification: '2024-12-15',
    validiteJours: 30,
    creePar: 'user-001',
    notes: 'Devis pour équipement informatique',
  },
];

// ============================================
// CALCUL HELPERS
// ============================================

/**
 * Calcule le total d'une simulation
 */
export function calculerTotalSimulation(
  produits: ProduitSimulation[],
  tauxTVA: number = 0.18,
  fraisAdditionnels: number = 0
): {
  sousTotal: number;
  remiseTotale: number;
  taxe: number;
  total: number;
  marge: number;
  pourcentageMarge: number;
} {
  // Calcul du sous-total et remise
  let sousTotal = 0;
  let remiseTotale = 0;
  let margeTotal = 0;

  produits.forEach((p) => {
    const totalLigne = p.prixUnitaire * p.quantite;
    const remiseLigne = (totalLigne * p.remisePercentage) / 100;

    sousTotal += totalLigne;
    remiseTotale += remiseLigne;

    // Pour le calcul de marge, on cherche le produit dans le catalogue
    // En production, cela viendrait de l'API
    const produitCatalogue = MOCK_PRODUITS.find((prod) => prod.id === p.produitId);
    if (produitCatalogue) {
      const prixAchatTotal = produitCatalogue.prixAchat * p.quantite;
      const prixVenteApresRemise = totalLigne - remiseLigne;
      margeTotal += prixVenteApresRemise - prixAchatTotal;
    }
  });

  const montantAvantTaxe = sousTotal - remiseTotale + fraisAdditionnels;
  const taxe = montantAvantTaxe * tauxTVA;
  const total = montantAvantTaxe + taxe;
  const pourcentageMarge = total > 0 ? (margeTotal / total) * 100 : 0;

  return {
    sousTotal,
    remiseTotale,
    taxe,
    total,
    marge: margeTotal,
    pourcentageMarge: Math.round(pourcentageMarge * 10) / 10,
  };
}

// ============================================
// API FUNCTIONS (Mock)
// ============================================

/**
 * Récupère la liste des simulations avec filtres et pagination
 */
export async function getSimulations(filters: {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  statut?: SimulationStatut;
  dateDebut?: string;
  dateFin?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<PaginatedResponse<Simulation>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    let filtered = [...MOCK_SIMULATIONS];

    // Filtres
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.reference.toLowerCase().includes(search) ||
          s.notes?.toLowerCase().includes(search)
      );
    }

    if (filters.clientId) {
      filtered = filtered.filter((s) => s.clientId === filters.clientId);
    }

    if (filters.statut) {
      filtered = filtered.filter((s) => s.statut === filters.statut);
    }

    if (filters.dateDebut) {
      filtered = filtered.filter((s) => s.dateCreation >= filters.dateDebut!);
    }

    if (filters.dateFin) {
      filtered = filtered.filter((s) => s.dateCreation <= filters.dateFin!);
    }

    // Tri
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[filters.sortBy as keyof Simulation];
        const bVal = b[filters.sortBy as keyof Simulation];
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
  const response = await fetch(`/api/commercial/simulations?${new URLSearchParams(filters as any)}`);
  return response.json();
}

/**
 * Récupère une simulation par son ID
 */
export async function getSimulationById(id: string): Promise<ApiResponse<Simulation>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const simulation = MOCK_SIMULATIONS.find((s) => s.id === id);

    if (!simulation) {
      return {
        success: false,
        message: 'Simulation non trouvée',
      };
    }

    return {
      success: true,
      data: simulation,
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/simulations/${id}`);
  return response.json();
}

/**
 * Crée une nouvelle simulation
 */
export async function createSimulation(data: {
  clientId?: string;
  produits: ProduitSimulation[];
  fraisAdditionnels?: number;
  validiteJours?: number;
  notes?: string;
}): Promise<ApiResponse<Simulation>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const calculs = calculerTotalSimulation(
      data.produits,
      0.18,
      data.fraisAdditionnels || 0
    );

    const newSimulation: Simulation = {
      id: `sim-${Date.now()}`,
      reference: `SIM-${new Date().getFullYear()}-${MOCK_SIMULATIONS.length + 1}`.padStart(12, '0'),
      clientId: data.clientId,
      produits: data.produits,
      ...calculs,
      fraisAdditionnels: data.fraisAdditionnels || 0,
      conditionsPaiement: 'comptant',
      statut: 'brouillon',
      dateCreation: new Date().toISOString().split('T')[0],
      derniereModification: new Date().toISOString().split('T')[0],
      validiteJours: data.validiteJours || 30,
      creePar: 'current-user',
      notes: data.notes,
    };

    MOCK_SIMULATIONS.push(newSimulation);

    return {
      success: true,
      data: newSimulation,
      message: 'Simulation créée avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch('/api/commercial/simulations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Met à jour une simulation
 */
export async function updateSimulation(
  id: string,
  data: Partial<Simulation>
): Promise<ApiResponse<Simulation>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const index = MOCK_SIMULATIONS.findIndex((s) => s.id === id);

    if (index === -1) {
      return {
        success: false,
        message: 'Simulation non trouvée',
      };
    }

    // Recalcul si les produits ont changé
    let calculs = {};
    if (data.produits) {
      calculs = calculerTotalSimulation(
        data.produits,
        0.18,
        data.fraisAdditionnels || MOCK_SIMULATIONS[index].fraisAdditionnels
      );
    }

    MOCK_SIMULATIONS[index] = {
      ...MOCK_SIMULATIONS[index],
      ...data,
      ...calculs,
      derniereModification: new Date().toISOString().split('T')[0],
    };

    return {
      success: true,
      data: MOCK_SIMULATIONS[index],
      message: 'Simulation mise à jour avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/simulations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Supprime une simulation
 */
export async function deleteSimulation(id: string): Promise<ApiResponse<void>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const index = MOCK_SIMULATIONS.findIndex((s) => s.id === id);

    if (index === -1) {
      return {
        success: false,
        message: 'Simulation non trouvée',
      };
    }

    MOCK_SIMULATIONS.splice(index, 1);

    return {
      success: true,
      message: 'Simulation supprimée avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/simulations/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

/**
 * Change le statut d'une simulation
 */
export async function changeSimulationStatut(
  id: string,
  statut: SimulationStatut
): Promise<ApiResponse<Simulation>> {
  return updateSimulation(id, { statut });
}

/**
 * Génère un PDF du devis
 */
export async function genererPDFDevis(id: string): Promise<ApiResponse<{ url: string }>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay(1500); // Simulation génération PDF

    return {
      success: true,
      data: {
        url: `/api/commercial/simulations/${id}/pdf`,
      },
      message: 'PDF généré avec succès',
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/simulations/${id}/pdf`, {
    method: 'POST',
  });
  return response.json();
}

/**
 * Envoie le devis par email au client
 */
export async function envoyerDevisEmail(
  id: string,
  email: string,
  message?: string
): Promise<ApiResponse<void>> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay(1000);

    // Met à jour le statut
    await updateSimulation(id, { statut: 'envoye' });

    return {
      success: true,
      message: `Devis envoyé avec succès à ${email}`,
    };
  }

  // TODO: Vraie implémentation API
  const response = await fetch(`/api/commercial/simulations/${id}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, message }),
  });
  return response.json();
}
