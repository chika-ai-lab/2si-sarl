/**
 * Nom affichable d'un client, quelle que soit la forme reçue.
 *
 * L'API sert deux formes selon l'endpoint :
 *   — camelCase (`nomComplet`, `raisonSociale`) quand elle sérialise une entité
 *     TypeORM, ce qui est le cas de /clients et /commande-clients ;
 *   — snake_case (`nom_complet`) quand la réponse vient d'une requête SQL brute,
 *     comme /bordereau-livraisons/:id/print.
 *
 * Plusieurs écrans ne lisaient que le snake_case : la valeur était toujours
 * absente et l'affichage retombait sur le nom de famille seul — « Diop » au lieu
 * de « Mamadou Diop ». Ce helper accepte les deux et applique une règle unique :
 * une entreprise s'identifie par sa raison sociale, un particulier par son nom
 * complet, et « prénom nom » ne sert que de dernier recours.
 */
export interface ClientNommable {
  nomComplet?: string | null;
  nom_complet?: string | null;
  raisonSociale?: string | null;
  raison_sociale?: string | null;
  nom?: string | null;
  prenom?: string | null;
}

export function nomClient(
  c: ClientNommable | null | undefined,
  defaut = "Client non renseigné",
): string {
  if (!c) return defaut;

  const raison = (c.raisonSociale ?? c.raison_sociale)?.trim();
  if (raison) return raison;

  const complet = (c.nomComplet ?? c.nom_complet)?.trim();
  if (complet) return complet;

  const compose = [c.prenom, c.nom].filter(Boolean).join(" ").trim();
  return compose || defaut;
}
