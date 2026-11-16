'use client';

// Avatar jugable (S2-T2). Procedural, 1.70 m, buzo azul casual con contorno de tinta.
// - WASD / flechas: movimiento relativo a la camara, giro suave, colisiones AABB (FLOOR_OBSTACLES) y limites +-2.2 m.
// - Publica en el store `playerPosition`, `playerRotationY` y `nearbyTargetId` (a < 0.95 m de un artefacto, de Milo o del escritorio).
// - Se sienta en la silla frente al escritorio cuando `isAtDesk` es true y se levanta al volver a false.
// Marco local del avatar: +z adelante, +y arriba, origen en los pies. yaw 0 mira a +z; el asiento mira a -z (yaw PI).
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ink, RBox } from './parts';
import { ROOM_LORE } from '@/data/roomLore';
import { useRoomStore } from '@/store/useRoomStore';
import {
  DESK_ZONE,
  EXTRA_REACH,
  PLAYER_CONFIG,
  SEAT,
  SEAT_SIDE_STEP,
  STAND_SPOT,
  findNearbyTarget,
  moveWithCollisions,
  shortestAngle,
} from '@/lib/playerNavigation';
import type { PlayerTarget } from '@/types/room';

/** Id del lore al que corresponde el gato (para la proximidad). */
const MILO_LORE_ID = 'photo-milo';

/** Estilo del avatar: se ajusta aqui sin tocar la geometria. */
const STYLE = {
  skin: '#e2b08a',
  hair: '#2b211c',
  hoodie: '#2f6bb5',
  hoodieDark: '#24548f',
  drawstring: '#f2efe6',
  jeans: '#39425a',
  shoe: '#f4f1ea',
  sole: '#2a2523',
} as const;

// Dimensiones (m)
const THIGH = 0.43;
const SHIN = 0.43;
const ANKLE = 0.06;
const HIP_Y = THIGH + SHIN + ANKLE; // 0.92
const SIT_HIP_Y = SEAT.seatTopY + 0.06; // cadera sobre el cojin
const SIT_THIGH = Math.asin((SIT_HIP_Y - (SHIN + ANKLE)) / THIGH); // inclinacion del muslo hacia abajo (rad)
const STRIDE = 4.6; // rad de fase por m/s

const smooth = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = THREE.MathUtils.lerp;

type Mode = 'free' | 'sitting-in' | 'seated' | 'standing-up';

interface PlayerSim {
  init: boolean;
  mode: Mode;
  x: number;
  z: number;
  yaw: number;
  speed: number;
  phase: number;
  sit: number;
  t: number;
  dur: number;
  fromX: number;
  fromZ: number;
  fromYaw: number;
  breathe: number;
}

const newSim = (): PlayerSim => ({
  init: false, mode: 'free', x: 0, z: 0, yaw: 0, speed: 0, phase: 0, sit: 0, t: 0, dur: 1, fromX: 0, fromZ: 0, fromYaw: 0, breathe: 0,
});

/** Avanza un tramo recto de una transicion y orienta al avatar en el sentido de la marcha. */
function glide(s: PlayerSim, ax: number, az: number, bx: number, bz: number, u: number, dt: number) {
  const k = smooth(clamp01(u));
  const nx = lerp(ax, bx, k);
  const nz = lerp(az, bz, k);
  const dx = nx - s.x;
  const dz = nz - s.z;
  const step = Math.hypot(dx, dz);
  if (step > 1e-4) s.yaw += shortestAngle(s.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 14);
  s.speed = dt > 0 ? Math.min(PLAYER_CONFIG.walkSpeed, step / dt) : 0;
  s.x = nx;
  s.z = nz;
}

/** Maquina de estados del avatar: caminar libre, sentarse, sentado y levantarse. */
function advancePlayer(s: PlayerSim, dt: number, move: { x: number; z: number }, wantSeated: boolean) {
  const cfg = PLAYER_CONFIG;
  if (s.mode === 'free') {
    if (wantSeated) {
      s.mode = 'sitting-in';
      s.t = 0;
      s.fromX = s.x;
      s.fromZ = s.z;
      s.dur = 0.9 + Math.min(2, Math.hypot(SEAT.position[0] - s.x, SEAT.position[1] - s.z)) * 0.3;
    } else {
      const len = Math.hypot(move.x, move.z);
      const want = len > 0.01 ? cfg.walkSpeed : 0;
      s.speed += (want - s.speed) * Math.min(1, dt * 10);
      if (len > 0.01) {
        const dx = move.x / len;
        const dz = move.z / len;
        [s.x, s.z] = moveWithCollisions(s.x, s.z, dx * s.speed * dt, dz * s.speed * dt, cfg);
        s.yaw += shortestAngle(s.yaw, Math.atan2(dx, dz)) * (1 - Math.exp(-cfg.turnSharpness * dt));
      }
      s.sit = Math.max(0, s.sit - dt * 4);
    }
  } else if (s.mode === 'sitting-in') {
    s.t += dt;
    const u = s.t / s.dur;
    if (u < 0.55) {
      glide(s, s.fromX, s.fromZ, SEAT_SIDE_STEP[0], SEAT_SIDE_STEP[1], u / 0.55, dt);
    } else if (u < 1) {
      const v = (u - 0.55) / 0.45;
      glide(s, SEAT_SIDE_STEP[0], SEAT_SIDE_STEP[1], SEAT.position[0], SEAT.position[1], v, dt);
      s.yaw += shortestAngle(s.yaw, SEAT.yaw) * Math.min(1, dt * 10);
      s.sit = smooth(v);
    } else {
      s.mode = 'seated';
      s.x = SEAT.position[0];
      s.z = SEAT.position[1];
      s.yaw = SEAT.yaw;
      s.sit = 1;
      s.speed = 0;
    }
  } else if (s.mode === 'seated') {
    s.speed = 0;
    if (!wantSeated) {
      s.mode = 'standing-up';
      s.t = 0;
      s.dur = 0.9;
    }
  } else {
    s.t += dt;
    const u = s.t / s.dur;
    s.sit = 1 - smooth(clamp01(u / 0.5));
    if (u < 0.5) {
      glide(s, SEAT.position[0], SEAT.position[1], SEAT_SIDE_STEP[0], SEAT_SIDE_STEP[1], u / 0.5, dt);
    } else if (u < 1) {
      glide(s, SEAT_SIDE_STEP[0], SEAT_SIDE_STEP[1], STAND_SPOT[0], STAND_SPOT[1], (u - 0.5) / 0.5, dt);
    } else {
      s.mode = 'free';
      s.x = STAND_SPOT[0];
      s.z = STAND_SPOT[1];
      s.sit = 0;
      s.speed = 0;
    }
  }
  const moving = s.mode === 'free' || s.mode === 'sitting-in' || s.mode === 'standing-up' ? s.speed : 0;
  s.phase += moving * dt * STRIDE;
  s.breathe += dt;
}

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
}

const KEY_MAP: Record<string, 'f' | 'b' | 'l' | 'r'> = {
  KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r',
};

// ---------------------------------------------------------------------------
// Piezas del cuerpo
// ---------------------------------------------------------------------------

function Limb({ r, len, color, ink = 0.012 }: { r: number; len: number; color: string; ink?: number }) {
  return (
    <mesh position={[0, -len / 2 - r * 0.2, 0]} castShadow>
      <capsuleGeometry args={[r, len, 5, 10]} />
      <meshStandardMaterial color={color} roughness={0.85} />
      <Ink t={ink} />
    </mesh>
  );
}

function Arm({ side }: { side: 'L' | 'R' }) {
  const s = side === 'L' ? 1 : -1;
  return (
    <group name={`p-arm${side}`} position={[s * 0.23, 0.46, 0]}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.062, 12, 10]} />
        <meshStandardMaterial color={STYLE.hoodie} roughness={0.85} />
      </mesh>
      <Limb r={0.05} len={0.26} color={STYLE.hoodie} />
      <group name={`p-elbow${side}`} position={[0, -0.3, 0]}>
        <Limb r={0.043} len={0.17} color={STYLE.hoodie} ink={0.01} />
        <mesh position={[0, -0.275, 0.01]} castShadow>
          <sphereGeometry args={[0.048, 12, 10]} />
          <meshStandardMaterial color={STYLE.skin} roughness={0.7} />
          <Ink t={0.006} />
        </mesh>
      </group>
    </group>
  );
}

function Leg({ side }: { side: 'L' | 'R' }) {
  const s = side === 'L' ? 1 : -1;
  return (
    <group name={`p-thigh${side}`} position={[s * 0.095, 0, 0]}>
      <Limb r={0.075} len={THIGH - 0.12} color={STYLE.jeans} ink={0.015} />
      <group name={`p-knee${side}`} position={[0, -THIGH, 0]}>
        <Limb r={0.062} len={SHIN - 0.1} color={STYLE.jeans} ink={0.015} />
        <group name={`p-foot${side}`} position={[0, -SHIN, 0]}>
          <RBox size={[0.115, 0.07, 0.25]} r={0.03} color={STYLE.shoe} rough={0.6} ink={0.01} position={[0, -0.005, 0.05]} />
          <RBox size={[0.12, 0.022, 0.26]} r={0.01} color={STYLE.sole} rough={0.8} ink={false} position={[0, -0.04, 0.05]} />
        </group>
      </group>
    </group>
  );
}

function Head() {
  return (
    <group name="p-head" position={[0, 0.64, 0]}>
      <mesh scale={[1, 1.06, 1.02]} castShadow>
        <sphereGeometry args={[0.115, 22, 16]} />
        <meshStandardMaterial color={STYLE.skin} roughness={0.7} />
        <Ink t={0.015} />
      </mesh>
      {/* Pelo: casquete + volumen trasero + flequillo */}
      <mesh position={[0, 0.012, -0.006]} rotation={[-0.25, 0, 0]} castShadow>
        <sphereGeometry args={[0.126, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={STYLE.hair} roughness={0.9} />
        <Ink t={0.012} />
      </mesh>
      <mesh position={[0, 0.0, -0.05]} scale={[1, 0.95, 0.8]} castShadow>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshStandardMaterial color={STYLE.hair} roughness={0.9} />
      </mesh>
      <mesh position={[0.02, 0.085, 0.1]} rotation={[0.5, 0, -0.12]} scale={[1.4, 0.5, 0.8]}>
        <sphereGeometry args={[0.05, 10, 8]} />
        <meshStandardMaterial color={STYLE.hair} roughness={0.9} />
      </mesh>
      {/* Rostro */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.042, 0.012, 0.104]} scale={[1, 1.15, 0.6]}>
            <sphereGeometry args={[0.0145, 10, 8]} />
            <meshStandardMaterial color="#14110f" roughness={0.3} />
          </mesh>
          <mesh position={[s * 0.043, 0.047, 0.106]} rotation={[0, 0, s * 0.12]}>
            <boxGeometry args={[0.04, 0.008, 0.008]} />
            <meshStandardMaterial color={STYLE.hair} />
          </mesh>
          <mesh position={[s * 0.116, -0.004, 0]}>
            <sphereGeometry args={[0.026, 10, 8]} />
            <meshStandardMaterial color={STYLE.skin} roughness={0.7} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.012, 0.114]}>
        <sphereGeometry args={[0.016, 10, 8]} />
        <meshStandardMaterial color={STYLE.skin} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.05, 0.108]}>
        <boxGeometry args={[0.04, 0.006, 0.006]} />
        <meshStandardMaterial color="#8a4a3f" />
      </mesh>
    </group>
  );
}

function PlayerBody() {
  return (
    <group name="p-pelvis" position={[0, HIP_Y, 0]}>
      <Leg side="L" />
      <Leg side="R" />
      <group name="p-torso">
        {/* Buzo azul: torso, dobladillo, bolsillo canguro, capucha y cordones */}
        <RBox size={[0.37, 0.52, 0.21]} r={0.08} color={STYLE.hoodie} rough={0.85} ink={0.015} position={[0, 0.27, 0]} />
        <RBox size={[0.385, 0.06, 0.22]} r={0.025} color={STYLE.hoodieDark} rough={0.85} ink={0.008} position={[0, 0.045, 0]} />
        <RBox size={[0.22, 0.1, 0.02]} r={0.02} color={STYLE.hoodieDark} rough={0.85} ink={0.006} position={[0, 0.17, 0.108]} />
        <mesh position={[0, 0.54, -0.07]} scale={[1.25, 0.75, 0.85]} castShadow>
          <sphereGeometry args={[0.11, 16, 10]} />
          <meshStandardMaterial color={STYLE.hoodieDark} roughness={0.9} />
          <Ink t={0.012} />
        </mesh>
        {[-0.035, 0.035].map((x) => (
          <mesh key={x} position={[x, 0.42, 0.108]}>
            <cylinderGeometry args={[0.0055, 0.0055, 0.12, 6]} />
            <meshStandardMaterial color={STYLE.drawstring} />
          </mesh>
        ))}
        <mesh position={[0, 0.555, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.07, 12]} />
          <meshStandardMaterial color={STYLE.skin} roughness={0.7} />
        </mesh>
        <Head />
        <Arm side="L" />
        <Arm side="R" />
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function PlayerCharacter() {
  const root = useRef<THREE.Group>(null);
  const sim = useRef<PlayerSim | null>(null);
  const rig = useRef<Record<string, THREE.Object3D | null> | null>(null);
  const keys = useRef({ f: false, b: false, l: false, r: false });
  const targets = useRef<(PlayerTarget & { obj?: THREE.Object3D | null })[] | null>(null);
  const tmp = useRef({ fwd: new THREE.Vector3(), pos: new THREE.Vector3(), lastX: NaN, lastZ: NaN, lastYaw: NaN });

  // Teclado: ignora campos de texto (Leva) y combinaciones con modificadores.
  useEffect(() => {
    const set = (e: KeyboardEvent, down: boolean) => {
      const k = KEY_MAP[e.code];
      if (!k || isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      keys.current[k] = down;
      e.preventDefault();
    };
    const onDown = (e: KeyboardEvent) => set(e, true);
    const onUp = (e: KeyboardEvent) => set(e, false);
    const clear = () => {
      keys.current = { f: false, b: false, l: false, r: false };
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', clear);
    };
  }, []);

  // El avatar no debe interceptar los clics de los artefactos que tiene detras.
  useEffect(() => {
    root.current?.traverse((o) => {
      o.raycast = () => {};
    });
  }, []);

  useFrame((state, rawDelta) => {
    const g = root.current;
    if (!g) return;
    const dt = Math.min(rawDelta, 0.05);
    const store = useRoomStore.getState();

    if (!rig.current) {
      const names = [
        'p-pelvis', 'p-torso', 'p-head', 'p-armL', 'p-armR', 'p-elbowL', 'p-elbowR',
        'p-thighL', 'p-thighR', 'p-kneeL', 'p-kneeR', 'p-footL', 'p-footR',
      ];
      const found: Record<string, THREE.Object3D | null> = {};
      for (const n of names) found[n] = g.getObjectByName(n) ?? null;
      if (names.some((n) => !found[n])) return;
      rig.current = found;
    }
    if (!sim.current) {
      sim.current = newSim();
      sim.current.x = store.playerPosition[0];
      sim.current.z = store.playerPosition[2];
      sim.current.yaw = store.playerRotationY;
      sim.current.init = true;
    }
    const s = sim.current;
    const r = rig.current;

    // Entrada relativa a la camara (adelante = hacia donde mira la camara, proyectado al suelo)
    const frozen = store.selectedArtifactId !== null;
    const fwd = tmp.current.fwd;
    state.camera.getWorldDirection(fwd);
    fwd.y = 0;
    if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, -1);
    fwd.normalize();
    const k = keys.current;
    const ax = (k.r ? 1 : 0) - (k.l ? 1 : 0);
    const af = (k.f ? 1 : 0) - (k.b ? 1 : 0);
    const move = frozen ? { x: 0, z: 0 } : { x: -fwd.z * ax + fwd.x * af, z: fwd.x * ax + fwd.z * af };

    advancePlayer(s, dt, move, store.isAtDesk);

    // Pose del avatar
    const sit = s.sit;
    const walk = clamp01(s.speed / PLAYER_CONFIG.walkSpeed) * (1 - sit);
    const swing = Math.sin(s.phase);
    g.position.set(s.x, 0, s.z);
    g.rotation.y = s.yaw;

    const bob = Math.abs(Math.cos(s.phase)) * 0.018 * walk;
    r['p-pelvis']!.position.y = lerp(HIP_Y, SIT_HIP_Y, sit) + bob;
    const breathe = Math.sin(s.breathe * 1.8) * 0.006;
    r['p-torso']!.rotation.x = 0.07 * walk + 0.1 * sit;
    r['p-torso']!.rotation.y = swing * 0.06 * walk;
    r['p-torso']!.scale.y = 1 + breathe;
    r['p-head']!.rotation.x = -0.05 * walk + Math.sin(s.breathe * 0.9) * 0.012;

    // Piernas: marcha en diagonal; sentado, muslos casi horizontales y pantorrillas verticales
    const thighSit = -(Math.PI / 2 - SIT_THIGH);
    const kneeSit = Math.PI / 2 - SIT_THIGH;
    for (const [side, ph] of [['L', 1], ['R', -1]] as const) {
      const w = swing * ph;
      r[`p-thigh${side}`]!.rotation.x = lerp(w * 0.62 * walk, thighSit, sit);
      r[`p-knee${side}`]!.rotation.x = lerp(Math.max(0, -Math.cos(s.phase) * ph) * 0.9 * walk + 0.06 * walk, kneeSit, sit);
      r[`p-foot${side}`]!.rotation.x = lerp(-r[`p-thigh${side}`]!.rotation.x * 0.4 + w * 0.15 * walk, 0, sit);
    }
    // Brazos: balanceo opuesto a las piernas; sentado, antebrazos sobre el teclado
    for (const [side, ph] of [['L', -1], ['R', 1]] as const) {
      const w = swing * ph;
      r[`p-arm${side}`]!.rotation.x = lerp(w * 0.55 * walk, -0.55, sit);
      r[`p-arm${side}`]!.rotation.z = (side === 'L' ? 1 : -1) * lerp(0.05, -0.04, sit);
      r[`p-elbow${side}`]!.rotation.x = lerp(-0.2 - Math.max(0, w) * 0.5 * walk, -1.0, sit);
    }

    // Publicar pose en el store solo si cambia
    const t = tmp.current;
    if (Math.abs(s.x - t.lastX) > 0.004 || Math.abs(s.z - t.lastZ) > 0.004 || Math.abs(s.yaw - t.lastYaw) > 0.01 || Number.isNaN(t.lastX)) {
      t.lastX = s.x;
      t.lastZ = s.z;
      t.lastYaw = s.yaw;
      store.setPlayerPose([s.x, 0, s.z], s.yaw);
    }

    // Proximidad: escritorio, artefactos del lore (posicion real, con calibracion Leva) y Milo
    if (store.isAtDesk || s.mode !== 'free') {
      store.setNearbyTarget(null);
      return;
    }
    if (!targets.current) {
      targets.current = [
        { ...DESK_ZONE, position: [DESK_ZONE.position[0], DESK_ZONE.position[1]] },
        ...ROOM_LORE.map((a) => ({ id: a.id, position: [a.defaultPosition[0], a.defaultPosition[2]] as [number, number], reach: EXTRA_REACH[a.id] })),
        { id: MILO_LORE_ID, position: [0, 0] as [number, number] },
      ];
    }
    const list = targets.current;
    const milo = state.scene.getObjectByName('milo-cat');
    const v = t.pos;
    for (let i = 1; i < list.length; i++) {
      const item = list[i];
      const isMilo = i === list.length - 1;
      let obj = isMilo ? milo : item.obj;
      if (!isMilo && (!obj || !obj.parent)) {
        obj = state.scene.getObjectByName(`artifact-${item.id}`) ?? null;
        item.obj = obj;
      }
      if (obj) {
        obj.getWorldPosition(v);
        item.position[0] = v.x;
        item.position[1] = v.z;
      }
    }
    store.setNearbyTarget(findNearbyTarget(s.x, s.z, list, store.nearbyTargetId));
  });

  return (
    <group ref={root} name="player-character">
      <PlayerBody />
    </group>
  );
}
