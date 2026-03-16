/**
 * Service de gestion des commandes commerciales — connecté au backend GestEMC
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
import { API_ENDPOINTS } from './api.config';
import { apiClient } from './apiClient';

// ============================================
// MAPPING etat backend → statut frontend
// ============================================

const ETAT_TO_STATUT: Record<string, CommandeStatut> = {
  brouillon: 'brouillon',
  'validé':  'validee',
  valide:    'validee',
  'livré':   'livree',
  livre:     'livree',
  annulé:    'annulee',
  annule:    'annulee',
  en_attente:'en_attente',
};

const STATUT_TO_ETAT: Record<string, string> = {
  brouillon:  'brouillon',
  validee:    'validé',
  livree:     'livré',
  annulee:    'annulé',
  en_attente: 'en_attente',
  en_cours:   'validé',
};

function mapBackendToCommande(c: any): CommandeCommerciale {
  const lignes = (c.articles || []).map((a: any) => ({
    id: String(a.id),
    produitId: String(a.article_id),
    produit: a.article ? { id: String(a.article.id), nom: a.article.libelle, prixVente: a.article.prix } : undefined,
    quantite: Number(a.quantite) || 1,
    prixUnitaire: Number(a.prix) || 0,
    remise: Number(a.reduction) || 0,
    sousTotal: Number(a.montant) || 0,
  }));

  return {
    id: String(c.id),
    numero: c.reference || `CMD-${c.id}`,
    reference: c.reference || `CMD-${c.id}`,
    clientId: String(c.client_id),
    lignes,
    sousTotal: Number(c.montant) || 0,
    taxe: Number(c.taxe) || 0,
    remise: Number(c.remise) || 0,
    fraisLivraison: Number(c.frais_livraison) || 0,
    total: Number(c.montant) || 0,
    adresseLivraison: { rue: '', ville: 'Dakar', codePostal: '', pays: 'Sénégal' },
    modeLivraison: c.mode_livraison || 'retrait',
    modePaiement: c.mode_paiement || 'virement',
    statutPaiement: c.statut_paiement || 'en_attente',
    montantPaye: 0,
    statut: (ETAT_TO_STATUT[c.etat] || 'brouillon') as CommandeStatut,
    dateCommande: c.date || c.created_at?.split('T')[0] || '',
    creePar: String(c.user_id || ''),
    notes: c.note,
    bonLivraison: c.avis_banque,
  };
}

// ============================================
// API FUNCTIONS
// ============================================

export async function getCommandes(filters: {
  page?: number; limit?: number; search?: string; clientId?: string;
  statut?: CommandeStatut; statutPaiement?: string; modePaiement?: ModePaiement;
  banque?: BanquePartenaire; dateDebut?: string; dateFin?: string;
  sortBy?: string; sortOrder?: 'asc' | 'desc';
} = {}): Promise<PaginatedResponse<CommandeCommerciale>> {
  const params: Record<string, string | number | undefined> = {
    client_id: filters.clientId,
    etat: filters.statut ? STATUT_TO_ETAT[filters.statut] : undefined,
    mode_paiement: filters.modePaiement,
    date_debut: filters.dateDebut,
    date_fin: filters.dateFin,
    page: filters.page,
    per_page: filters.limit,
  };

  const res = await apiClient.get<any>(API_ENDPOINTS.commandes.list, params);
  const items: any[] = res.data || res;

  return {
    data: items.map(mapBackendToCommande),
    pagination: {
      page: res.meta?.current_page || filters.page || 1,
      limit: res.meta?.per_page || filters.limit || 10,
      total: res.meta?.total || items.length,
      totalPages: res.meta?.last_page || 1,
    },
  };
}

export async function getCommandeById(id: string): Promise<ApiResponse<CommandeCommerciale>> {
  const res = await apiClient.get<any>(API_ENDPOINTS.commandes.getById(id));
  return { success: true, data: mapBackendToCommande(res.data || res) };
}

export async function createCommande(data: CreateCommandeDTO): Promise<ApiResponse<CommandeCommerciale>> {
  const payload = {
    client_id: data.clientId,
    date: new Date().toISOString().split('T')[0],
    montant: data.lignes.reduce((acc, l) => acc + l.prixUnitaire * l.quantite * (1 - l.remise / 100), 0),
    etat: 'brouillon',
    mode_paiement: data.modePaiement,
    mode_livraison: data.modeLivraison,
    note: data.notes,
    lignes: data.lignes.map(l => ({
      article_id: l.produitId,
      quantite: l.quantite,
      prix: l.prixUnitaire,
      reduction: l.remise,
      montant: l.prixUnitaire * l.quantite * (1 - l.remise / 100),
    })),
  };

  const res = await apiClient.post<any>(API_ENDPOINTS.commandes.create, payload);
  return { success: true, data: mapBackendToCommande(res.data || res), message: 'Commande créée avec succès' };
}

export async function updateCommande(id: string, data: Partial<CommandeCommerciale>): Promise<ApiResponse<CommandeCommerciale>> {
  const payload: Record<string, unknown> = {};
  if (data.statut) payload.etat = STATUT_TO_ETAT[data.statut] || data.statut;
  if (data.modePaiement) payload.mode_paiement = data.modePaiement;
  if (data.modeLivraison) payload.mode_livraison = data.modeLivraison;
  if (data.notes) payload.note = data.notes;
  if (data.total !== undefined) payload.montant = data.total;

  const res = await apiClient.put<any>(API_ENDPOINTS.commandes.update(id), payload);
  return { success: true, data: mapBackendToCommande(res.data || res), message: 'Commande mise à jour' };
}

export async function deleteCommande(id: string): Promise<ApiResponse<void>> {
  await apiClient.delete(API_ENDPOINTS.commandes.delete(id));
  return { success: true, message: 'Commande supprimée avec succès' };
}

export async function changeCommandeStatut(id: string, statut: CommandeStatut): Promise<ApiResponse<CommandeCommerciale>> {
  let endpoint: string;
  if (statut === 'validee' || statut === 'en_cours') endpoint = API_ENDPOINTS.commandes.valider(id);
  else if (statut === 'livree') endpoint = API_ENDPOINTS.commandes.livrer(id);
  else endpoint = API_ENDPOINTS.commandes.brouillon(id);

  const res = await apiClient.post<any>(endpoint);
  return { success: true, data: mapBackendToCommande(res.data || res) };
}

export async function genererFacture(id: string): Promise<ApiResponse<{ url: string }>> {
  return { success: true, data: { url: `/api/v1/facture-clients?commande_client_id=${id}` } };
}

export async function getCommandesStats() {
  const res = await apiClient.get<any>(API_ENDPOINTS.commandes.stats);
  return {
    total: res.total || 0,
    mois: res.mois || 0,
    caTotal: res.ca_total || 0,
    caMois: res.ca_mois || 0,
    parEtat: res.par_etat || {},
  };
}
