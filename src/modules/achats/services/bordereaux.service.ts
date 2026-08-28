import { apiClient } from "@/modules/commercial/services/apiClient";

/**
 * Bordereaux de livraison — source unique du parcours de livraison.
 *
 * Toute écriture de statut passe par ici. L'état d'une commande client n'est
 * plus jamais modifié depuis le front : c'est le serveur qui le répercute
 * lorsqu'un bordereau change d'état.
 */

export type BlEtat = "en_attente" | "expedie" | "livre" | "echec" | "annule";

export interface Bordereau {
  id: number;
  num: string | null;
  commandeClientId: number | null;
  commandeFournisseurId: number | null;
  bonCommandeId: number | null;
  clientId: number | null;
  date: string;
  etat: BlEtat;
  note: string | null;
  livreurNom: string | null;
  livreurTelephone: string | null;
  vehiculeMatricule: string | null;
  dateExpedition: string | null;
  dateLivraison: string | null;
  recuPar: string | null;
  modePaiement: string | null;
  motif: string | null;
}

/** Contenu réel d'un bordereau, assemblé par le serveur. */
export interface FicheBordereau {
  bl: Bordereau;
  client: {
    nom_complet: string; telephone: string; email: string;
    adresse: string; agence_nom: string;
  } | null;
  commercial: { nom_complet: string } | null;
  produits: {
    designation: string;
    reference: string | null;
    marque: string | null;
    quantite: number;
    prix: number;
  }[];
}

export interface ExpedierPayload {
  livreur_nom: string;
  livreur_telephone: string;
  vehicule_matricule?: string;
  note?: string;
}

export interface LivrerPayload {
  recu_par: string;
  mode_paiement?: string;
  note?: string;
}

const base = "/bordereau-livraisons";

export const BordereauxService = {
  getAll: async (params?: { page?: number; per_page?: number; search?: string }) => {
    const r = await apiClient.get<any>(base, params as any);
    const data = (Array.isArray(r) ? r : (r?.data ?? [])) as Bordereau[];
    return { data, meta: r?.meta ?? {} };
  },

  getOne: (id: number) => apiClient.get<Bordereau>(`${base}/${id}`),

  /** Lignes du bordereau — même source que le document imprimé. */
  getFiche: (id: number) => apiClient.get<FicheBordereau>(`${base}/${id}/print`),

  expedier: (id: number, body: ExpedierPayload) =>
    apiClient.post<Bordereau>(`${base}/${id}/expedier`, body),

  livrer: (id: number, body: LivrerPayload) =>
    apiClient.post<Bordereau>(`${base}/${id}/livrer`, body),

  echec: (id: number, motif: string) =>
    apiClient.post<Bordereau>(`${base}/${id}/echec`, { motif }),

  annuler: (id: number, motif: string) =>
    apiClient.post<Bordereau>(`${base}/${id}/annuler`, { motif }),
};

// ─── Présentation ────────────────────────────────────────────────────────────

export const BL_STATUT: Record<BlEtat, { label: string; className: string }> = {
  en_attente: { label: "À expédier", className: "bg-amber-100 text-amber-800 border-amber-200" },
  expedie:    { label: "En route",   className: "bg-blue-100 text-blue-800 border-blue-200" },
  livre:      { label: "Livré",      className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  echec:      { label: "Échec",      className: "bg-red-100 text-red-800 border-red-200" },
  annule:     { label: "Annulé",     className: "bg-muted text-muted-foreground border-border" },
};

/**
 * Les trois files de l'écran, chacune répondant à une question de l'opérateur.
 * L'action principale d'une ligne découle de son état, jamais du rôle.
 */
export const FILES = [
  { id: "a_expedier", label: "À expédier", etats: ["en_attente", "echec"] as BlEtat[] },
  { id: "en_route",   label: "En route",   etats: ["expedie"] as BlEtat[] },
  { id: "terminees",  label: "Terminées",  etats: ["livre", "annule"] as BlEtat[] },
] as const;

export type FileId = (typeof FILES)[number]["id"];
