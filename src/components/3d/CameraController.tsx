'use client';

// Camara (S1-T1 + S2-T2).
// - Modo normal: OrbitControls restringidos (arrastrar/zoom) que ademas SIGUEN al jugador en tercera persona:
//   camara y punto de mira se desplazan juntos hacia la cabeza del avatar, conservando el angulo y zoom elegidos.
// - Modo escritorio (`isAtDesk`): transicion GSAP hacia una pose frente a `monitor-screen`; al levantarse,
//   vuelve a la pose de seguimiento que tenia antes de sentarse.
import React, { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useRoomStore } from '@/store/useRoomStore';
import type { CameraConstraints, CameraPose } from '@/types/room';

export const CAMERA_CONSTRAINTS: CameraConstraints = {
  // Evitar que la cámara se acerque demasiado a través de objetos o se aleje fuera de la habitación
  minDistance: 1.8,
  maxDistance: 6.2,
  // Ángulo polar: 0 (cenital) a Math.PI / 2.05 (justo antes del suelo para no atravesarlo)
  minPolarAngle: Math.PI / 6, // 30 grados cenital
  maxPolarAngle: Math.PI / 2.08, // ~86 grados (no cruza el suelo)
  // Ángulo azimutal: mantener la vista dentro del ángulo abierto de la habitación isométrica/diorama
  minAzimuthAngle: -Math.PI / 1.8,
  maxAzimuthAngle: Math.PI / 1.8,
  // Centro de la habitación (referencia; el seguimiento usa la cabeza del jugador).
  target: [0, 1.1, 0],
};

/** Altura del punto de mira sobre los pies del avatar (torso alto). */
const FOLLOW_HEIGHT = 1.05;
/** Desplazamiento inicial de la camara respecto al jugador (tercera persona, ~5.4 m). */
const FOLLOW_OFFSET = new THREE.Vector3(3.2, 2.4, 3.7);
/** Rapidez del seguimiento (1/s). */
const FOLLOW_SHARPNESS = 7;

/**
 * Pose frente a `monitor-screen` (desplazamiento desde el centro de la pantalla). Con la cabeza del avatar sentado
 * a y=1.22 y la pantalla centrada en y=1.16, la camara debe subir a ~y=2.0 para ver el monitor completo por encima
 * de la cabeza (calculado con linea de vision: 0 de 81 puntos de la pantalla tapados; a y=1.75 se tapaba la fila inferior).
 */
export const DESK_CAMERA_OFFSET = new THREE.Vector3(0, 0.84, 1.48);
export const DESK_CAMERA_FOV = 28;
/** Pose de respaldo si la malla `monitor-screen` no existe. */
export const DESK_CAMERA_FALLBACK: CameraPose = {
  position: [0, 2.0, -0.5],
  target: [0, 1.16, -1.98],
  fov: DESK_CAMERA_FOV,
};

type Phase = 'follow' | 'to-desk' | 'desk' | 'from-desk';

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, scene } = useThree();
  const isAtDesk = useRoomStore((state) => state.isAtDesk);
  const phase = useRef<Phase>('follow');
  const saved = useRef({ offset: FOLLOW_OFFSET.clone(), fov: 45 });
  const tween = useRef<gsap.core.Tween | null>(null);
  const first = useRef(true);

  // Posicion inicial: tercera persona detras-arriba del jugador.
  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    const [px, , pz] = useRoomStore.getState().playerPosition;
    c.target.set(px, FOLLOW_HEIGHT, pz);
    camera.position.copy(c.target).add(FOLLOW_OFFSET);
    c.update();
  }, [camera]);

  // Transicion al sentarse / levantarse
  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    if (first.current) {
      first.current = false;
      if (!isAtDesk) return;
    }
    tween.current?.kill();
    const cam = camera as THREE.PerspectiveCamera;

    const fromPos = cam.position.clone();
    const fromTarget = c.target.clone();
    const fromFov = cam.fov;
    const toPos = new THREE.Vector3();
    const toTarget = new THREE.Vector3();
    let toFov: number;

    if (isAtDesk) {
      saved.current.offset.copy(fromPos).sub(fromTarget);
      saved.current.fov = fromFov;
      const screen = scene.getObjectByName('monitor-screen');
      if (screen) {
        screen.getWorldPosition(toTarget);
        toPos.copy(toTarget).add(DESK_CAMERA_OFFSET);
      } else {
        toPos.fromArray(DESK_CAMERA_FALLBACK.position);
        toTarget.fromArray(DESK_CAMERA_FALLBACK.target);
      }
      toFov = DESK_CAMERA_FOV;
      phase.current = 'to-desk';
    } else {
      // Al levantarse el avatar termina en STAND_SPOT: se toma el jugador publicado como referencia final
      const [px, , pz] = useRoomStore.getState().playerPosition;
      toTarget.set(px, FOLLOW_HEIGHT, pz);
      toPos.copy(toTarget).add(saved.current.offset);
      toFov = saved.current.fov;
      phase.current = 'from-desk';
    }

    c.enabled = false;
    const p = { k: 0 };
    tween.current = gsap.to(p, {
      k: 1,
      duration: isAtDesk ? 1.5 : 1.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        cam.position.lerpVectors(fromPos, toPos, p.k);
        c.target.lerpVectors(fromTarget, toTarget, p.k);
        cam.fov = THREE.MathUtils.lerp(fromFov, toFov, p.k);
        cam.updateProjectionMatrix();
        cam.lookAt(c.target);
      },
      onComplete: () => {
        if (isAtDesk) {
          phase.current = 'desk';
        } else {
          phase.current = 'follow';
          c.enabled = true;
          c.update();
        }
      },
    });
    return () => {
      tween.current?.kill();
    };
  }, [isAtDesk, camera, scene]);

  // Seguimiento suave del jugador (solo en modo normal). Se ejecuta antes del update de OrbitControls.
  useFrame((state, rawDelta) => {
    const c = controlsRef.current;
    if (!c || phase.current !== 'follow') return;
    const cam = state.camera;
    const dt = Math.min(rawDelta, 0.05);
    const [px, , pz] = useRoomStore.getState().playerPosition;
    const k = 1 - Math.exp(-FOLLOW_SHARPNESS * dt);
    const dx = (px - c.target.x) * k;
    const dy = (FOLLOW_HEIGHT - c.target.y) * k;
    const dz = (pz - c.target.z) * k;
    c.target.x += dx;
    c.target.y += dy;
    c.target.z += dz;
    cam.position.x += dx;
    cam.position.y += dy;
    cam.position.z += dz;
  }, -1);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      minDistance={CAMERA_CONSTRAINTS.minDistance}
      maxDistance={CAMERA_CONSTRAINTS.maxDistance}
      minPolarAngle={CAMERA_CONSTRAINTS.minPolarAngle}
      maxPolarAngle={CAMERA_CONSTRAINTS.maxPolarAngle}
      minAzimuthAngle={CAMERA_CONSTRAINTS.minAzimuthAngle}
      maxAzimuthAngle={CAMERA_CONSTRAINTS.maxAzimuthAngle}
    />
  );
}
