const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'public/textures');

const procedural = [
  { file: 'flag-unal.webp', title: 'UNAL MINAS', subtitle: 'Ingenieria de Sistemas', bg: '#1d432b', border: '#4A773C', fg: '#ffffff', icon: 'UNAL' },
  { file: 'flag-aguilas.webp', title: 'AGUILAS DORADAS', subtitle: 'Rionegro - Pasion Oriente', bg: '#785f12', border: '#D4AF37', fg: '#fff6cc', icon: 'AGUILAS' },
  { file: 'poster-interstellar.webp', title: 'INTERSTELLAR', subtitle: 'Letterboxd @s_escobar__', bg: '#0b132b', border: '#2563EB', fg: '#e0eaff', icon: 'GARGANTUA' },
  { file: 'poster-dune.webp', title: 'DUNE &amp; STAR WARS', subtitle: 'Sci-Fi Universes', bg: '#2b1a0b', border: '#D97706', fg: '#fed7aa', icon: 'DUNE' },
  { file: 'poster-cr7.webp', title: 'CR7 - SIUUU', subtitle: 'Mentalidad Competitiva', bg: '#0f172a', border: '#1D4ED8', fg: '#ffffff', icon: 'CR7' },
  { file: 'lumos-box.webp', title: 'LUMOS MAXIMA', subtitle: 'Ravenclaw Lightbox', bg: '#172554', border: '#60A5FA', fg: '#bfdbfe', icon: 'LUMOS' },
  { file: 'xbox-series-s.webp', title: 'XBOX SERIES S', subtitle: 'Game Pass &amp; Next Gen', bg: '#18181b', border: '#52525b', fg: '#fafafa', icon: 'XBOX' },
  { file: 'rubik.webp', title: 'RUBIK 3x3', subtitle: 'Algoritmos en Mano', bg: '#1e3a8a', border: '#3B82F6', fg: '#f8fafc', icon: 'RUBIK' }
];

async function generate() {
  for (const item of procedural) {
    const svg = `
      <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="${item.bg}" stop-opacity="1" />
            <stop offset="100%" stop-color="#030712" stop-opacity="1" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
        <rect x="30" y="30" width="740" height="740" fill="none" stroke="${item.border}" stroke-width="12" rx="24" />
        <rect x="50" y="50" width="700" height="700" fill="none" stroke="${item.border}" stroke-width="2" stroke-dasharray="10 10" rx="16" opacity="0.6" />
        <text x="50%" y="38%" font-family="sans-serif" font-weight="900" font-size="70" fill="${item.border}" text-anchor="middle" dominant-baseline="middle">${item.icon}</text>
        <text x="50%" y="55%" font-family="sans-serif" font-weight="900" font-size="40" fill="${item.fg}" text-anchor="middle" letter-spacing="3">${item.title}</text>
        <text x="50%" y="65%" font-family="sans-serif" font-size="24" fill="#cbd5e1" text-anchor="middle">${item.subtitle}</text>
        <text x="50%" y="85%" font-family="monospace" font-size="18" fill="#64748b" text-anchor="middle">PORTFOLIO ROOM 3D</text>
      </svg>
    `;
    const outPath = path.join(dir, item.file);
    await sharp(Buffer.from(svg))
      .webp({ quality: 90 })
      .toFile(outPath);
    console.log('Generated procedural webp:', item.file);
  }
}

generate();
