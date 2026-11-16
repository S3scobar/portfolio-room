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

/** Escudo de la Universidad Nacional de Colombia. Coordenadas locales: centro del anillo de texto = (0,0), eje y hacia abajo. */
function drawUnalCrest(ctx: Ctx) {
  const GRAY = '#5a5f63';
  const RED = '#9a1b2e';
  const LEAF = ['#7fae3d', '#4f8a2c'];
  const white = '#ffffff';

  // Corona de laurel a ambos lados del escudo
  for (const s of [-1, 1]) {
    for (let i = 0; i < 15; i++) {
      const phi = 0.5 + (i / 14) * 2.3;
      const x = s * 60 * Math.sin(phi);
      const y = -10 - 68 * Math.cos(phi);
      const tangent = Math.atan2(68 * Math.sin(phi), s * 60 * Math.cos(phi));
      const off = i % 2 === 0 ? 4 : -3;
      ctx.save();
      ctx.translate(x + off * Math.cos(tangent + Math.PI / 2), y + off * Math.sin(tangent + Math.PI / 2));
      ctx.rotate(tangent + (i % 2 === 0 ? 0.35 : -0.35) * s);
      ctx.fillStyle = LEAF[i % 2];
      ctx.beginPath();
      ctx.ellipse(0, 0, 9.5, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Condor
  ctx.save();
  ctx.translate(0, -88);
  const dark = '#2d3033';
  for (const s of [-1, 1]) {
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(s * 5, 2);
    ctx.quadraticCurveTo(s * 22, -18, s * 38, -8);
    ctx.lineTo(s * 34, -2);
    ctx.lineTo(s * 37, 4);
    ctx.lineTo(s * 30, 5);
    ctx.lineTo(s * 31, 11);
    ctx.lineTo(s * 23, 9);
    ctx.lineTo(s * 21, 15);
    ctx.lineTo(s * 13, 10);
    ctx.lineTo(s * 6, 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c9ccce';
    ctx.lineWidth = 0.7;
    for (const [x1, y1, x2, y2] of [[10, 0, 28, -4], [10, 4, 29, 3], [10, 8, 24, 9]]) {
      ctx.beginPath();
      ctx.moveTo(s * x1, y1);
      ctx.lineTo(s * x2, y2);
      ctx.stroke();
    }
  }
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.ellipse(0, 4, 7, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e9ebec';
  ctx.fillRect(-5, -7, 10, 2.5);
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(0.5, -12, 4.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8c9094';
  ctx.beginPath();
  ctx.moveTo(4, -14);
  ctx.quadraticCurveTo(10, -13, 8, -8);
  ctx.quadraticCurveTo(6, -11, 3.5, -10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Escudo cuartelado
  const shield = new Path2D();
  shield.moveTo(-46, -60);
  shield.lineTo(46, -60);
  shield.lineTo(46, 4);
  shield.quadraticCurveTo(46, 32, 0, 46);
  shield.quadraticCurveTo(-46, 32, -46, 4);
  shield.closePath();
  ctx.save();
  ctx.clip(shield);
  ctx.fillStyle = RED;
  ctx.fillRect(-46, -60, 46, 44);
  ctx.fillRect(0, -16, 46, 66);
  ctx.fillStyle = GRAY;
  ctx.fillRect(0, -60, 46, 44);
  ctx.fillRect(-46, -16, 46, 66);
  ctx.restore();
  ctx.strokeStyle = '#3d4144';
  ctx.lineWidth = 2;
  ctx.stroke(shield);
  ctx.strokeStyle = white;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -60);
  ctx.lineTo(0, 46);
  ctx.moveTo(-46, -16);
  ctx.lineTo(46, -16);
  ctx.stroke();

  ctx.strokeStyle = white;
  ctx.fillStyle = white;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Balanza (cuartel superior izquierdo)
  ctx.save();
  ctx.translate(-23, -38);
  ctx.beginPath();
  ctx.moveTo(0, -13);
  ctx.lineTo(0, 12);
  ctx.moveTo(-7, 12);
  ctx.lineTo(7, 12);
  ctx.moveTo(-14, -8);
  ctx.lineTo(14, -8);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  for (const x of [-12, 12]) {
    ctx.beginPath();
    ctx.moveTo(x, -8);
    ctx.lineTo(x - 6, 3);
    ctx.moveTo(x, -8);
    ctx.lineTo(x + 6, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, 3, 6, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Copa de Higia con serpiente (cuartel superior derecho)
  ctx.save();
  ctx.translate(23, -38);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -3, 9, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(0, 12);
  ctx.moveTo(-6, 12);
  ctx.lineTo(6, 12);
  ctx.stroke();
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-1, 7);
  ctx.bezierCurveTo(10, 3, -9, -4, 2, -10);
  ctx.bezierCurveTo(5, -12, 8, -14, 6, -16);
  ctx.stroke();
  ctx.restore();

  // Numero pi (cuartel inferior izquierdo)
  ctx.fillStyle = white;
  ctx.font = '700 34px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('\u03c0', -23, 8);

  // Arpa (cuartel inferior derecho)
  ctx.save();
  ctx.translate(23, 10);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(10, -16);
  ctx.lineTo(10, 14);
  ctx.moveTo(10, -16);
  ctx.quadraticCurveTo(-11, -16, -10, 0);
  ctx.moveTo(-10, 0);
  ctx.lineTo(10, 14);
  ctx.stroke();
  ctx.lineWidth = 1.1;
  for (const x of [-6, -2, 2, 6]) {
    const top = -14 + 14 * Math.pow((10 - x) / 20, 1.5);
    const bottom = 1 + ((x + 10) / 20) * 13;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  }
  ctx.restore();

  // Escudete central con espiga
  const mini = new Path2D();
  mini.moveTo(-11, -29);
  mini.lineTo(11, -29);
  mini.lineTo(11, -12);
  mini.quadraticCurveTo(11, -2, 0, 3);
  mini.quadraticCurveTo(-11, -2, -11, -12);
  mini.closePath();
  ctx.fillStyle = '#4f8f3a';
  ctx.fill(mini);
  ctx.strokeStyle = white;
  ctx.lineWidth = 1.6;
  ctx.stroke(mini);
  ctx.strokeStyle = '#eef6e4';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(0, -24);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const y = -8 - i * 4.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(-5, y - 4);
    ctx.moveTo(0, y);
    ctx.lineTo(5, y - 4);
    ctx.stroke();
  }

  // Cinta con el lema
  ctx.fillStyle = white;
  ctx.strokeStyle = '#3d4144';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-56, 44);
  ctx.quadraticCurveTo(0, 66, 56, 44);
  ctx.lineTo(56, 58);
  ctx.quadraticCurveTo(0, 80, -56, 58);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const motto = 'INTER AULAS ACADEMIAE OLIM VERBUM';
  ctx.fillStyle = '#3d4144';
  ctx.font = '700 4.8px Arial, sans-serif';
  const chars = [...motto];
  chars.forEach((ch, i) => {
    const t = (i + 0.5) / chars.length;
    const x = -50 + 100 * t;
    const y = 51 + 32 * t * (1 - t);
    ctx.save();
    ctx.translate(x, y + 2);
    ctx.rotate(Math.atan2(32 * (1 - 2 * t), 100));
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
}

/** Anillo de texto "UNIVERSIDAD NACIONAL DE COLOMBIA" con NACIONAL mas grande, puntos y el anio 1867. */
function drawUnalRing(ctx: Ctx, radius: number) {
  const parts = [
    { text: 'UNIVERSIDAD', size: 24 },
    { text: 'NACIONAL', size: 40 },
    { text: 'DE COLOMBIA', size: 24 },
  ];
  const gap = 0.22;
  const tracking = 3.2;
  type Glyph = { ch: string; size: number; w: number };
  const words: Glyph[][] = parts.map((p) => {
    ctx.font = `500 ${p.size}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    return [...p.text].map((ch) => ({ ch, size: p.size, w: ctx.measureText(ch).width + tracking }));
  });
  const arc = (g: Glyph) => g.w / radius;
  const total = words.reduce((s, w) => s + w.reduce((a, g) => a + arc(g), 0), 0) + gap * (words.length - 1);
  let a = -Math.PI / 2 - total / 2;
  const start = a;
  ctx.fillStyle = '#585d61';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  words.forEach((word) => {
    word.forEach((g) => {
      const mid = a + arc(g) / 2;
      ctx.font = `500 ${g.size}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
      ctx.save();
      ctx.translate(radius * Math.cos(mid), radius * Math.sin(mid));
      ctx.rotate(mid + Math.PI / 2);
      ctx.fillText(g.ch, 0, 0);
      ctx.restore();
      a += arc(g);
    });
    a += gap;
  });
  const end = a - gap;
  for (const ang of [start - 0.12, end + 0.12]) {
    ctx.beginPath();
    ctx.arc((radius + 4) * Math.cos(ang), (radius + 4) * Math.sin(ang), 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.save();
  ctx.translate(0, radius - 8);
  ctx.rotate(0.05);
  ctx.font = 'italic 300 28px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('1867', 0, 0);
  ctx.restore();
}

/** Bandera UNAL: paño blanco con el escudo institucional y el anillo "Universidad Nacional de Colombia 1867". */
export function unalFlagTexture() {
  const W = 1024;
  const H = 640;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  const k = 1.25;
  ctx.save();
  ctx.translate(W / 2, H / 2 + 12 * k);
  ctx.scale(k, k);
  drawUnalRing(ctx, 124);
  drawUnalCrest(ctx);
  ctx.restore();
  ctx.strokeStyle = '#e4e7e8';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, W - 4, H - 4);
  return finish(canvas);
}

/** Poster minimalista de Interstellar: lineas doradas de Gargantua sobre fondo oscuro. */
export function interstellarPosterTexture() {
  const SC = 2;
  const W = 564;
  const H = 798;
  const { canvas, ctx } = makeCanvas(W * SC, H * SC);
  ctx.scale(SC, SC);

  const bg = ctx.createRadialGradient(W / 2, 260, 40, W / 2, 360, 620);
  bg.addColorStop(0, '#17181c');
  bg.addColorStop(1, '#0b0c0e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const rand = rng(1014);
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.015 + rand() * 0.03})`;
    ctx.fillRect(rand() * W, rand() * H, 1, 1);
  }

  const cx = 320;
  const cy = 215;
  const R = 62;
  const L = { x: -8, y: 263 };
  const T = { x: 572, y: 176 };

  for (const tip of [{ x: 40, y: 256 }, { x: 530, y: 184 }]) {
    const g = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 90);
    g.addColorStop(0, 'rgba(247,207,58,0.22)');
    g.addColorStop(1, 'rgba(247,207,58,0)');
    ctx.fillStyle = g;
    ctx.fillRect(tip.x - 90, tip.y - 90, 180, 180);
  }

  const N = 9;
  ctx.lineWidth = 0.9;
  for (let i = 0; i < N; i++) {
    const d = 8 + i * 4.6;
    const mix = i / (N - 1);
    const mid = `rgb(${Math.round(240 - 8 * mix)},${Math.round(190 + 25 * mix)},${Math.round(70 + 90 * mix)})`;
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#f7cf3a');
    grad.addColorStop(0.3, mid);
    grad.addColorStop(0.7, mid);
    grad.addColorStop(1, '#f7cf3a');
    ctx.strokeStyle = grad;
    for (const dir of [-1, 1]) {
      const peak = cy + dir * (R + d);
      const c = (8 * peak - L.y - T.y) / 6;
      ctx.beginPath();
      ctx.moveTo(L.x, L.y);
      ctx.bezierCurveTo(150, c, 470, c, T.x, T.y);
      ctx.stroke();
    }
  }

  // Horizonte de sucesos y eje del disco
  ctx.strokeStyle = '#f4f4f1';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-6, 263.6);
  ctx.lineTo(570, 176);
  ctx.stroke();
  ctx.lineWidth = 1.1;
  for (const [x, y, r] of [[131, 364, 6.5], [433, 280, 6.5], [373, 466, 7.5]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Tipografia
  const spaced = (text: string, y: number, size: number, tracking: number, weight: number, color: string, maxW = W) => {
    let s = size;
    let t = tracking;
    const width = () => {
      ctx.font = `${weight} ${s}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
      return [...text].reduce((a, ch) => a + ctx.measureText(ch).width, 0) + t * (text.length - 1);
    };
    while (width() > maxW && s > 3) {
      s -= 0.25;
      t *= 0.98;
    }
    let x = (W - width()) / 2;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    for (const ch of text) {
      ctx.fillText(ch, x, y);
      x += ctx.measureText(ch).width + t;
    }
  };
  spaced('A FILM BY CHRISTOPHER NOLAN', 606, 8, 1.6, 600, '#d9d9d6');
  spaced('INTERSTELLAR', 641, 27, 13, 300, '#f2f2ef', 360);
  const credit = '#85878b';
  spaced('PARAMOUNT PICTURES AND WARNER BROS. PICTURES PRESENT', 655, 5.2, 0.6, 400, credit, 300);
  spaced('IN ASSOCIATION WITH LEGENDARY PICTURES A SYNCOPY/LINDA OBST PRODUCTIONS PRODUCTION', 662, 4.8, 0.4, 400, credit, 330);
  spaced('A FILM BY CHRISTOPHER NOLAN  \u201cINTERSTELLAR\u201d  MATTHEW McCONAUGHEY  ANNE HATHAWAY', 669, 4.8, 0.4, 400, credit, 330);
  spaced('JESSICA CHASTAIN  BILL IRWIN  ELLEN BURSTYN  AND MICHAEL CAINE  MARY ZOPHRES  HANS ZIMMER', 676, 4.8, 0.4, 400, credit, 400);
  spaced('JORDAN GOLDBERG  JAKE MYERS  KIP THORNE  JONATHAN NOLAN AND CHRISTOPHER NOLAN', 683, 4.8, 0.4, 400, credit, 360);
  spaced('EMMA THOMAS  CHRISTOPHER NOLAN  LYNDA OBST  CHRISTOPHER NOLAN', 690, 4.8, 0.4, 400, credit, 330);
  ctx.fillStyle = '#6e7074';
  ctx.textBaseline = 'middle';
  ctx.font = '700 7px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('LEGENDARY', 116, 713);
  ctx.textAlign = 'right';
  ctx.fillText('IMAX', 448, 713);
  spaced('NOVEMBER 2014', 716, 9.5, 2.8, 500, '#e7e7e3');
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
