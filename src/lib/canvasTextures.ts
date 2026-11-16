// Texturas procedurales dibujadas con Canvas 2D (solo cliente).
// Sin imagenes externas: paredes pintadas a mano, piso de madera, cielo de
// atardecer, banderas nitidas, lomos de libros, caja de luz, etc.
import * as THREE from 'three';

type Ctx = CanvasRenderingContext2D;

/** PRNG determinista (mulberry32) para que las texturas sean estables entre recargas. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible');
  return { canvas, ctx };
}

function finish(canvas: HTMLCanvasElement, wrap = false) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (wrap) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }
  return tex;
}

const shade = (hex: string, l: number) =>
  `#${new THREE.Color(hex).offsetHSL(0, 0, l).getHexString()}`;

/** Dibuja texto a lo largo de un arco. `bottom` invierte el sentido para que se lea de izquierda a derecha. */
function arcText(ctx: Ctx, text: string, cx: number, cy: number, radius: number, span: number, bottom = false) {
  const chars = [...text];
  const step = span / Math.max(1, chars.length - 1);
  const center = bottom ? Math.PI / 2 : -Math.PI / 2;
  chars.forEach((ch, i) => {
    const a = bottom ? center + span / 2 - i * step : center - span / 2 + i * step;
    ctx.save();
    ctx.translate(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
    ctx.rotate(bottom ? a - Math.PI / 2 : a + Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
}

// ---------------------------------------------------------------------------
// Entorno
// ---------------------------------------------------------------------------

/** Pared pintada a mano: color base con pinceladas suaves, tileable. */
export function paintedWallTexture(base: string, seed: number, repeat: [number, number]) {
  const S = 512;
  const { canvas, ctx } = makeCanvas(S, S);
  const rand = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 260; i++) {
    const x = rand() * S;
    const y = rand() * S;
    const w = 50 + rand() * 190;
    const h = 8 + rand() * 28;
    const rot = (rand() - 0.5) * 0.3;
    ctx.fillStyle = rand() > 0.5 ? shade(base, 0.05) : shade(base, -0.06);
    ctx.globalAlpha = 0.03 + rand() * 0.06;
    for (const ox of [-S, 0, S]) {
      for (const oy of [-S, 0, S]) {
        ctx.save();
        ctx.translate(x + ox, y + oy);
        ctx.rotate(rot);
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();
      }
    }
  }
  ctx.globalAlpha = 1;
  const tex = finish(canvas, true);
  tex.repeat.set(repeat[0], repeat[1]);
  return tex;
}

/** Piso de tablones de madera calida. Cada tile cubre 2 m. */
export function woodFloorTexture(repeat: number) {
  const S = 1024;
  const rows = 8;
  const rowH = S / rows;
  const { canvas, ctx } = makeCanvas(S, S);
  const rand = rng(77);
  const palette = ['#c58a52', '#b97a45', '#cf9560', '#b0703c', '#c28048', '#d09a63'];
  ctx.fillStyle = '#6b4023';
  ctx.fillRect(0, 0, S, S);
  for (let r = 0; r < rows; r++) {
    let x = -rand() * 300;
    while (x < S) {
      const len = 420 + rand() * 300;
      const color = palette[Math.floor(rand() * palette.length)];
      for (const ox of [0, -S]) {
        ctx.fillStyle = color;
        ctx.fillRect(x + ox, r * rowH + 2, len - 3, rowH - 3);
        ctx.strokeStyle = 'rgba(90,50,20,0.16)';
        ctx.lineWidth = 1.2;
        for (let g = 0; g < 9; g++) {
          const gy = r * rowH + 8 + rand() * (rowH - 16);
          ctx.beginPath();
          ctx.moveTo(x + ox, gy);
          ctx.bezierCurveTo(x + ox + len * 0.3, gy + (rand() - 0.5) * 6, x + ox + len * 0.7, gy + (rand() - 0.5) * 6, x + ox + len, gy);
          ctx.stroke();
        }
      }
      x += len;
    }
  }
  const tex = finish(canvas, true);
  tex.repeat.set(repeat, repeat);
  return tex;
}

/** Alfombra azul con borde crema y retícula de rombos. */
export function rugTexture() {
  const W = 1200;
  const H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = '#2b4a8c';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(150,190,240,0.35)';
  ctx.lineWidth = 3;
  for (let x = -H; x < W + H; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + H, H);
    ctx.moveTo(x + H, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  const frame = (inset: number, width: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  };
  frame(34, 26, '#f1e1bd');
  frame(78, 8, '#e0894a');
  frame(104, 4, '#f1e1bd');
  ctx.fillStyle = '#f1e1bd';
  ctx.beginPath();
  ctx.moveTo(W / 2, H / 2 - 150);
  ctx.lineTo(W / 2 + 190, H / 2);
  ctx.lineTo(W / 2, H / 2 + 150);
  ctx.lineTo(W / 2 - 190, H / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2b4a8c';
  ctx.beginPath();
  ctx.moveTo(W / 2, H / 2 - 95);
  ctx.lineTo(W / 2 + 120, H / 2);
  ctx.lineTo(W / 2, H / 2 + 95);
  ctx.lineTo(W / 2 - 120, H / 2);
  ctx.closePath();
  ctx.fill();
  return finish(canvas);
}

/** Cielo de atardecer visto desde la ventana: dorado en el horizonte, naranja, rosa y violeta arriba, con montanas. */
export function sunsetSkyTexture() {
  const W = 2048;
  const H = 1024;
  const horizon = 590;
  const { canvas, ctx } = makeCanvas(W, H);
  const rand = rng(2024);

  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#3a2866');
  sky.addColorStop(0.22, '#7b3f8f');
  sky.addColorStop(0.45, '#d95f8a');
  sky.addColorStop(0.7, '#ff8d5c');
  sky.addColorStop(0.9, '#ffbe66');
  sky.addColorStop(1, '#ffe08a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, horizon + 4);

  const glow = ctx.createRadialGradient(1450, horizon - 10, 0, 1450, horizon - 10, 560);
  glow.addColorStop(0, 'rgba(255,236,170,0.95)');
  glow.addColorStop(0.35, 'rgba(255,190,110,0.45)');
  glow.addColorStop(1, 'rgba(255,170,100,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, horizon + 4);

  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(1450, horizon - 28, 46, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 9; i++) {
    const cx = rand() * W;
    const cy = 90 + rand() * (horizon - 230);
    const w = 220 + rand() * 360;
    const h = 14 + rand() * 24;
    ctx.fillStyle = `rgba(255,${150 + Math.floor(rand() * 60)},${140 + Math.floor(rand() * 40)},0.3)`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#2b1b45';
  ctx.fillRect(0, horizon, W, H - horizon);

  const ridge = (color: string, baseY: number, amp: number, seed: number) => {
    const r = rng(seed);
    const p = [r() * 6, r() * 6, r() * 6];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) {
      const n = Math.sin(x * 0.004 + p[0]) * 0.5 + Math.sin(x * 0.011 + p[1]) * 0.3 + Math.sin(x * 0.027 + p[2]) * 0.2;
      ctx.lineTo(x, baseY - amp * (1 - Math.abs(n)));
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  };
  ridge('#a8587f', 590, 95, 11);
  ridge('#6e3f78', 635, 125, 12);
  ridge('#40285b', 700, 100, 13);
  ridge('#2b1b45', 770, 60, 14);
  return finish(canvas);
}

/** Gradiente alfa para el haz de luz: brillante en la ventana, se desvanece con la distancia y hacia los bordes. */
export function lightBeamTexture() {
  const { canvas, ctx } = makeCanvas(128, 256);
  const g = ctx.createLinearGradient(0, 256, 0, 0);
  g.addColorStop(0, 'rgba(255,214,150,0.85)');
  g.addColorStop(0.5, 'rgba(255,200,130,0.35)');
  g.addColorStop(1, 'rgba(255,190,120,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 256);
  ctx.globalCompositeOperation = 'destination-in';
  const e = ctx.createLinearGradient(0, 0, 128, 0);
  e.addColorStop(0, 'rgba(0,0,0,0)');
  e.addColorStop(0.3, 'rgba(0,0,0,1)');
  e.addColorStop(0.7, 'rgba(0,0,0,1)');
  e.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = e;
  ctx.fillRect(0, 0, 128, 256);
  return finish(canvas);
}

// ---------------------------------------------------------------------------
// Objetos
// ---------------------------------------------------------------------------

/** Bandera UNAL: verde arriba, blanco abajo, sello circular y texto de la Facultad de Minas. */
export function unalFlagTexture() {
  const W = 1024;
  const H = 640;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = '#1d7a3e';
  ctx.fillRect(0, 0, W, H / 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, H / 2, W, H / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 44px Georgia, serif';
  ctx.fillText('UNIVERSIDAD NACIONAL DE COLOMBIA', W / 2, 72);

  const cx = W / 2;
  const cy = H / 2;
  ctx.fillStyle = '#e6c24a';
  ctx.beginPath();
  ctx.arc(cx, cy, 158, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d7a3e';
  ctx.beginPath();
  ctx.arc(cx, cy, 148, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, 100, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 25px Georgia, serif';
  arcText(ctx, 'FACULTAD DE MINAS', cx, cy, 124, 2.5, false);
  arcText(ctx, 'MEDELLIN', cx, cy, 124, 1.1, true);

  // Escudo estilizado
  ctx.fillStyle = '#1d7a3e';
  ctx.beginPath();
  ctx.moveTo(cx - 52, cy - 62);
  ctx.lineTo(cx + 52, cy - 62);
  ctx.lineTo(cx + 52, cy + 6);
  ctx.quadraticCurveTo(cx + 52, cy + 56, cx, cy + 74);
  ctx.quadraticCurveTo(cx - 52, cy + 56, cx - 52, cy + 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#e6c24a';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 40px Georgia, serif';
  ctx.fillText('UNAL', cx, cy - 12);
  ctx.fillStyle = '#e6c24a';
  ctx.fillRect(cx - 34, cy + 10, 68, 5);
  ctx.beginPath();
  ctx.arc(cx, cy + 36, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1d7a3e';
  ctx.font = '700 34px Georgia, serif';
  ctx.fillText('FACULTAD DE MINAS', W / 2, 520);
  ctx.font = '600 27px Georgia, serif';
  ctx.fillText('INGENIERIA DE SISTEMAS E INFORMATICA', W / 2, 568);

  ctx.strokeStyle = '#e6c24a';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, W - 10, H - 10);
  return finish(canvas);
}

/** Bandera Aguilas Doradas: dorado vibrante #D4AF37, franjas negras diagonales y aguila. */
export function aguilasFlagTexture() {
  const W = 1024;
  const H = 640;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#0b0b0b';
  for (const off of [-260, 250]) {
    ctx.beginPath();
    ctx.moveTo(off, 0);
    ctx.lineTo(off + 190, 0);
    ctx.lineTo(off + 190 + H * 0.9, H);
    ctx.lineTo(off + H * 0.9, H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(W - 330, 0);
  ctx.lineTo(W - 120, 0);
  ctx.lineTo(W - 120 + H * 0.9, H);
  ctx.lineTo(W - 330 + H * 0.9, H);
  ctx.closePath();
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0, 22, W, 92);
  ctx.fillRect(0, H - 114, W, 92);
  ctx.fillStyle = '#D4AF37';
  ctx.font = '800 62px "Arial Black", Arial, sans-serif';
  ctx.fillText('AGUILAS DORADAS', W / 2, 70);
  ctx.font = '700 36px Arial, sans-serif';
  ctx.fillText('RIONEGRO · ORIENTE ANTIOQUENO', W / 2, H - 68);

  const cx = W / 2;
  const cy = H / 2;
  ctx.fillStyle = '#0b0b0b';
  ctx.beginPath();
  ctx.arc(cx, cy, 138, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, 126, 0, Math.PI * 2);
  ctx.stroke();

  // Aguila de frente con alas levantadas y plumas
  ctx.fillStyle = '#D4AF37';
  const wing = (s: number) => {
    ctx.beginPath();
    ctx.moveTo(cx + s * 14, cy + 4);
    ctx.quadraticCurveTo(cx + s * 60, cy - 10, cx + s * 78, cy - 62);
    ctx.lineTo(cx + s * 92, cy - 98);
    ctx.lineTo(cx + s * 98, cy - 58);
    ctx.lineTo(cx + s * 112, cy - 84);
    ctx.lineTo(cx + s * 108, cy - 40);
    ctx.lineTo(cx + s * 120, cy - 56);
    ctx.lineTo(cx + s * 108, cy - 14);
    ctx.lineTo(cx + s * 114, cy - 18);
    ctx.lineTo(cx + s * 90, cy + 14);
    ctx.quadraticCurveTo(cx + s * 50, cy + 30, cx + s * 14, cy + 34);
    ctx.closePath();
    ctx.fill();
  };
  wing(1);
  wing(-1);
  // Cuerpo y cola en abanico
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, 24, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - 26, cy + 48);
  ctx.lineTo(cx - 34, cy + 100);
  ctx.lineTo(cx - 12, cy + 88);
  ctx.lineTo(cx, cy + 104);
  ctx.lineTo(cx + 12, cy + 88);
  ctx.lineTo(cx + 34, cy + 100);
  ctx.lineTo(cx + 26, cy + 48);
  ctx.closePath();
  ctx.fill();
  // Cabeza de perfil con pico ganchudo
  ctx.beginPath();
  ctx.arc(cx, cy - 56, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 12, cy - 66);
  ctx.quadraticCurveTo(cx + 44, cy - 62, cx + 38, cy - 38);
  ctx.quadraticCurveTo(cx + 30, cy - 48, cx + 14, cy - 46);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0b0b0b';
  ctx.beginPath();
  ctx.arc(cx + 5, cy - 60, 3.8, 0, Math.PI * 2);
  ctx.fill();
  return finish(canvas);
}

/** Lomo de libro con titulo y autor. La relacion de aspecto del canvas debe igualar largo/grosor del libro. */
export function bookSpineTexture(title: string, author: string, bg: string, fg: string, aspect: number) {
  const H = 160;
  const W = Math.round(H * aspect);
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = fg;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(0, 10, W, 4);
  ctx.fillRect(0, H - 14, W, 4);
  ctx.globalAlpha = 1;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  let size = 84;
  ctx.font = `800 ${size}px Georgia, serif`;
  while (ctx.measureText(title).width > W * 0.5 && size > 20) {
    size -= 4;
    ctx.font = `800 ${size}px Georgia, serif`;
  }
  ctx.fillText(title, W * 0.07, H * 0.5);
  ctx.textAlign = 'right';
  ctx.font = '600 28px Georgia, serif';
  ctx.fillText(author, W * 0.95, H * 0.5);
  return finish(canvas);
}

/** Panel luminoso de la caja de luz: fondo blanco calido y texto LUMOS MAXIMA. */
export function lumosBoxTexture() {
  const W = 680;
  const H = 400;
  const { canvas, ctx } = makeCanvas(W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#fffdf3');
  g.addColorStop(1, '#fff0cf');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#16120f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 122px Georgia, serif';
  ctx.fillText('LUMOS', W / 2, H * 0.32);
  ctx.fillText('MAXIMA', W / 2, H * 0.7);
  ctx.fillRect(W * 0.18, H * 0.505, W * 0.64, 5);
  return finish(canvas);
}

/** Pin circular con un simbolo (por ejemplo la letra pi). */
export function pinTexture(symbol: string, bg: string, fg: string) {
  const S = 128;
  const { canvas, ctx } = makeCanvas(S, S);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 92px Georgia, serif';
  ctx.fillText(symbol, S / 2, S / 2 + 4);
  return finish(canvas);
}
