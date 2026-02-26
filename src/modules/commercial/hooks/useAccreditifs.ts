/**
 * Hooks React Query pour la gestion des accréditifs
 * Facilite l'utilisation des services avec cache automatique et mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Accreditif,
  AccreditifStatut,
  BanquePartenaire,
  DocumentAccreditif,
} from '../types';
import * as accreditifsService from '../services/accreditifs.service';

// ============================================
// QUERY KEYS
// ============================================

export const accreditifsKeys = {
  all: ['accreditifs'] as const,
  lists: () => [...accreditifsKeys.all, 'list'] as const,
  list: (filters: any) => [...accreditifsKeys.lists(), filters] as const,
  details: () => [...accreditifsKeys.all, 'detail'] as const,
  detail: (id: string) => [...accreditifsKeys.details(), id] as const,
  stats: () => [...accreditifsKeys.all, 'stats'] as const,
  alertes: () => [...accreditifsKeys.all, 'alertes'] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook pour récupérer la liste des accréditifs
 */
export function useAccreditifs(filters: {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  banqueEmettrice?: BanquePartenaire;
  statut?: AccreditifStatut;
  dateDebut?: string;
  dateFin?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) {
  return useQuery({
    queryKey: accreditifsKeys.list(filters),
    queryFn: () => accreditifsService.getAccreditifs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer un accréditif par son ID
 */
export function useAccreditif(id: string) {
  return useQuery({
    queryKey: accreditifsKeys.detail(id),
    queryFn: () => accreditifsService.getAccreditifById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer les accréditifs expirant bientôt
 */
export function useAccreditifsExpirantBientot(jours: number = 30) {
  return useQuery({
    queryKey: [...accreditifsKeys.alertes(), jours],
    queryFn: () => accreditifsService.getAccreditifsExpirantBientot(jours),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook pour récupérer les statistiques des accréditifs
 */
export function useAccreditifsStats() {
  return useQuery({
    queryKey: accreditifsKeys.stats(),
    queryFn: () => accreditifsService.getAccreditifsStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook pour créer un accréditif
 */
export function useCreateAccreditif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      numeroAccreditif: string;
      banqueEmettrice: BanquePartenaire;
      banqueBeneficiaire: string;
      montant: number;
      devise: 'FCFA' | 'EUR' | 'USD';
      clientId?: string;
      commandeIds?: string[];
      dateExpiration: string;
      notes?: string;
    }) => accreditifsService.createAccreditif(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accreditifsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accreditifsKeys.stats() });
    },
  });
}

/**
 * Hook pour mettre à jour un accréditif
 */
export function useUpdateAccreditif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Accreditif> }) =>
      accreditifsService.updateAccreditif(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: accreditifsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accreditifsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: accreditifsKeys.stats() });
    },
  });
}

/**
 * Hook pour supprimer un accréditif
 */
export function useDeleteAccreditif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accreditifsService.deleteAccreditif(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accreditifsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accreditifsKeys.stats() });
    },
  });
}

/**
 * Hook pour changer le statut d'un accréditif
 */
export function useChangeAccreditifStatut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: AccreditifStatut }) =>
      accreditifsService.changeAccreditifStatut(id, statut),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: accreditifsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accreditifsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: accreditifsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: accreditifsKeys.alertes() });
    },
  });
}

/**
 * Hook pour uploader un document
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      file,
      type,
    }: {
      id: string;
      file: File;
      type: 'lettre_credit' | 'garantie' | 'autre';
    }) => accreditifsService.uploadDocument(id, file, type),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: accreditifsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: accreditifsKeys.lists() });
    },
  });
}
