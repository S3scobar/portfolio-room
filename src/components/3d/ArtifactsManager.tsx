'use client';

import React from 'react';
import { useControls, folder, button } from 'leva';
import { ROOM_LORE } from '@/data/roomLore';
import type { RoomArtifact, ArtifactTransform, CalibrationExport } from '@/types/room';

interface ArtifactsManagerProps {
  onArtifactsReady?: (artifacts: RoomArtifact[]) => void;
  children: (artifacts: RoomArtifact[]) => React.ReactNode;
}

/**
 * Controla la calibración espacial con Leva para los 16 artefactos del Sprint 1.
 * Agrupa cada objeto con claves únicas para evitar colisiones en el store de Leva.
 */
export function ArtifactsManager({ children }: ArtifactsManagerProps) {
  // Construir controles de Leva dinámicos para cada objeto del lore con identificador único
  const schemas: Record<string, ReturnType<typeof folder>> = {};

  ROOM_LORE.forEach((item) => {
    const k = item.id;
    schemas[item.title] = folder(
      {
        [`${k}_posX`]: { value: item.defaultPosition[0], min: -5, max: 5, step: 0.02, label: 'Pos X' },
        [`${k}_posY`]: { value: item.defaultPosition[1], min: -1, max: 5, step: 0.02, label: 'Pos Y' },
        [`${k}_posZ`]: { value: item.defaultPosition[2], min: -5, max: 5, step: 0.02, label: 'Pos Z' },
        [`${k}_rotX`]: { value: item.defaultRotation[0], min: -Math.PI, max: Math.PI, step: 0.05, label: 'Rot X' },
        [`${k}_rotY`]: { value: item.defaultRotation[1], min: -Math.PI, max: Math.PI, step: 0.05, label: 'Rot Y' },
        [`${k}_rotZ`]: { value: item.defaultRotation[2], min: -Math.PI, max: Math.PI, step: 0.05, label: 'Rot Z' },
        [`${k}_scaleX`]: { value: item.defaultScale[0], min: 0.01, max: 3, step: 0.02, label: 'Esc X' },
        [`${k}_scaleY`]: { value: item.defaultScale[1], min: 0.01, max: 3, step: 0.02, label: 'Esc Y' },
        [`${k}_scaleZ`]: { value: item.defaultScale[2], min: 0.01, max: 3, step: 0.02, label: 'Esc Z' },
      },
      { collapsed: true }
    );
  });

  const controlsValues = useControls('Artefactos 3D (Calibración)', schemas);

  // Mapear cada elemento con sus valores de Leva en tiempo real
  const calibratedArtifacts: RoomArtifact[] = ROOM_LORE.map((item) => {
    const raw = controlsValues as unknown as Record<string, number>;
    const k = item.id;

    const pos: [number, number, number] = [
      raw[`${k}_posX`] ?? item.defaultPosition[0],
      raw[`${k}_posY`] ?? item.defaultPosition[1],
      raw[`${k}_posZ`] ?? item.defaultPosition[2],
    ];

    const rot: [number, number, number] = [
      raw[`${k}_rotX`] ?? item.defaultRotation[0],
      raw[`${k}_rotY`] ?? item.defaultRotation[1],
      raw[`${k}_rotZ`] ?? item.defaultRotation[2],
    ];

    const scl: [number, number, number] = [
      raw[`${k}_scaleX`] ?? item.defaultScale[0],
      raw[`${k}_scaleY`] ?? item.defaultScale[1],
      raw[`${k}_scaleZ`] ?? item.defaultScale[2],
    ];

    const transform: ArtifactTransform = {
      position: pos,
      rotation: rot,
      scale: scl,
    };

    return {
      ...item,
      transform,
    };
  });

  // Botón para exportar JSON con la calibración final según el contrato de Kiro
  useControls('Exportar Coordenadas', {
    'Descargar JSON Calibración': button(() => {
      const exportData: CalibrationExport = {
        version: 1,
        exportedAt: new Date().toISOString(),
        entries: calibratedArtifacts.map((a) => ({
          id: a.id,
          transform: a.transform,
        })),
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      console.log('--- CALIBRACIÓN EXPORTADA S1-T4 ---');
      console.log(jsonStr);

      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `room-calibration-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }),
  });

  return <>{children(calibratedArtifacts)}</>;
}
