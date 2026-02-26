/**
 * Hooks React Query pour la gestion des clients
 * Facilite l'utilisation des services avec cache automatique
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type {
  Client,
  CreateClientDTO,
  UpdateClientDTO,
  ClientFilters,
} from '../types';
import * as clientsService from '../services/clients.service';

// ============================================
// QUERY KEYS
// ============================================

export const clientsKeys = {
  all: ['clients'] as const,
  lists: () => [...clientsKeys.all, 'list'] as const,
  list: (filters: ClientFilters) => [...clientsKeys.lists(), filters] as const,
  details: () => [...clientsKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientsKeys.details(), id] as const,
  stats: () => [...clientsKeys.all, 'stats'] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook pour récupérer la liste des clients
 */
export function useClients(filters: ClientFilters = {}) {
  return useQuery({
    queryKey: clientsKeys.list(filters),
    queryFn: () => clientsService.getClients(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer un client par son ID
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: clientsKeys.detail(id),
    queryFn: () => clientsService.getClientById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer les statistiques clients
 */
export function useClientsStats() {
  return useQuery({
    queryKey: clientsKeys.stats(),
    queryFn: () => clientsService.getClientsStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook pour créer un nouveau client
 */
export function useCreateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateClientDTO) => clientsService.createClient(data),
    onSuccess: (response) => {
      if (response.success) {
        // Invalider le cache de la liste des clients
        queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
        queryClient.invalidateQueries({ queryKey: clientsKeys.stats() });

        toast({
          title: 'Succès',
          description: response.message || 'Client créé avec succès',
        });
      } else {
        toast({
          title: 'Erreur',
          description: response.message || 'Erreur lors de la création du client',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook pour mettre à jour un client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientDTO }) =>
      clientsService.updateClient(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        // Invalider le cache du client et de la liste
        queryClient.invalidateQueries({ queryKey: clientsKeys.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
        queryClient.invalidateQueries({ queryKey: clientsKeys.stats() });

        toast({
          title: 'Succès',
          description: response.message || 'Client mis à jour avec succès',
        });
      } else {
        toast({
          title: 'Erreur',
          description: response.message || 'Erreur lors de la mise à jour du client',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook pour supprimer un client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => clientsService.deleteClient(id),
    onSuccess: (response) => {
      if (response.success) {
        // Invalider le cache de la liste
        queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
        queryClient.invalidateQueries({ queryKey: clientsKeys.stats() });

        toast({
          title: 'Succès',
          description: response.message || 'Client supprimé avec succès',
        });
      } else {
        toast({
          title: 'Erreur',
          description: response.message || 'Erreur lors de la suppression du client',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });
}
