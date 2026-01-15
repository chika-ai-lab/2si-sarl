/**
 * React Query hooks pour les rapports commerciaux
 */

import { useQuery } from "@tanstack/react-query";
import {
  getRapportEvolutionCA,
  getStatistiquesGlobales,
  getTopProduits,
  getTopClients,
  getRepartitionBanques,
  type RapportFilters,
} from "../services/rapports.service";

// ============================================
// QUERY KEYS
// ============================================

export const rapportsKeys = {
  all: ["rapports"] as const,
  evolutionCA: (filters: RapportFilters) => [...rapportsKeys.all, "evolution-ca", filters] as const,
  statistiques: () => [...rapportsKeys.all, "statistiques"] as const,
  topProduits: (filters: RapportFilters, limit: number) =>
    [...rapportsKeys.all, "top-produits", filters, limit] as const,
  topClients: (filters: RapportFilters, limit: number) =>
    [...rapportsKeys.all, "top-clients", filters, limit] as const,
  repartitionBanques: (filters: RapportFilters) =>
    [...rapportsKeys.all, "repartition-banques", filters] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook pour récupérer le rapport d'évolution du CA
 */
export function useRapportEvolutionCA(filters: RapportFilters = {}) {
  return useQuery({
    queryKey: rapportsKeys.evolutionCA(filters),
    queryFn: () => getRapportEvolutionCA(filters),
    select: (response) => response.data,
  });
}

/**
 * Hook pour récupérer les statistiques globales
 */
export function useStatistiquesGlobales() {
  return useQuery({
    queryKey: rapportsKeys.statistiques(),
    queryFn: () => getStatistiquesGlobales(),
    select: (response) => response.data,
    // Rafraîchir toutes les 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer le top des produits
 */
export function useTopProduits(filters: RapportFilters = {}, limit: number = 10) {
  return useQuery({
    queryKey: rapportsKeys.topProduits(filters, limit),
    queryFn: () => getTopProduits(filters, limit),
    select: (response) => response.data,
  });
}

/**
 * Hook pour récupérer le top des clients
 */
export function useTopClients(filters: RapportFilters = {}, limit: number = 10) {
  return useQuery({
    queryKey: rapportsKeys.topClients(filters, limit),
    queryFn: () => getTopClients(filters, limit),
    select: (response) => response.data,
  });
}

/**
 * Hook pour récupérer la répartition par banque
 */
export function useRepartitionBanques(filters: RapportFilters = {}) {
  return useQuery({
    queryKey: rapportsKeys.repartitionBanques(filters),
    queryFn: () => getRepartitionBanques(filters),
    select: (response) => response.data,
  });
}
