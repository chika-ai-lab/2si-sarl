/**
 * Adresse client — format canonique : du TEXTE.
 *
 * La colonne `clients.adresse` est une simple chaîne. Ce back-office y
 * sérialisait pourtant un objet `{rue, ville, codePostal, pays}` tandis que
 * l'application terrain y écrivait du texte libre : deux écrivains, deux
 * formats, une seule colonne. L'application terrain affichait donc, en clair,
 * `{"rue":"","ville":"Dakar","codePostal":"","pays":"Sénégal"}`.
 *
 * Le texte a été retenu comme format unique : la majorité des adresses réelles
 * l'utilisaient déjà, `codePostal` était vide partout, et `pays` valait
 * toujours « Sénégal ». La production a été normalisée
 * (`2si-api/sql/normaliser-adresses.js`) — plus aucun objet JSON en base.
 *
 * La lecture reste néanmoins tolérante : un environnement non migré, une
 * sauvegarde ancienne ou un import peuvent encore présenter l'ancienne forme,
 * et mieux vaut la lire que la montrer telle quelle.
 */

/** Ancienne forme, conservée pour la seule relecture des données héritées. */
interface AdresseHeritee {
  rue?: string | null;
  ville?: string | null;
  codePostal?: string | null;
  pays?: string | null;
}

/**
 * Rend une adresse lisible sur une ligne, ou `""` si elle ne porte rien.
 *
 * Le code postal est ignoré : vide sur la totalité des enregistrements, et
 * hors usage dans une adresse sénégalaise courante.
 */
export function formatAdresse(valeur: unknown): string {
  if (!valeur) return "";

  if (typeof valeur === "object") return assembler(valeur as AdresseHeritee);

  if (typeof valeur !== "string") return "";
  const brut = valeur.trim();
  if (!brut) return "";

  // Une chaîne qui n'ouvre pas sur une accolade est déjà du texte : on évite le
  // coût et les faux positifs d'un JSON.parse sur chaque ligne de liste.
  if (!brut.startsWith("{")) return brut;

  try {
    const objet = JSON.parse(brut);
    return objet && typeof objet === "object" ? assembler(objet) : brut;
  } catch {
    // Une accolade sans JSON valide reste du texte saisi par quelqu'un.
    return brut;
  }
}

/**
 * Prépare une adresse pour la base : texte nettoyé, ou `null`.
 *
 * `null` plutôt que chaîne vide, pour qu'une adresse non saisie reste
 * indiscernable d'une adresse absente — c'est l'enveloppe JSON de champs vides
 * produite par l'ancien code qui avait rempli des fiches de rien.
 */
export function serialiserAdresse(valeur: unknown): string | null {
  return formatAdresse(valeur) || null;
}

function assembler(a: AdresseHeritee): string {
  return [a.rue, a.ville, a.pays]
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean)
    .join(", ");
}
