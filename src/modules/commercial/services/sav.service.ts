/**
 * Service de gestion du SAV (Service Après-Vente) — connecté au backend GestEMC
 */

import type {
  TicketSAV,
  InterventionSAV,
  StatutTicketSAV,
  PaginatedResponse,
  ApiResponse,
  SAVFilters,
} from '../types';
import { API_ENDPOINTS } from './api.config';
import { apiClient } from './apiClient';

// ============================================
// MAPPING
// ============================================

function mapBackendToIntervention(i: any): InterventionSAV {
  return {
    id: String(i.id),
    date: i.date || '',
    technicienId: String(i.technicien || ''),
    technicien: i.technicien || '',
    description: i.description || '',
    piecesUtilisees: [],
    tempsIntervention: Number(i.duree_heures) || 0,
    cout: Number(i.cout) || 0,
  };
}

function mapBackendToTicket(t: any): TicketSAV {
  const interventions: InterventionSAV[] = (t.interventions || []).map(mapBackendToIntervention);
  const coutPieces = Number(t.cout_pieces) || 0;
  const coutMainOeuvre = Number(t.cout_main_oeuvre) || 0;

  return {
    id: String(t.id),
    numero: t.numero || `SAV-${t.id}`,
    clientId: String(t.client_id || ''),
    produitId: t.produit_id ? String(t.produit_id) : undefined,
    commandeId: t.commande_id ? String(t.commande_id) : undefined,
    type: t.type || 'reclamation',
    priorite: t.priorite || 'normale',
    sujet: t.sujet || '',
    description: t.description || '',
    symptomes: undefined,
    photos: [],
    documents: [],
    statut: t.statut || 'ouvert',
    interventions,
    dateOuverture: t.created_at?.split('T')[0] || '',
    datePrevueResolution: t.date_prevue_resolution || undefined,
    dateResolution: t.date_resolution || undefined,
    sousGarantie: Boolean(t.sous_garantie),
    dateFinGarantie: undefined,
    coutPieces,
    coutMainOeuvre,
    coutTotal: coutPieces + coutMainOeuvre,
    assigneA: t.assigne_a ? String(t.assigne_a) : undefined,
    creePar: String(t.user_id || ''),
    notes: t.notes,
  };
}

// ============================================
// API FUNCTIONS
// ============================================

export async function getTicketsSAV(filters: SAVFilters = {}): Promise<PaginatedResponse<TicketSAV>> {
  const params: Record<string, string | number | undefined> = {
    client_id: filters.clientId,
    statut: filters.statut,
    priorite: filters.priorite,
    type: filters.type,
    assigne_a: filters.assigneA,
    page: filters.page,
    per_page: filters.limit,
  };

  const res = await apiClient.get<any>(API_ENDPOINTS.sav.list, params);
  const items: any[] = res.data || res;

  return {
    data: items.map(mapBackendToTicket),
    pagination: {
      page: res.meta?.current_page || filters.page || 1,
      limit: res.meta?.per_page || filters.limit || 10,
      total: res.meta?.total || items.length,
      totalPages: res.meta?.last_page || 1,
    },
  };
}

export async function getTicketSAV(id: string): Promise<ApiResponse<TicketSAV>> {
  const res = await apiClient.get<any>(API_ENDPOINTS.sav.getById(id));
  return { success: true, data: mapBackendToTicket(res.data || res) };
}

export async function createTicketSAV(data: Partial<TicketSAV>): Promise<ApiResponse<TicketSAV>> {
  const payload = {
    client_id: data.clientId,
    produit_id: data.produitId,
    commande_id: data.commandeId,
    type: data.type || 'reclamation',
    priorite: data.priorite || 'normale',
    sujet: data.sujet || '',
    description: data.description || '',
    sous_garantie: data.sousGarantie || false,
    assigne_a: data.assigneA,
    notes: data.notes,
  };

  const res = await apiClient.post<any>(API_ENDPOINTS.sav.create, payload);
  return { success: true, data: mapBackendToTicket(res.data || res), message: 'Ticket SAV créé avec succès' };
}

export async function updateTicketSAV(id: string, data: Partial<TicketSAV>): Promise<ApiResponse<TicketSAV>> {
  const payload: Record<string, unknown> = {};
  if (data.statut) payload.statut = data.statut;
  if (data.priorite) payload.priorite = data.priorite;
  if (data.sujet) payload.sujet = data.sujet;
  if (data.description) payload.description = data.description;
  if (data.assigneA !== undefined) payload.assigne_a = data.assigneA;
  if (data.notes !== undefined) payload.notes = data.notes;
  if (data.datePrevueResolution) payload.date_prevue_resolution = data.datePrevueResolution;
  if (data.sousGarantie !== undefined) payload.sous_garantie = data.sousGarantie;
  if (data.coutPieces !== undefined) payload.cout_pieces = data.coutPieces;
  if (data.coutMainOeuvre !== undefined) payload.cout_main_oeuvre = data.coutMainOeuvre;

  const res = await apiClient.put<any>(API_ENDPOINTS.sav.update(id), payload);
  return { success: true, data: mapBackendToTicket(res.data || res), message: 'Ticket SAV mis à jour avec succès' };
}

export async function changeStatutTicket(id: string, statut: StatutTicketSAV): Promise<ApiResponse<TicketSAV>> {
  if (statut === 'ferme') {
    const res = await apiClient.post<any>(API_ENDPOINTS.sav.close(id));
    return { success: true, data: mapBackendToTicket(res.data || res), message: 'Ticket fermé avec succès' };
  }
  return updateTicketSAV(id, { statut });
}

export async function addIntervention(
  ticketId: string,
  intervention: Omit<InterventionSAV, 'id'>
): Promise<ApiResponse<TicketSAV>> {
  const payload = {
    description: intervention.description,
    technicien: intervention.technicien,
    cout: intervention.cout,
    duree_heures: intervention.tempsIntervention,
    date: intervention.date || new Date().toISOString().split('T')[0],
  };

  const res = await apiClient.post<any>(API_ENDPOINTS.sav.addIntervention(ticketId), payload);
  return { success: true, data: mapBackendToTicket(res.data || res), message: 'Intervention ajoutée avec succès' };
}

export async function assignerTicket(id: string, technicienId: string): Promise<ApiResponse<TicketSAV>> {
  return updateTicketSAV(id, { assigneA: technicienId, statut: 'en_cours' });
}

export async function ajouterSatisfaction(
  id: string,
  note: 1 | 2 | 3 | 4 | 5,
  commentaire?: string
): Promise<ApiResponse<TicketSAV>> {
  return updateTicketSAV(id, { notes: commentaire });
}

export async function getStatistiquesSAV() {
  const res = await apiClient.get<any>(API_ENDPOINTS.sav.list, { per_page: 1000 });
  const items: any[] = res.data || res;
  const mapped = items.map(mapBackendToTicket);

  return {
    success: true,
    data: {
      total: res.meta?.total || mapped.length,
      ouverts: mapped.filter((t) => t.statut === 'ouvert').length,
      enCours: mapped.filter((t) => t.statut === 'en_cours' || t.statut === 'en_attente_pieces').length,
      resolus: mapped.filter((t) => t.statut === 'resolu').length,
      fermes: mapped.filter((t) => t.statut === 'ferme').length,
      satisfactionMoyenne: 0,
      coutTotalMois: mapped.reduce((sum, t) => sum + t.coutTotal, 0),
      tempsResolutionMoyen: 0,
    },
  };
}
