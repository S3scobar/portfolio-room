'use client';

// Camara en PRIMERA PERSONA (S1-T1 + S2-T2). Reemplaza al OrbitControls y al seguimiento en tercera persona.
// - Libre: la camara esta en los ojos del jugador (y = 1.7 m) sobre `playerPosition`, con un leve vaiven al caminar.
//   El raton gira la vista: clic en el espacio vacio captura el cursor (Pointer Lock); si el navegador no lo permite,
//   mantener el boton izquierdo y arrastrar tambien gira. `Esc` suelta el cursor.
// - Con el cursor capturado no hay puntero que "pase por encima" de los objetos: la interaccion usa la MIRA
//   (rayo desde el centro de la pantalla, alcance 3.2 m) y actualiza `hoveredArtifactId`; el clic abre la ficha.
// - Sentado (`isAtDesk`): transicion GSAP a los ojos del asiento mirando `monitor-screen`; se suelta el cursor para
//   poder usar el Mini-OS. Al terminar publica `deskCameraReady`. Al levantarse, vuelve a la vista libre.
// El espacio es cerrado (4 paredes + techo en `RoomEnvironment`): desde dentro no se ve el exterior de la pagina.
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { useRoomStore } from '@/store/useRoomStore';
import { PLAYER_CONFIG, SEAT, STAND_SPOT } from '@/lib/playerNavigation';
import { isPointerLocked } from '@/lib/pointerLock';
import type { CameraConstraints, Vec3 } from '@/types/room';

/** LEGADO (S1-T1): limites del OrbitControls. Ya no se usan con la camara en primera persona; se conserva el export. */
export const CAMERA_CONSTRAINTS: CameraConstraints = {
  minDistance: 1.8,
  maxDistance: 6.2,
  minPolarAngle: Math.PI / 6,
  maxPolarAngle: Math.PI / 2.08,
  minAzimuthAngle: -Math.PI / 1.8,
  maxAzimuthAngle: Math.PI / 1.8,
  target: [0, 1.1, 0],
};

/** Altura de los ojos de pie (m). */
export const EYE_HEIGHT = 1.7;
/** Campo de vision vertical en la vista libre (grados). Debe coincidir con `camera.fov` de `RoomCanvas`. */
export const FIRST_PERSON_FOV = 70;
/** Radianes por pixel de movimiento del raton. */
export const LOOK_SENSITIVITY = 0.0022;
/** Limite de cabeceo arriba/abajo (rad, ~72 grados). */
export const PITCH_LIMIT = 1.25;
/** Alcance de la mira para inspeccionar objetos (m). */
export const PICK_DISTANCE = 3.2;
/** Ojos sentado: cojin a 0.52 m + ~0.78 m. Se asienta sobre la silla frente al monitor. */
export const SEATED_EYE: Vec3 = [SEAT.position[0], 1.3, SEAT.position[1]];
/** Campo de vision frente al monitor (a ~0.78 m la pantalla de 0.9x0.52 m llena ~80 % de la vista). */
export const DESK_CAMERA_FOV = 44;
/** Centro de `monitor-screen` si la malla no se encuentra. */
export const DESK_SCREEN_FALLBACK: Vec3 = [0, 1.16, -1.978];

/** Mirada al levantarse: hacia el escritorio (yaw PI mira a -z) y levemente hacia abajo. */
const STAND_YAW = Math.PI;
const STAND_PITCH = -0.12;
/** Semiancho de `monitor-screen` (m) con 12 % de margen, para calcular el FOV minimo segun el aspecto de la ventana. */
const SCREEN_HALF_WIDTH = 0.45 * 1.12;
const MILO_LORE_ID = 'photo-milo';

type Phase = 'free' | 'to-desk' | 'desk' | 'from-desk';

/** Id del lore del objeto interactivo que contiene a `obj` (nodos `artifact-<id>` y `milo-cat`), o null. */
function interactiveId(obj: THREE.Object3D | null): string | null {
  for (let o = obj; o; o = o.parent) {
    if (o.name.startsWith('artifact-')) return o.name.slice('artifact-'.length);
    if (o.name === 'milo-cat') return MILO_LORE_ID;
  }
  return null;
}

const pickRay = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0);

/**
 * Objeto interactivo que hay en el punto `ndc` de la pantalla (coordenadas normalizadas -1..1; (0,0) = la mira),
 * hasta `far` metros. Un objeto opaco no interactivo (pared, mueble) tapa lo que hay detras; los planos
 * transparentes (haz de luz, vistas del ventanal) y las particulas no bloquean.
 */
function pickAt(scene: THREE.Scene, camera: THREE.Camera, ndc: THREE.Vector2, far: number): string | null {
  pickRay.setFromCamera(ndc, camera);
  pickRay.far = far;
  const hits = pickRay.intersectObjects(scene.children, true);
  for (const h of hits) {
    const id = interactiveId(h.object);
    if (id) return id;
    if ((h.object as THREE.Points).isPoints) continue;
    const m = (h.object as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    const mat = Array.isArray(m) ? m[0] : m;
    if (!mat || !mat.transparent) return null;
  }
  return null;
}

/** Orientacion de una camara en `from` que mira a `to` (sin roll). */
function lookQuaternion(from: THREE.Vector3, to: THREE.Vector3, out: THREE.Quaternion) {
  const m = new THREE.Matrix4().lookAt(from, to, new THREE.Vector3(0, 1, 0));
  out.setFromRotationMatrix(m);
}

export function CameraController() {
  const { camera, scene, gl } = useThree();
  const isAtDesk = useRoomStore((s) => s.isAtDesk);
  const selectedArtifactId = useRoomStore((s) => s.selectedArtifactId);

  const phase = useRef<Phase>('free');
  const look = useRef({ yaw: PLAYER_CONFIG.spawnYaw, pitch: -0.08 });
  const bob = useRef({ lastX: NaN, lastZ: NaN, phase: 0, amp: 0 });
  const pickTimer = useRef(0);
  const tween = useRef<gsap.core.Tween | null>(null);
  const prevAtDesk = useRef(false);

  // Raton: girar la vista, capturar el cursor y actuar sobre la mira
  useEffect(() => {
    const el = gl.domElement;
    const blocked = () => {
      const s = useRoomStore.getState();
      return s.isAtDesk || s.selectedArtifactId !== null || phase.current !== 'free';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (blocked()) return;
      const locked = document.pointerLockElement === el;
      if (!locked && e.buttons !== 1) return;
      const l = look.current;
      l.yaw -= e.movementX * LOOK_SENSITIVITY;
      l.pitch = THREE.MathUtils.clamp(l.pitch - e.movementY * LOOK_SENSITIVITY, -PITCH_LIMIT, PITCH_LIMIT);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || e.target !== el || blocked()) return;
      const s = useRoomStore.getState();
      if (document.pointerLockElement === el) {
        // Cursor capturado: el clic actua sobre lo que apunta la mira
        if (s.hoveredArtifactId) s.selectArtifact(s.hoveredArtifactId);
        return;
      }
      // Cursor libre sobre un objeto: el clic abre su ficha (evento de R3F); no se captura el cursor.
      // Se comprueba con un rayo propio en este instante: `hoveredArtifactId` puede estar obsoleto si el
      // jugador camino con el raton quieto (R3F solo recalcula el hover cuando el raton se mueve).
      const rect = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      camera.updateMatrixWorld();
      if (pickAt(scene, camera, ndc, 100)) return;
      void Promise.resolve(el.requestPointerLock()).catch(() => {});
    };
    const onLockChange = () => {
      if (document.pointerLockElement === null) useRoomStore.getState().setHoveredArtifact(null);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onLockChange);
    el.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onLockChange);
      el.removeEventListener('mousedown', onMouseDown);
    };
  }, [gl, camera, scene]);

  // Sentado o con una ficha abierta se necesita el cursor: se suelta la captura
  useEffect(() => {
    if ((isAtDesk || selectedArtifactId !== null) && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isAtDesk, selectedArtifactId]);

  // Transicion al sentarse / levantarse (solo cuando `isAtDesk` cambia de verdad; inmune al doble efecto de StrictMode)
  useEffect(() => {
    if (prevAtDesk.current === isAtDesk) return;
    prevAtDesk.current = isAtDesk;
    tween.current?.kill();

    const cam = camera as THREE.PerspectiveCamera;
    const fromPos = cam.position.clone();
    const fromQuat = cam.quaternion.clone();
    const fromFov = cam.fov;
    const toPos = new THREE.Vector3();
    const toQuat = new THREE.Quaternion();
    let toFov: number;

    if (isAtDesk) {
      phase.current = 'to-desk';
      toPos.fromArray(SEATED_EYE);
      const target = new THREE.Vector3();
      const screen = scene.getObjectByName('monitor-screen');
      if (screen) screen.getWorldPosition(target);
      else target.fromArray(DESK_SCREEN_FALLBACK);
      lookQuaternion(toPos, target, toQuat);
      // FOV vertical: el de diseno, o mas si en una ventana mas cuadrada la pantalla no cabe a lo ancho
      const widthFov = THREE.MathUtils.radToDeg(2 * Math.atan(SCREEN_HALF_WIDTH / toPos.distanceTo(target) / cam.aspect));
      toFov = Math.max(DESK_CAMERA_FOV, widthFov);
    } else {
      phase.current = 'from-desk';
      toPos.set(STAND_SPOT[0], EYE_HEIGHT, STAND_SPOT[1]);
      toQuat.setFromEuler(new THREE.Euler(STAND_PITCH, STAND_YAW + Math.PI, 0, 'YXZ'));
      toFov = FIRST_PERSON_FOV;
    }

    const p = { k: 0 };
    tween.current = gsap.to(p, {
      k: 1,
      duration: isAtDesk ? 1.4 : 1.1,
      ease: 'power3.inOut',
      onUpdate: () => {
        cam.position.lerpVectors(fromPos, toPos, p.k);
        cam.quaternion.slerpQuaternions(fromQuat, toQuat, p.k);
        cam.fov = THREE.MathUtils.lerp(fromFov, toFov, p.k);
        cam.updateProjectionMatrix();
      },
      onComplete: () => {
        if (isAtDesk) {
          phase.current = 'desk';
          useRoomStore.getState().setDeskCameraReady(true);
        } else {
          // La vista libre retoma desde donde termino la transicion (mirando hacia el escritorio)
          look.current = { yaw: STAND_YAW, pitch: STAND_PITCH };
          bob.current.lastX = NaN;
          phase.current = 'free';
        }
      },
    });
    return () => {
      tween.current?.kill();
    };
  }, [isAtDesk, camera, scene]);

  // Vista libre: ojos sobre la posicion del jugador + mira. Corre despues de `PlayerCharacter` (prioridad -2).
  useFrame((state, rawDelta) => {
    if (phase.current !== 'free') return;
    const cam = state.camera;
    const dt = Math.min(rawDelta, 0.05);
    const p = useRoomStore.getState().playerPosition;

    const b = bob.current;
    if (Number.isNaN(b.lastX)) {
      b.lastX = p[0];
      b.lastZ = p[2];
    }
    const moved = Math.hypot(p[0] - b.lastX, p[2] - b.lastZ);
    b.lastX = p[0];
    b.lastZ = p[2];
    const speed = dt > 0 ? moved / dt : 0;
    b.phase += moved * 7;
    b.amp += (Math.min(1, speed / PLAYER_CONFIG.walkSpeed) - b.amp) * Math.min(1, dt * 8);

    cam.position.set(p[0], EYE_HEIGHT + Math.sin(b.phase) * 0.014 * b.amp, p[2]);
    cam.rotation.set(look.current.pitch, look.current.yaw + Math.PI, 0, 'YXZ');

    // Mira: solo con el cursor capturado (con el cursor libre, el hover lo resuelve R3F)
    pickTimer.current += rawDelta;
    if (pickTimer.current >= 0.1) {
      pickTimer.current = 0;
      if (isPointerLocked()) {
        cam.updateMatrixWorld();
        const id = pickAt(state.scene, cam, screenCenter, PICK_DISTANCE);
        const st = useRoomStore.getState();
        if (st.hoveredArtifactId !== id) st.setHoveredArtifact(id);
      }
    }
  });

  return null;
}
