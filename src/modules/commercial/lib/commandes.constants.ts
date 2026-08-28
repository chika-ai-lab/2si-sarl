import { CheckCircle, Edit, Truck, CheckCircle2, XCircle, PackageSearch } from "lucide-react";
import type { ComponentType } from "react";

export interface CommandeStatutConfig {
  label: string;
  color: string;
  icon: ComponentType<{ className?: string }>;
}

/**
 * Les six états d'une commande. `en_attente` a été retiré : il figurait dans les
 * filtres mais aucun code serveur ne l'a jamais produit. `en_cours` signifie
 * « en approvisionnement » et `expediee` « partie du dépôt » — la distinction
 * manquait, et « en cours » servait à désigner les deux.
 */
export const CMD_STATUT: Record<string, CommandeStatutConfig> = {
  brouillon:  { label: "Brouillon",         color: "bg-gray-100 text-gray-700",       icon: Edit },
  validee:    { label: "Validée",           color: "bg-blue-100 text-blue-800",       icon: CheckCircle },
  en_cours:   { label: "Approvisionnement", color: "bg-amber-100 text-amber-800",     icon: PackageSearch },
  expediee:   { label: "En route",          color: "bg-orange-100 text-orange-800",   icon: Truck },
  livree:     { label: "Livrée",            color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  annulee:    { label: "Annulée",           color: "bg-red-100 text-red-800",         icon: XCircle },
};

export function mapCmdStatut(raw: string | null | undefined): string {
  const map: Record<string, string> = {
    validee: "validee", validé: "validee", valide: "validee", confirmee: "validee",
    en_cours: "en_cours",
    expediee: "expediee", expédiée: "expediee",
    livree: "livree", livré: "livree", livre: "livree",
    annulee: "annulee", annulé: "annulee",
    // Héritage : les commandes qui portaient cet état n'existent plus côté serveur.
    en_attente: "en_cours",
  };
  return map[raw ?? ""] ?? raw ?? "brouillon";
}

export const MODES_PAIEMENT = [
  { value: "especes",    label: "Espèces" },
  { value: "virement",   label: "Virement" },
  { value: "cheque",     label: "Chèque" },
  { value: "credit",     label: "Crédit" },
  { value: "accreditif", label: "Accréditif" },
] as const;
