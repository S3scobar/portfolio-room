// Posters dibujados por codigo (sin imagenes externas): Dune y el poster de la Muestra de Proyectos (SAMI).
import { finish, makeCanvas, rng } from './canvasTextures';

type Ctx = CanvasRenderingContext2D;

const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';

/** Texto con separacion fija entre letras, centrado en `cx`. */
function spaced(ctx: Ctx, text: string, cx: number, y: number, font: string, tracking: number, color: string) {
  ctx.font = font;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const w = [...text].reduce((a, ch) => a + ctx.measureText(ch).width, 0) + tracking * (text.length - 1);
  let x = cx - w / 2;
  ctx.fillStyle = color;
  for (const ch of text) {
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + tracking;
  }
}

// ---------------------------------------------------------------------------
// Dune
// ---------------------------------------------------------------------------

function ornithopter(ctx: Ctx, cx: number, cy: number, span: number) {
  ctx.strokeStyle = '#6b2d12';
  ctx.lineWidth = 2.1;
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * 4, cy - 2);
    ctx.lineTo(cx + s * span * 0.5, cy - 11);
    ctx.moveTo(cx + s * 4, cy + 1);
    ctx.lineTo(cx + s * span * 0.5, cy + 4);
    ctx.moveTo(cx + s * 4, cy + 3);
    ctx.lineTo(cx + s * span * 0.46, cy + 8);
    ctx.stroke();
  }
  ctx.fillStyle = '#5a2a12';
  ctx.fillRect(cx - 5, cy - 5, 10, 11);
  ctx.fillRect(cx - 2, cy + 6, 4, 5);
  ctx.lineCap = 'butt';
}

function silhouette(ctx: Ctx) {
  ctx.fillStyle = '#2a1410';
  // Capa al viento hacia la izquierda
  ctx.beginPath();
  ctx.moveTo(327, 414);
  ctx.bezierCurveTo(308, 420, 284, 446, 265, 484);
  ctx.bezierCurveTo(267, 495, 282, 498, 294, 492);
  ctx.bezierCurveTo(310, 482, 322, 470, 328, 452);
  ctx.closePath();
  ctx.fill();
  // Cuerpo
  ctx.beginPath();
  ctx.moveTo(327, 413);
  ctx.lineTo(347, 410);
  ctx.lineTo(354, 438);
  ctx.lineTo(352, 468);
  ctx.lineTo(353, 492);
  ctx.lineTo(341, 492);
  ctx.lineTo(339, 470);
  ctx.lineTo(334, 492);
  ctx.lineTo(322, 492);
  ctx.lineTo(324, 466);
  ctx.lineTo(322, 438);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(337.5, 401, 8, 10.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Poster de Dune: sol enorme tras una duna, figura en la cresta y ornitopteros. */
export function dunePosterTexture() {
  const SC = 1.5;
  const W = 724;
  const H = 1024;
  const { canvas, ctx } = makeCanvas(W * SC, H * SC);
  ctx.scale(SC, SC);
  const rand = rng(1965);

  const sky = ctx.createLinearGradient(0, 0, 0, 580);
  sky.addColorStop(0, '#cb3410');
  sky.addColorStop(0.3, '#e2601f');
  sky.addColorStop(0.65, '#f48c3e');
  sky.addColorStop(1, '#f9aa5c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // Pinceladas suaves en el cielo
  for (let i = 0; i < 140; i++) {
    const y = rand() * 560;
    ctx.fillStyle = rand() > 0.5 ? `rgba(255,170,90,${0.03 + rand() * 0.05})` : `rgba(190,40,10,${0.03 + rand() * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(rand() * W, y, 60 + rand() * 180, 10 + rand() * 30, (rand() - 0.5) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sol pequeno
  const g1 = ctx.createRadialGradient(611, 80, 30, 611, 80, 110);
  g1.addColorStop(0, 'rgba(255,225,180,0.4)');
  g1.addColorStop(1, 'rgba(255,225,180,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(480, 0, 244, 220);
  ctx.fillStyle = '#fdf0db';
  ctx.beginPath();
  ctx.arc(611, 80, 41, 0, Math.PI * 2);
  ctx.fill();

  // Sol grande tras la duna
  const g2 = ctx.createRadialGradient(382, 435, 120, 382, 435, 380);
  g2.addColorStop(0, 'rgba(255,225,175,0.6)');
  g2.addColorStop(1, 'rgba(255,225,175,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 100, W, 600);
  const g3 = ctx.createRadialGradient(382, 435, 60, 382, 435, 158);
  g3.addColorStop(0, '#fff8ec');
  g3.addColorStop(1, '#fdeed6');
  ctx.fillStyle = g3;
  ctx.beginPath();
  ctx.arc(382, 435, 158, 0, Math.PI * 2);
  ctx.fill();

  ornithopter(ctx, 242, 121, 120);
  ornithopter(ctx, 460, 153, 120);
  ornithopter(ctx, 607, 200, 96);
  ornithopter(ctx, 116, 248, 96);

  // Dunas lejanas con bruma
  const hill = (pts: [number, number][], color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i += 3) ctx.bezierCurveTo(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], pts[i + 2][0], pts[i + 2][1]);
    ctx.lineTo(pts[pts.length - 1][0], 720);
    ctx.lineTo(pts[0][0], 720);
    ctx.closePath();
    ctx.fill();
  };
  hill([[0, 492], [60, 500], [140, 522], [230, 548]], '#f29548');
  hill([[0, 566], [60, 560], [130, 572], [215, 590]], '#ee8a3e');
  hill([[0, 604], [50, 590], [120, 602], [190, 624]], '#e77d34');
  hill([[490, 566], [560, 548], [640, 556], [724, 520]], '#f29548');
  hill([[520, 596], [600, 568], [680, 584], [724, 602]], '#ec8338');
  hill([[600, 618], [650, 596], [700, 606], [724, 626]], '#e27333');

  // Cara iluminada de la duna principal
  const lit = new Path2D();
  lit.moveTo(325, 492);
  lit.bezierCurveTo(300, 502, 250, 522, 190, 550);
  lit.bezierCurveTo(120, 582, 40, 618, 0, 648);
  lit.lineTo(0, 926);
  lit.lineTo(345, 818);
  lit.bezierCurveTo(360, 810, 380, 802, 400, 792);
  lit.bezierCurveTo(470, 760, 492, 690, 470, 640);
  lit.bezierCurveTo(430, 562, 360, 520, 325, 492);
  lit.closePath();
  const gl = ctx.createLinearGradient(40, 560, 480, 760);
  gl.addColorStop(0, '#f78a30');
  gl.addColorStop(0.55, '#ee701f');
  gl.addColorStop(1, '#d9571a');
  ctx.fillStyle = gl;
  ctx.fill(lit);
  ctx.save();
  ctx.clip(lit);
  const rim = ctx.createRadialGradient(150, 640, 40, 150, 640, 420);
  rim.addColorStop(0, 'rgba(255,170,80,0.28)');
  rim.addColorStop(1, 'rgba(255,170,80,0)');
  ctx.fillStyle = rim;
  ctx.fillRect(0, 480, 520, 460);
  ctx.restore();

  // Cara en sombra
  const shade = new Path2D();
  shade.moveTo(325, 492);
  shade.bezierCurveTo(380, 496, 440, 516, 500, 548);
  shade.bezierCurveTo(580, 588, 660, 602, 724, 628);
  shade.lineTo(724, 944);
  shade.bezierCurveTo(600, 900, 480, 832, 345, 818);
  shade.lineTo(400, 792);
  shade.bezierCurveTo(470, 760, 492, 690, 470, 640);
  shade.bezierCurveTo(430, 562, 360, 520, 325, 492);
  shade.closePath();
  const gs = ctx.createLinearGradient(0, 490, 0, 940);
  gs.addColorStop(0, '#7c3519');
  gs.addColorStop(0.45, '#4d2013');
  gs.addColorStop(1, '#2a1310');
  ctx.fillStyle = gs;
  ctx.fill(shade);

  // Franja inferior izquierda y duna frontal oscura
  const band = ctx.createLinearGradient(0, 830, 0, 1024);
  band.addColorStop(0, '#c4501b');
  band.addColorStop(1, '#6f2a14');
  ctx.fillStyle = band;
  ctx.beginPath();
  ctx.moveTo(0, 926);
  ctx.lineTo(345, 818);
  ctx.lineTo(0, 1024);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#231110';
  ctx.beginPath();
  ctx.moveTo(0, 1024);
  ctx.lineTo(350, 820);
  ctx.bezierCurveTo(480, 830, 620, 890, 724, 944);
  ctx.lineTo(724, 1024);
  ctx.closePath();
  ctx.fill();

  silhouette(ctx);

  // Grano de papel
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = rand() > 0.5 ? `rgba(255,235,205,${0.02 + rand() * 0.04})` : `rgba(40,10,0,${0.02 + rand() * 0.04})`;
    ctx.fillRect(rand() * W, rand() * H, 1.2, 1.2);
  }
  spaced(ctx, 'DUNE', 362, 947, `600 48px "Trajan Pro", Cinzel, Georgia, "Times New Roman", serif`, 30, '#e9e4df');
  return finish(canvas);
}

// ---------------------------------------------------------------------------
// Muestra de Proyectos en Ingenieria (SAMI)
// ---------------------------------------------------------------------------

function rrect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx: Ctx, s: string, x: number, y: number, size: number, opts: { w?: number; color?: string; align?: CanvasTextAlign; italic?: boolean; font?: string } = {}) {
  ctx.font = `${opts.italic ? 'italic ' : ''}${opts.w ?? 400} ${size}px ${opts.font ?? SANS}`;
  ctx.fillStyle = opts.color ?? '#1d1d1f';
  ctx.textAlign = opts.align ?? 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function lines(ctx: Ctx, rows: string[], x: number, y: number, step: number, size: number, opts: Parameters<typeof text>[5] = {}) {
  rows.forEach((r, i) => text(ctx, r, x, y + i * step, size, opts));
}

/** Tarjeta numerada con barra de titulo gris. */
function card(ctx: Ctx, x: number, y: number, w: number, h: number, n: number, title: string, headH = 36) {
  ctx.fillStyle = '#ffffff';
  rrect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = '#e3e3e5';
  ctx.beginPath();
  ctx.moveTo(x, y + headH);
  ctx.lineTo(x, y + 10);
  ctx.arcTo(x, y, x + 10, y, 10);
  ctx.lineTo(x + w - 10, y);
  ctx.arcTo(x + w, y, x + w, y + 10, 10);
  ctx.lineTo(x + w, y + headH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b9b9bd';
  ctx.lineWidth = 2;
  rrect(ctx, x, y, w, h, 10);
  ctx.stroke();
  ctx.fillStyle = '#1b5fa8';
  ctx.beginPath();
  ctx.arc(x + 20, y + headH / 2, 12, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, String(n), x + 20, y + headH / 2 + 1, 16, { w: 800, color: '#fff', align: 'center' });
  const rows = title.split('\n');
  rows.forEach((r, i) => text(ctx, r, x + 40, y + headH / 2 + (i - (rows.length - 1) / 2) * 20, 19, { w: 800, color: '#222' }));
}

const circle = (ctx: Ctx, x: number, y: number, r: number, color: string) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

function heart(ctx: Ctx, x: number, y: number, s: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.5, y - s * 1.1, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.5, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.9);
  ctx.fill();
}

function houseIcon(ctx: Ctx, x: number, y: number) {
  ctx.fillStyle = '#f2d9b0';
  ctx.fillRect(x - 13, y - 4, 26, 18);
  ctx.fillStyle = '#e8892b';
  ctx.beginPath();
  ctx.moveTo(x - 17, y - 3);
  ctx.lineTo(x, y - 18);
  ctx.lineTo(x + 17, y - 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6b4a2c';
  ctx.fillRect(x - 4, y + 3, 8, 11);
}

function elders(ctx: Ctx, x: number, y: number) {
  for (const [dx, c] of [[-9, '#c9a37a'], [9, '#8f9bb8']] as const) {
    circle(ctx, x + dx, y - 12, 5, '#f1c9a0');
    circle(ctx, x + dx, y - 15, 5, '#cfcfd4');
    ctx.fillStyle = c;
    rrect(ctx, x + dx - 8, y - 6, 16, 22, 5);
    ctx.fill();
  }
}

function band(ctx: Ctx, cx: number, cy: number) {
  // Correa azul marino con perforaciones
  ctx.fillStyle = '#2b4180';
  rrect(ctx, cx - 22, cy - 82, 44, 76, 14);
  ctx.fill();
  rrect(ctx, cx - 22, cy + 6, 44, 76, 14);
  ctx.fill();
  ctx.fillStyle = '#1b2a5a';
  for (const dy of [-70, -58, -46, -34, -22, 16, 28, 40, 52, 64]) {
    circle(ctx, cx, cy + dy, 2.2, '#1b2a5a');
  }
  // Cuerpo plateado
  const g = ctx.createLinearGradient(cx - 28, cy - 30, cx + 28, cy + 30);
  g.addColorStop(0, '#f3f3f5');
  g.addColorStop(1, '#a9acb4');
  ctx.fillStyle = g;
  rrect(ctx, cx - 30, cy - 34, 60, 68, 16);
  ctx.fill();
  ctx.strokeStyle = '#8d9098';
  ctx.lineWidth = 1.5;
  rrect(ctx, cx - 30, cy - 34, 60, 68, 16);
  ctx.stroke();
  heart(ctx, cx, cy - 8, 7, '#8d9098');
  text(ctx, 'sami', cx, cy + 14, 13, { w: 500, color: '#6d7078', align: 'center' });
  circle(ctx, cx - 30, cy - 10, 2.5, '#f08a24');
  circle(ctx, cx - 30, cy + 2, 2.5, '#f08a24');
}

function hexPattern(ctx: Ctx, x0: number, y0: number, w: number, h: number) {
  ctx.strokeStyle = '#bcd9ee';
  ctx.lineWidth = 1.3;
  const r = 13;
  for (let row = 0; row * r * 1.5 < h; row++) {
    for (let col = 0; col * r * 1.75 < w; col++) {
      const cx = x0 + col * r * 1.75 + (row % 2 ? r * 0.875 : 0);
      const cy = y0 + row * r * 1.5;
      if (cx > x0 + w - (row * 5)) continue;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = Math.PI / 6 + (k * Math.PI) / 3;
        ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function hospital(ctx: Ctx, x: number, y: number) {
  ctx.fillStyle = '#7fb1e0';
  ctx.fillRect(x - 36, y - 22, 72, 52);
  ctx.fillStyle = '#d6e6f6';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) ctx.fillRect(x - 32 + c * 11.5, y - 8 + r * 12, 8, 7);
  ctx.fillStyle = '#e24a4a';
  ctx.fillRect(x - 5, y - 20, 10, 3);
  ctx.fillRect(x - 1.5, y - 23.5, 3, 10);
  ctx.fillStyle = '#5e8fbf';
  ctx.fillRect(x - 6, y + 18, 12, 12);
}

function cell(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string, label: string, size = 12, color = '#111') {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  const rows = label.split('\n');
  rows.forEach((r, i) => text(ctx, r, x + w / 2, y + h / 2 + (i - (rows.length - 1) / 2) * (size + 2), size, { w: 700, color, align: 'center' }));
}

/** Poster "Muestra de Proyectos en Ingenieria": SAMI, wearable para adultos mayores. */
export function muestraPosterTexture() {
  const SC = 1.5;
  const W = 745;
  const H = 1024;
  const { canvas, ctx } = makeCanvas(W * SC, H * SC);
  ctx.scale(SC, SC);
  ctx.fillStyle = '#f4f5f7';
  ctx.fillRect(0, 0, W, H);

  // Encabezado
  const hg = ctx.createLinearGradient(0, 0, W, 0);
  hg.addColorStop(0, '#1b92da');
  hg.addColorStop(1, '#1670b8');
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, W, 133);
  ctx.fillStyle = '#12629f';
  rrect(ctx, 42, 20, 242, 54, 5);
  ctx.fill();
  text(ctx, 'MUESTRA', 54, 48, 44, { w: 900, color: '#fff', font: 'Arial Black, Arial, sans-serif' });
  ctx.fillStyle = '#34363a';
  rrect(ctx, 44, 80, 56, 48, 6);
  ctx.fill();
  ctx.strokeStyle = '#c9ccd1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(56, 118);
  ctx.lineTo(88, 90);
  ctx.moveTo(56, 90);
  ctx.lineTo(88, 118);
  ctx.stroke();
  text(ctx, 'DE', 108, 93, 14, { w: 800, color: '#fff' });
  text(ctx, 'PROYECTOS', 128, 92, 31, { w: 900, color: '#f6c21a', font: 'Arial Black, Arial, sans-serif' });
  text(ctx, 'EN INGENIERÍA', 108, 119, 24, { w: 900, color: '#fff', font: 'Arial Black, Arial, sans-serif' });
  lines(
    ctx,
    ['Santiago Escobar Arias', 'Juan Andrés Saboyá Soto', 'Kevin David Aristizabal', 'Sergio Rojas García', 'Esteban Pillimue', 'Edwin Arbey Timana Getial', 'Ismael David Vera Salcedo'],
    462,
    24,
    17,
    13.5,
    { w: 600, color: '#fff' },
  );
  heart(ctx, 692, 44, 9, '#ffffff');
  text(ctx, 'sami', 700, 96, 26, { w: 400, color: '#fff', align: 'center' });

  // 1 Problema
  card(ctx, 12, 155, 230, 221, 1, 'PROBLEMA');
  lines(ctx, ['“Alta deficiencia en el', 'monitoreo de la salud', 'integral de adultos', 'mayores de estratos 2 y', '3 durante períodos de', 'soledad en la ciudad de', 'Medellín”'], 127, 204, 16, 12.8, { w: 700, align: 'center' });
  houseIcon(ctx, 44, 327);
  circle(ctx, 92, 328, 11, '#d6e6f6');
  ctx.strokeStyle = '#2b5fa8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(84, 336);
  ctx.lineTo(100, 320);
  ctx.moveTo(86, 322);
  ctx.lineTo(98, 334);
  ctx.stroke();
  ctx.fillStyle = '#2a2a2e';
  rrect(ctx, 130, 312, 17, 32, 3);
  ctx.fill();
  circle(ctx, 190, 336, 8, '#f0b429');
  circle(ctx, 196, 326, 8, '#f6c84c');
  circle(ctx, 188, 318, 8, '#e9a21b');
  for (const [s, x] of [['Soledad\nProlongada', 44], ['Sin\nmonitoreo\ncontinuo', 92], ['Brecha\ndigital', 138], ['Soluciones\ncostosas', 192]] as const) {
    lines(ctx, s.split('\n'), x, 360, 8, 6.5, { w: 700, align: 'center' });
  }

  // 2 Contexto
  card(ctx, 252, 155, 230, 221, 2, 'CONTEXTO');
  text(ctx, 'Envejecimiento en Medellín', 367, 205, 12.5, { w: 800, align: 'center' });
  elders(ctx, 275, 244);
  ctx.strokeStyle = '#c9c9cd';
  ctx.lineWidth = 1;
  for (const x of [380, 428]) {
    ctx.beginPath();
    ctx.moveTo(x, 222);
    ctx.lineTo(x, 262);
    ctx.stroke();
  }
  lines(ctx, ['492 mil+', 'adultos', 'mayores'], 341, 228, 11, 9.5, { w: 800, align: 'center' });
  lines(ctx, ['10.1%', 'viven', 'solos'], 404, 228, 11, 9.5, { w: 800, align: 'center' });
  lines(ctx, ['63.7%', 'presentan', 'barreras', 'digitales'], 455, 226, 10, 9, { w: 800, align: 'center' });
  text(ctx, 'Conectividad', 292, 283, 10, { w: 800 });
  ctx.fillStyle = '#d3e6f7';
  rrect(ctx, 262, 293, 80, 12, 6);
  ctx.fill();
  ctx.fillStyle = '#2f7bd0';
  rrect(ctx, 262, 293, 56, 12, 6);
  ctx.fill();
  text(ctx, '70%', 352, 299, 10, { w: 800 });
  lines(ctx, ['73,7% de los hogares', 'cuenta con conexión a', 'internet'], 309, 322, 10, 8.3, { w: 600, align: 'center' });
  circle(ctx, 384, 322, 15, '#2a2a2e');
  circle(ctx, 384, 322, 10.5, '#fff');
  circle(ctx, 384, 322, 6, '#2a2a2e');
  circle(ctx, 384, 322, 2.6, '#fff');
  text(ctx, 'Estratos 2 y 3', 440, 304, 9, { w: 800, align: 'center' });
  lines(ctx, ['Representan el 75,6%', 'de la población atendida', 'en la ciudad'], 440, 326, 9.5, 7.4, { w: 600, align: 'center' });
  text(ctx, 'Medellín Cómo Vamos. (2021). Informe de Calidad de Vida de Medellín, 2020.', 367, 366, 6.2, { italic: true, align: 'center', color: '#444' });

  // 3 Efectos negativos
  card(ctx, 492, 155, 241, 221, 3, 'EFECTOS NEGATIVOS');
  // calendario con X
  ctx.fillStyle = '#e8eef7';
  rrect(ctx, 528, 205, 36, 36, 4);
  ctx.fill();
  ctx.fillStyle = '#e24a4a';
  ctx.fillRect(528, 205, 36, 9);
  ctx.strokeStyle = '#e24a4a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(538, 220);
  ctx.lineTo(554, 236);
  ctx.moveTo(554, 220);
  ctx.lineTo(538, 236);
  ctx.stroke();
  // manos y corazon
  heart(ctx, 682, 222, 12, '#e24a4a');
  ctx.fillStyle = '#f2a65a';
  rrect(ctx, 654, 232, 56, 12, 6);
  ctx.fill();
  // trabajador medico
  circle(ctx, 546, 306, 8, '#f1c9a0');
  ctx.fillStyle = '#2b6cb0';
  rrect(ctx, 535, 313, 22, 20, 6);
  ctx.fill();
  circle(ctx, 561, 327, 7, '#2b6cb0');
  // familia
  circle(ctx, 672, 303, 6.5, '#f1c9a0');
  circle(ctx, 692, 307, 5.5, '#f1c9a0');
  ctx.fillStyle = '#e24a4a';
  rrect(ctx, 664, 311, 16, 20, 5);
  ctx.fill();
  ctx.fillStyle = '#2b6cb0';
  rrect(ctx, 685, 313, 14, 18, 5);
  ctx.fill();
  lines(ctx, ['Inasistencia', 'Prolongada'], 546, 262, 12, 10.5, { w: 800, align: 'center' });
  lines(ctx, ['Deterioro del', 'Bienestar Socio', '- Afectivo'], 682, 258, 12, 10.5, { w: 800, align: 'center' });
  lines(ctx, ['Lesiones', 'Irreversibles o', 'Fatalidades'], 546, 342, 11, 10, { w: 800, align: 'center' });
  lines(ctx, ['Estrés Crónico', 'Familiar'], 682, 346, 11, 10, { w: 800, align: 'center' });

  // 4 Producto SAMI
  card(ctx, 12, 386, 470, 250, 4, 'PRODUCTO - SAMI');
  hexPattern(ctx, 24, 436, 90, 130);
  lines(ctx, ['Detección automática', 'de Caidas'], 148, 456, 14, 11.5, { w: 800, align: 'center' });
  text(ctx, 'Interacción Cero', 140, 508, 11.5, { w: 800, align: 'center' });
  lines(ctx, ['Monitoreo Fisiologico', 'Continuo'], 140, 538, 14, 11.5, { w: 800, align: 'center' });
  text(ctx, 'Geolocalización', 428, 458, 11.5, { w: 800, align: 'center' });
  text(ctx, 'Activa', 428, 472, 11.5, { w: 800, align: 'center' });
  lines(ctx, ['Indicador', 'LED'], 430, 508, 14, 11.5, { w: 800, align: 'center' });
  lines(ctx, ['Carga', 'Inductiva'], 430, 552, 14, 11.5, { w: 800, align: 'center' });
  lines(ctx, ['Portal Web con Dashboards', '(Acceso  para la familia y', 'seguimiento)'], 344, 600, 13, 11.5, { w: 800, align: 'center' });
  band(ctx, 308, 506);
  ctx.strokeStyle = '#f0a020';
  ctx.lineWidth = 1.6;
  for (const [x1, y1, x2, y2] of [[210, 462, 285, 490], [214, 510, 278, 506], [212, 536, 282, 520], [392, 466, 338, 488], [392, 506, 340, 506], [394, 546, 338, 528], [344, 584, 322, 540]]) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  // wearable -> nube -> alertas
  ctx.fillStyle = '#c9ccd2';
  rrect(ctx, 28, 594, 22, 24, 6);
  ctx.fill();
  ctx.fillStyle = '#1b1e26';
  rrect(ctx, 31, 600, 16, 13, 3);
  ctx.fill();
  ctx.fillStyle = '#4aa3e8';
  ctx.beginPath();
  ctx.arc(104, 608, 9, Math.PI * 0.5, Math.PI * 1.5);
  ctx.arc(116, 603, 11, Math.PI, Math.PI * 2);
  ctx.arc(128, 609, 8, Math.PI * 1.5, Math.PI * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2f4f6';
  rrect(ctx, 176, 590, 40, 20, 4);
  ctx.fill();
  ctx.fillStyle = '#e24a4a';
  ctx.fillRect(190, 593, 4, 12);
  ctx.fillRect(186, 597, 12, 4);
  circle(ctx, 184, 612, 3.5, '#333');
  circle(ctx, 208, 612, 3.5, '#333');
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.6;
  for (const [x1, x2] of [[56, 90], [136, 170]]) {
    ctx.beginPath();
    ctx.moveTo(x1, 608);
    ctx.lineTo(x2, 608);
    ctx.lineTo(x2 - 5, 604);
    ctx.moveTo(x2, 608);
    ctx.lineTo(x2 - 5, 612);
    ctx.stroke();
  }
  text(ctx, 'Wearable', 40, 628, 8.5, { w: 700, align: 'center' });
  text(ctx, 'Nube', 116, 628, 8.5, { w: 700, align: 'center' });
  text(ctx, 'Alertas duales', 198, 628, 8.5, { w: 700, align: 'center' });

  // 5 Justificacion
  card(ctx, 492, 386, 241, 250, 5, 'JUSTIFICACIÓN');
  text(ctx, 'Beneficios Integrales y', 612, 436, 12, { w: 800, align: 'center' });
  text(ctx, 'Escala de impacto', 612, 450, 12, { w: 800, align: 'center', color: '#e8920c' });
  const bullets: [string[], string][] = [
    [['Previene incidentes fatales y', 'reduce mortalidad'], '#e24a4a'],
    [['Preserva la autonomía y', 'prolonga la permanencia en', 'el hogar'], '#2b6cb0'],
    [['Disminuye tiempos de', 'respuesta médica'], '#f0a020'],
    [['Alivia la carga psicofísica de', 'trabajo y estrés crónico en', 'cuidadores'], '#e24a4a'],
    [['Descongestiona el sistema de', 'salud y previene', 'complicaciones'], '#4aa3e8'],
  ];
  let by = 476;
  bullets.forEach(([rows, color]) => {
    circle(ctx, 512, by + ((rows.length - 1) * 10.5) / 2, 8, color);
    lines(ctx, rows, 530, by, 10.5, 9.3, { w: 600 });
    by += rows.length * 10.5 + 6;
  });

  // 6 Limitaciones
  card(ctx, 12, 650, 400, 255, 6, 'LIMITACIONES DE ALTERNATIVAS DEL\nMERCADO', 50);
  const RED = '#ff4b4b';
  const ORG = '#f6a623';
  const GRN = '#6aa84f';
  const cols = [70, 124, 90, 96];
  const heads = ['Item', 'Teleasistencia\nprivada', 'Domotica', 'Centros\nGeriatricos'];
  const body: [string, [string, string][]][] = [
    ['Costo', [[RED, 'alto\n(instalacion)'], [ORG, 'Medio'], [RED, 'Alto']]],
    ['Vulneración\na la\nprivacidad', [[ORG, 'Media'], [ORG, 'Media'], [RED, 'Alta']]],
    ['Brecha\nDigital', [[GRN, 'Baja'], [RED, 'Alta'], [GRN, 'Baja']]],
  ];
  let tx = 22;
  heads.forEach((h, i) => {
    cell(ctx, tx, 710, cols[i], 40, '#fbfbfb', h, 11);
    tx += cols[i];
  });
  body.forEach(([label, cells], r) => {
    const y = 750 + r * 51;
    cell(ctx, 22, y, cols[0], 51, '#fbfbfb', label, 10.5);
    let x = 22 + cols[0];
    cells.forEach(([color, t], i) => {
      cell(ctx, x, y, cols[i + 1], 51, color, t, 11);
      x += cols[i + 1];
    });
  });

  // 7 Impacto y rentabilidad
  card(ctx, 420, 650, 313, 255, 7, 'IMPACTO Y RENTABILIDAD');
  text(ctx, 'Precio', 492, 712, 17, { w: 800, align: 'center' });
  text(ctx, 'Wearable', 492, 738, 11.5, { w: 800, align: 'center' });
  text(ctx, '$170.000 COP', 492, 754, 11.5, { w: 800, align: 'center' });
  text(ctx, 'Suscripción', 492, 784, 11.5, { w: 800, align: 'center' });
  text(ctx, '$28.000 COP / Mes', 492, 800, 11.5, { w: 800, align: 'center' });
  ctx.fillStyle = '#cfe0f2';
  rrect(ctx, 448, 836, 88, 54, 4);
  ctx.fill();
  ctx.strokeStyle = '#7aa6d6';
  ctx.lineWidth = 1;
  rrect(ctx, 448, 836, 88, 54, 4);
  ctx.stroke();
  text(ctx, 'RC/B', 492, 854, 17, { w: 800, align: 'center', font: 'Courier New, monospace' });
  text(ctx, '3.05', 492, 876, 17, { w: 800, align: 'center', font: 'Courier New, monospace' });
  ctx.strokeStyle = '#8a8a90';
  ctx.beginPath();
  ctx.moveTo(566, 700);
  ctx.lineTo(566, 890);
  ctx.stroke();
  hospital(ctx, 648, 735);
  text(ctx, 'Impacto social', 648, 790, 13.5, { w: 800, align: 'center' });
  lines(ctx, ['• Ahorro al Sistema', '  de Salud Público'], 580, 820, 12, 10, { w: 700 });
  lines(ctx, ['• Preservación del', '  Bienestar Familiar'], 580, 858, 12, 10, { w: 700 });

  // Pie
  ctx.fillStyle = '#5b5b5d';
  ctx.fillRect(0, 915, W, 109);
  text(ctx, 'Facultad de Minas', 36, 962, 20, { italic: true, color: '#f1f1f1', font: 'Georgia, serif' });
  text(ctx, 'Sede Medellín', 36, 987, 20, { italic: true, color: '#f1f1f1', font: 'Georgia, serif' });
  ctx.fillStyle = '#f1f1f1';
  ctx.fillRect(397, 958, 8, 34);
  ctx.fillRect(409, 958, 8, 34);
  ctx.fillRect(397, 958, 28, 8);
  lines(ctx, ['Instituto de', 'Educación en', 'Ingeniería'], 432, 966, 12, 10, { w: 700, color: '#f1f1f1' });
  ctx.strokeStyle = '#a9a9ac';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(512, 940);
  ctx.lineTo(512, 1004);
  ctx.stroke();
  // Escudo simplificado (monocromo)
  ctx.strokeStyle = '#f1f1f1';
  ctx.fillStyle = '#f1f1f1';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(530, 950);
  ctx.lineTo(566, 950);
  ctx.lineTo(566, 972);
  ctx.quadraticCurveTo(566, 988, 548, 996);
  ctx.quadraticCurveTo(530, 988, 530, 972);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(548, 950);
  ctx.lineTo(548, 996);
  ctx.moveTo(530, 971);
  ctx.lineTo(566, 971);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(548, 944, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  spaced(ctx, 'UNIVERSIDAD', 650, 958, `500 12px ${SANS}`, 2.4, '#f1f1f1');
  spaced(ctx, 'NACIONAL', 650, 982, `600 25px ${SANS}`, 3, '#f1f1f1');
  spaced(ctx, 'DE COLOMBIA', 650, 1000, `500 12px ${SANS}`, 2.4, '#f1f1f1');
  return finish(canvas);
}
