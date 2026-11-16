'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { RoomEnvironment } from './RoomEnvironment';
import { MiloCat } from './MiloCat';
import { Atmosphere } from './Atmosphere';
import { CameraController } from './CameraController';
import { ArtifactsManager } from './ArtifactsManager';
import { ArtifactMesh } from './ArtifactMesh';

function SceneLoader() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#d97706" wireframe />
    </mesh>
  );
}

export function RoomCanvas() {
  return (
    <div className="relative w-full h-screen bg-[#0d1117] overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [3.8, 3.2, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full"
      >
        <Suspense fallback={<SceneLoader />}>
          {/* Atmósfera y luces golden hour con acento ventana */}
          <Atmosphere />

          {/* Controlador de cámara con restricciones que impiden cruzar muros y piso */}
          <CameraController />

          {/* Entorno procedural: paredes, piso, zócalos, ventanal con cielo, haz de luz y mobiliario con contorno de tinta */}
          <RoomEnvironment />

          {/* Milo: gato 3D que camina solo por el suelo; clic abre su ficha (photo-milo) */}
          <MiloCat />

          {/* Gestor y renderizador de los 16 artefactos del lore con calibración Leva */}
          <ArtifactsManager>
            {(artifacts) => (
              <group name="artifacts-group">
                {artifacts.map((artifact) => (
                  <ArtifactMesh key={artifact.id} artifact={artifact} />
                ))}
              </group>
            )}
          </ArtifactsManager>
        </Suspense>
      </Canvas>
    </div>
  );
}
