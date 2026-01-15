/**
 * Hooks React Query pour le SAV
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as savService from '../services/sav.service';
import type {
  SAVFilters,
  TicketSAV,
  StatutTicketSAV,
  InterventionSAV,
} from '../types';

// ============================================
// QUERY KEYS
// ============================================

export const savKeys = {
  all: ['sav'] as const,
  lists: () => [...savKeys.all, 'list'] as const,
  list: (filters: SAVFilters) => [...savKeys.lists(), filters] as const,
  details: () => [...savKeys.all, 'detail'] as const,
  detail: (id: string) => [...savKeys.details(), id] as const,
  stats: () => [...savKeys.all, 'stats'] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook pour récupérer la liste des tickets SAV
 */
export function useTicketsSAV(filters: SAVFilters = {}) {
  return useQuery({
    queryKey: savKeys.list(filters),
    queryFn: () => savService.getTicketsSAV(filters),
  });
}

/**
 * Hook pour récupérer un ticket SAV par ID
 */
export function useTicketSAV(id: string) {
  return useQuery({
    queryKey: savKeys.detail(id),
    queryFn: () => savService.getTicketSAV(id),
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer les statistiques SAV
 */
export function useStatistiquesSAV() {
  return useQuery({
    queryKey: savKeys.stats(),
    queryFn: () => savService.getStatistiquesSAV(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook pour créer un nouveau ticket SAV
 */
export function useCreateTicketSAV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TicketSAV>) => savService.createTicketSAV(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savKeys.stats() });
    },
  });
}

/**
 * Hook pour mettre à jour un ticket SAV
 */
export function useUpdateTicketSAV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TicketSAV> }) =>
      savService.updateTicketSAV(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: savKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: savKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savKeys.stats() });
    },
  });
}

/**
 * Hook pour changer le statut d'un ticket
 */
export function useChangeStatutTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: StatutTicketSAV }) =>
      savService.changeStatutTicket(id, statut),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: savKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: savKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savKeys.stats() });
    },
  });
}

/**
 * Hook pour ajouter une intervention à un ticket
 */
export function useAddIntervention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      intervention,
    }: {
      ticketId: string;
      intervention: Omit<InterventionSAV, 'id'>;
    }) => savService.addIntervention(ticketId, intervention),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: savKeys.detail(variables.ticketId) });
      queryClient.invalidateQueries({ queryKey: savKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savKeys.stats() });
    },
  });
}

/**
 * Hook pour assigner un ticket à un technicien
 */
export function useAssignerTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, technicienId }: { id: string; technicienId: string }) =>
      savService.assignerTicket(id, technicienId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: savKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: savKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savKeys.stats() });
    },
  });
}

/**
 * Hook pour ajouter une note de satisfaction
 */
export function useAjouterSatisfaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      note,
      commentaire,
    }: {
      id: string;
      note: 1 | 2 | 3 | 4 | 5;
      commentaire?: string;
    }) => savService.ajouterSatisfaction(id, note, commentaire),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: savKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: savKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savKeys.stats() });
    },
  });
}
