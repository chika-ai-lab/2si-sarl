/**
 * Service pour les rapports commerciaux — connecté au backend GestEMC
 */

import type { ApiResponse } from "@/types/api";
import { API_ENDPOINTS } from './api.config';
import { apiClient } from './apiClient';

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
  evolutionCA: number;
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
// MAPPING
// ============================================

function mapChiffreAffaire(item: any): ChiffreAffaire {
  const montant = Number(item.ca || item.montant || item.chiffre_affaire) || 0;
  const nombreCommandes = Number(item.nb_commandes || item.nombre_commandes) || 0;
  return {
    periode: item.mois || item.periode || item.semaine || '',
    montant,
    nombreCommandes,
    montantMoyen: nombreCommandes > 0 ? Math.round(montant / nombreCommandes) : 0,
  };
}

function mapVenteParProduit(item: any): VenteParProduit {
  return {
    produitId: String(item.article_id || item.produit_id || ''),
    produitNom: item.article_nom || item.libelle || item.nom || item.produit_nom || '',
    quantiteVendue: Number(item.quantite_vendue) || 0,
    chiffreAffaire: Number(item.chiffre_affaire || item.ca) || 0,
    nombreCommandes: Number(item.nb_commandes || item.nombre_commandes) || 0,
  };
}

function mapVenteParClient(item: any): VenteParClient {
  return {
    clientId: String(item.client_id || ''),
    clientNom: item.client_nom || item.nom_complet || item.nom || '',
    chiffreAffaire: Number(item.chiffre_affaire || item.ca) || 0,
    nombreCommandes: Number(item.nb_commandes || item.nombre_commandes) || 0,
    dernierAchat: item.dernier_achat || '',
  };
}

function mapVenteParBanque(item: any): VenteParBanque {
  return {
    banque: item.banque || item.banque_partenaire || '',
    chiffreAffaire: Number(item.chiffre_affaire || item.ca) || 0,
    nombreCommandes: Number(item.nombre_commandes) || 0,
    nombreClients: Number(item.nombre_clients) || 0,
  };
}

function mapStatistiquesGlobales(res: any): StatistiquesGlobales {
  return {
    chiffreAffaireTotal: Number(res.chiffre_affaire_total ?? res.ca_total) || 0,
    chiffreAffaireMois: Number(res.chiffre_affaire_mois ?? res.ca_mois) || 0,
    evolutionCA: Number(res.evolution_ca) || 0,
    nombreCommandesTotal: Number(res.nombre_commandes_total ?? res.commandes_total) || 0,
    nombreCommandesMois: Number(res.nombre_commandes_mois ?? res.commandes_mois) || 0,
    evolutionCommandes: Number(res.evolution_commandes) || 0,
    panierMoyen: Number(res.panier_moyen) || 0,
    evolutionPanierMoyen: Number(res.evolution_panier_moyen) || 0,
    nombreClientsActifs: Number(res.nombre_clients_actifs ?? res.clients_actifs) || 0,
    tauxConversion: Number(res.taux_conversion) || 0,
    nombreAccreditifsActifs: Number(res.accreditifs_actifs) || 0,
    montantAccreditifsActifs: Number(res.montant_accreditifs_actifs) || 0,
  };
}

// ============================================
// API FUNCTIONS
// ============================================

// ── Unwrap helper ─────────────────────────────────────────────────────────
// Backend renvoie soit un tableau directement, soit { data: [...] }
function unwrapList(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export async function getRapportEvolutionCA(
  filters: RapportFilters = {}
): Promise<ApiResponse<RapportEvolutionCA>> {
  const dateParams: Record<string, string | undefined> = {
    date_debut: filters.dateDebut,
    date_fin:   filters.dateFin,
    banque:     filters.banque,
  };

  // Appels parallèles vers les 4 endpoints
  const [evolutionRes, topProduitsRes, topClientsRes, banquesRes] = await Promise.all([
    apiClient.get<any>(API_ENDPOINTS.rapports.evolutionCA,       dateParams).catch(() => []),
    apiClient.get<any>(API_ENDPOINTS.rapports.topProduits,       { ...dateParams, limit: 10 }).catch(() => []),
    apiClient.get<any>(API_ENDPOINTS.rapports.topClients,        { ...dateParams, limit: 10 }).catch(() => []),
    apiClient.get<any>(API_ENDPOINTS.rapports.repartitionBanques, dateParams).catch(() => []),
  ]);

  const evolutionItems  = unwrapList(evolutionRes);
  const topProduitsItems = unwrapList(topProduitsRes);
  const topClientsItems  = unwrapList(topClientsRes);
  const banquesItems     = unwrapList(banquesRes);

  // ── Calcul des KPIs à partir des données d'évolution ─────────────────
  const caTotal     = evolutionItems.reduce((s, x) => s + (Number(x.ca)           || 0), 0);
  const cmdTotal    = evolutionItems.reduce((s, x) => s + (Number(x.nb_commandes) || 0), 0);

  // Trier du plus récent au plus ancien
  const sorted = [...evolutionItems].sort((a, b) =>
    (b.mois || b.periode || '').localeCompare(a.mois || a.periode || '')
  );
  const dernierMois     = sorted[0] ?? {};
  const avantDernierMois = sorted[1] ?? {};

  const caMois      = Number(dernierMois.ca)           || 0;
  const caPrecedent = Number(avantDernierMois.ca)      || 0;
  const cmdMois     = Number(dernierMois.nb_commandes) || 0;
  const cmdPrecedent = Number(avantDernierMois.nb_commandes) || 0;

  const evolutionCA        = caPrecedent > 0 ? ((caMois - caPrecedent) / caPrecedent) * 100 : 0;
  const evolutionCommandes = cmdPrecedent > 0 ? ((cmdMois - cmdPrecedent) / cmdPrecedent) * 100 : 0;
  const panierMoyen        = cmdTotal > 0 ? Math.round(caTotal / cmdTotal) : 0;

  const computedStats: StatistiquesGlobales = {
    chiffreAffaireTotal:     caTotal,
    chiffreAffaireMois:      caMois,
    evolutionCA:             Math.round(evolutionCA * 10) / 10,
    nombreCommandesTotal:    cmdTotal,
    nombreCommandesMois:     cmdMois,
    evolutionCommandes:      Math.round(evolutionCommandes * 10) / 10,
    panierMoyen,
    evolutionPanierMoyen:    0,
    nombreClientsActifs:     topClientsItems.length,
    tauxConversion:          0,
    nombreAccreditifsActifs: 0,
    montantAccreditifsActifs: 0,
  };

  return {
    success: true,
    data: {
      evolutionMensuelle:   evolutionItems.map(mapChiffreAffaire),
      evolutionHebdomadaire: [],
      topProduits:          topProduitsItems.map(mapVenteParProduit),
      topClients:           topClientsItems.map(mapVenteParClient),
      repartitionBanques:   banquesItems.map(mapVenteParBanque),
      statistiques:         computedStats,
    },
    message: 'Rapport récupéré avec succès',
  };
}

export async function getStatistiquesGlobales(): Promise<ApiResponse<StatistiquesGlobales>> {
  const res = await apiClient.get<any>(API_ENDPOINTS.rapports.statistiques);
  return {
    success: true,
    data: mapStatistiquesGlobales(res.data || res || {}),
    message: 'Statistiques récupérées avec succès',
  };
}

export async function getTopProduits(
  filters: RapportFilters = {},
  limit: number = 10
): Promise<ApiResponse<VenteParProduit[]>> {
  const params: Record<string, string | number | undefined> = {
    date_debut: filters.dateDebut,
    date_fin: filters.dateFin,
    limit,
  };

  const res = await apiClient.get<any>(API_ENDPOINTS.rapports.topProduits, params);
  const items: any[] = res.data || res || [];
  return { success: true, data: items.map(mapVenteParProduit), message: 'Top produits récupérés avec succès' };
}

export async function getTopClients(
  filters: RapportFilters = {},
  limit: number = 10
): Promise<ApiResponse<VenteParClient[]>> {
  const params: Record<string, string | number | undefined> = {
    date_debut: filters.dateDebut,
    date_fin: filters.dateFin,
    limit,
  };

  const res = await apiClient.get<any>(API_ENDPOINTS.rapports.topClients, params);
  const items: any[] = res.data || res || [];
  return { success: true, data: items.map(mapVenteParClient), message: 'Top clients récupérés avec succès' };
}

export async function getRepartitionBanques(
  filters: RapportFilters = {}
): Promise<ApiResponse<VenteParBanque[]>> {
  const params: Record<string, string | number | undefined> = {
    date_debut: filters.dateDebut,
    date_fin: filters.dateFin,
  };

  const res = await apiClient.get<any>(API_ENDPOINTS.rapports.repartitionBanques, params);
  const items: any[] = res.data || res || [];
  return { success: true, data: items.map(mapVenteParBanque), message: 'Répartition par banque récupérée avec succès' };
}

export async function exporterRapportCSV(
  type: 'ca' | 'produits' | 'clients' | 'banques',
  filters: RapportFilters = {}
): Promise<Blob> {
  const params = new URLSearchParams();
  if (filters.dateDebut) params.append('date_debut', filters.dateDebut);
  if (filters.dateFin) params.append('date_fin', filters.dateFin);

  const token = localStorage.getItem('auth-token');
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const url = `${API_BASE}${API_ENDPOINTS.rapports.export(type)}?${params}`;

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) throw new Error(`Erreur export ${response.status}`);
  return response.blob();
}
