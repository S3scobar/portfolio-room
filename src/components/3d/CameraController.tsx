'use client';

import React, { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useRoomStore } from '@/store/useRoomStore';
import type { CameraConstraints } from '@/types/room';

export const CAMERA_CONSTRAINTS: CameraConstraints = {
  // Evitar que la cámara se acerque demasiado a través de objetos o se aleje fuera de la habitación
  minDistance: 1.8,
  maxDistance: 6.2,
  // Ángulo polar: 0 (cenital) a Math.PI / 2.05 (justo antes del suelo para no atravesarlo)
  minPolarAngle: Math.PI / 6,      // 30 grados cenital
  maxPolarAngle: Math.PI / 2.08,   // ~86 grados (no cruza el suelo)
  // Ángulo azimutal: mantener la vista dentro del ángulo abierto de la habitación isométrica/diorama
  minAzimuthAngle: -Math.PI / 1.8,
  maxAzimuthAngle: Math.PI / 1.8,
  target: [0, 1.1, 0],
};

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraMode = useRoomStore((state) => state.cameraMode);

  useEffect(() => {
    if (!controlsRef.current) return;
    if (cameraMode === 'orbit') {
      controlsRef.current.target.set(
        CAMERA_CONSTRAINTS.target[0],
        CAMERA_CONSTRAINTS.target[1],
        CAMERA_CONSTRAINTS.target[2]
      );
      controlsRef.current.update();
    }
  }, [cameraMode]);

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
      target={CAMERA_CONSTRAINTS.target}
    />
  );
}
