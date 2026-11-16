// Estado global de la habitacion 3D (Sprint 1 + Sprint 2).
// Contrato de store (Zustand v5) definido por el Arquitecto (Kiro).
// La implementacion de componentes/escena la realiza Antigravity.
import { create } from 'zustand';
import { PLAYER_CONFIG } from '@/lib/playerNavigation';
import type { CameraMode, PlayerState, Vec3 } from '@/types/room';

export interface RoomState extends PlayerState {
  // --- S1-T1: seleccion, hover y modo de camara ---
  /** Artefacto seleccionado (tarjeta narrativa abierta) o null. */
  selectedArtifactId: string | null;
  /** Artefacto bajo el cursor / la mira o null. */
  hoveredArtifactId: string | null;
  /**
   * Modo de camara. Con la vista en primera persona: `'orbit'` = vista libre (caminando),
   * `'inspect'` = ficha abierta, `'desk'` = sentado frente al monitor.
   */
  cameraMode: CameraMode;
  /**
   * true cuando la camara ya llego a la pose frente al monitor (termino la transicion de sentarse).
   * El Mini-OS (`MonitorOS`) solo se monta con este valor en true, para que nunca flote sobre el cuarto.
   */
  deskCameraReady: boolean;

  // --- Acciones S1 ---
  /**
   * Selecciona un artefacto y pasa a modo `inspect`; null limpia y vuelve a `orbit`.
   * Sentado (`isAtDesk`) el modo de camara se mantiene en `desk`.
   */
  selectArtifact: (id: string | null) => void;
  setHoveredArtifact: (id: string | null) => void;
  setCameraMode: (mode: CameraMode) => void;
  /** Cierra la tarjeta narrativa (equivale a selectArtifact(null)). */
  closeArtifact: () => void;

  // --- Acciones S2 (jugador) ---
  /**
   * Sienta (true) o levanta (false) al jugador del escritorio.
   * true: `cameraMode='desk'`, cierra la ficha abierta y limpia `nearbyTargetId`.
   * false: cierra cualquier app, `deskCameraReady=false` y la camara vuelve a la vista libre.
   */
  setIsAtDesk: (value: boolean) => void;
  /** Abre una app del Mini-OS (`id` de `PORTFOLIO_APPS`). Solo tiene efecto sentado. */
  openApp: (id: string) => void;
  closeApp: () => void;
  /** Lo publica `PlayerCharacter` cuando cambia la pose (solo con cambios apreciables). */
  setPlayerPose: (position: Vec3, rotationY: number) => void;
  /** Lo publica `PlayerCharacter` solo cuando cambia el objetivo cercano. */
  setNearbyTarget: (id: string | null) => void;
  /** Lo publica `CameraController` al terminar (true) o al iniciar la salida (false) de la vista del monitor. */
  setDeskCameraReady: (ready: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  selectedArtifactId: null,
  hoveredArtifactId: null,
  cameraMode: 'orbit',
  deskCameraReady: false,

  playerPosition: [PLAYER_CONFIG.spawn[0], 0, PLAYER_CONFIG.spawn[1]],
  playerRotationY: PLAYER_CONFIG.spawnYaw,
  nearbyTargetId: null,
  isAtDesk: false,
  openAppId: null,

  selectArtifact: (id) =>
    set((s) => ({
      selectedArtifactId: id,
      cameraMode: s.isAtDesk ? 'desk' : id ? 'inspect' : 'orbit',
    })),
  setHoveredArtifact: (id) => set({ hoveredArtifactId: id }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  closeArtifact: () =>
    set((s) => ({ selectedArtifactId: null, cameraMode: s.isAtDesk ? 'desk' : 'orbit' })),

  setIsAtDesk: (value) =>
    set((s) => {
      if (s.isAtDesk === value) return s;
      return value
        ? { isAtDesk: true, cameraMode: 'desk', selectedArtifactId: null, nearbyTargetId: null, deskCameraReady: false }
        : { isAtDesk: false, openAppId: null, cameraMode: 'orbit', deskCameraReady: false };
    }),
  openApp: (id) => set((s) => (s.isAtDesk ? { openAppId: id } : s)),
  closeApp: () => set((s) => (s.openAppId === null ? s : { openAppId: null })),
  setPlayerPose: (position, rotationY) => set({ playerPosition: position, playerRotationY: rotationY }),
  setNearbyTarget: (id) => set((s) => (s.nearbyTargetId === id ? s : { nearbyTargetId: id })),
  setDeskCameraReady: (ready) => set((s) => (s.deskCameraReady === ready ? s : { deskCameraReady: ready })),
}));
