const sharp = require('sharp');
const path = require('path');
const dir = path.join(process.cwd(), 'public/textures');

async function genFlags() {
  // Bandera UNAL: franjas verde esmeralda y blanco con texto
  const unalSvg = `
    <svg width="1024" height="640" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="50%" fill="#1b6d3b" />
      <rect y="320" width="100%" height="50%" fill="#ffffff" />
      <circle cx="512" cy="320" r="140" fill="#1b6d3b" stroke="#ffd700" stroke-width="8" />
      <circle cx="512" cy="320" r="120" fill="#ffffff" />
      <text x="512" y="315" font-family="sans-serif" font-weight="900" font-size="36" fill="#1b6d3b" text-anchor="middle">UNAL</text>
      <text x="512" y="350" font-family="sans-serif" font-weight="700" font-size="16" fill="#1b6d3b" text-anchor="middle">FACULTAD DE MINAS</text>
      <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#ffd700" stroke-width="16" />
      <text x="512" y="80" font-family="sans-serif" font-weight="900" font-size="30" fill="#ffffff" text-anchor="middle" letter-spacing="4">UNIVERSIDAD NACIONAL DE COLOMBIA</text>
      <text x="512" y="580" font-family="sans-serif" font-weight="800" font-size="24" fill="#1b6d3b" text-anchor="middle" letter-spacing="3">FACULTAD DE MINAS · INGENIERIA DE SISTEMAS</text>
    </svg>
  `;
  await sharp(Buffer.from(unalSvg)).webp({ quality: 92 }).toFile(path.join(dir, 'flag-unal.webp'));
  console.log('UNAL flag generated');

  // Bandera Águilas Doradas: fondo dorado vibrante con franjas negras
  const aguilasSvg = `
    <svg width="1024" height="640" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#D4AF37" />
      <polygon points="0,0 200,0 1024,540 1024,640 824,640 0,100" fill="#111111" />
      <polygon points="0,160 100,160 724,640 624,640" fill="#000000" opacity="0.7" />
      <circle cx="512" cy="320" r="140" fill="#111111" stroke="#F5DEB3" stroke-width="8" />
      <text x="512" y="310" font-family="sans-serif" font-weight="900" font-size="44" fill="#D4AF37" text-anchor="middle">AGUILAS</text>
      <text x="512" y="360" font-family="sans-serif" font-weight="900" font-size="28" fill="#F5DEB3" text-anchor="middle" letter-spacing="2">DORADAS</text>
      <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#111111" stroke-width="16" />
      <text x="512" y="70" font-family="sans-serif" font-weight="900" font-size="28" fill="#111111" text-anchor="middle" letter-spacing="4">AGUILAS DORADAS DE RIONEGRO</text>
      <text x="512" y="590" font-family="sans-serif" font-weight="800" font-size="22" fill="#111111" text-anchor="middle" letter-spacing="3">PASION DEL ORIENTE ANTIOQUENO</text>
    </svg>
  `;
  await sharp(Buffer.from(aguilasSvg)).webp({ quality: 92 }).toFile(path.join(dir, 'flag-aguilas.webp'));
  console.log('Aguilas flag generated');
}

genFlags();
