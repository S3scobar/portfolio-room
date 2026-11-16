'use client';

// Milo: gato atigrado 3D procedural que camina solo entre puntos libres del suelo (esquivando
// escritorio, silla, cama y morral), mueve patas y cola, se sienta por momentos y abre su ficha
// narrativa (`photo-milo` del lore) al hacerle clic. Mientras la ficha esta abierta, se queda sentado.
// Marco local del gato: +z adelante, +y arriba. Sin estado de React por fotograma (todo en refs).
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ink } from './parts';
import { useRoomStore } from '@/store/useRoomStore';
import { CAT_WAYPOINTS, buildNeighbors } from '@/lib/catNavigation';
import { isPointerLocked } from '@/lib/pointerLock';
import type { CatBehavior } from '@/types/room';

/** Id del lore cuya ficha se muestra al hacer clic en el gato. */
export const MILO_LORE_ID = 'photo-milo';

const FUR = '#8a6a46';
const FUR_DARK = '#3d2e22';
const FUR_LIGHT = '#b39069';
const CREAM = '#e2d3b4';

const WALK_SPEED = 0.34;
const LEG_LEN = 0.16;
const PIV = { y: 0.07, z: -0.14 };
const SIT_PITCH = 0.55;
const SIT_DROP = 0.1;
const TAIL_SEGMENTS = 7;
const STRIPE_Z = [-0.09, -0.045, 0, 0.045, 0.09];

interface LegRefs {
  pivot: THREE.Object3D | null;
  upper: THREE.Object3D | null;
  paw: THREE.Object3D | null;
}

function shortestAngle(from: number, to: number) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

interface CatSim {
  init: boolean;
  x: number;
  z: number;
  yaw: number;
  current: number;
  target: number;
  mode: CatBehavior;
  timer: number;
  phase: number;
  sit: number;
  t: number;
}

const newSim = (): CatSim => ({ init: false, x: 0, z: 0, yaw: 0, current: 0, target: 0, mode: 'walking', timer: 0, phase: 0, sit: 0, t: 0 });

/** Elige el siguiente waypoint alcanzable (prefiere los que estan a mas de 0.7 m). */
function pickNext(s: CatSim, neighbors: number[][]) {
  const a = CAT_WAYPOINTS[s.current].position;
  const far = neighbors[s.current].filter((j) => {
    const b = CAT_WAYPOINTS[j].position;
    return Math.hypot(a[0] - b[0], a[1] - b[1]) > 0.7;
  });
  const list = far.length ? far : neighbors[s.current];
  s.target = list[Math.floor(Math.random() * list.length)];
}

/** Avanza la maquina de estados (caminar / sentarse). Devuelve true si el gato se esta desplazando. */
function advanceCat(s: CatSim, dt: number, neighbors: number[][], selected: boolean, pose?: CatBehavior): boolean {
  s.t += dt;
  if (!s.init) {
    s.init = true;
    s.current = Math.floor(Math.random() * CAT_WAYPOINTS.length);
    s.x = CAT_WAYPOINTS[s.current].position[0];
    s.z = CAT_WAYPOINTS[s.current].position[1];
    pickNext(s, neighbors);
  }
  let moving = false;
  if (pose) {
    s.mode = pose;
    s.x = 0;
    s.z = 0;
  } else if (s.mode === 'walking' && !selected) {
    const tp = CAT_WAYPOINTS[s.target].position;
    const dx = tp[0] - s.x;
    const dz = tp[1] - s.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.06) {
      s.current = s.target;
      if (Math.random() < (CAT_WAYPOINTS[s.current].sitSpot ? 0.8 : 0.22)) {
        s.mode = 'sitting';
        s.timer = 3 + Math.random() * 4;
      } else {
        pickNext(s, neighbors);
      }
    } else {
      const diff = shortestAngle(s.yaw, Math.atan2(dx, dz));
      s.yaw += diff * Math.min(1, dt * 6);
      const speed = WALK_SPEED * THREE.MathUtils.clamp(1 - Math.abs(diff) / 1.6, 0.15, 1);
      const step = Math.min(dist, speed * dt);
      s.x += (dx / dist) * step;
      s.z += (dz / dist) * step;
      moving = speed > 0.05;
    }
  } else {
    if (selected) s.mode = 'sitting';
    s.timer -= dt;
    if (s.timer <= 0 && !selected) {
      s.mode = 'walking';
      pickNext(s, neighbors);
    }
  }
  s.sit += ((s.mode === 'sitting' ? 1 : 0) - s.sit) * Math.min(1, dt * 3.5);
  if (moving || (pose === 'walking' && s.sit < 0.2)) s.phase += dt * 9;
  return moving;
}

function Fur({ color = FUR }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.92} />;
}

function Leg({ index, position, front }: { index: number; position: [number, number, number]; front: boolean }) {
  return (
    <group name={`leg-${index}`} position={position}>
      <mesh name={`leg-${index}-upper`} position={[0, -0.07, 0]} castShadow>
        <capsuleGeometry args={[front ? 0.021 : 0.024, 0.08, 4, 8]} />
        <Fur />
        <Ink t={0.004} />
      </mesh>
      <mesh name={`leg-${index}-paw`} position={[0, -0.135, 0.008]} scale={[1, 0.7, 1.35]} castShadow>
        <sphereGeometry args={[0.024, 10, 8]} />
        <Fur color={CREAM} />
        <Ink t={0.004} />
      </mesh>
    </group>
  );
}

function TailSegment({ index }: { index: number }) {
  const r = 0.0185 - index * 0.0013;
  const dark = index % 2 === 1 || index === TAIL_SEGMENTS - 1;
  return (
    <group name={`tail-${index}`} position={[0, index === 0 ? 0 : 0.045, 0]}>
      <mesh position={[0, 0.0225, 0]} castShadow>
        <capsuleGeometry args={[r, 0.04, 4, 8]} />
        <Fur color={dark ? FUR_DARK : FUR} />
        <Ink t={0.003} />
      </mesh>
      {index < TAIL_SEGMENTS - 1 && <TailSegment index={index + 1} />}
    </group>
  );
}

export interface MiloCatProps {
  /** Fuerza una pose fija en el origen (verificacion visual). Sin esta prop el gato camina solo. */
  pose?: CatBehavior;
}

export function MiloCat({ pose }: MiloCatProps) {
  const root = useRef<THREE.Group>(null);
  const sim = useRef<CatSim | null>(null);
  const rig = useRef<{ pitch: THREE.Object3D; head: THREE.Object3D; tailBase: THREE.Object3D; legs: LegRefs[]; tail: (THREE.Object3D | null)[] } | null>(null);
  const neighbors = useMemo(() => buildNeighbors(), []);

  useFrame((_, rawDelta) => {
    const g = root.current;
    if (!g) return;
    // Localiza una sola vez los nodos animados por nombre
    if (!rig.current) {
      const get = (n: string) => g.getObjectByName(n) ?? null;
      const pitch = get('cat-pitch');
      const head = get('cat-head');
      const tailBase = get('cat-tail-base');
      if (!pitch || !head || !tailBase) return;
      rig.current = {
        pitch,
        head,
        tailBase,
        legs: [0, 1, 2, 3].map((i) => ({ pivot: get(`leg-${i}`), upper: get(`leg-${i}-upper`), paw: get(`leg-${i}-paw`) })),
        tail: Array.from({ length: TAIL_SEGMENTS }, (_, i) => get(`tail-${i}`)),
      };
    }
    if (!sim.current) sim.current = newSim();
    const s = sim.current;
    const r = rig.current;
    const dt = Math.min(rawDelta, 0.05);
    advanceCat(s, dt, neighbors, useRoomStore.getState().selectedArtifactId === MILO_LORE_ID, pose);

    const sit = s.sit;
    const walkAmt = 1 - sit;
    const swing = Math.sin(s.phase) * 0.55 * walkAmt;

    // Posicion, orientacion y leve escala en hover (el hover viene del store: cursor libre o mira)
    const isHover = useRoomStore.getState().hoveredArtifactId === MILO_LORE_ID;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, isHover ? 1.07 : 1, Math.min(1, dt * 10)));
    g.position.set(s.x, Math.abs(Math.sin(s.phase * 2)) * 0.006 * walkAmt, s.z);
    g.rotation.y = s.yaw;

    // Torso al sentarse: se levanta el frente y se baja el cuarto trasero
    const th = -SIT_PITCH * sit;
    r.pitch.rotation.x = th;
    r.pitch.position.y = PIV.y - SIT_DROP * sit;

    // Patas: diagonales al caminar; al sentarse, delanteras verticales y traseras recogidas hacia delante
    const frontHipY = r.pitch.position.y + (0.16 - PIV.y) * Math.cos(th) - (0.1 - PIV.z) * Math.sin(th);
    const ext = THREE.MathUtils.clamp(frontHipY / LEG_LEN, 0.9, 1.7);
    const rotFront = swing + SIT_PITCH * sit;
    const rotHind = swing - 1.0 * sit;
    const rots = [rotFront, -rotFront + 2 * SIT_PITCH * sit, -rotHind - 2 * 1.0 * sit, rotHind];
    r.legs.forEach((leg, i) => {
      if (!leg.pivot) return;
      leg.pivot.rotation.x = rots[i];
      const e = i < 2 ? ext : 1;
      if (leg.upper) {
        leg.upper.scale.y = e;
        leg.upper.position.y = -0.07 * e;
      }
      if (leg.paw) leg.paw.position.y = -0.135 * e;
    });

    // Cola: ondula al caminar y se enrosca al sentarse
    r.tailBase.rotation.x = -1.07 + 0.95 * sit;
    r.tail.forEach((seg, i) => {
      if (!seg) return;
      seg.rotation.x = Math.sin(s.t * 2.4 - i * 0.55) * (0.09 + 0.05 * walkAmt) + 0.1 * walkAmt;
      seg.rotation.z = sit * (0.18 + i * 0.03);
    });

    // Cabeza: mira alrededor al estar sentado
    r.head.rotation.y = Math.sin(s.t * 0.7) * 0.35 * sit;
    r.head.rotation.x = Math.sin(s.t * 4.5) * 0.02 * walkAmt - 0.12 * sit;
  });

  const setHover = useRoomStore((state) => state.setHoveredArtifact);
  const select = useRoomStore((state) => state.selectArtifact);

  return (
    <group
      ref={root}
      name="milo-cat"
      onPointerOver={(e) => {
        if (isPointerLocked()) return;
        e.stopPropagation();
        setHover(MILO_LORE_ID);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        if (isPointerLocked()) return;
        e.stopPropagation();
        if (useRoomStore.getState().hoveredArtifactId === MILO_LORE_ID) setHover(null);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        if (isPointerLocked()) return;
        e.stopPropagation();
        const current = useRoomStore.getState().selectedArtifactId;
        select(current === MILO_LORE_ID ? null : MILO_LORE_ID);
      }}
    >
      <group name="cat-pitch" position={[0, PIV.y, PIV.z]}>
        <group position={[0, -PIV.y, -PIV.z]}>
          {/* Torso */}
          <mesh position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.075, 0.2, 6, 14]} />
            <Fur />
            <Ink t={0.006} />
          </mesh>
          <mesh position={[0, 0.135, 0.02]} rotation={[Math.PI / 2, 0, 0]} scale={[0.8, 1, 0.6]}>
            <capsuleGeometry args={[0.07, 0.16, 4, 10]} />
            <Fur color={FUR_LIGHT} />
          </mesh>
          {STRIPE_Z.map((z) => (
            <mesh key={z} position={[0, 0.17, z]} rotation={[0, 0, -0.53]}>
              <torusGeometry args={[0.0765, 0.0075, 6, 18, 4.2]} />
              <Fur color={FUR_DARK} />
            </mesh>
          ))}
          {/* Ancas */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.058, 0.165, -0.1]} scale={[0.9, 1.1, 1.2]} castShadow>
              <sphereGeometry args={[0.048, 12, 10]} />
              <Fur />
            </mesh>
          ))}

          {/* Cabeza */}
          <group name="cat-head" position={[0, 0.235, 0.185]}>
            <mesh scale={[1.05, 0.92, 0.95]} castShadow>
              <sphereGeometry args={[0.062, 18, 14]} />
              <Fur />
              <Ink t={0.005} />
            </mesh>
            <mesh position={[0, -0.02, 0.05]} scale={[1, 0.75, 0.8]}>
              <sphereGeometry args={[0.032, 12, 10]} />
              <Fur color={CREAM} />
            </mesh>
            <mesh position={[0, -0.006, 0.079]}>
              <sphereGeometry args={[0.0075, 8, 6]} />
              <meshStandardMaterial color="#d98a8a" roughness={0.5} />
            </mesh>
            {[-1, 1].map((s) => (
              <group key={s}>
                {/* Ojos verdes con pupila vertical */}
                <mesh position={[s * 0.028, 0.012, 0.05]} scale={[1, 1, 0.6]}>
                  <sphereGeometry args={[0.0135, 12, 10]} />
                  <meshStandardMaterial color="#8fd14f" roughness={0.3} emissive="#4a8a1e" emissiveIntensity={0.35} />
                </mesh>
                <mesh position={[s * 0.028, 0.012, 0.0575]} scale={[0.35, 1.6, 0.5]}>
                  <sphereGeometry args={[0.0072, 8, 6]} />
                  <meshStandardMaterial color="#0b0b0b" roughness={0.3} />
                </mesh>
                {/* Orejas */}
                <mesh position={[s * 0.04, 0.054, -0.005]} rotation={[0, 0, -s * 0.25]} castShadow>
                  <coneGeometry args={[0.03, 0.058, 6]} />
                  <Fur />
                  <Ink t={0.004} />
                </mesh>
                <mesh position={[s * 0.04, 0.05, 0.004]} rotation={[0, 0, -s * 0.25]} scale={[0.6, 0.7, 0.5]}>
                  <coneGeometry args={[0.03, 0.058, 6]} />
                  <meshStandardMaterial color="#c98a86" roughness={0.7} />
                </mesh>
                {/* Bigotes */}
                {[0.012, -0.004].map((y, k) => (
                  <mesh key={k} position={[s * 0.048, y - 0.014, 0.066]} rotation={[0, s * (0.35 + k * 0.1), s * (0.12 - k * 0.2)]}>
                    <boxGeometry args={[0.06, 0.0012, 0.0012]} />
                    <meshStandardMaterial color="#e9e4d6" />
                  </mesh>
                ))}
                {/* Rayas de la mejilla */}
                <mesh position={[s * 0.052, -0.004, 0.03]} rotation={[0, 0, s * 0.3]}>
                  <boxGeometry args={[0.022, 0.004, 0.012]} />
                  <Fur color={FUR_DARK} />
                </mesh>
              </group>
            ))}
            {/* Frente con la M del atigrado */}
            {[-0.014, 0, 0.014].map((x) => (
              <mesh key={x} position={[x, 0.055, 0.02]} rotation={[0.35, 0, 0]}>
                <boxGeometry args={[0.0042, 0.0035, 0.034]} />
                <Fur color={FUR_DARK} />
              </mesh>
            ))}
          </group>

          {/* Patas: delantera izq/der, trasera izq/der */}
          <Leg index={0} position={[0.045, 0.16, 0.1]} front />
          <Leg index={1} position={[-0.045, 0.16, 0.1]} front />
          <Leg index={2} position={[0.052, 0.16, -0.11]} front={false} />
          <Leg index={3} position={[-0.052, 0.16, -0.11]} front={false} />

          {/* Cola */}
          <group name="cat-tail-base" position={[0, 0.2, -0.2]} rotation={[-1.07, 0, 0]}>
            <TailSegment index={0} />
          </group>
        </group>
      </group>
    </group>
  );
}
