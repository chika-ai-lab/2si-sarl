#!/usr/bin/env node
/**
 * Optimise les images produit SUR PLACE : 1 fichier -> 1 fichier, même nom, même
 * URL. Redimensionne à 1200px max de large + recompresse. Aucun fichier ajouté,
 * donc rien à changer côté base ni côté code.
 *
 * À relancer après avoir déposé de nouvelles images dans public/images.
 * Idempotent : un fichier déjà optimisé n'est pas réécrit (voir `keep` plus bas).
 *
 * Prérequis : sharp, volontairement hors package.json (dépendance native lourde,
 * utile uniquement pour cette tâche ponctuelle) :
 *     npm install --no-save sharp
 *
 * Usage :
 *     node scripts/optimize-images.js            # simulation, n'écrit rien
 *     node scripts/optimize-images.js --apply    # applique
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT   = path.resolve(__dirname, '..', 'public', 'images');
const APPLY  = process.argv.includes('--apply');
const MAX_W  = 1200;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (/\.(jpe?g|png)$/i.test(e.name)) out.push(f);
  }
  return out;
}

// Seuil de réécriture : réencoder un JPEG déjà optimisé regagne toujours 2-3 %,
// mais dégrade l'image à chaque passage. On n'écrit qu'à partir d'un gain franc,
// ce qui rend le script réellement idempotent.
const MIN_GAIN = 0.10;

(async () => {
  const files = walk(ROOT);
  let before = 0, after = 0, done = 0, rewritten = 0;

  for (const file of files) {
    const buf = fs.readFileSync(file);
    before += buf.length;
    const isPng = /\.png$/i.test(file);

    let pipeline = sharp(buf).rotate().resize({ width: MAX_W, withoutEnlargement: true });
    pipeline = isPng
      ? pipeline.png({ compressionLevel: 9, palette: true, quality: 82 })
      : pipeline.jpeg({ quality: 80, progressive: true, mozjpeg: true });

    const out = await pipeline.toBuffer();
    const worthIt = out.length < buf.length * (1 - MIN_GAIN);
    const keep = worthIt ? out : buf;
    if (worthIt) rewritten++;
    after += keep.length;
    if (APPLY && worthIt) fs.writeFileSync(file, keep);
    if (++done % 50 === 0) console.log(`  ${done}/${files.length}…`);
  }

  const mb = (n) => (n / 1048576).toFixed(1) + ' Mo';
  console.log(`\n${files.length} images analysées, ${rewritten} à réécrire (${files.length - rewritten} déjà optimisées)`);
  console.log(`avant : ${mb(before)}  ->  après : ${mb(after)}   (${Math.round((1 - after / before) * 100)} % de gain)`);
  if (!APPLY) console.log('\nDry-run : aucune écriture. Relancer avec --apply.');
})().catch((e) => { console.error(e); process.exit(1); });
