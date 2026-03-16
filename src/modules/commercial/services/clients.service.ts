/**
 * Service de gestion des clients — connecté au backend GestEMC
 */

import type {
  Client,
  CreateClientDTO,
  UpdateClientDTO,
  ClientFilters,
  PaginatedResponse,
  ApiResponse,
} from '../types';
import { API_ENDPOINTS } from './api.config';
import { apiClient } from './apiClient';

// ============================================
// MAPPING
// ============================================

function mapBackendToClient(c: any): Client {
  const creditLimite = Number(c.credit_limite) || 0;
  const creditUtilise = Number(c.credit_utilise) || 0;

  let adresse = { rue: '', ville: 'Dakar', codePostal: '', pays: 'Sénégal' };
  if (c.adresse) {
    try {
      adresse = typeof c.adresse === 'string' ? JSON.parse(c.adresse) : c.adresse;
    } catch {
      adresse.rue = c.adresse;
    }
  }

  return {
    id: String(c.id),
    code: c.num_compte || `CLT-${String(c.id).padStart(3, '0')}`,
    nom: c.nom || (c.type === 'particulier' ? (c.nom_complet || '').split(' ')[0] : undefined),
    prenom: c.prenom || (c.type === 'particulier' ? (c.nom_complet || '').split(' ').slice(1).join(' ') : undefined),
    raisonSociale: c.raison_sociale || (c.type === 'entreprise' ? c.nom_complet : undefined),
    type: c.type || 'particulier',
    email: c.email || '',
    telephone: c.telephone || '',
    telephoneSecondaire: c.telephone_secondaire,
    adresse,
    categorie: c.categorie || 'B',
    credit: { limite: creditLimite, utilise: creditUtilise, disponible: creditLimite - creditUtilise },
    banquePartenaire: c.banque_partenaire || 'Autre',
    numeroCompte: c.num_compte,
    statut: c.statut || 'actif',
    dateCreation: c.created_at?.split('T')[0] || c.created_at || '',
    totalAchats: 0,
    nombreCommandes: 0,
    commercialAssigne: c.gestionnaire,
    notes: c.notes,
  };
}

function mapClientToBackend(data: CreateClientDTO | UpdateClientDTO): Record<string, unknown> {
  const nomComplet = (data as any).type === 'entreprise'
    ? (data as any).raisonSociale
    : [(data as any).nom, (data as any).prenom].filter(Boolean).join(' ');

  return {
    nom_complet: nomComplet,
    nom: (data as any).nom,
    prenom: (data as any).prenom,
    raison_sociale: (data as any).raisonSociale,
    type: (data as any).type,
    email: data.email,
    telephone: data.telephone,
    telephone_secondaire: (data as any).telephoneSecondaire,
    adresse: JSON.stringify((data as any).adresse || {}),
    categorie: (data as any).categorie,
    statut: (data as any).statut,
    banque_partenaire: (data as any).banquePartenaire,
    credit_limite: (data as any).creditLimite,
    num_compte: (data as any).numeroCompte,
    gestionnaire: (data as any).commercialAssigne,
    notes: (data as any).notes,
  };
}

// ============================================
// API FUNCTIONS
// ============================================

export async function getClients(filters: ClientFilters = {}): Promise<PaginatedResponse<Client>> {
  const params: Record<string, string | number | undefined> = {
    search: filters.search,
    statut: filters.statut,
    categorie: filters.categorie,
    banque_partenaire: filters.banque,
    page: filters.page,
    per_page: filters.limit,
  };

  const res = await apiClient.get<any>(API_ENDPOINTS.clients.list, params);
  const items: any[] = res.data || res;

  return {
    data: items.map(mapBackendToClient),
    pagination: {
      page: res.meta?.current_page || filters.page || 1,
      limit: res.meta?.per_page || filters.limit || 10,
      total: res.meta?.total || items.length,
      totalPages: res.meta?.last_page || 1,
    },
  };
}

export async function getClientById(id: string): Promise<ApiResponse<Client>> {
  const res = await apiClient.get<any>(API_ENDPOINTS.clients.getById(id));
  const c = res.data || res;
  return { success: true, data: mapBackendToClient(c) };
}

export async function createClient(data: CreateClientDTO): Promise<ApiResponse<Client>> {
  const res = await apiClient.post<any>(API_ENDPOINTS.clients.create, mapClientToBackend(data));
  const c = res.data || res;
  return { success: true, data: mapBackendToClient(c), message: 'Client créé avec succès' };
}

export async function updateClient(id: string, data: UpdateClientDTO): Promise<ApiResponse<Client>> {
  const res = await apiClient.put<any>(API_ENDPOINTS.clients.update(id), mapClientToBackend(data));
  const c = res.data || res;
  return { success: true, data: mapBackendToClient(c), message: 'Client mis à jour avec succès' };
}

export async function deleteClient(id: string): Promise<ApiResponse<void>> {
  await apiClient.delete(API_ENDPOINTS.clients.delete(id));
  return { success: true, message: 'Client supprimé avec succès' };
}

export async function getClientsStats() {
  const res = await apiClient.get<any>(API_ENDPOINTS.clients.stats);
  return {
    total: res.total || 0,
    actifs: res.actifs || 0,
    nouveauxMois: res.nouveaux_mois || 0,
    categorieA: res.par_categorie?.A || 0,
    categorieB: res.par_categorie?.B || 0,
    categorieC: res.par_categorie?.C || 0,
  };
}
