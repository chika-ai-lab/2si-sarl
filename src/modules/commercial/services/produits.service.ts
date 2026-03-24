/**
 * Service de gestion des produits catalogue — connecté au backend GestEMC
 */

import type {
  ProduitCatalogue,
  ProduitFilters,
  PaginatedResponse,
  ApiResponse,
} from '../types';
import { API_ENDPOINTS } from './api.config';
import { apiClient } from './apiClient';

// ============================================
// MAPPING
// ============================================

function mapBackendToProduct(a: any): ProduitCatalogue {
  const prixVente = Number(a.prix) || 0;
  const prixAchat = Number(a.prix_achat) || Math.round(prixVente * 0.7);

  return {
    id: String(a.id),
    reference: a.reference || `REF-${a.id}`,
    nom: a.libelle || '',
    description: a.description || '',
    categorie: a.categorie?.categorie || String(a.categorie_id || ''),
    categoriesIds: Array.isArray(a.categories) ? a.categories.map(Number) : [],
    marque: a.marque,
    banque: a.banque || 'Autre',
    prixAchat,
    prixVente,
    marge: prixVente - prixAchat,
    stock: {
      quantite: Number(a.quantite) || 0,
      seuilAlerte: Number(a.seuil_alerte) || 5,
      unite: 'piece',
    },
    images: Array.isArray(a.images) ? a.images : (() => { try { return a.images ? JSON.parse(a.images) : []; } catch { return []; } })(),
    statut: a.statut || 'actif',
    dateAjout: a.created_at?.split('T')[0] || '',
    derniereModification: a.updated_at?.split('T')[0] || '',
  };
}

// ============================================
// API FUNCTIONS
// ============================================

export async function getProduits(filters: ProduitFilters = {}): Promise<PaginatedResponse<ProduitCatalogue>> {
  const params: Record<string, string | number | undefined> = {
    search: filters.search,
    banque: filters.banque,
    categorie_id: filters.categorie,
    statut: filters.statut,
    prix_min: filters.prixMin,
    prix_max: filters.prixMax,
    page: filters.page,
    per_page: filters.limit,
  };

  const res = await apiClient.get<any>(API_ENDPOINTS.produits.list, params);
  const items: any[] = res.data || res;

  return {
    data: items.map(mapBackendToProduct),
    pagination: {
      page: res.meta?.current_page || filters.page || 1,
      limit: res.meta?.per_page || filters.limit || 10,
      total: res.meta?.total || items.length,
      totalPages: res.meta?.last_page || 1,
    },
  };
}

export async function getProduitById(id: string): Promise<ApiResponse<ProduitCatalogue>> {
  const res = await apiClient.get<any>(API_ENDPOINTS.produits.getById(id));
  return { success: true, data: mapBackendToProduct(res.data || res) };
}

export async function getProduitsByBanque(banque: string): Promise<PaginatedResponse<ProduitCatalogue>> {
  return getProduits({ banque: banque as any });
}

export async function getCategories(): Promise<ApiResponse<string[]>> {
  const res = await apiClient.get<any>(API_ENDPOINTS.produits.categories);
  const items: any[] = res.data || res;
  return { success: true, data: items.map((c: any) => c.categorie || c) };
}

export async function getCategoriesWithId(): Promise<{id: number; categorie: string}[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.produits.categories);
  const items: any[] = res.data || res;
  return items.map((c: any) => ({ id: Number(c.id), categorie: c.categorie || c }));
}

export async function getProduitsStats() {
  const res = await apiClient.get<any>(API_ENDPOINTS.produits.stats);
  return {
    total: res.total || 0,
    actifs: res.actifs || 0,
    rupture: res.rupture || 0,
    valeurStock: res.valeur_stock || 0,
  };
}

// Alias conservé pour compatibilité
export const MOCK_PRODUITS: ProduitCatalogue[] = [];

export async function createProduit(data: Partial<ProduitCatalogue>): Promise<ProduitCatalogue> {
  const payload = {
    libelle: data.nom,
    description: data.description,
    reference: data.reference,
    prix: data.prixVente,
    prix_achat: data.prixAchat,
    quantite: data.stock?.quantite,
    seuil_alerte: data.stock?.seuilAlerte,
    statut: data.statut || 'actif',
    categorie_id: data.categorie,
    categories_ids: (data as any).categoriesIds || [],
    banque: data.banque,
    marque: data.marque,
  };
  const res = await apiClient.post<any>(API_ENDPOINTS.produits.create, payload);
  return mapBackendToProduct(res.data || res);
}

export async function updateProduit(id: string, data: Partial<ProduitCatalogue>): Promise<ProduitCatalogue> {
  const payload = {
    libelle: data.nom,
    description: data.description,
    reference: data.reference,
    prix: data.prixVente,
    prix_achat: data.prixAchat,
    quantite: data.stock?.quantite,
    seuil_alerte: data.stock?.seuilAlerte,
    statut: data.statut,
    categorie_id: data.categorie,
    categories_ids: (data as any).categoriesIds || [],
    banque: data.banque,
    marque: data.marque,
  };
  const res = await apiClient.put<any>(API_ENDPOINTS.produits.update(id), payload);
  return mapBackendToProduct(res.data || res);
}

export async function deleteProduit(id: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.produits.delete(id));
}

