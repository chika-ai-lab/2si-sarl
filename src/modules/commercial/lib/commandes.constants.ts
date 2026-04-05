import { CheckCircle, Clock, Edit, Truck, CheckCircle2, XCircle } from "lucide-react";
import type { ComponentType } from "react";

export interface CommandeStatutConfig {
  label: string;
  color: string;
  icon: ComponentType<{ className?: string }>;
}

export const CMD_STATUT: Record<string, CommandeStatutConfig> = {
  brouillon:  { label: "Brouillon",    color: "bg-gray-100 text-gray-700",     icon: Edit },
  en_attente: { label: "En attente",   color: "bg-yellow-100 text-yellow-800", icon: Clock },
  validee:    { label: "Validée",      color: "bg-blue-100 text-blue-800",     icon: CheckCircle },
  en_cours:   { label: "En livraison", color: "bg-orange-100 text-orange-800", icon: Truck },
  livree:     { label: "Livrée",       color: "bg-green-100 text-green-800",   icon: CheckCircle2 },
  annulee:    { label: "Annulée",      color: "bg-red-100 text-red-800",       icon: XCircle },
};

export function mapCmdStatut(raw: string | null | undefined): string {
  const map: Record<string, string> = {
    validee: "validee", validé: "validee", valide: "validee", confirmee: "validee",
    en_cours: "en_cours",
    livree: "livree", livré: "livree", livre: "livree",
    annulee: "annulee", annulé: "annulee",
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
