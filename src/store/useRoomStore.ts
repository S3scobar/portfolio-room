// Estado global de la habitacion 3D - Sprint 1.
// Contrato de store (Zustand v5) definido por el Arquitecto (Kiro).
// La implementacion de componentes/escena la realiza Antigravity.
import { create } from 'zustand';
import type { CameraMode } from '@/types/room';

export interface RoomState {
  // --- S1-T1: seleccion, hover y modo de camara ---
  /** Artefacto seleccionado (tarjeta narrativa abierta) o null. */
  selectedArtifactId: string | null;
  /** Artefacto bajo el cursor o null. */
  hoveredArtifactId: string | null;
  cameraMode: CameraMode;

  // --- Acciones ---
  /** Selecciona un artefacto y pasa a modo `inspect`; null limpia y vuelve a `orbit`. */
  selectArtifact: (id: string | null) => void;
  setHoveredArtifact: (id: string | null) => void;
  setCameraMode: (mode: CameraMode) => void;
  /** Cierra la tarjeta narrativa (equivale a selectArtifact(null)). */
  closeArtifact: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  selectedArtifactId: null,
  hoveredArtifactId: null,
  cameraMode: 'orbit',

  selectArtifact: (id) =>
    set({
      selectedArtifactId: id,
      cameraMode: id ? 'inspect' : 'orbit',
    }),
  setHoveredArtifact: (id) => set({ hoveredArtifactId: id }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  closeArtifact: () => set({ selectedArtifactId: null, cameraMode: 'orbit' }),
}));
