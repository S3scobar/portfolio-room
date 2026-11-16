'use client';

import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function RoomModel() {
  const { scene } = useGLTF('/models/room.glb');

  // Asegurar que todas las mallas proyecten y reciban sombras suaves
  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} position={[0, 0, 0]} />;
}

useGLTF.preload('/models/room.glb');
