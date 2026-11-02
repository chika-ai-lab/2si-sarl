import { apiClient } from "@/modules/commercial/services/apiClient";

/** Côté le plus long d'une image envoyée : assez pour une fiche produit, léger pour WhatsApp. */
const COTE_MAX = 1600;
const POIDS_SANS_RETOUCHE = 1.5 * 1024 * 1024;
const TYPES_ACCEPTES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Réduit une photo avant l'envoi. Une photo de téléphone pèse 3 à 8 Mo ;
 * ramenée à 1600 px en JPEG, elle tombe sous 500 Ko sans perte visible.
 * Une image déjà petite part telle quelle (transparence PNG comprise).
 */
async function reduire(fichier: File): Promise<Blob> {
  const image = await createImageBitmap(fichier);
  const echelle = Math.min(1, COTE_MAX / Math.max(image.width, image.height));
  if (echelle === 1 && fichier.size <= POIDS_SANS_RETOUCHE) {
    image.close();
    return fichier;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * echelle);
  canvas.height = Math.round(image.height * echelle);
  const ctx = canvas.getContext("2d")!;
  // Le JPEG n'a pas de transparence : fond blanc plutôt que noir.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  return new Promise((ok, ko) =>
    canvas.toBlob((b) => (b ? ok(b) : ko(new Error("Conversion de l'image impossible."))), "image/jpeg", 0.85),
  );
}

/** Envoie une image au serveur et renvoie son adresse publique. */
export async function televerserImage(fichier: File): Promise<string> {
  if (!TYPES_ACCEPTES.includes(fichier.type)) {
    throw new Error(`« ${fichier.name} » n'est pas une image JPEG, PNG ou WebP.`);
  }
  const blob = await reduire(fichier);
  if (blob.size > 5 * 1024 * 1024) throw new Error(`« ${fichier.name} » dépasse 5 Mo même réduite.`);

  const fd = new FormData();
  const nom = blob === fichier ? fichier.name : fichier.name.replace(/\.\w+$/, "") + ".jpg";
  fd.append("file", blob, nom);
  const r = await apiClient.postForm<{ url: string }>("/uploads", fd);
  return r.url;
}
