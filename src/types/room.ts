// Contratos TypeScript - Sprint 1 (Entorno 3D Base)
// Mantenido por el Arquitecto (Kiro). No contiene UI, CSS ni coordenadas.
import type { ArtifactCategory, RoomArtifactSeed } from '@/data/roomLore';

export type { ArtifactCategory, RoomArtifactSeed };

/** Terna 3D reutilizable para posicion, rotacion (radianes) y escala. */
export type Vec3 = [number, number, number];

// ---------------------------------------------------------------------------
// S1-T1: Camara y estado global
// ---------------------------------------------------------------------------

/**
 * Modo de camara de la escena.
 * - `orbit`: OrbitControls restringido (exploracion libre de la habitacion).
 * - `inspect`: foco sobre un artefacto seleccionado.
 * - `desk`: camara anclada al monitor/escritorio (preparacion Sprint 2).
 */
export type CameraMode = 'orbit' | 'inspect' | 'desk';

/** Limites del OrbitControls: la camara no debe atravesar muros ni suelo. */
export interface CameraConstraints {
  minDistance: number;
  maxDistance: number;
  /** Angulo polar en radianes (0 = cenital, Math.PI/2 = horizonte). */
  minPolarAngle: number;
  maxPolarAngle: number;
  /** Angulo azimutal en radianes; limita el giro horizontal. */
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  /** Objetivo (look-at) por defecto de la camara. */
  target: Vec3;
}

// ---------------------------------------------------------------------------
// S1-T3: Artefactos interactivos y lore
// ---------------------------------------------------------------------------

/**
 * Artefacto en runtime: combina la semilla de lore con el transform calibrado
 * efectivo (ver S1-T4). Las mallas 3D interactivas se renderizan a partir de el.
 */
export interface RoomArtifact extends RoomArtifactSeed {
  /** Transform aplicado en escena (calibrado o el `default*` de la semilla). */
  transform: ArtifactTransform;
}

/** Estado visual de interaccion de un artefacto (feedback en hover/seleccion). */
export interface ArtifactInteractionState {
  isHovered: boolean;
  isSelected: boolean;
}

/** Datos que consume la tarjeta UI tipo diario narrativo al hacer clic. */
export interface ArtifactLoreCard {
  id: string;
  title: string;
  subtitle: string;
  category: ArtifactCategory;
  description: string;
  accentColor: string;
}

// ---------------------------------------------------------------------------
// S1-T4: Calibracion espacial (Leva)
// ---------------------------------------------------------------------------

/** Transform editable de un artefacto durante la calibracion. */
export interface ArtifactTransform {
  position: Vec3;
  /** Rotacion en radianes por eje (x, y, z). */
  rotation: Vec3;
  scale: Vec3;
}

/** Entrada exportada por la herramienta de calibracion por artefacto. */
export interface CalibrationExportEntry {
  id: string;
  transform: ArtifactTransform;
}

/** Documento final exportado desde Leva con todas las coordenadas ajustadas. */
export interface CalibrationExport {
  version: 1;
  exportedAt: string; // ISO-8601
  entries: CalibrationExportEntry[];
}

// ---------------------------------------------------------------------------
// S1-T2: Atmosfera visual (Mixtape / Life is Strange)
// ---------------------------------------------------------------------------

/** Contrato de iluminacion golden hour con acentos azules en sombra. */
export interface AtmosphereLighting {
  /** Luz direccional calida tipo atardecer. */
  keyLight: { color: string; intensity: number; position: Vec3 };
  /** Relleno frio azulado para las sombras. */
  fillLight: { color: string; intensity: number; position: Vec3 };
  ambientColor: string;
  ambientIntensity: number;
  /** Mapa de sombras suaves. */
  shadowMapSize: number;
}

// ---------------------------------------------------------------------------
// Correccion visual S1: modelos procedurales, entorno y Milo
// ---------------------------------------------------------------------------

/**
 * Props del modelo procedural de un artefacto. Unidades en metros; origen = punto de apoyo
 * (base centrada) o punto de montaje en pared. `defaultScale` del lore es un multiplicador (1 = real).
 */
export interface CustomArtifactModelProps {
  /** Id de `ROOM_LORE` que selecciona el modelo. */
  id: string;
  /** Intensidad emisiva de feedback (0 = reposo, hover ~0.3, seleccion ~0.5). */
  glow: number;
  /** Color emisivo del feedback (el `accentColor` del lore). */
  accent: string;
}

/** Comportamiento del gato Milo. */
export type CatBehavior = 'walking' | 'sitting';

/** Obstaculo rectangular en el plano del suelo (AABB en x,z, metros). */
export interface FloorObstacle {
  id: string;
  min: [number, number];
  max: [number, number];
}

/** Punto libre del suelo al que Milo puede caminar. `sitSpot` = lugar preferido para sentarse. */
export interface CatWaypoint {
  id: string;
  position: [number, number];
  sitSpot?: boolean;
}

/** Contrato del EffectComposer (Bloom sutil, ToneMapping, Vignette). */
export interface AtmospherePostprocessing {
  bloom: { intensity: number; luminanceThreshold: number; radius: number };
  vignette: { offset: number; darkness: number };
  toneMappingEnabled: boolean;
}
