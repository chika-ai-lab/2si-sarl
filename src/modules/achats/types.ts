// ─── Shared types for the Achats / Livraisons module ─────────────────────────

export interface LigneCommande {
  id: string;
  produit?: { id: string; nom: string; reference?: string };
  quantite: number;
  prixUnitaire: number;
  typeLivraison?: string;
}

export interface CommandeLivraison {
  id: string;
  reference: string;
  statut: string;
  dateCommande: string;
  dateLivraison?: string;
  client?: {
    id: string;
    nom: string;
    prenom?: string;
    raisonSociale?: string;
    telephone: string;
    adresse?: { ville?: string; rue?: string };
  };
  lignes: LigneCommande[];
  total: number;
  notes?: string;
  commercial?: string;
  banque?: string;
}

export interface BLForm {
  chauffeurNom: string;
  chauffeurTel: string;
  matricule: string;
  datePlanifiee: string;
}

export const EMPTY_BL_FORM: BLForm = {
  chauffeurNom: "",
  chauffeurTel: "",
  matricule: "",
  datePlanifiee: new Date().toISOString().slice(0, 16),
};
