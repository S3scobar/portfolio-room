'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { RoomEnvironment } from './RoomEnvironment';
import { MiloCat } from './MiloCat';
import { PlayerCharacter } from './PlayerCharacter';
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
      {/* Primera persona: ojos a 1.7 m sobre el punto de aparicion. CameraController la mueve cada fotograma;
          estos valores solo fijan el FOV (70) y el plano cercano (0.05 m, para poder pegarse a las paredes). */}
      <Canvas
        shadows
        camera={{ position: [0.9, 1.7, 0.9], fov: 70, near: 0.05, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full"
      >
        <Suspense fallback={<SceneLoader />}>
          {/* Atmósfera y luces golden hour con acento ventana */}
          <Atmosphere />

          {/* Cámara en primera persona (ratón para mirar, mira central) y transición al monitor al sentarse */}
          <CameraController />

          {/* Entorno procedural: paredes, piso, zócalos, ventanal con cielo, haz de luz y mobiliario con contorno de tinta */}
          <RoomEnvironment />

          {/* Milo: gato 3D que camina solo por el suelo; clic abre su ficha (photo-milo) */}
          <MiloCat />

          {/* Controlador del jugador (sin avatar visible): WASD/flechas, colisiones, proximidad y asiento */}
          <PlayerCharacter />

          {/* Gestor de los artefactos del lore: transforms fijos de roomLore.ts (calibración Leva solo con NEXT_PUBLIC_CALIBRATION=1) */}
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
