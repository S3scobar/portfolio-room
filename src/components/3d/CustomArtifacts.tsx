'use client';

// Modelos 3D procedurales de los 16 artefactos de `roomLore.ts`.
// Convencion: unidades en metros, origen = punto de apoyo (base centrada) o punto de montaje
// en pared (centro del objeto, cara trasera sobre la pared, el objeto crece hacia +z local).
// `defaultScale` del lore es un multiplicador (1 = tamano real).
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Ink, RBox } from './parts';
import {
  aguilasFlagTexture,
  bookSpineTexture,
  interstellarPosterTexture,
  lumosBoxTexture,
  pinTexture,
  rng,
  unalFlagTexture,
} from '@/lib/canvasTextures';
import type { CustomArtifactModelProps } from '@/types/room';

type V = { glow: number; accent: string };

function Mat({
  color,
  rough = 0.7,
  metal = 0,
  glow = 0,
  accent,
  map,
}: {
  color?: string;
  rough?: number;
  metal?: number;
  glow?: number;
  accent?: string;
  map?: THREE.Texture | null;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={rough}
      metalness={metal}
      map={map ?? null}
      emissive={glow > 0 && accent ? accent : '#000000'}
      emissiveIntensity={glow}
    />
  );
}

// ---------------------------------------------------------------------------
// Pared: posters y banderas
// ---------------------------------------------------------------------------

function PosterFrame({
  tex,
  maxW,
  maxH,
  frame,
  glow,
  accent,
}: V & { tex: THREE.Texture; maxW: number; maxH: number; frame: string }) {
  const img = tex.image as { width: number; height: number };
  const aspect = img.width / img.height;
  let w = maxW;
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  return (
    <group>
      <RBox size={[w + 0.05, h + 0.05, 0.026]} r={0.008} color={frame} glow={glow} accent={accent} position={[0, 0, 0.013]} ink={0.008} />
      <mesh position={[0, 0, 0.0275]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.6} emissive={glow > 0 ? accent : '#000000'} emissiveIntensity={glow * 0.6} />
      </mesh>
    </group>
  );
}

/** Poster con imagen de /public/textures. */
function FramedPoster({ texturePath, ...rest }: V & { texturePath: string; maxW: number; maxH: number; frame: string }) {
  const tex = useTexture(texturePath);
  return <PosterFrame tex={tex} {...rest} />;
}

/** Poster dibujado por codigo (canvas), sin imagen externa. */
function InterstellarPoster(props: V & { maxW: number; maxH: number; frame: string }) {
  const tex = useMemo(() => interstellarPosterTexture(), []);
  return <PosterFrame tex={tex} {...props} />;
}

function HangingFlag({
  kind,
  w,
  h,
  glow,
  accent,
}: V & { kind: 'unal' | 'aguilas'; w: number; h: number }) {
  const tex = useMemo(() => (kind === 'unal' ? unalFlagTexture() : aguilasFlagTexture()), [kind]);
  const rodY = h / 2 + 0.035;
  return (
    <group>
      {/* Asta de madera con remates y soportes a la pared */}
      <mesh position={[0, rodY, 0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.014, 0.014, w + 0.14, 14]} />
        <Mat color="#7a4a29" rough={0.6} glow={glow} accent={accent} />
        <Ink t={0.006} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 + 0.08), rodY, 0.05]} castShadow>
          <sphereGeometry args={[0.026, 12, 10]} />
          <Mat color="#d4af37" metal={0.6} rough={0.35} />
          <Ink t={0.005} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <RBox key={s} size={[0.03, 0.03, 0.05]} r={0.008} color="#33291f" ink={0.005} position={[s * (w / 2 - 0.1), rodY, 0.022]} />
      ))}
      {/* Tela: caja delgada con la bandera en ambas caras */}
      <mesh position={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[w, h, 0.008]} />
        {[0, 1, 2, 3].map((i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color="#d8d2c0" roughness={0.8} />
        ))}
        <meshStandardMaterial attach="material-4" map={tex} roughness={0.75} emissive={glow > 0 ? accent : '#000000'} emissiveIntensity={glow * 0.5} />
        <meshStandardMaterial attach="material-5" map={tex} roughness={0.75} emissive={glow > 0 ? accent : '#000000'} emissiveIntensity={glow * 0.5} />
        <Ink t={0.008} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Escritorio: Xbox, Rubik, badge, Milo, Snoopy, musica
// ---------------------------------------------------------------------------

function XboxController({ glow, accent }: V) {
  const white = '#f3f3f0';
  return (
    <group>
      <RBox size={[0.108, 0.032, 0.062]} r={0.014} color={white} glow={glow} accent={accent} ink={0.004} position={[0, 0.034, 0]} />
      {[-1, 1].map((s) => (
        <RBox key={s} size={[0.034, 0.05, 0.075]} r={0.015} color={white} glow={glow} accent={accent} ink={0.004} position={[s * 0.046, 0.027, 0.035]} rotation={[0, -s * 0.35, 0]} />
      ))}
      {/* Gatillos/bumpers verdes */}
      {[-1, 1].map((s) => (
        <RBox key={s} size={[0.032, 0.012, 0.014]} r={0.005} color="#5fb21f" ink={0.003} position={[s * 0.034, 0.046, -0.032]} />
      ))}
      {/* Sticks */}
      {([[-0.034, -0.006], [0.018, 0.014]] as const).map(([x, z]) => (
        <mesh key={x} position={[x, 0.055, z]} castShadow>
          <cylinderGeometry args={[0.0095, 0.0105, 0.01, 14]} />
          <Mat color="#1a1a1c" rough={0.5} />
          <Ink t={0.002} />
        </mesh>
      ))}
      {/* Cruceta */}
      <RBox size={[0.016, 0.004, 0.005]} r={0.001} color="#2a2a2e" ink={false} position={[-0.016, 0.052, 0.016]} />
      <RBox size={[0.005, 0.004, 0.016]} r={0.001} color="#2a2a2e" ink={false} position={[-0.016, 0.052, 0.016]} />
      {/* Botones ABXY y boton Xbox verde */}
      {([['#3aa642', 0.036, 0.0], ['#d33a2f', 0.044, -0.008], ['#2d6fd3', 0.028, -0.008], ['#f0c020', 0.036, -0.016]] as const).map(([c, x, z]) => (
        <mesh key={c} position={[x, 0.0505, z + 0.006]}>
          <sphereGeometry args={[0.0058, 10, 8]} />
          <Mat color={c} rough={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.0505, -0.016]}>
        <sphereGeometry args={[0.0058, 12, 10]} />
        <Mat color="#59c21a" rough={0.3} glow={0.5} accent="#59c21a" />
      </mesh>
    </group>
  );
}

function XboxSeriesS({ glow, accent }: V) {
  return (
    <group>
      <RBox size={[0.275, 0.0635, 0.151]} r={0.008} color="#f2f2ef" rough={0.45} glow={glow} accent={accent} ink={0.004} position={[0, 0.03175, 0]} />
      {/* Rejilla circular negra superior */}
      <group position={[0.055, 0.0638, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <circleGeometry args={[0.052, 48]} />
          <meshStandardMaterial color="#0b0b0c" roughness={0.6} />
        </mesh>
        {[0.012, 0.022, 0.032, 0.042].map((r) => (
          <mesh key={r} position={[0, 0, 0.0004]}>
            <ringGeometry args={[r - 0.0009, r + 0.0009, 48]} />
            <meshBasicMaterial color="#35353a" />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.0004]}>
          <circleGeometry args={[0.004, 16]} />
          <meshBasicMaterial color="#35353a" />
        </mesh>
      </group>
      {/* Boton de encendido frontal */}
      <mesh position={[-0.108, 0.034, 0.0757]}>
        <circleGeometry args={[0.0065, 16]} />
        <meshStandardMaterial color="#d5d5d2" roughness={0.4} />
      </mesh>
      <group position={[0, 0, 0.2]} rotation={[0, 0.3, 0]}>
        <XboxController glow={glow} accent={accent} />
      </group>
    </group>
  );
}

const RUBIK_COLORS = ['#f5f5f0', '#ffd500', '#c41e3a', '#ff5800', '#0046ad', '#009b48'];
// Orden de caras: +x rojo, -x naranja, +y blanco, -y amarillo, +z verde, -z azul
const RUBIK_FACES: { n: [number, number, number]; rot: [number, number, number]; base: number }[] = [
  { n: [1, 0, 0], rot: [0, Math.PI / 2, 0], base: 2 },
  { n: [-1, 0, 0], rot: [0, -Math.PI / 2, 0], base: 3 },
  { n: [0, 1, 0], rot: [-Math.PI / 2, 0, 0], base: 0 },
  { n: [0, -1, 0], rot: [Math.PI / 2, 0, 0], base: 1 },
  { n: [0, 0, 1], rot: [0, 0, 0], base: 5 },
  { n: [0, 0, -1], rot: [0, Math.PI, 0], base: 4 },
];

function RubikCube({ glow, accent }: V) {
  const S = 0.0188;
  const P = 0.0194;
  const { cubie, sticker, cells } = useMemo(() => {
    const rand = rng(42);
    const list: { pos: [number, number, number]; stickers: { rot: [number, number, number]; pos: [number, number, number]; color: string }[] }[] = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const stickers: { rot: [number, number, number]; pos: [number, number, number]; color: string }[] = [];
          for (const f of RUBIK_FACES) {
            const idx = [x, y, z];
            const nIdx = f.n.findIndex((v) => v !== 0);
            if (idx[nIdx] !== f.n[nIdx]) continue;
            const ci = rand() < 0.4 ? f.base : Math.floor(rand() * 6);
            stickers.push({
              rot: f.rot,
              pos: [f.n[0] * (S / 2 + 0.0002), f.n[1] * (S / 2 + 0.0002), f.n[2] * (S / 2 + 0.0002)],
              color: RUBIK_COLORS[ci],
            });
          }
          list.push({ pos: [x * P, y * P, z * P], stickers });
        }
      }
    }
    return {
      cubie: new RoundedBoxGeometry(S, S, S, 2, 0.0025),
      sticker: new RoundedBoxGeometry(0.0148, 0.0148, 0.0008, 2, 0.0003),
      cells: list,
    };
  }, []);
  return (
    <group position={[0, P * 1.5 + 0.0005, 0]}>
      {cells.map((c, i) => (
        <group key={i} position={c.pos}>
          <mesh geometry={cubie} castShadow receiveShadow>
            <Mat color="#0e0e10" rough={0.4} glow={glow} accent={accent} />
            <Ink t={0.0012} />
          </mesh>
          {c.stickers.map((s, j) => (
            <mesh key={j} geometry={sticker} position={s.pos} rotation={s.rot}>
              <Mat color={s.color} rough={0.3} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

const UKE_FRETS = [0.0196, 0.038, 0.0557, 0.0727, 0.0888, 0.1042, 0.1188, 0.1327, 0.146, 0.1587, 0.1708, 0.175];

function Ukulele({ glow, accent }: V) {
  const bodyGeo = useMemo(() => {
    const right = (
      [[0, 0], [0.05, 0.008], [0.082, 0.04], [0.087, 0.075], [0.07, 0.1], [0.056, 0.118], [0.06, 0.138], [0.067, 0.162], [0.055, 0.19], [0.03, 0.2]] as const
    ).map(([x, y]) => new THREE.Vector2(x, y));
    const pts = new THREE.SplineCurve(right).getPoints(60);
    const left = pts.slice(1, -1).reverse().map((p) => new THREE.Vector2(-p.x, p.y));
    const shape = new THREE.Shape([...pts, ...left]);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
      curveSegments: 1,
    });
    geo.translate(0, 0, -0.025);
    return geo;
  }, []);
  const wood = '#d99a52';
  const woodSide = '#a8672f';
  return (
    <group>
      <mesh geometry={bodyGeo} castShadow receiveShadow>
        <meshStandardMaterial attach="material-0" color={wood} roughness={0.5} emissive={glow > 0 ? accent : '#000000'} emissiveIntensity={glow} />
        <meshStandardMaterial attach="material-1" color={woodSide} roughness={0.55} emissive={glow > 0 ? accent : '#000000'} emissiveIntensity={glow} />
        <Ink t={0.004} />
      </mesh>
      {/* Boca circular y roseta */}
      <mesh position={[0, 0.125, 0.0295]}>
        <circleGeometry args={[0.026, 32]} />
        <meshStandardMaterial color="#0d0806" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.125, 0.0297]}>
        <torusGeometry args={[0.03, 0.0022, 8, 40]} />
        <meshStandardMaterial color="#4a2a14" roughness={0.6} />
      </mesh>
      {/* Puente */}
      <RBox size={[0.06, 0.009, 0.012]} r={0.003} color="#3b2416" ink={0.002} position={[0, 0.045, 0.034]} />
      {/* Mastil y diapason */}
      <RBox size={[0.034, 0.21, 0.02]} r={0.006} color="#c98a4a" ink={0.003} position={[0, 0.295, 0.02]} />
      <RBox size={[0.03, 0.23, 0.005]} r={0.0015} color="#2c1a10" ink={false} position={[0, 0.285, 0.0335]} />
      {UKE_FRETS.map((d) => (
        <mesh key={d} position={[0, 0.4 - d, 0.0368]}>
          <boxGeometry args={[0.03, 0.0012, 0.0012]} />
          <meshStandardMaterial color="#cfcfd2" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {/* Clavijero con 4 clavijas */}
      <RBox size={[0.044, 0.075, 0.014]} r={0.006} color="#8a5a30" ink={0.003} position={[0, 0.4375, 0.02]} rotation={[-0.12, 0, 0]} />
      {[-1, 1].flatMap((s) => [0.42, 0.455].map((y) => (
        <group key={`${s}${y}`} position={[s * 0.024, y, 0.018]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0035, 0.0035, 0.014, 8]} />
            <meshStandardMaterial color="#b9b9bd" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[s * 0.01, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0065, 0.0065, 0.004, 10]} />
            <meshStandardMaterial color="#f0eadb" roughness={0.4} />
          </mesh>
        </group>
      )))}
      {/* Cuerdas */}
      {[-1.5, -0.5, 0.5, 1.5].map((k) => (
        <mesh key={k} position={[k * 0.0078, 0.2225, 0.0375]} rotation={[0, 0, -k * 0.0057 / 0.35]}>
          <cylinderGeometry args={[0.0006, 0.0006, 0.355, 5]} />
          <meshStandardMaterial color="#e9e6dc" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

const BOOKS = [
  { title: 'LA CUPULA', author: 'STEPHEN KING', bg: '#a31621', fg: '#f4e3c1', t: 0.045, len: 0.21, dx: 0, ry: 0.03 },
  { title: 'DUNE', author: 'FRANK HERBERT', bg: '#d9731f', fg: '#2a1608', t: 0.04, len: 0.2, dx: 0.01, ry: -0.04 },
  { title: 'MESIAS DE DUNE', author: 'F. HERBERT', bg: '#1d4f91', fg: '#f2e6c9', t: 0.03, len: 0.205, dx: -0.008, ry: 0.05 },
  { title: '11/22/63', author: 'STEPHEN KING', bg: '#1f4a4a', fg: '#f0d9a8', t: 0.035, len: 0.19, dx: 0.006, ry: -0.02 },
];

function Book({ b, glow, accent }: V & { b: (typeof BOOKS)[number] }) {
  const depth = 0.15;
  const spine = useMemo(() => bookSpineTexture(b.title, b.author, b.bg, b.fg, b.len / b.t), [b]);
  return (
    <group>
      <RBox size={[b.len, 0.004, depth]} r={0.0015} color={b.bg} glow={glow} accent={accent} ink={0.0025} position={[0, b.t / 2 - 0.002, 0]} />
      <RBox size={[b.len, 0.004, depth]} r={0.0015} color={b.bg} glow={glow} accent={accent} ink={0.0025} position={[0, -b.t / 2 + 0.002, 0]} />
      <RBox size={[b.len, b.t, 0.006]} r={0.002} color={b.bg} glow={glow} accent={accent} ink={0.0025} position={[0, 0, depth / 2 - 0.003]} />
      <mesh position={[0, 0, depth / 2 + 0.0006]}>
        <planeGeometry args={[b.len * 0.985, b.t * 0.92]} />
        <meshStandardMaterial map={spine} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, -0.004]}>
        <boxGeometry args={[b.len - 0.012, b.t - 0.008, depth - 0.012]} />
        <meshStandardMaterial color="#efe6cf" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Altura del centro de cada libro dentro de la pila (acumulado de grosores). */
const BOOK_CENTER_Y = BOOKS.map((b, i) => BOOKS.slice(0, i).reduce((acc, p) => acc + p.t, 0) + b.t / 2);

function BookStack({ glow, accent }: V) {
  return (
    <group>
      {BOOKS.map((b, i) => (
        <group key={b.title} position={[b.dx, BOOK_CENTER_Y[i], 0]} rotation={[0, b.ry, 0]}>
          <Book b={b} glow={glow} accent={accent} />
        </group>
      ))}
    </group>
  );
}

function LumosBox({ glow, accent }: V) {
  const tex = useMemo(() => lumosBoxTexture(), []);
  return (
    <group>
      <RBox size={[0.34, 0.2, 0.07]} r={0.012} color="#111111" glow={glow} accent={accent} ink={0.005} position={[0, 0.1, 0]} />
      <mesh position={[0, 0.1, 0.0356]}>
        <planeGeometry args={[0.3, 0.164]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.75} roughness={0.5} />
      </mesh>
      <pointLight position={[0, 0.1, 0.16]} color="#fff0d0" intensity={0.8} distance={1.2} />
    </group>
  );
}

function TottoBackpack({ glow, accent }: V) {
  const piTex = useMemo(() => pinTexture('\u03c0', '#2b2f3a', '#f2d24b'), []);
  const pins: { x: number; y: number; r: number; c: string; sides: number; map?: THREE.Texture }[] = [
    { x: -0.085, y: 0.36, r: 0.013, c: '#e0b13a', sides: 5 },
    { x: -0.03, y: 0.375, r: 0.015, c: '#c8201e', sides: 8 },
    { x: 0.03, y: 0.355, r: 0.014, c: '#f4f4f0', sides: 20, map: piTex },
    { x: 0.085, y: 0.37, r: 0.012, c: '#1e88e5', sides: 20 },
    { x: -0.06, y: 0.32, r: 0.011, c: '#2e9b57', sides: 6 },
    { x: 0.005, y: 0.32, r: 0.012, c: '#7e57c2', sides: 20 },
    { x: 0.065, y: 0.315, r: 0.011, c: '#e8e8ea', sides: 6 },
    { x: -0.095, y: 0.305, r: 0.009, c: '#ff8a3d', sides: 20 },
  ];
  return (
    <group>
      <RBox size={[0.3, 0.44, 0.16]} r={0.05} color="#15233f" rough={0.85} glow={glow} accent={accent} ink={0.007} position={[0, 0.22, 0]} />
      <RBox size={[0.26, 0.2, 0.07]} r={0.03} color="#101216" rough={0.85} ink={0.006} position={[0, 0.12, 0.1]} />
      <RBox size={[0.26, 0.006, 0.005]} r={0.001} color="#8b8f99" ink={false} position={[0, 0.215, 0.1]} />
      {[-1, 1].map((s) => (
        <RBox key={s} size={[0.06, 0.2, 0.1]} r={0.025} color="#101216" rough={0.85} ink={0.006} position={[s * 0.165, 0.11, 0.01]} />
      ))}
      <mesh position={[0, 0.455, 0]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.045, 0.008, 8, 20, Math.PI]} />
        <Mat color="#101216" rough={0.8} />
        <Ink t={0.004} />
      </mesh>
      {pins.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 0.0825]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[p.r, p.r, 0.006, p.sides]} />
          <meshStandardMaterial color={p.c} metalness={0.7} roughness={0.3} />
          <Ink t={0.0015} />
        </mesh>
      ))}
      {/* Pin de la caja con π: cara frontal con simbolo */}
      <mesh position={[0.03, 0.355, 0.0858]}>
        <circleGeometry args={[0.0125, 20]} />
        <meshStandardMaterial map={piTex} roughness={0.4} />
      </mesh>
      <RBox size={[0.07, 0.025, 0.004]} r={0.002} color="#e9e4d6" ink={0.002} position={[0, 0.2, 0.139]} />
    </group>
  );
}

function SnoopyFigure({ glow, accent }: V) {
  const white = '#f7f5ef';
  return (
    <group>
      <mesh position={[0, 0.036, 0]} scale={[1, 1.1, 0.9]} castShadow>
        <sphereGeometry args={[0.034, 16, 12]} />
        <Mat color={white} rough={0.45} glow={glow} accent={accent} />
        <Ink t={0.0025} />
      </mesh>
      {/* Mancha negra en el lomo */}
      <mesh position={[0, 0.046, -0.022]} scale={[1, 0.9, 0.5]}>
        <sphereGeometry args={[0.02, 12, 10]} />
        <Mat color="#151515" rough={0.5} />
      </mesh>
      {/* Cabeza, hocico y nariz */}
      <mesh position={[0, 0.088, 0.004]} castShadow>
        <sphereGeometry args={[0.03, 16, 12]} />
        <Mat color={white} rough={0.45} glow={glow} accent={accent} />
        <Ink t={0.0025} />
      </mesh>
      <mesh position={[0, 0.082, 0.032]} scale={[1, 0.75, 1.35]} castShadow>
        <sphereGeometry args={[0.019, 14, 10]} />
        <Mat color={white} rough={0.45} />
        <Ink t={0.002} />
      </mesh>
      <mesh position={[0, 0.088, 0.054]}>
        <sphereGeometry args={[0.0085, 10, 8]} />
        <Mat color="#0b0b0b" rough={0.3} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.0105, 0.1, 0.027]}>
            <sphereGeometry args={[0.0035, 8, 6]} />
            <Mat color="#0b0b0b" />
          </mesh>
          {/* Orejas largas y negras */}
          <mesh position={[s * 0.03, 0.078, 0.003]} rotation={[0, 0, s * 0.18]} scale={[0.6, 2.3, 0.9]} castShadow>
            <sphereGeometry args={[0.0145, 10, 8]} />
            <Mat color="#121212" rough={0.5} />
            <Ink t={0.002} />
          </mesh>
          {/* Patas delanteras */}
          <mesh position={[s * 0.016, 0.014, 0.026]} scale={[1, 0.7, 1.3]} castShadow>
            <sphereGeometry args={[0.012, 10, 8]} />
            <Mat color={white} rough={0.45} />
            <Ink t={0.0018} />
          </mesh>
        </group>
      ))}
      {/* Cola */}
      <mesh position={[0, 0.02, -0.032]} castShadow>
        <sphereGeometry args={[0.008, 8, 6]} />
        <Mat color="#121212" />
      </mesh>
    </group>
  );
}

function BadgeUnal({ glow, accent }: V) {
  const tex = useTexture('/textures/badge-minas-card.webp');
  const img = tex.image as { width: number; height: number };
  const h = 0.115;
  const w = h * (img.width / img.height);
  const cord = useMemo(() => {
    const pts = ([[0, -0.05], [0.045, -0.1], [0.07, -0.18], [0.02, -0.26], [-0.04, -0.24], [-0.07, -0.16], [-0.04, -0.09]] as const).map(
      ([x, z]) => new THREE.Vector3(x, 0.0016, z),
    );
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 60, 0.0016, 6, true);
  }, []);
  return (
    <group>
      <RBox size={[w, 0.003, h]} r={0.0012} color="#1e6b8c" glow={glow} accent={accent} ink={0.0018} position={[0, 0.0015, 0]} />
      <mesh position={[0, 0.0033, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.96, h * 0.96]} />
        <meshStandardMaterial map={tex} roughness={0.55} />
      </mesh>
      <mesh geometry={cord} castShadow>
        <Mat color="#1f6fb5" rough={0.7} />
      </mesh>
      <mesh position={[0, 0.003, -h / 2 - 0.004]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.005, 0.0012, 8, 14]} />
        <Mat color="#c9c9cd" metal={0.8} rough={0.3} />
      </mesh>
      {/* Zona de impacto amplia para el raton (la credencial es muy delgada) */}
      <mesh position={[0, 0.01, -0.05]}>
        <boxGeometry args={[0.16, 0.02, 0.32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function MiloFrame({ glow, accent }: V) {
  const tex = useTexture('/textures/milo-upright.webp');
  const img = tex.image as { width: number; height: number };
  const ph = 0.16;
  const pw = ph * (img.width / img.height);
  return (
    <group>
      <group rotation={[-0.2, 0, 0]}>
        <RBox size={[pw + 0.03, ph + 0.03, 0.014]} r={0.004} color="#7a4a29" glow={glow} accent={accent} ink={0.004} position={[0, (ph + 0.03) / 2 + 0.01, 0]} />
        <mesh position={[0, (ph + 0.03) / 2 + 0.01, 0.0072]}>
          <planeGeometry args={[pw, ph]} />
          <meshStandardMaterial map={tex} roughness={0.4} />
        </mesh>
        <RBox size={[0.022, ph * 0.8, 0.005]} r={0.002} color="#5a3820" ink={0.002} position={[0, ph * 0.45, -0.032]} rotation={[0.35, 0, 0]} />
      </group>
    </group>
  );
}

function VinylAndHeadphones({ glow, accent }: V) {
  return (
    <group>
      {/* Cajon de madera con dos fundas y un disco asomando */}
      <RBox size={[0.2, 0.03, 0.06]} r={0.006} color="#8a5836" glow={glow} accent={accent} ink={0.004} position={[0, 0.015, 0]} />
      <RBox size={[0.19, 0.19, 0.004]} r={0.002} color="#0284c7" ink={0.003} position={[0, 0.11, -0.016]} rotation={[-0.08, 0, 0]} />
      <RBox size={[0.19, 0.19, 0.004]} r={0.002} color="#f2f0ea" ink={0.003} position={[0, 0.11, 0.018]} rotation={[-0.08, 0, 0]} />
      <group position={[0.0, 0.135, 0.001]} rotation={[-0.08, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.092, 0.092, 0.0025, 40]} />
          <Mat color="#0c0c0e" rough={0.25} metal={0.2} />
          <Ink t={0.002} />
        </mesh>
        <mesh position={[0, 0, 0.0014]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.0008, 24]} />
          <Mat color="#f08a2e" rough={0.5} />
        </mesh>
      </group>
      {/* Audifonos sobre el escritorio */}
      <group position={[0.01, 0, 0.17]} rotation={[0, 0.4, 0]}>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.075, 0.04, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.026, 20]} />
              <Mat color="#17181c" rough={0.5} />
              <Ink t={0.003} />
            </mesh>
            <mesh position={[-s * 0.014, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.034, 0.008, 8, 20]} />
              <Mat color="#2a2c33" rough={0.8} />
            </mesh>
            <mesh position={[s * 0.014, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <ringGeometry args={[0.01, 0.02, 16]} />
              <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.4} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.04, 0]} castShadow>
          <torusGeometry args={[0.075, 0.0065, 8, 28, Math.PI]} />
          <Mat color="#17181c" rough={0.5} />
          <Ink t={0.003} />
        </mesh>
      </group>
    </group>
  );
}

function Fallback({ glow, accent }: V) {
  return <RBox size={[0.1, 0.1, 0.1]} color="#cccccc" glow={glow} accent={accent} position={[0, 0.05, 0]} />;
}

/** Punto de entrada: devuelve el modelo procedural correspondiente al id del lore. */
export function CustomArtifactModel({ id, glow, accent }: CustomArtifactModelProps) {
  const v: V = { glow, accent };
  switch (id) {
    case 'flag-unal':
      return <HangingFlag kind="unal" w={0.82} h={0.51} {...v} />;
    case 'flag-aguilas':
      return <HangingFlag kind="aguilas" w={0.82} h={0.51} {...v} />;
    case 'poster-hp':
      return <FramedPoster texturePath="/textures/poster-hp.webp" maxW={0.8} maxH={0.7} frame="#2a2421" {...v} />;
    case 'poster-interstellar':
      return <InterstellarPoster maxW={0.62} maxH={0.72} frame="#16181c" {...v} />;
    case 'poster-dune-sw-marvel':
      return <FramedPoster texturePath="/textures/poster-dune.webp" maxW={0.7} maxH={0.7} frame="#3a2a18" {...v} />;
    case 'poster-cr7':
      return <FramedPoster texturePath="/textures/poster-cr7.webp" maxW={0.6} maxH={0.6} frame="#1b2a4a" {...v} />;
    case 'xbox-series-s':
      return <XboxSeriesS {...v} />;
    case 'rubik-cube':
      return <RubikCube {...v} />;
    case 'ukulele-wood':
      return <Ukulele {...v} />;
    case 'books-stephen-king':
      return <BookStack {...v} />;
    case 'lightbox-lumos':
      return <LumosBox {...v} />;
    case 'totto-backpack-pins':
      return <TottoBackpack {...v} />;
    case 'snoopy-figure':
      return <SnoopyFigure {...v} />;
    case 'badge-minas':
      return <BadgeUnal {...v} />;
    case 'photo-milo':
      return <MiloFrame {...v} />;
    case 'music-avicii-garrix':
      return <VinylAndHeadphones {...v} />;
    default:
      return <Fallback {...v} />;
  }
}
