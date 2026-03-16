/**
 * Service de gestion des accréditifs (lettres de crédit) — connecté au backend GestEMC
 */

import type {
  Accreditif,
  AccreditifStatut,
  DocumentAccreditif,
  PaginatedResponse,
  ApiResponse,
  BanquePartenaire,
} from '../types';
import { API_ENDPOINTS } from './api.config';
import { apiClient } from './apiClient';

// ============================================
// MAPPING
// ============================================

function mapBackendToAccreditif(a: any): Accreditif {
  const documents: DocumentAccreditif[] = (a.documents || []).map((d: any) => ({
    type: d.type || 'autre',
    nom: d.nom || '',
    url: d.chemin || '',
    dateUpload: d.created_at?.split('T')[0] || '',
  }));

  return {
    id: String(a.id),
    reference: a.reference || `LC-${a.id}`,
    numeroAccreditif: a.numero_accreditif || '',
    banqueEmettrice: (a.banque_emettrice || 'Autre') as BanquePartenaire,
    banqueBeneficiaire: a.banque_beneficiaire || '',
    montant: Number(a.montant) || 0,
    devise: (a.devise || 'FCFA') as 'FCFA' | 'EUR' | 'USD',
    clientId: a.client_id ? String(a.client_id) : undefined,
    commandeIds: a.commande_id ? [String(a.commande_id)] : [],
    dateEmission: a.date_emission || '',
    dateExpiration: a.date_expiration || '',
    documents,
    statut: (a.statut || 'en_attente') as AccreditifStatut,
    creePar: String(a.user_id || ''),
    notes: a.notes,
  };
}

// ============================================
// API FUNCTIONS
// ============================================

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
  const params: Record<string, string | number | undefined> = {
    client_id: filters.clientId,
    banque_emettrice: filters.banqueEmettrice,
    statut: filters.statut,
    date_debut: filters.dateDebut,
    date_fin: filters.dateFin,
    page: filters.page,
    per_page: filters.limit,
  };

  const res = await apiClient.get<any>(API_ENDPOINTS.accreditifs.list, params);
  const items: any[] = res.data || res;

  return {
    data: items.map(mapBackendToAccreditif),
    pagination: {
      page: res.meta?.current_page || filters.page || 1,
      limit: res.meta?.per_page || filters.limit || 10,
      total: res.meta?.total || items.length,
      totalPages: res.meta?.last_page || 1,
    },
  };
}

export async function getAccreditifById(id: string): Promise<ApiResponse<Accreditif>> {
  const res = await apiClient.get<any>(API_ENDPOINTS.accreditifs.getById(id));
  return { success: true, data: mapBackendToAccreditif(res.data || res) };
}

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
  const payload = {
    numero_accreditif: data.numeroAccreditif,
    banque_emettrice: data.banqueEmettrice,
    banque_beneficiaire: data.banqueBeneficiaire,
    montant: data.montant,
    devise: data.devise,
    client_id: data.clientId,
    commande_id: data.commandeIds?.[0],
    date_emission: new Date().toISOString().split('T')[0],
    date_expiration: data.dateExpiration,
    notes: data.notes,
  };

  const res = await apiClient.post<any>(API_ENDPOINTS.accreditifs.create, payload);
  return { success: true, data: mapBackendToAccreditif(res.data || res), message: 'Accréditif créé avec succès' };
}

export async function updateAccreditif(id: string, data: Partial<Accreditif>): Promise<ApiResponse<Accreditif>> {
  const payload: Record<string, unknown> = {};
  if (data.statut) payload.statut = data.statut;
  if (data.notes !== undefined) payload.notes = data.notes;
  if (data.montant !== undefined) payload.montant = data.montant;
  if (data.dateExpiration) payload.date_expiration = data.dateExpiration;
  if (data.banqueBeneficiaire) payload.banque_beneficiaire = data.banqueBeneficiaire;

  const res = await apiClient.put<any>(API_ENDPOINTS.accreditifs.update(id), payload);
  return { success: true, data: mapBackendToAccreditif(res.data || res), message: 'Accréditif mis à jour avec succès' };
}

export async function deleteAccreditif(id: string): Promise<ApiResponse<void>> {
  await apiClient.delete(API_ENDPOINTS.accreditifs.delete(id));
  return { success: true, message: 'Accréditif supprimé avec succès' };
}

export async function changeAccreditifStatut(id: string, statut: AccreditifStatut): Promise<ApiResponse<Accreditif>> {
  return updateAccreditif(id, { statut });
}

export async function uploadDocument(
  id: string,
  file: File,
  type: 'lettre_credit' | 'garantie' | 'autre'
): Promise<ApiResponse<DocumentAccreditif>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('nom', file.name);

  const res = await apiClient.postForm<any>(API_ENDPOINTS.accreditifs.uploadDocument(id), formData);
  const d = res.data || res;
  return {
    success: true,
    data: {
      type: d.type || type,
      nom: d.nom || file.name,
      url: d.chemin || '',
      dateUpload: d.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    },
    message: 'Document uploadé avec succès',
  };
}

export async function getAccreditifsExpirantBientot(jours: number = 30) {
  const res = await apiClient.get<any>(API_ENDPOINTS.accreditifs.alertes, { jours });
  const items: any[] = res.data || res;
  return {
    data: items.map(mapBackendToAccreditif),
    count: items.length,
  };
}

export async function getAccreditifsStats() {
  const res = await apiClient.get<any>(API_ENDPOINTS.accreditifs.list, { per_page: 1000 });
  const items: any[] = res.data || res;

  const mapped = items.map(mapBackendToAccreditif);
  return {
    total: res.meta?.total || mapped.length,
    enAttente: mapped.filter((a) => a.statut === 'en_attente').length,
    approuve: mapped.filter((a) => a.statut === 'approuve').length,
    execute: mapped.filter((a) => a.statut === 'execute').length,
    expire: mapped.filter((a) => a.statut === 'expire').length,
    montantTotal: mapped.reduce((acc, a) => acc + a.montant, 0),
    montantActif: mapped
      .filter((a) => a.statut === 'approuve' || a.statut === 'execute')
      .reduce((acc, a) => acc + a.montant, 0),
  };
}
