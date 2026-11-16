// Vista exterior del ventanal: una calle de Medellin por la manana (torres de ladrillo, techos de teja,
// arboles y montanas), pintada en capas de profundidad. Cada capa es un plano con alfa que se coloca
// a una distancia distinta de la camara, asi que al orbitar se separan (parallax) y la vista se siente
// como un paisaje real detras del vidrio y no como una imagen pegada.
//
// Todas las capas se pintan en un mismo sistema de coordenadas de "diseno": se alinean exactamente
// cuando se mira desde la camara inicial (ver `WINDOW_VIEW`) y los planos se escalan con la distancia.
import type { Texture } from 'three';
import { finish, makeCanvas, rng } from './canvasTextures';

type Ctx = CanvasRenderingContext2D;

/**
 * Ojos del jugador en el punto de aparicion (primera persona, y = 1.7 m) y centro del ventanal: definen el rayo
 * central de la vista. Antes era la camara orbital [3.8, 3.2, 4.2]; si se cambia el punto de aparicion
 * (`PLAYER_CONFIG.spawn`) o `EYE_HEIGHT`, actualizar este valor.
 */
export const WINDOW_VIEW = {
  camera: [0.9, 1.7, 0.9] as [number, number, number],
  windowCenter: [-2.5, 1.7, -0.4] as [number, number, number],
  /** Tangente del angulo por pixel de textura (comun a todas las capas). */
  tanPerPx: 0.7 / 1024,
  layerSize: [1536, 1024] as [number, number],
  /** Plano de cielo: cubre tan +-1.4 en ambos ejes. */
  skySize: 1024,
  skyTanHalf: 1.4,
} as const;

export type WindowLayerKey = 'sky' | 'clouds' | 'mountains' | 'towers' | 'trees' | 'houses' | 'near';

/** Distancia (m) desde la camara inicial, de la mas lejana a la mas cercana. */
export const WINDOW_LAYER_DISTANCE: Record<WindowLayerKey, number> = {
  sky: 100,
  clouds: 80,
  mountains: 60,
  towers: 40,
  trees: 28,
  houses: 19,
  near: 13.5,
};

const [LW, LH] = WINDOW_VIEW.layerSize;
const SCALE = 0.93;
const OX = 299;
const OY = 246;
/** Rango horizontal (coordenadas de diseno) que cubre cada capa, con margen. */
const X0 = -440;
const X1 = 1450;

// --- utilidades de color y formas ---------------------------------------------------------------

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a: string, b: string, t: number) {
  const A = rgb(a);
  const B = rgb(b);
  const c = A.map((v, i) => Math.max(0, Math.min(255, Math.round(v + (B[i] - v) * t))));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function ell(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Crea una capa 1536x1024: pinta en coordenadas de diseno y desvanece los bordes laterales. */
function makeLayer(paint: (ctx: Ctx, rand: () => number) => void, seed: number) {
  const { canvas, ctx } = makeCanvas(LW, LH);
  ctx.setTransform(SCALE, 0, 0, SCALE, OX, OY);
  paint(ctx, rng(seed));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'destination-in';
  const g = ctx.createLinearGradient(0, 0, LW, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.06, 'rgba(0,0,0,1)');
  g.addColorStop(0.94, 'rgba(0,0,0,1)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LW, LH);
  ctx.globalCompositeOperation = 'source-over';
  return finish(canvas);
}

// --- capas --------------------------------------------------------------------------------------

/** Cielo: degradado azul que se aclara y se vuelve calido hacia el horizonte (sin nubes, van en otra capa). */
function skyTexture() {
  const N = WINDOW_VIEW.skySize;
  const { canvas, ctx } = makeCanvas(N, N);
  const px = (tanUp: number) => (N / 2 - tanUp / (WINDOW_VIEW.skyTanHalf * 2 / N)) / N;
  const g = ctx.createLinearGradient(0, 0, 0, N);
  const stops: [number, string][] = [
    [1.4, '#2a56a0'],
    [0.7, '#3567b2'],
    [0.412, '#3f78c2'],
    [0.182, '#6a9dd8'],
    [0.0995, '#a2c4e6'],
    [0.0515, '#d2e2ee'],
    [0.026, '#efe3cc'],
    [-0.0217, '#d9d8c9'],
    [-0.417, '#b8c4c0'],
    [-1.4, '#a4b0aa'],
  ];
  stops.forEach(([t, c]) => g.addColorStop(Math.max(0, Math.min(1, px(t))), c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, N, N);
  return finish(canvas);
}

function paintClouds(ctx: Ctx, rand: () => number) {
  const r = ctx.createRadialGradient(60, 235, 0, 60, 235, 430);
  r.addColorStop(0, 'rgba(255,225,170,0.55)');
  r.addColorStop(1, 'rgba(255,225,170,0)');
  ctx.fillStyle = r;
  ctx.fillRect(X0, -200, 1000, 800);
  ell(ctx, 350, 135, 620, 22, 'rgba(255,255,255,0.26)');
  ell(ctx, 700, 98, 430, 13, 'rgba(255,255,255,0.2)');
  ell(ctx, 120, 170, 300, 10, 'rgba(255,248,235,0.3)');
  for (let i = 0; i < 30; i++) {
    ell(ctx, X0 + rand() * (X1 - X0), -60 + rand() * 260, 60 + rand() * 160, 3 + rand() * 7, `rgba(255,255,255,${0.1 + rand() * 0.18})`);
  }
}

function ridge(ctx: Ctx, base: number, amp: number, c1: string, c2: string, seed: number, bump?: { x: number; w: number; h: number }) {
  const r = rng(seed);
  const p = [r() * 6, r() * 6, r() * 6];
  ctx.beginPath();
  ctx.moveTo(X0, 940);
  for (let x = X0; x <= X1; x += 6) {
    const n = Math.sin(x * 0.006 + p[0]) * 0.5 + Math.sin(x * 0.017 + p[1]) * 0.3 + Math.sin(x * 0.041 + p[2]) * 0.2;
    let y = base - amp * (0.5 + 0.5 * n);
    if (bump) y -= bump.h * Math.exp(-Math.pow((x - bump.x) / bump.w, 2));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(X1, 940);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, base - amp - 30, 0, base + 60);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fill();
}

function paintMountains(ctx: Ctx) {
  ridge(ctx, 240, 24, '#7d98b0', '#b8c6cb', 11, { x: 90, w: 75, h: 22 });
  ridge(ctx, 250, 14, '#6f8ca3', '#a5b8bd', 12, { x: 880, w: 220, h: 7 });
  ridge(ctx, 262, 8, '#8da296', '#a7b5a4', 13);
}

/** Edificio de torre: cara iluminada, cara en sombra, lineas de pisos y remate. */
function tower(ctx: Ctx, x: number, top: number, w: number, bottom: number, lit: string, shade: string) {
  const sw = Math.max(3, w * 0.24);
  ctx.fillStyle = lit;
  ctx.fillRect(x, top, w - sw, bottom - top);
  ctx.fillStyle = shade;
  ctx.fillRect(x + w - sw, top, sw, bottom - top);
  ctx.fillStyle = 'rgba(60,30,20,0.2)';
  for (let y = top + 4; y < bottom; y += 5) ctx.fillRect(x, y, w, 1);
  ctx.fillStyle = 'rgba(255,230,200,0.16)';
  for (let xx = x + 3; xx < x + w - sw; xx += 5) ctx.fillRect(xx, top, 1, bottom - top);
  ctx.fillStyle = mix(shade, '#000000', 0.25);
  ctx.fillRect(x - 1, top - 2, w + 2, 3);
}

const TOWER_PALETTE: [string, string][] = [
  ['#d98a5e', '#a2563c'],
  ['#e0b080', '#b77b55'],
  ['#d4916a', '#9c5a42'],
  ['#cbbfa8', '#a39a86'],
  ['#ece6d8', '#bdb6a6'],
  ['#c58a65', '#94604a'],
];

function paintTowers(ctx: Ctx, rand: () => number) {
  const haze = '#cfd6d8';
  const g = ctx.createLinearGradient(0, 255, 0, 940);
  g.addColorStop(0, '#8a9c86');
  g.addColorStop(1, '#667a5c');
  ctx.fillStyle = g;
  ctx.fillRect(X0, 262, X1 - X0, 700);
  const filler = (from: number, to: number, base: number, step: number, hz: number) => {
    for (let x = from; x < to; x += step) {
      const h = 10 + rand() * 30;
      const w = 8 + rand() * 18;
      const c = TOWER_PALETTE[Math.floor(rand() * TOWER_PALETTE.length)];
      tower(ctx, x, base - h, w, base + 4, mix(c[0], haze, hz), mix(c[1], haze, hz));
    }
  };
  filler(X0, 200, 262, 14, 0.35);
  filler(640, X1, 292, 12, 0.28);
  // Los cuatro bloques de torres del barrio y la torre grande de ladrillo
  const main: [number, number, number][] = [[213, 27, 212], [250, 28, 214], [284, 22, 214], [348, 27, 205], [388, 23, 207], [432, 15, 217], [536, 49, 197]];
  main.forEach(([x, w, top], i) => {
    const c = i === 6 ? (['#e49a66', '#b5603f'] as [string, string]) : i % 2 ? TOWER_PALETTE[0] : TOWER_PALETTE[2];
    tower(ctx, x, top, w, 268, mix(c[0], haze, 0.2), mix(c[1], haze, 0.2));
  });
  tower(ctx, 378, 236, 42, 292, mix('#cbbfa8', haze, 0.2), mix('#a39a86', haze, 0.2));
  tower(ctx, 470, 240, 26, 280, mix('#ece6d8', haze, 0.2), mix('#bdb6a6', haze, 0.2));
  tower(ctx, 600, 230, 30, 282, mix('#d4916a', haze, 0.2), mix('#9c5a42', haze, 0.2));
}

function clump(ctx: Ctx, cx: number, cy: number, r: number) {
  ell(ctx, cx, cy, r, r * 0.85, '#2f4b2d');
  ell(ctx, cx - r * 0.15, cy - r * 0.2, r * 0.75, r * 0.6, '#456b34');
  ell(ctx, cx - r * 0.3, cy - r * 0.45, r * 0.4, r * 0.26, '#7f9d44');
}

function paintTrees(ctx: Ctx, rand: () => number) {
  const g = ctx.createLinearGradient(0, 300, 0, 940);
  g.addColorStop(0, '#3d5a33');
  g.addColorStop(1, '#33482c');
  ctx.fillStyle = g;
  ctx.fillRect(X0, 300, X1 - X0, 700);
  for (let x = 640; x < X1; x += 26) {
    const w = 18 + rand() * 18;
    const y = 300 + rand() * 22;
    ctx.fillStyle = rand() > 0.5 ? '#b4573b' : '#c46a48';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w * 0.2, y - 9);
    ctx.lineTo(x + w * 0.8, y - 9);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e6dcc4';
    ctx.fillRect(x + 2, y, w - 4, 8);
  }
  for (let x = X0; x < X1; x += 20) clump(ctx, x, 272 + rand() * 34, 13 + rand() * 15);
  ell(ctx, 808, 262, 9, 34, '#3d5a30');
  ell(ctx, 806, 250, 5, 20, '#58783a');
  for (let x = X0; x < X1; x += 34) clump(ctx, x + 8, 308 + rand() * 14, 16 + rand() * 10);
}

type RoofStyle = { roof: string; roofLit: string; wall: string; wallShade: string };
const RED_ROOF: RoofStyle = { roof: '#a8452f', roofLit: '#c8603f', wall: '#c9b79a', wallShade: '#9a8468' };
const BRICK_ROOF: RoofStyle = { roof: '#9a3e2a', roofLit: '#b8573a', wall: '#a9604a', wallShade: '#7e4636' };

function house(ctx: Ctx, x: number, y: number, w: number, h: number, wallH: number, o: RoofStyle) {
  ctx.fillStyle = o.wall;
  ctx.fillRect(x + w * 0.04, y + h, w * 0.92, wallH);
  ctx.fillStyle = o.wallShade;
  ctx.fillRect(x + w * 0.04, y + h + wallH * 0.75, w * 0.92, wallH * 0.25);
  ctx.fillStyle = '#3e3532';
  for (let i = 0; i < Math.floor(w / 22); i++) ctx.fillRect(x + w * 0.1 + i * 22, y + h + wallH * 0.2, 10, wallH * 0.4);
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, o.roofLit);
  g.addColorStop(1, o.roof);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w * 0.18, y);
  ctx.lineTo(x + w * 0.82, y);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(70,20,10,0.28)';
  ctx.lineWidth = 1;
  for (let yy = y + 3; yy < y + h; yy += 3.5) {
    const inset = (1 - (yy - y) / h) * w * 0.18;
    ctx.beginPath();
    ctx.moveTo(x + inset, yy);
    ctx.lineTo(x + w - inset, yy);
    ctx.stroke();
  }
  ctx.fillStyle = mix(o.roofLit, '#ffd9b0', 0.4);
  ctx.fillRect(x + w * 0.18, y - 1.5, w * 0.64, 2.5);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x + w * 0.04, y + h, w * 0.92, 2);
}

function paintHouses(ctx: Ctx, rand: () => number) {
  const g = ctx.createLinearGradient(0, 470, 0, 940);
  g.addColorStop(0, '#566a47');
  g.addColorStop(1, '#6a6c60');
  ctx.fillStyle = g;
  ctx.fillRect(X0, 470, X1 - X0, 500);
  // Relleno de tejados lejanos a ambos lados
  for (const [from, to] of [[X0, 330], [760, X1]] as const) {
    for (let x = from; x < to; x += 88 + rand() * 30) {
      house(ctx, x, 350 + rand() * 40, 70 + rand() * 40, 28 + rand() * 12, 22 + rand() * 6, rand() > 0.5 ? RED_ROOF : BRICK_ROOF);
    }
  }
  const list: [number, number, number, number, number, RoofStyle][] = [
    [350, 372, 70, 28, 22, BRICK_ROOF],
    [430, 365, 92, 34, 24, BRICK_ROOF],
    [520, 372, 72, 30, 22, RED_ROOF],
    [582, 352, 72, 40, 28, BRICK_ROOF],
    [470, 405, 82, 30, 26, RED_ROOF],
    [545, 418, 92, 36, 26, BRICK_ROOF],
    [610, 408, 70, 32, 22, RED_ROOF],
  ];
  list.forEach(([x, y, w, h, wh, o]) => house(ctx, x, y, w, h, wh, o));
  // Edificio de ladrillo de la derecha
  ctx.fillStyle = '#b9654a';
  ctx.fillRect(640, 300, 190, 110);
  ctx.fillStyle = '#8a4a38';
  ctx.fillRect(760, 300, 70, 110);
  ctx.fillStyle = '#3a3230';
  for (let yy = 312; yy < 400; yy += 18) for (let xx = 652; xx < 820; xx += 22) ctx.fillRect(xx, yy, 9, 11);
  ctx.fillStyle = '#9a9a98';
  ctx.fillRect(636, 292, 198, 10);
  ctx.fillStyle = '#6f6f70';
  ctx.fillRect(680, 282, 30, 10);
  for (let x = X0; x < X1; x += 85) clump(ctx, x, 430 + rand() * 20, 18 + rand() * 10);
}

function pine(ctx: Ctx, x: number, top: number, w: number, h: number) {
  const n = 7;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const cy = top + t * h;
    const rw = w * (0.35 + 0.65 * t);
    ell(ctx, x, cy, rw, (h / n) * 1.3, i % 2 ? '#26402a' : '#2e4a2b');
    ell(ctx, x - rw * 0.3, cy - 2, rw * 0.5, (h / n) * 0.8, '#4d7032');
  }
}

function roof(ctx: Ctx, pts: [number, number][], from: [number, number], to: [number, number], c1: string, c2: string, lines: [number, number, number][]) {
  const g = ctx.createLinearGradient(from[0], from[1], to[0], to[1]);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(70,20,10,0.3)';
  ctx.lineWidth = 1;
  lines.forEach(([x1, x2, y]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  });
}

/** Primer plano: la calle y las dos casas que enmarcan el ventanal, con pinos en el borde izquierdo. */
function paintNear(ctx: Ctx) {
  // Pinos oscuros al borde izquierdo (detras de la casa)
  for (let i = 0; i < 5; i++) pine(ctx, 270 + i * 24, 210 + i * 12, 38, 250 + i * 8);
  pine(ctx, 392, 300, 28, 150);
  // Calle
  ctx.fillStyle = '#4d5052';
  ctx.beginPath();
  ctx.moveTo(470, 372);
  ctx.lineTo(502, 372);
  ctx.lineTo(560, 487);
  ctx.lineTo(620, 640);
  ctx.lineTo(380, 640);
  ctx.lineTo(436, 487);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#cfcabc';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(470, 372);
  ctx.lineTo(436, 487);
  ctx.lineTo(380, 640);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(240,235,220,0.55)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([10, 9]);
  ctx.beginPath();
  ctx.moveTo(486, 376);
  ctx.lineTo(500, 487);
  ctx.lineTo(500, 640);
  ctx.stroke();
  ctx.setLineDash([]);
  // Coche blanco y caja verde de energia
  ctx.fillStyle = '#e9edf0';
  ctx.fillRect(452, 470, 26, 11);
  ctx.fillStyle = '#98a2a8';
  ctx.fillRect(458, 467, 14, 5);
  ctx.fillStyle = '#3f9a4a';
  ctx.fillRect(540, 526, 9, 24);
  // Casa izquierda (crema) con techo de teja
  ctx.fillStyle = '#efe8d2';
  ctx.fillRect(300, 436, 152, 124);
  ctx.fillStyle = '#dcd2b8';
  ctx.fillRect(404, 436, 48, 124);
  ctx.fillStyle = '#8a5442';
  ctx.fillRect(300, 538, 152, 22);
  ctx.fillStyle = '#4a3a33';
  ctx.fillRect(326, 462, 40, 30);
  ctx.fillRect(386, 462, 24, 30);
  ctx.fillStyle = '#7a5a44';
  ctx.fillRect(324, 460, 44, 3);
  const tiles: [number, number, number][] = [];
  for (let y = 400; y < 442; y += 4) tiles.push([310 + (y - 392) * 0.15, 438 + (y - 392) * 0.4, y]);
  roof(ctx, [[290, 444], [330, 394], [430, 398], [466, 446]], [300, 394], [466, 446], '#c8603f', '#9c3f2b', tiles);
  // Casa derecha (blanca y ladrillo)
  ctx.fillStyle = '#efeadf';
  ctx.fillRect(562, 500, 230, 160);
  ctx.fillStyle = '#a9644c';
  ctx.fillRect(610, 520, 180, 54);
  ctx.fillStyle = '#3a3230';
  for (let xx = 624; xx < 780; xx += 36) ctx.fillRect(xx, 534, 16, 28);
  const tiles2: [number, number, number][] = [];
  for (let y = 426; y < 500; y += 5) tiles2.push([566 + (y - 426) * 0.15, 780, y]);
  roof(ctx, [[548, 504], [590, 424], [720, 420], [800, 456], [818, 506], [790, 520], [570, 520]], [560, 420], [800, 520], '#c8603f', '#9a3d2a', tiles2);
  ctx.fillStyle = '#e8d9c0';
  ctx.fillRect(560, 520, 236, 10);
  // Cables y arbustos del primer plano
  ctx.strokeStyle = 'rgba(40,34,30,0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(250, 380);
  ctx.quadraticCurveTo(400, 440, 560, 452);
  ctx.moveTo(250, 394);
  ctx.quadraticCurveTo(400, 454, 560, 466);
  ctx.stroke();
  clump(ctx, 500, 590, 34);
  clump(ctx, 452, 598, 24);
  clump(ctx, 548, 596, 22);
  ell(ctx, 500, 584, 20, 9, '#8aa83e');
}

// --- API ----------------------------------------------------------------------------------------

/** Texturas de las capas, de la mas lejana a la mas cercana. Debe llamarse en el navegador. */
export function windowViewTextures(): Record<WindowLayerKey, Texture> {
  return {
    sky: skyTexture(),
    clouds: makeLayer(paintClouds, 1),
    mountains: makeLayer(paintMountains, 2),
    towers: makeLayer(paintTowers, 3),
    trees: makeLayer(paintTrees, 4),
    houses: makeLayer(paintHouses, 5),
    near: makeLayer(paintNear, 6),
  };
}
