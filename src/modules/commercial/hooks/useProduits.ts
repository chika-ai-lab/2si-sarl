/**
 * Hooks React Query pour la gestion des produits catalogue
 * Facilite l'utilisation des services avec cache automatique
 */

import { useQuery } from '@tanstack/react-query';
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
