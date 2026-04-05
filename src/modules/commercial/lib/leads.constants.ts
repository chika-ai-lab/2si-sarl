export const BADGE_TICKET: Record<string, string> = {
  ouvert:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  assigne:  "bg-blue-100 text-blue-800 border-blue-200",
  en_cours: "bg-purple-100 text-purple-800 border-purple-200",
  ferme:    "bg-green-100 text-green-800 border-green-200",
};

export const LABEL_TICKET: Record<string, string> = {
  ouvert: "Ouvert", assigne: "Assigné", en_cours: "En cours", ferme: "Fermé",
};

export const LABEL_CANAL: Record<string, string> = {
  bouche_a_oreille: "Bouche à oreille",
  google:           "Google",
  facebook:         "Facebook/Instagram",
  linkedin:         "LinkedIn",
  recommandation:   "Recommandation",
  autre:            "Autre",
};

export function formatCfa(n: number): string {
  return new Intl.NumberFormat("fr-SN", { style: "decimal", maximumFractionDigits: 0 }).format(n) + " FCFA";
}

export function formatDate(s: string): string {
  return new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
