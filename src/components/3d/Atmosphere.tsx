'use client';

import React from 'react';
import type { AtmosphereLighting, AtmospherePostprocessing } from '@/types/room';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

export const ATMOSPHERE_CONFIG: {
  lighting: AtmosphereLighting;
  postprocessing: AtmospherePostprocessing;
} = {
  lighting: {
    // Golden hour: luz cálida y anaranjada potente entrando desde la ventana izquierda (x = -3.5, y = 3.5, z = -0.4)
    keyLight: {
      color: '#ffb36b',
      intensity: 2.4,
      position: [-4.0, 3.2, -0.4],
    },
    // Relleno frío azulado en sombras
    fillLight: {
      color: '#4a7299',
      intensity: 1.1,
      position: [4, 4, 3],
    },
    ambientColor: '#ffe4c4',
    ambientIntensity: 0.9,
    shadowMapSize: 2048,
  },
  postprocessing: {
    bloom: {
      intensity: 0.45,
      luminanceThreshold: 0.7,
      radius: 0.6,
    },
    vignette: {
      offset: 0.2,
      darkness: 0.45,
    },
    toneMappingEnabled: true,
  },
};

export function Atmosphere() {
  const { lighting, postprocessing } = ATMOSPHERE_CONFIG;

  return (
    <>
      {/* Luz hemisférica: cielo dorado cálido y suelo azulado en sombras */}
      <hemisphereLight
        color="#ffe8cc"
        groundColor="#3b5998"
        intensity={1.1}
      />

      {/* Luz ambiente suave de soporte */}
      <ambientLight
        color={lighting.ambientColor}
        intensity={lighting.ambientIntensity}
      />

      {/* Luz direccional dorada entrando en diagonal por la ventana izquierda */}
      <directionalLight
        color={lighting.keyLight.color}
        intensity={lighting.keyLight.intensity}
        position={lighting.keyLight.position}
        target-position={[0, 0.8, -1.0]}
        castShadow
        shadow-mapSize-width={lighting.shadowMapSize}
        shadow-mapSize-height={lighting.shadowMapSize}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0005}
      />

      {/* Relleno frío diagonal opuesto */}
      <directionalLight
        color={lighting.fillLight.color}
        intensity={lighting.fillLight.intensity}
        position={lighting.fillLight.position}
      />

      {/* Luz puntual azul suave cerca del escritorio/monitor */}
      <pointLight
        color="#38bdf8"
        intensity={1.2}
        distance={4.5}
        position={[0, 1.4, -1.6]}
      />

      {/* Luz cálida de atardecer emanando de la ventana */}
      <pointLight
        color="#ff9e5e"
        intensity={1.8}
        distance={5}
        position={[-2.3, 1.85, -0.4]}
      />

      {/* Postprocessing sutil estilo Mixtape / Life is Strange */}
      <EffectComposer multisampling={4}>
        <Bloom
          intensity={postprocessing.bloom.intensity}
          luminanceThreshold={postprocessing.bloom.luminanceThreshold}
          radius={postprocessing.bloom.radius}
          mipmapBlur
        />
        <Vignette
          offset={postprocessing.vignette.offset}
          darkness={postprocessing.vignette.darkness}
          eskil={false}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  );
}
