/**
 * Hooks React Query pour la gestion des produits catalogue
 * Facilite l'utilisation des services avec cache automatique
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ProduitCatalogue,
  ProduitFilters,
} from '../types';
import * as produitsService from '../services/produits.service';

// ============================================
// QUERY KEYS
// ============================================

export const produitsKeys = {
  all: ['produits'] as const,
  lists: () => [...produitsKeys.all, 'list'] as const,
  list: (filters: ProduitFilters) => [...produitsKeys.lists(), filters] as const,
  details: () => [...produitsKeys.all, 'detail'] as const,
  detail: (id: string) => [...produitsKeys.details(), id] as const,
  byBanque: (banque: string) => [...produitsKeys.all, 'banque', banque] as const,
  categories: () => [...produitsKeys.all, 'categories'] as const,
  stats: () => [...produitsKeys.all, 'stats'] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook pour récupérer la liste des produits
 */
export function useProduits(filters: ProduitFilters = {}) {
  return useQuery({
    queryKey: produitsKeys.list(filters),
    queryFn: () => produitsService.getProduits(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer un produit par son ID
 */
export function useProduit(id: string) {
  return useQuery({
    queryKey: produitsKeys.detail(id),
    queryFn: () => produitsService.getProduitById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer les produits par banque
 */
export function useProduitsByBanque(banque: string) {
  return useQuery({
    queryKey: produitsKeys.byBanque(banque),
    queryFn: () => produitsService.getProduitsByBanque(banque),
    enabled: !!banque,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer les catégories de produits
 */
export function useCategories() {
  return useQuery({
    queryKey: produitsKeys.categories(),
    queryFn: () => produitsService.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook pour récupérer les statistiques produits
 */
export function useProduitsStats() {
  return useQuery({
    queryKey: produitsKeys.stats(),
    queryFn: () => produitsService.getProduitsStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ============================================
// MUTATIONS — invalident le cache automatiquement
// ============================================

/**
 * Hook pour créer un produit. Invalide la liste des produits après succès,
 * ce qui déclenche un rechargement automatique dans CataloguePage.
 */
export function useCreateProduit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<import('../types').ProduitCatalogue>) =>
      produitsService.createProduit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produitsKeys.all });
    },
  });
}

/**
 * Hook pour mettre à jour un produit. Invalide la liste après succès.
 */
export function useUpdateProduit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../types').ProduitCatalogue> }) =>
      produitsService.updateProduit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produitsKeys.all });
    },
  });
}

/**
 * Hook pour supprimer un produit. Invalide la liste après succès.
 */
export function useDeleteProduit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => produitsService.deleteProduit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produitsKeys.all });
    },
  });
}

