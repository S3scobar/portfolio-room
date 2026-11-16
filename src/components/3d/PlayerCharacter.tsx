'use client';

// Controlador del jugador (S2-T2) en PRIMERA PERSONA. Ya no hay avatar visible: el jugador ES la camara,
// que `CameraController` coloca a la altura de los ojos sobre la posicion que publica este componente.
// - WASD / flechas: movimiento relativo a hacia donde mira la camara, con colisiones AABB (`FLOOR_OBSTACLES`)
//   y limites de +-2.2 m.
// - Publica en el store `playerPosition`, `playerRotationY` (yaw de la mirada, 0 = +z) y `nearbyTargetId`
//   (a < 0.95 m de un artefacto, de Milo o del escritorio).
// - Sentado (`isAtDesk`): queda fijo en el asiento; al levantarse reaparece en `STAND_SPOT`.
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ROOM_LORE } from '@/data/roomLore';
import { useRoomStore } from '@/store/useRoomStore';
import {
  DESK_ZONE,
  EXTRA_REACH,
  PLAYER_CONFIG,
  SEAT,
  STAND_SPOT,
  findNearbyTarget,
  moveWithCollisions,
} from '@/lib/playerNavigation';
import type { PlayerTarget } from '@/types/room';

/** Id del lore al que corresponde el gato (para la proximidad). */
const MILO_LORE_ID = 'photo-milo';

type Mode = 'free' | 'seated';

interface PlayerSim {
  mode: Mode;
  x: number;
  z: number;
  speed: number;
}

const newSim = (x: number, z: number): PlayerSim => ({ mode: 'free', x, z, speed: 0 });

/** Avanza el estado del jugador: caminar libre, o fijo en el asiento mientras `wantSeated` sea true. */
function stepPlayer(s: PlayerSim, dt: number, move: { x: number; z: number }, wantSeated: boolean) {
  const cfg = PLAYER_CONFIG;
  if (wantSeated) {
    if (s.mode !== 'seated') {
      s.mode = 'seated';
      s.x = SEAT.position[0];
      s.z = SEAT.position[1];
      s.speed = 0;
    }
    return;
  }
  if (s.mode === 'seated') {
    // Al levantarse reaparece en un punto libre; la camara hace la transicion de vuelta hasta ahi.
    s.mode = 'free';
    s.x = STAND_SPOT[0];
    s.z = STAND_SPOT[1];
    s.speed = 0;
    return;
  }
  const len = Math.hypot(move.x, move.z);
  const want = len > 0.01 ? cfg.walkSpeed : 0;
  s.speed += (want - s.speed) * Math.min(1, dt * 10);
  if (len > 0.01) {
    const dx = move.x / len;
    const dz = move.z / len;
    [s.x, s.z] = moveWithCollisions(s.x, s.z, dx * s.speed * dt, dz * s.speed * dt, cfg);
  }
}

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
}

const KEY_MAP: Record<string, 'f' | 'b' | 'l' | 'r'> = {
  KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r',
};

export function PlayerCharacter() {
  const sim = useRef<PlayerSim | null>(null);
  const keys = useRef({ f: false, b: false, l: false, r: false });
  const targets = useRef<(PlayerTarget & { obj?: THREE.Object3D | null })[] | null>(null);
  const tmp = useRef({ fwd: new THREE.Vector3(), pos: new THREE.Vector3(), lastX: NaN, lastZ: NaN, lastYaw: NaN });

  // Teclado: ignora campos de texto y combinaciones con modificadores.
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

  // Prioridad negativa: se ejecuta ANTES que CameraController (prioridad 0), asi la camara lee la posicion
  // de este mismo fotograma. Una prioridad negativa no toma el control del renderizado.
  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const store = useRoomStore.getState();
    if (!sim.current) {
      sim.current = newSim(store.playerPosition[0], store.playerPosition[2]);
    }
    const s = sim.current;

    // Entrada relativa a la camara (adelante = hacia donde mira la camara, proyectado al suelo)
    const frozen = store.selectedArtifactId !== null;
    const fwd = tmp.current.fwd;
    state.camera.getWorldDirection(fwd);
    const yaw = Math.atan2(fwd.x, fwd.z);
    fwd.y = 0;
    if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, -1);
    fwd.normalize();
    const k = keys.current;
    const ax = (k.r ? 1 : 0) - (k.l ? 1 : 0);
    const af = (k.f ? 1 : 0) - (k.b ? 1 : 0);
    const move = frozen ? { x: 0, z: 0 } : { x: -fwd.z * ax + fwd.x * af, z: fwd.x * ax + fwd.z * af };

    stepPlayer(s, dt, move, store.isAtDesk);

    // Publicar pose en el store solo si cambia
    const t = tmp.current;
    if (
      Number.isNaN(t.lastX) ||
      Math.abs(s.x - t.lastX) > 0.004 ||
      Math.abs(s.z - t.lastZ) > 0.004 ||
      Math.abs(yaw - t.lastYaw) > 0.02
    ) {
      t.lastX = s.x;
      t.lastZ = s.z;
      t.lastYaw = yaw;
      store.setPlayerPose([s.x, 0, s.z], yaw);
    }

    // Proximidad: escritorio, artefactos del lore (posicion real, con calibracion) y Milo
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
  }, -2);

  // Sin geometria: en primera persona el jugador no se ve a si mismo.
  return null;
}
