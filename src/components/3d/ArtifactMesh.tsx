'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RoomArtifact } from '@/types/room';
import { useRoomStore } from '@/store/useRoomStore';
import { CustomArtifactModel } from './CustomArtifacts';

interface ArtifactMeshProps {
  artifact: RoomArtifact;
}

/**
 * Envoltorio de interaccion (hover, clic, escala animada) de un artefacto.
 * La geometria la aporta `CustomArtifactModel` (modelos procedurales, sin cajas con foto estirada).
 */
export function ArtifactMesh({ artifact }: ArtifactMeshProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

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
    e.stopPropagation();
    setHovered(true);
    setHoveredArtifact(artifact.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(false);
    setHoveredArtifact(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: { stopPropagation: () => void }) => {
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
