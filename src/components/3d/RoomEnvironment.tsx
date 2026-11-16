'use client';

// Entorno procedural de la habitacion (+-2.5 m, alto 3 m). Reemplaza a RoomModel (GLB gris)
// y a RoomFurniture. Paredes de una sola cara con la normal hacia adentro: desde fuera
// quedan invisibles (corte tipo diorama). Eje +x = pared derecha, -x = ventana, -z = fondo.
import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';
import { Ink, RBox } from './parts';
import {
  lightBeamTexture,
  paintedWallTexture,
  rugTexture,
  woodFloorTexture,
} from '@/lib/canvasTextures';
import { WINDOW_LAYER_DISTANCE, WINDOW_VIEW, windowViewTextures, type WindowLayerKey } from '@/lib/windowView';

export const ROOM = { half: 2.5, height: 3 } as const;

/** Hueco del ventanal en coordenadas locales de la pared izquierda (u = -z mundo). */
export const WINDOW = { uMin: -0.45, uMax: 1.25, yMin: 0.8, yMax: 2.6 } as const;
const WINDOW_CENTER_WORLD = new THREE.Vector3(-ROOM.half, (WINDOW.yMin + WINDOW.yMax) / 2, -(WINDOW.uMin + WINDOW.uMax) / 2);

const WOOD = '#b0764a';
const WOOD_DARK = '#8a5836';
const WOOD_FRAME = '#7a4a29';
const CREAM = '#f6ead3';

function Floor() {
  const map = useMemo(() => woodFloorTexture(2.5), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[ROOM.half * 2, ROOM.half * 2]} />
      <meshStandardMaterial map={map} roughness={0.62} />
    </mesh>
  );
}

function Walls() {
  const back = useMemo(() => paintedWallTexture('#f1dcb4', 11, [2.5, 1.5]), []);
  const right = useMemo(() => paintedWallTexture('#eed3a6', 23, [2.5, 1.5]), []);
  const left = useMemo(() => paintedWallTexture('#d9a07e', 37, [0.5, 0.5]), []);
  const leftShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-ROOM.half, 0);
    s.lineTo(ROOM.half, 0);
    s.lineTo(ROOM.half, ROOM.height);
    s.lineTo(-ROOM.half, ROOM.height);
    s.closePath();
    const hole = new THREE.Path();
    hole.moveTo(WINDOW.uMin, WINDOW.yMin);
    hole.lineTo(WINDOW.uMin, WINDOW.yMax);
    hole.lineTo(WINDOW.uMax, WINDOW.yMax);
    hole.lineTo(WINDOW.uMax, WINDOW.yMin);
    hole.closePath();
    s.holes.push(hole);
    return s;
  }, []);
  const H = ROOM.height;
  return (
    <group name="walls">
      <mesh position={[0, H / 2, -ROOM.half]} receiveShadow>
        <planeGeometry args={[ROOM.half * 2, H]} />
        <meshStandardMaterial map={back} roughness={0.95} />
      </mesh>
      <mesh position={[ROOM.half, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.half * 2, H]} />
        <meshStandardMaterial map={right} roughness={0.95} />
      </mesh>
      {/* Pared izquierda con hueco: proyecta el parche de luz de la ventana. */}
      <mesh position={[-ROOM.half, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <shapeGeometry args={[leftShape]} />
        <meshStandardMaterial map={left} roughness={0.95} />
      </mesh>
    </group>
  );
}

function Baseboards() {
  const len = ROOM.half * 2;
  return (
    <group name="baseboards">
      <RBox size={[len, 0.12, 0.03]} r={0.008} color={CREAM} ink={0.006} position={[0, 0.06, -ROOM.half + 0.015]} />
      <RBox size={[len, 0.12, 0.03]} r={0.008} color={CREAM} ink={0.006} position={[ROOM.half - 0.015, 0.06, 0]} rotation={[0, Math.PI / 2, 0]} />
      <RBox size={[len, 0.12, 0.03]} r={0.008} color={CREAM} ink={0.006} position={[-ROOM.half + 0.015, 0.06, 0]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
}

/** Hoja de ventana abierta (marco sin vidrio). */
function SashLeaf() {
  const w = 0.82;
  const h = 1.72;
  const t = 0.05;
  return (
    <group>
      <RBox size={[t, h, 0.04]} r={0.006} color={WOOD_FRAME} ink={0.007} position={[t / 2, 0, 0]} />
      <RBox size={[t, h, 0.04]} r={0.006} color={WOOD_FRAME} ink={0.007} position={[w - t / 2, 0, 0]} />
      <RBox size={[w, t, 0.04]} r={0.006} color={WOOD_FRAME} ink={0.007} position={[w / 2, h / 2 - t / 2, 0]} />
      <RBox size={[w, t, 0.04]} r={0.006} color={WOOD_FRAME} ink={0.007} position={[w / 2, -h / 2 + t / 2, 0]} />
      <RBox size={[w, 0.035, 0.03]} r={0.005} color={WOOD_FRAME} ink={0.006} position={[w / 2, 0.1, 0]} />
    </group>
  );
}

/** Ventanal abierto con marco de madera. Coordenadas locales de la pared izquierda. */
function Ventanal() {
  const wU = WINDOW.uMax - WINDOW.uMin;
  const hY = WINDOW.yMax - WINDOW.yMin;
  const cu = (WINDOW.uMin + WINDOW.uMax) / 2;
  const cy = (WINDOW.yMin + WINDOW.yMax) / 2;
  const bar = 0.1;
  const depth = 0.16;
  return (
    <group position={[-ROOM.half, 0, 0]} rotation={[0, Math.PI / 2, 0]} name="ventanal">
      <RBox size={[bar, hY + bar, depth]} r={0.012} color={WOOD_FRAME} ink={0.01} position={[WINDOW.uMin - bar / 2 + 0.02, cy, 0]} />
      <RBox size={[bar, hY + bar, depth]} r={0.012} color={WOOD_FRAME} ink={0.01} position={[WINDOW.uMax + bar / 2 - 0.02, cy, 0]} />
      <RBox size={[wU + bar * 2 - 0.04, bar, depth]} r={0.012} color={WOOD_FRAME} ink={0.01} position={[cu, WINDOW.yMax + bar / 2 - 0.02, 0]} />
      {/* Travesano y poste central */}
      <RBox size={[0.05, hY, 0.06]} r={0.008} color={WOOD_FRAME} ink={0.008} position={[cu, cy, 0]} />
      <RBox size={[wU, 0.05, 0.06]} r={0.008} color={WOOD_FRAME} ink={0.008} position={[cu, WINDOW.yMax - 0.5, 0]} />
      {/* Alfeizar */}
      <RBox size={[wU + 0.3, 0.05, 0.34]} r={0.01} color="#9b6a40" ink={0.01} position={[cu, WINDOW.yMin - 0.015, 0.06]} />
      {/* Hoja abierta hacia el interior, bisagra en el borde u = uMin */}
      <group position={[WINDOW.uMin + 0.04, cy, 0.05]} rotation={[0, -1.15, 0]}>
        <SashLeaf />
      </group>
    </group>
  );
}

/**
 * Paisaje exterior en capas (cielo, nubes, montanas, torres, arboles, casas y calle) detras del ventanal.
 * Cada capa es un plano a distinta distancia, orientado hacia la camara inicial y escalado con la
 * distancia: desde esa camara se componen en una sola imagen, y al orbitar se separan (parallax).
 * Si cambias la camara inicial de RoomCanvas, actualiza `WINDOW_VIEW.camera`.
 */
function WindowView() {
  const textures = useMemo(() => windowViewTextures(), []);
  useEffect(() => () => Object.values(textures).forEach((t) => t.dispose()), [textures]);
  const { quaternion, forward, camera } = useMemo(() => {
    const cam = new THREE.Vector3(...WINDOW_VIEW.camera);
    const f = new THREE.Vector3(...WINDOW_VIEW.windowCenter).sub(cam).normalize();
    const right = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, f);
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, f.clone().negate()));
    return { quaternion: q, forward: f, camera: cam };
  }, []);
  const keys = Object.keys(WINDOW_LAYER_DISTANCE) as WindowLayerKey[];
  return (
    <group name="window-view">
      {keys.map((key, i) => {
        const d = WINDOW_LAYER_DISTANCE[key];
        const isSky = key === 'sky';
        const w = isSky ? WINDOW_VIEW.skyTanHalf * 2 * d : WINDOW_VIEW.layerSize[0] * WINDOW_VIEW.tanPerPx * d;
        const h = isSky ? w : WINDOW_VIEW.layerSize[1] * WINDOW_VIEW.tanPerPx * d;
        return (
          <mesh
            key={key}
            position={camera.clone().addScaledVector(forward, d)}
            quaternion={quaternion}
            renderOrder={i - keys.length}
          >
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial
              map={textures[key]}
              transparent={!isSky}
              depthWrite={isSky}
              side={THREE.DoubleSide}
              toneMapped={false}
              fog={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** Haz diagonal de luz calida (planos en abanico con gradiente aditivo) y particulas flotantes. */
function LightShaft() {
  const map = useMemo(() => lightBeamTexture(), []);
  const target = useMemo(() => new THREE.Vector3(0.1, 0, -0.3), []);
  const { quaternion, length } = useMemo(() => {
    const dir = target.clone().sub(WINDOW_CENTER_WORLD);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
    return { quaternion: q, length: dir.length() };
  }, [target]);
  return (
    <group name="light-shaft">
      <group position={WINDOW_CENTER_WORLD} quaternion={quaternion}>
        {[0, Math.PI / 3, (2 * Math.PI) / 3].map((a) => (
          <group key={a} rotation={[0, 0, a]}>
            <mesh position={[0, 0, length / 2]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.5, length]} />
              <meshBasicMaterial
                map={map}
                transparent
                opacity={0.55}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </group>
      <Sparkles
        count={70}
        speed={0.25}
        opacity={0.9}
        color="#ffe2a8"
        size={4}
        noise={0.6}
        scale={[3.1, 1.5, 1.4]}
        position={[-1.15, 0.95, -0.35]}
        rotation={[0, 0, -0.59]}
      />
    </group>
  );
}

function Rug() {
  const map = useMemo(() => rugTexture(), []);
  return (
    <mesh position={[0, 0.0125, 0]} receiveShadow>
      <boxGeometry args={[2.4, 0.025, 2.0]} />
      <meshStandardMaterial attach="material-0" color="#2b4a8c" roughness={0.95} />
      <meshStandardMaterial attach="material-1" color="#2b4a8c" roughness={0.95} />
      <meshStandardMaterial attach="material-2" map={map} roughness={0.95} />
      <meshStandardMaterial attach="material-3" color="#1d3566" roughness={0.95} />
      <meshStandardMaterial attach="material-4" color="#2b4a8c" roughness={0.95} />
      <meshStandardMaterial attach="material-5" color="#2b4a8c" roughness={0.95} />
    </mesh>
  );
}

function Desk() {
  const legs: [number, number][] = [
    [-1.15, -0.38],
    [1.15, -0.38],
    [-1.15, 0.38],
    [1.15, 0.38],
  ];
  return (
    <group position={[0, 0, -1.8]} name="desk">
      <RBox size={[2.5, 0.06, 0.9]} r={0.012} color={WOOD} rough={0.5} position={[0, 0.75, 0]} />
      <RBox size={[2.3, 0.28, 0.03]} r={0.006} color={WOOD_DARK} position={[0, 0.58, -0.4]} />
      {legs.map(([x, z]) => (
        <RBox key={`${x}${z}`} size={[0.07, 0.72, 0.07]} r={0.01} color={WOOD_DARK} position={[x, 0.36, z]} />
      ))}
      {/* Alfombrilla, teclado y raton */}
      <RBox size={[0.7, 0.006, 0.3]} r={0.003} color="#2f3a4f" ink={0.004} position={[0, 0.783, 0.15]} />
      <RBox size={[0.42, 0.018, 0.14]} r={0.006} color="#d9d2c3" ink={0.006} position={[-0.05, 0.798, 0.15]} />
      <RBox size={[0.06, 0.024, 0.1]} r={0.01} color="#2a2f3a" ink={0.005} position={[0.22, 0.798, 0.15]} />
      <Monitor />
    </group>
  );
}

/** Monitor: `monitor-screen` es el ancla del Mini-OS de LUKA (Sprint 2). */
function Monitor() {
  return (
    <group position={[0, 0.78, -0.2]}>
      <mesh position={[0, 0.012, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.024, 20]} />
        <meshStandardMaterial color="#1b2230" roughness={0.35} metalness={0.6} />
        <Ink t={0.006} />
      </mesh>
      <RBox size={[0.06, 0.3, 0.04]} r={0.01} color="#232c3d" metal={0.5} ink={0.006} position={[0, 0.16, -0.04]} />
      <RBox size={[0.96, 0.58, 0.04]} r={0.014} color="#141a27" rough={0.3} metal={0.4} ink={0.01} position={[0, 0.38, 0]} />
      <mesh name="monitor-screen" position={[0, 0.38, 0.022]}>
        <planeGeometry args={[0.9, 0.52]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>
    </group>
  );
}

function Chair() {
  return (
    <group position={[0, 0, -1.15]} name="chair">
      <RBox size={[0.48, 0.08, 0.46]} r={0.03} color="#3f6f7a" position={[0, 0.48, 0]} />
      <RBox size={[0.44, 0.5, 0.06]} r={0.025} color="#34606a" position={[0, 0.8, 0.2]} rotation={[-0.08, 0, 0]} />
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.42, 12]} />
        <meshStandardMaterial color="#4a3a33" roughness={0.4} metalness={0.5} />
        <Ink t={0.006} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <RBox size={[0.3, 0.035, 0.05]} r={0.012} color="#3a2a22" ink={0.005} position={[0.15, 0.06, 0]} />
            <mesh position={[0.29, 0.03, 0]} castShadow>
              <sphereGeometry args={[0.03, 10, 8]} />
              <meshStandardMaterial color="#1e1713" roughness={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Shelves() {
  return (
    <group position={[0, 0, -2.36]} name="shelves">
      {[1.6, 2.1].map((y) => (
        <group key={y}>
          <RBox size={[2.0, 0.04, 0.3]} r={0.01} color="#a56a3b" rough={0.5} position={[0, y, 0]} />
          {[-0.8, 0.8].map((x) => (
            <RBox key={x} size={[0.04, 0.16, 0.22]} r={0.008} color="#33291f" ink={0.006} position={[x, y - 0.1, -0.03]} />
          ))}
        </group>
      ))}
    </group>
  );
}

function Bed() {
  return (
    <group position={[1.55, 0, 0.4]} name="bed">
      <RBox size={[1.1, 0.3, 2.1]} r={0.03} color="#8b5a35" position={[0, 0.17, 0]} />
      <RBox size={[1.12, 0.62, 0.07]} r={0.03} color="#7a4a29" position={[0, 0.46, -1.07]} />
      <RBox size={[1.04, 0.16, 2.0]} r={0.05} color="#f1e3c8" rough={0.9} position={[0, 0.39, 0]} />
      <RBox size={[1.07, 0.1, 1.45]} r={0.04} color="#3d6fb0" rough={0.9} position={[0, 0.47, 0.25]} />
      <RBox size={[0.7, 0.12, 0.38]} r={0.05} color="#f7efe0" rough={0.95} position={[0, 0.51, -0.75]} />
    </group>
  );
}

export function RoomEnvironment() {
  return (
    <>
      {/* Directo bajo la escena (no dentro de un group): ttach se aplica al padre inmediato. */}
      <color attach="background" args={['#7a5870']} />
      <group name="room-environment">
      <Floor />
      <Walls />
      <Baseboards />
      <Ventanal />
      <WindowView />
      <LightShaft />
      <Rug />
      <Desk />
      <Chair />
      <Shelves />
      <Bed />
      </group>
    </>
  );
}
