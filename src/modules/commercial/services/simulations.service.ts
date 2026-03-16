/**
 * Service de gestion des simulations/devis — connecté au backend GestEMC
 */

import type {
  Simulation,
  SimulationStatut,
  ProduitSimulation,
  PaginatedResponse,
  ApiResponse,
} from '../types';
import { API_ENDPOINTS } from './api.config';
import { apiClient } from './apiClient';

// ============================================
// MAPPING
// ============================================

function mapBackendToSimulation(s: any): Simulation {
  const produits: ProduitSimulation[] = (s.produits || s.simulation_produits || []).map((p: any) => ({
    produitId: String(p.article_id || p.produit_id),
    quantite: Number(p.quantite) || 1,
    prixUnitaire: Number(p.prix_unitaire) || 0,
    remisePercentage: Number(p.remise_percentage) || 0,
    remiseMontant: (Number(p.prix_unitaire) || 0) * (Number(p.quantite) || 1) * (Number(p.remise_percentage) || 0) / 100,
  }));

  const sousTotal = Number(s.sous_total) || 0;
  const remiseTotale = Number(s.remise_totale) || 0;
  const taxe = Number(s.taxe) || 0;
  const total = Number(s.total) || 0;

  return {
    id: String(s.id),
    reference: s.reference || `SIM-${s.id}`,
    clientId: s.client_id ? String(s.client_id) : undefined,
    produits,
    sousTotal,
    remiseTotale,
    taxe,
    fraisAdditionnels: Number(s.frais_additionnels) || 0,
    total,
    marge: Number(s.marge) || 0,
    pourcentageMarge: total > 0 ? Math.round((Number(s.marge) / total) * 1000) / 10 : 0,
    conditionsPaiement: s.conditions_paiement || 'comptant',
    statut: (s.statut || 'brouillon') as SimulationStatut,
    dateCreation: s.created_at?.split('T')[0] || '',
    derniereModification: s.updated_at?.split('T')[0] || '',
    validiteJours: Number(s.validite_jours) || 30,
    creePar: String(s.user_id || ''),
    notes: s.notes,
    commandeId: s.commande_id ? String(s.commande_id) : undefined,
  };
}

// ============================================
// CALCUL HELPERS
// ============================================

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
  let sousTotal = 0;
  let remiseTotale = 0;

  produits.forEach((p) => {
    const totalLigne = p.prixUnitaire * p.quantite;
    const remiseLigne = (totalLigne * p.remisePercentage) / 100;
    sousTotal += totalLigne;
    remiseTotale += remiseLigne;
  });

  const montantAvantTaxe = sousTotal - remiseTotale + fraisAdditionnels;
  const taxe = montantAvantTaxe * tauxTVA;
  const total = montantAvantTaxe + taxe;

  return {
    sousTotal,
    remiseTotale,
    taxe,
    total,
    marge: 0,
    pourcentageMarge: 0,
  };
}

// ============================================
// API FUNCTIONS
// ============================================

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
  const params: Record<string, string | number | undefined> = {
    client_id: filters.clientId,
    statut: filters.statut,
    date_debut: filters.dateDebut,
    date_fin: filters.dateFin,
    page: filters.page,
    per_page: filters.limit,
  };

  const res = await apiClient.get<any>(API_ENDPOINTS.simulations.list, params);
  const items: any[] = res.data || res;

  return {
    data: items.map(mapBackendToSimulation),
    pagination: {
      page: res.meta?.current_page || filters.page || 1,
      limit: res.meta?.per_page || filters.limit || 10,
      total: res.meta?.total || items.length,
      totalPages: res.meta?.last_page || 1,
    },
  };
}

export async function getSimulationById(id: string): Promise<ApiResponse<Simulation>> {
  const res = await apiClient.get<any>(API_ENDPOINTS.simulations.getById(id));
  return { success: true, data: mapBackendToSimulation(res.data || res) };
}

export async function createSimulation(data: {
  clientId?: string;
  produits: ProduitSimulation[];
  fraisAdditionnels?: number;
  validiteJours?: number;
  notes?: string;
}): Promise<ApiResponse<Simulation>> {
  const calculs = calculerTotalSimulation(data.produits, 0.18, data.fraisAdditionnels || 0);

  const payload = {
    client_id: data.clientId,
    sous_total: calculs.sousTotal,
    remise_totale: calculs.remiseTotale,
    taxe: calculs.taxe,
    frais_additionnels: data.fraisAdditionnels || 0,
    total: calculs.total,
    marge: 0,
    conditions_paiement: 'comptant',
    statut: 'brouillon',
    notes: data.notes,
    produits: data.produits.map((p) => ({
      article_id: p.produitId,
      quantite: p.quantite,
      prix_unitaire: p.prixUnitaire,
      remise_percentage: p.remisePercentage,
    })),
  };

  const res = await apiClient.post<any>(API_ENDPOINTS.simulations.create, payload);
  return { success: true, data: mapBackendToSimulation(res.data || res), message: 'Simulation créée avec succès' };
}

export async function updateSimulation(id: string, data: Partial<Simulation>): Promise<ApiResponse<Simulation>> {
  const payload: Record<string, unknown> = {};
  if (data.statut) payload.statut = data.statut;
  if (data.clientId !== undefined) payload.client_id = data.clientId;
  if (data.notes !== undefined) payload.notes = data.notes;
  if (data.conditionsPaiement) payload.conditions_paiement = data.conditionsPaiement;
  if (data.fraisAdditionnels !== undefined) payload.frais_additionnels = data.fraisAdditionnels;

  if (data.produits) {
    const calculs = calculerTotalSimulation(data.produits, 0.18, data.fraisAdditionnels || 0);
    payload.sous_total = calculs.sousTotal;
    payload.remise_totale = calculs.remiseTotale;
    payload.taxe = calculs.taxe;
    payload.total = calculs.total;
    payload.produits = data.produits.map((p) => ({
      article_id: p.produitId,
      quantite: p.quantite,
      prix_unitaire: p.prixUnitaire,
      remise_percentage: p.remisePercentage,
    }));
  }

  const res = await apiClient.put<any>(API_ENDPOINTS.simulations.update(id), payload);
  return { success: true, data: mapBackendToSimulation(res.data || res), message: 'Simulation mise à jour avec succès' };
}

export async function deleteSimulation(id: string): Promise<ApiResponse<void>> {
  await apiClient.delete(API_ENDPOINTS.simulations.delete(id));
  return { success: true, message: 'Simulation supprimée avec succès' };
}

export async function changeSimulationStatut(id: string, statut: SimulationStatut): Promise<ApiResponse<Simulation>> {
  return updateSimulation(id, { statut });
}

export async function genererPDFDevis(id: string): Promise<ApiResponse<{ url: string }>> {
  return { success: true, data: { url: `/api/v1/simulations/${id}/pdf` } };
}

export async function envoyerDevisEmail(
  id: string,
  email: string,
  message?: string
): Promise<ApiResponse<void>> {
  await apiClient.post<any>(API_ENDPOINTS.simulations.send(id), { email, message });
  return { success: true, message: `Devis envoyé avec succès à ${email}` };
}

export async function convertirSimulationEnCommande(id: string): Promise<ApiResponse<{ commandeId: string }>> {
  const res = await apiClient.post<any>(API_ENDPOINTS.simulations.convertToOrder(id));
  const d = res.data || res;
  return { success: true, data: { commandeId: String(d.id || d.commande_id || '') }, message: 'Simulation convertie en commande' };
}
