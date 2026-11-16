/**
 * Genera texturas derivadas a partir de las fotos originales (que NO se modifican):
 *  - milo-upright.webp      : retrato de Milo girado 90 grados (el original viene tumbado, sin EXIF).
 *  - badge-minas-card.webp  : cara de la escarapela enderezada y recortada (sin mano ni fondo).
 *
 * Uso: node scripts/generate-derived-textures.js
 */
const sharp = require('sharp');
const path = require('path');

const dir = path.join(process.cwd(), 'public/textures');

// La foto de la escarapela se rota 110 grados (texto horizontal) y se recorta el
// rectangulo medido sobre la imagen rotada (891x1159). Aspecto resultante ~0.76.
const BADGE_ROTATION = 110;
const BADGE_CROP = { left: 297, top: 457, width: 301, height: 396 };

async function milo() {
  await sharp(path.join(dir, 'milo.webp'))
    .rotate(90)
    .webp({ quality: 88 })
    .toFile(path.join(dir, 'milo-upright.webp'));
}

async function badge() {
  const rotated = await sharp(path.join(dir, 'badge-minas.webp'))
    .rotate(BADGE_ROTATION, { background: '#0b4f6c' })
    .toBuffer();
  await sharp(rotated)
    .extract(BADGE_CROP)
    .resize(602, 792)
    .webp({ quality: 90 })
    .toFile(path.join(dir, 'badge-minas-card.webp'));
}

(async () => {
  await milo();
  await badge();
  console.log('Texturas derivadas generadas en public/textures');
})();
