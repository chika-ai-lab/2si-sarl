/**
 * Hooks React Query pour la gestion des simulations/devis
 * Facilite l'utilisation des services avec cache automatique et mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Simulation, SimulationStatut, ProduitSimulation } from '../types';
import * as simulationsService from '../services/simulations.service';

// ============================================
// QUERY KEYS
// ============================================

export const simulationsKeys = {
  all: ['simulations'] as const,
  lists: () => [...simulationsKeys.all, 'list'] as const,
  list: (filters: any) => [...simulationsKeys.lists(), filters] as const,
  details: () => [...simulationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...simulationsKeys.details(), id] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook pour récupérer la liste des simulations
 */
export function useSimulations(filters: {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  statut?: SimulationStatut;
  dateDebut?: string;
  dateFin?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) {
  return useQuery({
    queryKey: simulationsKeys.list(filters),
    queryFn: () => simulationsService.getSimulations(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer une simulation par son ID
 */
export function useSimulation(id: string) {
  return useQuery({
    queryKey: simulationsKeys.detail(id),
    queryFn: () => simulationsService.getSimulationById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook pour créer une simulation
 */
export function useCreateSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      clientId?: string;
      produits: ProduitSimulation[];
      fraisAdditionnels?: number;
      validiteJours?: number;
      notes?: string;
    }) => simulationsService.createSimulation(data),
    onSuccess: () => {
      // Invalider les listes pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: simulationsKeys.lists() });
    },
  });
}

/**
 * Hook pour mettre à jour une simulation
 */
export function useUpdateSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Simulation> }) =>
      simulationsService.updateSimulation(id, data),
    onSuccess: (response, variables) => {
      // Invalider les listes et le détail
      queryClient.invalidateQueries({ queryKey: simulationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: simulationsKeys.detail(variables.id) });
    },
  });
}

/**
 * Hook pour supprimer une simulation
 */
export function useDeleteSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => simulationsService.deleteSimulation(id),
    onSuccess: () => {
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: simulationsKeys.lists() });
    },
  });
}

/**
 * Hook pour changer le statut d'une simulation
 */
export function useChangeSimulationStatut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: SimulationStatut }) =>
      simulationsService.changeSimulationStatut(id, statut),
    onSuccess: (response, variables) => {
      // Invalider les listes et le détail
      queryClient.invalidateQueries({ queryKey: simulationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: simulationsKeys.detail(variables.id) });
    },
  });
}

/**
 * Hook pour générer un PDF du devis
 */
export function useGenererPDFDevis() {
  return useMutation({
    mutationFn: (id: string) => simulationsService.genererPDFDevis(id),
  });
}

/**
 * Hook pour envoyer le devis par email
 */
export function useEnvoyerDevisEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, email, message }: { id: string; email: string; message?: string }) =>
      simulationsService.envoyerDevisEmail(id, email, message),
    onSuccess: (response, variables) => {
      // Invalider pour rafraîchir le statut
      queryClient.invalidateQueries({ queryKey: simulationsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: simulationsKeys.lists() });
    },
  });
}
