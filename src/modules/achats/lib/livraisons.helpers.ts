import { mapCmdStatut } from "@/modules/commercial/lib/commandes.constants";
import type { CommandeLivraison } from "../types";

// ─── Number generators ────────────────────────────────────────────────────────

export function buildBLCNumber(id: string | number): string {
  const now = new Date();
  const yy  = String(now.getFullYear()).slice(2);
  const mm  = String(now.getMonth() + 1).padStart(2, "0");
  const seq = String(id).padStart(5, "0");
  return `BLC${yy}${mm}${seq}`;
}

export function buildCONumber(id: string | number): string {
  const now = new Date();
  const yy  = String(now.getFullYear()).slice(2);
  const mm  = String(now.getMonth() + 1).padStart(2, "0");
  const seq = String(id).padStart(4, "0");
  return `CO${yy}${mm}-${seq}`;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function clientDisplayName(c?: CommandeLivraison["client"]): string {
  if (!c) return "—";
  return c.raisonSociale || `${c.nom} ${c.prenom || ""}`.trim();
}

export function formatDatetime(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).replace(",", "");
}

// ─── API mapping ──────────────────────────────────────────────────────────────

export function mapCommande(c: any): CommandeLivraison {
  return {
    id:            String(c.id),
    reference:     c.reference || `CMD-${String(c.id).padStart(5, "0")}`,
    statut:        mapCmdStatut(c.etat),
    dateCommande:  c.date || c.created_at?.split("T")[0] || "",
    dateLivraison: c.date_livraison,
    client: c.client ? {
      id:            String(c.client.id),
      nom:           c.client.nom || "",
      prenom:        c.client.prenom,
      raisonSociale: c.client.raison_sociale,
      telephone:     c.client.telephone || "",
      adresse:       { ville: c.client.ville || "Dakar", rue: c.client.adresse || "" },
    } : undefined,
    lignes: (c.articles || []).map((a: any) => ({
      id:            String(a.id),
      produit:       a.article ? { id: String(a.article.id), nom: a.article.libelle, reference: a.article.reference } : undefined,
      quantite:      Number(a.quantite) || 1,
      prixUnitaire:  Number(a.prix) || 0,
      typeLivraison: a.type_livraison || "agence",
    })),
    total:      Number(c.montant) || 0,
    notes:      c.note,
    commercial: c.commercial_nom || c.user?.name,
    banque:     c.mode_paiement,
  };
}
