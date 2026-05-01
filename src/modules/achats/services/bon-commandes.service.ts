import { apiClient } from "@/modules/commercial/services/apiClient";

export interface BonCommandeLigne {
  id: number;
  bonCommandeId: number;
  clientId: number | null;
  articleId: number | null;
  commercialId: number | null;
  commandeClientId: number | null;
  adresseLivraison: string | null;
  quantite: number;
  prix: number;
  fournisseurId: number | null;
  complement: string | null;
}

export interface BonCommande {
  id: number;
  numero: string;
  agenceId: number | null;
  userId: number | null;
  date: string;
  statut: string;
  note: string | null;
  lignes: BonCommandeLigne[];
  createdAt: string;
}

export interface GenererResult {
  message: string;
  commandes: { id: number; fournisseurId: number; montant: number; etat: string }[];
}

const base = "/bon-commandes";

export const BonCommandesService = {
  getAll: async (params?: { page?: number; per_page?: number; search?: string }) => {
    const r = await apiClient.get<any>(base, params as any);
    // Normaliser : l'API peut retourner un tableau brut ou { data: [...], meta: {} }
    const data = (Array.isArray(r) ? r : (r?.data ?? [])) as BonCommande[];
    return { data, meta: r?.meta ?? {} };
  },

  getOne: async (id: number): Promise<BonCommande> => {
    const r = await apiClient.get<any>(`${base}/${id}`);
    return r as BonCommande;
  },

  create: async (body: Partial<BonCommande> & { lignes?: Partial<BonCommandeLigne>[] }) => {
    return apiClient.post<BonCommande>(base, body);
  },

  update: async (id: number, body: Partial<BonCommande>) => {
    return apiClient.put<BonCommande>(`${base}/${id}`, body);
  },

  assignerFournisseur: async (bdcId: number, ligneId: number, fournisseurId: number) => {
    return apiClient.put<BonCommandeLigne>(
      `${base}/${bdcId}/lignes/${ligneId}/fournisseur`,
      { fournisseur_id: fournisseurId },
    );
  },

  generer: async (bdcId: number): Promise<GenererResult> => {
    return apiClient.post<GenererResult>(`${base}/${bdcId}/generer`, {});
  },

  delete: async (id: number) => {
    return apiClient.delete(`${base}/${id}`);
  },
};
