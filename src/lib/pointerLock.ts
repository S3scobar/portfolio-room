// Estado del bloqueo de puntero (mouse look en primera persona). Con el cursor capturado, el navegador
// congela `clientX/clientY`, asi que los eventos de puntero de R3F (hover/clic) apuntarian a un punto
// obsoleto. Mientras haya bloqueo, la interaccion se hace con la mira (rayo desde el centro de la pantalla).

/** true si el cursor esta capturado (mirando con el raton). */
export function isPointerLocked(): boolean {
  return typeof document !== 'undefined' && document.pointerLockElement !== null;
}
