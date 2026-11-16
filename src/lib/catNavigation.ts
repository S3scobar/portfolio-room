// Navegacion de Milo sobre el suelo (plano x,z). Logica pura, sin dependencias de three/React,
// para poder verificarla con Node. Unidades en metros.
import type { CatWaypoint, FloorObstacle } from '../types/room';

/** Radio de holgura del gato: los obstaculos se inflan por este valor. */
export const CAT_CLEARANCE = 0.17;

/** Limites caminables del suelo (dentro de los zocalos). */
export const FLOOR_BOUNDS = { minX: -2.3, maxX: 2.3, minZ: -2.3, maxZ: 2.3 } as const;

/** Muebles y objetos de suelo que Milo debe esquivar (AABB en x,z). */
export const FLOOR_OBSTACLES: FloorObstacle[] = [
  { id: 'escritorio', min: [-1.3, -2.3], max: [1.3, -1.3] },
  { id: 'silla', min: [-0.35, -1.45], max: [0.35, -0.85] },
  { id: 'cama', min: [-2.45, 1.34], max: [-0.35, 2.46] },
  { id: 'morral-y-ukelele', min: [-2.4, -1.8], max: [-1.4, -1.3] },
];

/** Puntos libres del suelo y alfombra azul. `sitSpot` = lugares donde le gusta sentarse. */
export const CAT_WAYPOINTS: CatWaypoint[] = [
  { id: 'esquina-frente-der', position: [1.8, 1.8] },
  { id: 'lado-derecho', position: [1.7, 0.3], sitSpot: true },
  { id: 'frente-centro', position: [0.3, 1.8] },
  { id: 'alfombra-frente', position: [0.45, 0.7], sitSpot: true },
  { id: 'alfombra-izq', position: [-0.6, 0.5] },
  { id: 'junto-ventana-frente', position: [-1.8, 0.5] },
  { id: 'junto-ventana-fondo', position: [-1.9, -0.5], sitSpot: true },
  { id: 'alfombra-centro-izq', position: [-0.9, -0.1] },
  { id: 'parche-de-sol', position: [0.1, -0.1], sitSpot: true },
  { id: 'pasillo-cama', position: [0.55, 1.25] },
];

function insideInflated(x: number, z: number, o: FloorObstacle, pad: number) {
  return x > o.min[0] - pad && x < o.max[0] + pad && z > o.min[1] - pad && z < o.max[1] + pad;
}

/** Un punto es libre si esta dentro del suelo y fuera de todos los obstaculos inflados. */
export function pointClear(x: number, z: number, pad = CAT_CLEARANCE): boolean {
  if (x < FLOOR_BOUNDS.minX || x > FLOOR_BOUNDS.maxX || z < FLOOR_BOUNDS.minZ || z > FLOOR_BOUNDS.maxZ) return false;
  return !FLOOR_OBSTACLES.some((o) => insideInflated(x, z, o, pad));
}

/** Un segmento es libre si muestreado cada 4 cm no entra en ningun obstaculo inflado. */
export function segmentClear(a: [number, number], b: [number, number], pad = CAT_CLEARANCE): boolean {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const steps = Math.max(2, Math.ceil(Math.hypot(dx, dz) / 0.04));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (!pointClear(a[0] + dx * t, a[1] + dz * t, pad)) return false;
  }
  return true;
}

/** Lista de adyacencia: para cada waypoint, los indices alcanzables en linea recta sin chocar. */
export function buildNeighbors(points: CatWaypoint[] = CAT_WAYPOINTS): number[][] {
  return points.map((p, i) =>
    points.reduce<number[]>((acc, q, j) => {
      if (i !== j && segmentClear(p.position, q.position)) acc.push(j);
      return acc;
    }, []),
  );
}
