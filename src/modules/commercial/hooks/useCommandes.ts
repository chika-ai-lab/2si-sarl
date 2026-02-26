/**
 * Hooks React Query pour la gestion des commandes commerciales
 * Facilite l'utilisation des services avec cache automatique et mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CommandeCommerciale,
  CommandeStatut,
  CreateCommandeDTO,
  ModePaiement,
  BanquePartenaire,
} from '../types';
import * as commandesService from '../services/commandes.service';

// ============================================
// QUERY KEYS
// ============================================

export const commandesKeys = {
  all: ['commandes'] as const,
  lists: () => [...commandesKeys.all, 'list'] as const,
  list: (filters: any) => [...commandesKeys.lists(), filters] as const,
  details: () => [...commandesKeys.all, 'detail'] as const,
  detail: (id: string) => [...commandesKeys.details(), id] as const,
  stats: () => [...commandesKeys.all, 'stats'] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook pour récupérer la liste des commandes
 */
export function useCommandes(filters: {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  statut?: CommandeStatut;
  statutPaiement?: string;
  modePaiement?: ModePaiement;
  banque?: BanquePartenaire;
  dateDebut?: string;
  dateFin?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) {
  return useQuery({
    queryKey: commandesKeys.list(filters),
    queryFn: () => commandesService.getCommandes(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer une commande par son ID
 */
export function useCommande(id: string) {
  return useQuery({
    queryKey: commandesKeys.detail(id),
    queryFn: () => commandesService.getCommandeById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer les statistiques des commandes
 */
export function useCommandesStats() {
  return useQuery({
    queryKey: commandesKeys.stats(),
    queryFn: () => commandesService.getCommandesStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook pour créer une commande
 */
export function useCreateCommande() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommandeDTO) => commandesService.createCommande(data),
    onSuccess: () => {
      // Invalider les listes pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: commandesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: commandesKeys.stats() });
    },
  });
}

/**
 * Hook pour mettre à jour une commande
 */
export function useUpdateCommande() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CommandeCommerciale> }) =>
      commandesService.updateCommande(id, data),
    onSuccess: (response, variables) => {
      // Invalider les listes et le détail
      queryClient.invalidateQueries({ queryKey: commandesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: commandesKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: commandesKeys.stats() });
    },
  });
}

/**
 * Hook pour supprimer une commande
 */
export function useDeleteCommande() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commandesService.deleteCommande(id),
    onSuccess: () => {
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: commandesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: commandesKeys.stats() });
    },
  });
}

/**
 * Hook pour changer le statut d'une commande
 */
export function useChangeCommandeStatut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: CommandeStatut }) =>
      commandesService.changeCommandeStatut(id, statut),
    onSuccess: (response, variables) => {
      // Invalider les listes et le détail
      queryClient.invalidateQueries({ queryKey: commandesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: commandesKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: commandesKeys.stats() });
    },
  });
}

/**
 * Hook pour générer une facture
 */
export function useGenererFacture() {
  return useMutation({
    mutationFn: (id: string) => commandesService.genererFacture(id),
  });
}
