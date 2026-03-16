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
  const montant = Number(item.montant) || 0;
  const nombreCommandes = Number(item.nombre_commandes) || 0;
  return {
    periode: item.periode || '',
    montant,
    nombreCommandes,
    montantMoyen: nombreCommandes > 0 ? Math.round(montant / nombreCommandes) : 0,
  };
}

function mapVenteParProduit(item: any): VenteParProduit {
  return {
    produitId: String(item.article_id || item.produit_id || ''),
    produitNom: item.libelle || item.nom || item.produit_nom || '',
    quantiteVendue: Number(item.quantite_vendue) || 0,
    chiffreAffaire: Number(item.chiffre_affaire || item.ca) || 0,
    nombreCommandes: Number(item.nombre_commandes) || 0,
  };
}

function mapVenteParClient(item: any): VenteParClient {
  return {
    clientId: String(item.client_id || ''),
    clientNom: item.nom_complet || item.nom || item.client_nom || '',
    chiffreAffaire: Number(item.chiffre_affaire || item.ca) || 0,
    nombreCommandes: Number(item.nombre_commandes) || 0,
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
    chiffreAffaireTotal: Number(res.ca_total) || 0,
    chiffreAffaireMois: Number(res.ca_mois) || 0,
    evolutionCA: Number(res.evolution_ca) || 0,
    nombreCommandesTotal: Number(res.commandes_total) || 0,
    nombreCommandesMois: Number(res.commandes_mois) || 0,
    evolutionCommandes: Number(res.evolution_commandes) || 0,
    panierMoyen: Number(res.panier_moyen) || 0,
    evolutionPanierMoyen: Number(res.evolution_panier_moyen) || 0,
    nombreClientsActifs: Number(res.clients_actifs) || 0,
    tauxConversion: Number(res.taux_conversion) || 0,
    nombreAccreditifsActifs: Number(res.accreditifs_actifs) || 0,
    montantAccreditifsActifs: Number(res.montant_accreditifs_actifs) || 0,
  };
}

// ============================================
// API FUNCTIONS
// ============================================

export async function getRapportEvolutionCA(
  filters: RapportFilters = {}
): Promise<ApiResponse<RapportEvolutionCA>> {
  const params: Record<string, string | number | undefined> = {
    date_debut: filters.dateDebut,
    date_fin: filters.dateFin,
    client_id: filters.clientId,
    banque: filters.banque,
  };

  const [evolutionRes, statsRes, topProduitsRes, topClientsRes, banquesRes] = await Promise.all([
    apiClient.get<any>(API_ENDPOINTS.rapports.evolutionCA, params),
    apiClient.get<any>(API_ENDPOINTS.rapports.statistiques),
    apiClient.get<any>(API_ENDPOINTS.rapports.topProduits, { limit: 5 }),
    apiClient.get<any>(API_ENDPOINTS.rapports.topClients, { limit: 5 }),
    apiClient.get<any>(API_ENDPOINTS.rapports.repartitionBanques),
  ]);

  const evolutionItems: any[] = evolutionRes.data || evolutionRes || [];
  const topProduitsItems: any[] = topProduitsRes.data || topProduitsRes || [];
  const topClientsItems: any[] = topClientsRes.data || topClientsRes || [];
  const banquesItems: any[] = banquesRes.data || banquesRes || [];

  return {
    success: true,
    data: {
      evolutionMensuelle: evolutionItems.map(mapChiffreAffaire),
      evolutionHebdomadaire: [],
      topProduits: topProduitsItems.map(mapVenteParProduit),
      topClients: topClientsItems.map(mapVenteParClient),
      repartitionBanques: banquesItems.map(mapVenteParBanque),
      statistiques: mapStatistiquesGlobales(statsRes.data || statsRes || {}),
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
