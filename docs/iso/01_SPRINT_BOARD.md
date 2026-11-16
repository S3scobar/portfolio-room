# Sprint Board (ISO/IEC 12207)
Estados válidos: `[TODO]` | `[EN_ARQUITECTURA]` | `[LISTO_PARA_DEV]` | `[LISTO_PARA_QA]` | `[APROBADO]`

## Sprint 1: Entorno 3D Base, Atmósfera Mixtape/LiS y Decoración Personal
- **S1-T1 [LISTO_PARA_DEV] Escena 3D y Cámara Restringida:** Configurar Canvas R3F con `public/models/room.glb`, controles `OrbitControls` con límites de ángulo/zoom (sin atravesar paredes ni suelo) y estado global en Zustand (`selectedArtifactId`, `hoveredArtifactId`, `cameraMode`).
- **S1-T2 [LISTO_PARA_DEV] Atmósfera Visual Mixtape / Life is Strange:** Implementar iluminación direccional cálida tipo golden hour (atardecer con acentos azules en sombra), sombras suaves y `EffectComposer` con `Bloom` sutil, `ToneMapping` y `Vignette`.
- **S1-T3 [LISTO_PARA_DEV] Sistema de Artefactos Interactivos y Lore:** Renderizar los 16 objetos personales definidos en `src/data/roomLore.ts` como mallas/planos 3D interactivos con feedback visual en hover (escala/brillo) y tarjeta UI tipo diario narrativo al hacer clic.
- **S1-T4 [LISTO_PARA_DEV] Herramienta de Calibración Espacial (Leva):** Integrar controles temporales de `Leva` para ajustar posición `[x, y, z]`, rotación y escala de cada artefacto sobre el modelo `.glb` base y exportar coordenadas finales.

> **Corrección visual S1 (Kiro):** entorno procedural (`RoomEnvironment`), 16 modelos 3D (`CustomArtifacts`) y gato Milo (`MiloCat`) listos. Cambia la convención de defaultScale (ahora multiplicador, 1 = tamaño real) y los orígenes de apoyo. Antigravity: conectar, recalibrar con Leva y hacer QA según la sección *Pendiente para Antigravity* de `02_ARCHITECTURE.md`.

### Criterios de Aceptación (DoD Sprint 1)
1. 0 errores en consola de navegador ni errores de compilación TypeScript (`npm run build` limpio).
2. La cámara gira fluida a 60 FPS sin cruzar muros ni el piso.
3. Al pasar el cursor sobre cualquier objeto personal cambia el cursor a `pointer` y resalta el objeto; al hacer clic se abre su ficha narrativa con título, categoría y anécdota.
4. El escritorio y el monitor quedan despejados y listos como punto de anclaje para el Sprint 2.

## Sprint 2: Personaje Jugable, Interacción por Proximidad y Mini-OS del Monitor
- **S2-T1 [LISTO_PARA_DEV] Estado de Juego y Contratos de Jugador:** Extender `src/types/room.ts` y `src/store/useRoomStore.ts` con `playerPosition`, `playerRotationY`, `nearbyTargetId`, `isAtDesk` y `openAppId`, más acciones para sentarse/levantarse del escritorio.
- **S2-T2 [LISTO_PARA_DEV] Avatar 3D Jugable y Colisiones (`PlayerCharacter.tsx`):** Modelar personaje estilizado mío con `<Outlines thickness={0.015} color="#1c1613" />`, movimiento fluido con `WASD` / Flechas, animación de caminata/sentado, colisiones reutilizando los obstáculos de `src/lib/catNavigation.ts` y cámara de seguimiento suave en `CameraController.tsx`.
- **S2-T3 [TODO] HUD de Proximidad estilo Life is Strange:** Mostrar prompt flotante (`[E] Inspeccionar <objeto>` / `[E] Sentarse en el PC`) cuando `nearbyTargetId` esté activo y ejecutar la acción con la tecla `E` (y `Escape` para levantarse).
- **S2-T4 [TODO] Mini-OS en el Monitor (`MonitorOS.tsx`):** Proyectar un escritorio interactivo sobre la malla `monitor-screen` usando `<Html transform occlude>` de `@react-three/drei` con ventanas funcionales (`iframe` + fallback elegante) para **LUKA** y mis 12 webs.
