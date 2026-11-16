'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RoomArtifact } from '@/types/room';
import { useRoomStore } from '@/store/useRoomStore';
import { isPointerLocked } from '@/lib/pointerLock';
import { CustomArtifactModel } from './CustomArtifacts';

interface ArtifactMeshProps {
  artifact: RoomArtifact;
}

/**
 * Envoltorio de interaccion (hover, clic, escala animada) de un artefacto.
 * La geometria la aporta `CustomArtifactModel` (modelos procedurales, sin cajas con foto estirada).
 *
 * El hover vive en el store (`hoveredArtifactId`): lo escribe R3F con el cursor libre y la mira de
 * `CameraController` con el cursor capturado (primera persona). Con el cursor capturado los eventos de puntero
 * de R3F se ignoran, porque el navegador congela las coordenadas del cursor.
 */
export function ArtifactMesh({ artifact }: ArtifactMeshProps) {
  const meshRef = useRef<THREE.Group>(null);

  const hovered = useRoomStore((state) => state.hoveredArtifactId === artifact.id);
  const selectedArtifactId = useRoomStore((state) => state.selectedArtifactId);
  const selectArtifact = useRoomStore((state) => state.selectArtifact);
  const setHoveredArtifact = useRoomStore((state) => state.setHoveredArtifact);

  const isSelected = selectedArtifactId === artifact.id;
  const { position, rotation, scale } = artifact.transform;

  // Escala suave con lerp: leve aumento en hover y seleccion
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mult = isSelected ? 1.1 : hovered ? 1.05 : 1.0;
    const k = Math.min(1, delta * 10);
    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, scale[0] * mult, k);
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, scale[1] * mult, k);
    meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, scale[2] * mult, k);
  });

  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    if (isPointerLocked()) return;
    e.stopPropagation();
    setHoveredArtifact(artifact.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: { stopPropagation: () => void }) => {
    if (isPointerLocked()) return;
    e.stopPropagation();
    if (useRoomStore.getState().hoveredArtifactId === artifact.id) setHoveredArtifact(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: { stopPropagation: () => void }) => {
    if (isPointerLocked()) return;
    e.stopPropagation();
    selectArtifact(isSelected ? null : artifact.id);
  };

  const glow = isSelected ? 0.5 : hovered ? 0.3 : 0;

  return (
    <group
      ref={meshRef}
      name={`artifact-${artifact.id}`}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <CustomArtifactModel id={artifact.id} glow={glow} accent={artifact.accentColor} />
    </group>
  );
}
