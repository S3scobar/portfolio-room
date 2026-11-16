// Navegacion del jugador sobre el suelo (plano x,z). Logica pura, sin three/React, para poder
// verificarla con Node. Reutiliza los obstaculos del gato (`FLOOR_OBSTACLES`). Unidades en metros.
import { pointClear } from './catNavigation';
import type { PlayerConfig, PlayerTarget } from '../types/room';

/** Id especial de la zona del escritorio (sentarse frente al PC). */
export const DESK_TARGET_ID = 'desk-pc';

/** Zona del escritorio: borde frontal, centrado. Es un objetivo mas para la proximidad. */
export const DESK_ZONE: PlayerTarget = { id: DESK_TARGET_ID, position: [0, -1.35] };

/** Asiento: centro de la silla (la silla esta en [0, -1.15]; el avatar se adelanta 5 cm para que los muslos entren bajo el escritorio). */
export const SEAT = { position: [0, -1.2] as [number, number], yaw: Math.PI, seatTopY: 0.52 };

/** Punto libre donde queda el avatar al levantarse (delante de la silla, fuera del obstaculo inflado). */
export const STAND_SPOT: [number, number] = [0.7, -0.8];

/** Punto por el que el avatar entra a la silla de lado (el respaldo esta del lado +z). */
export const SEAT_SIDE_STEP: [number, number] = [0.62, -1.0];

/**
 * Alcance extra (m) por id de `ROOM_LORE`. Estos objetos estan sobre las repisas o tras la cama y el
 * mobiliario impide acercarse a menos de `interactRadius`: sin esto su prompt nunca apareceria.
 */
export const EXTRA_REACH: Record<string, number> = {
  'books-stephen-king': 0.4,
  'lightbox-lumos': 0.4,
  'flag-aguilas': 0.25,
};

export const PLAYER_CONFIG: PlayerConfig = {
  walkSpeed: 1.6,
  turnSharpness: 12,
  radius: 0.22,
  boundsMin: [-2.2, -2.2],
  boundsMax: [2.2, 2.2],
  interactRadius: 0.95,
  hysteresis: 0.15,
  spawn: [0.9, 0.9],
  spawnYaw: Math.PI,
};

/** Angulo con signo mas corto (rad) para girar de `from` a `to`. */
export function shortestAngle(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** Un punto es caminable si esta dentro de +-2.2 m y fuera de los obstaculos inflados por el radio del jugador. */
export function walkable(x: number, z: number, cfg: PlayerConfig = PLAYER_CONFIG): boolean {
  if (x < cfg.boundsMin[0] || x > cfg.boundsMax[0] || z < cfg.boundsMin[1] || z > cfg.boundsMax[1]) return false;
  return pointClear(x, z, cfg.radius);
}

/**
 * Aplica un desplazamiento (dx, dz) con colisiones AABB y deslizamiento por ejes: si el
 * movimiento diagonal choca, intenta cada eje por separado para rozar la pared o el mueble.
 */
export function moveWithCollisions(
  x: number,
  z: number,
  dx: number,
  dz: number,
  cfg: PlayerConfig = PLAYER_CONFIG,
): [number, number] {
  let nx = x;
  let nz = z;
  if (walkable(x + dx, z + dz, cfg)) return [x + dx, z + dz];
  if (dx !== 0 && walkable(x + dx, z, cfg)) nx = x + dx;
  if (dz !== 0 && walkable(nx, z + dz, cfg)) nz = z + dz;
  return [nx, nz];
}

/**
 * Elige el objetivo interactuable mas cercano dentro de `interactRadius`. El objetivo ya activo
 * (`currentId`) conserva una ventaja de `hysteresis` metros y un radio ampliado en esa misma
 * cantidad, para que el prompt no parpadee en el borde. Varios objetivos pueden compartir id
 * (por ejemplo el retrato de Milo y el gato): gana el mas cercano.
 */
export function findNearbyTarget(
  px: number,
  pz: number,
  targets: PlayerTarget[],
  currentId: string | null,
  cfg: PlayerConfig = PLAYER_CONFIG,
): string | null {
  let bestId: string | null = null;
  let bestScore = Infinity;
  for (const t of targets) {
    const d = Math.hypot(t.position[0] - px, t.position[1] - pz);
    const isCurrent = t.id === currentId;
    const limit = cfg.interactRadius + (t.reach ?? 0) + (isCurrent ? cfg.hysteresis : 0);
    if (d > limit) continue;
    const score = isCurrent ? d - cfg.hysteresis : d;
    if (score < bestScore) {
      bestScore = score;
      bestId = t.id;
    }
  }
  return bestId;
}
