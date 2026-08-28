import { apiClient } from "./apiClient";

/**
 * Encaissements d'une commande.
 *
 * Le statut de paiement n'est jamais écrit : il se déduit de la somme des
 * versements. Confirmer une livraison ne solde donc rien — c'est la règle posée
 * en réunion, « recevoir un produit ne vaut pas l'avoir payé ».
 */

export type OrigineVersement = "client" | "banque";
export type ImputationVersement = "auto" | "apport" | "financement";

export interface Versement {
  id: number;
  commandeClientId: number;
  montant: number;
  origine: OrigineVersement;
  imputation: ImputationVersement;
  imputeApport: number;
  imputeFinancement: number;
  modePaiement: string | null;
  reference: string | null;
  dateVersement: string;
  userNom: string | null;
  note: string | null;
}

export interface SuiviPaiement {
  montant: number;
  montantFinance: number;
  apportClient: number;
  encaisse: number;
  encaisseApport: number;
  encaisseFinancement: number;
  resteApport: number;
  resteFinancement: number;
  reliquat: number;
  /** Part réglée, entre 0 et 1. */
  progression: number;
  statut: "en_attente" | "partiel" | "paye";
  versements: Versement[];
}

export interface NouveauVersement {
  commande_client_id: number;
  montant: number;
  origine: OrigineVersement;
  imputation?: ImputationVersement;
  mode_paiement?: string;
  reference?: string;
  date_versement?: string;
  note?: string;
}

export const VersementsService = {
  suivi: (commandeId: number | string) =>
    apiClient.get<SuiviPaiement>(`/versements/commande/${commandeId}`),

  moyensPaiement: () => apiClient.get<string[]>("/versements/moyens-paiement"),

  /** Renvoie aussi l'excédent éventuel, quand le versement dépasse ce qui reste dû. */
  creer: (body: NouveauVersement) =>
    apiClient.post<{ versement: Versement; excedent: number }>("/versements", body),

  supprimer: (id: number) => apiClient.delete(`/versements/${id}`),

  /** Répartition banque / apport — leur somme doit égaler le montant de la commande. */
  definirFinancement: (commandeId: number | string, montantFinance: number, apportClient: number) =>
    apiClient.put(`/commande-clients/${commandeId}/financement`, {
      montant_finance: montantFinance,
      apport_client: apportClient,
    }),
};

// ─── Présentation ────────────────────────────────────────────────────────────

export const LIBELLE_ORIGINE: Record<OrigineVersement, string> = {
  client: "Client",
  banque: "Banque",
};

export const LIBELLE_IMPUTATION: Record<ImputationVersement, string> = {
  auto: "Automatique",
  apport: "Sur l'apport client",
  financement: "Sur le financement bancaire",
};

export const STATUT_PAIEMENT: Record<
  SuiviPaiement["statut"],
  { label: string; className: string }
> = {
  en_attente: { label: "Impayée", className: "bg-red-100 text-red-800 border-red-200" },
  partiel:    { label: "Partiel", className: "bg-amber-100 text-amber-800 border-amber-200" },
  paye:       { label: "Soldée",  className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

/** Étiquette lisible d'un moyen de paiement configuré en base. */
export function libelleMoyen(valeur: string): string {
  const connus: Record<string, string> = {
    especes: "Espèces",
    virement: "Virement bancaire",
    paiement_express: "Paiement Express",
    transfert: "Transfert",
    cheque: "Chèque",
    autre: "Autre",
  };
  return connus[valeur] ?? valeur.replace(/_/g, " ");
}
