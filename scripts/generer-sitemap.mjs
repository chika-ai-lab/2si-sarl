/**
 * Génère dist/sitemap.xml à partir du catalogue réel, après `vite build`.
 *
 * Le sitemap statique de public/ ne listait que l'accueil et le catalogue :
 * les fiches produits n'étaient découvertes par Google qu'au hasard des liens.
 * Celui-ci liste chaque fiche, avec sa photo (Google Images).
 *
 * Si l'API ne répond pas, le sitemap minimal de public/ (déjà copié dans
 * dist/) est conservé : un build ne doit pas échouer pour une question de SEO.
 */
import { writeFile } from "node:fs/promises";

const SITE = "https://www.sen-services.com";
const API = (process.env.VITE_API_URL || "https://api.sen-services.com/api/v2").replace(/\/+$/, "");
const SORTIE = new URL("../dist/sitemap.xml", import.meta.url);

const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Les chemins d'images sont déjà encodés en base (%20) : on ne ré-encode pas. */
const imageAbsolue = (u) => (u.startsWith("http") ? u : `${SITE}${u.startsWith("/") ? "" : "/"}${u}`);

async function json(chemin) {
  const r = await fetch(`${API}${chemin}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) throw new Error(`${chemin} → HTTP ${r.status}`);
  return r.json();
}

async function articles() {
  const tous = [];
  for (let page = 1; ; page++) {
    const r = await json(`/public/articles?page=${page}&per_page=200`);
    tous.push(...(r.data ?? r));
    if (!r.meta || r.meta.current_page >= r.meta.last_page) return tous;
  }
}

async function main() {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const [liste, categories] = await Promise.all([articles(), json("/public/categories")]);

  const url = (loc, { priorite, frequence, images = [] }) => [
    "  <url>",
    `    <loc>${xml(loc)}</loc>`,
    `    <lastmod>${aujourdhui}</lastmod>`,
    `    <changefreq>${frequence}</changefreq>`,
    `    <priority>${priorite}</priority>`,
    ...images.map((i) => `    <image:image><image:loc>${xml(imageAbsolue(i))}</image:loc></image:image>`),
    "  </url>",
  ].join("\n");

  const entrees = [
    url(`${SITE}/`, { priorite: "1.0", frequence: "daily" }),
    url(`${SITE}/catalog`, { priorite: "0.9", frequence: "daily" }),
    ...categories
      .filter((c) => Number(c.articles_count) > 0)
      .map((c) => url(`${SITE}/catalog?categories=${encodeURIComponent(c.categorie)}`, { priorite: "0.8", frequence: "weekly" })),
    ...liste
      .filter((a) => a.statut !== "inactif")
      .map((a) => url(`${SITE}/product/${a.id}`, {
        priorite: "0.7",
        frequence: "weekly",
        images: (Array.isArray(a.images) ? a.images : []).filter(Boolean).slice(0, 3),
      })),
  ];

  const contenu = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entrees,
    "</urlset>",
    "",
  ].join("\n");
  await writeFile(SORTIE, contenu, "utf8");
  console.log(`sitemap.xml : ${entrees.length} adresses (${liste.length} produits)`);
}

main().catch((e) => {
  console.warn(`sitemap.xml non régénéré (${e.message}) : le sitemap minimal de public/ est conservé.`);
});
