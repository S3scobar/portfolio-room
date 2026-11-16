# Arquitectura y Contratos Técnicos
*(Este archivo es mantenido exclusivamente por Kiro. Define rutas, estado global y contratos TypeScript antes de que Antigravity escriba código).*

## Rutas canónicas
- `src/types/room.ts` — contratos TypeScript del dominio 3D.
- `src/store/useRoomStore.ts` — estado global (Zustand v5).
- `src/data/roomLore.ts` — semillas de lore (`ROOM_LORE`, 16 artefactos). Fuente de verdad del contenido y de los transforms por defecto.
- `src/components/3d/RoomEnvironment.tsx` — habitación procedural (paredes, piso, zócalos, ventanal, cielo, haz de luz, mobiliario).
- `src/components/3d/CustomArtifacts.tsx` — modelos procedurales de los 16 artefactos (`CustomArtifactModel`).
- `src/components/3d/MiloCat.tsx` — gato Milo (autónomo, interactivo).
- `src/components/3d/parts.tsx` — `Ink` (contorno de tinta) y `RBox` (caja biselada con contorno).
- `src/lib/canvasTextures.ts` — texturas Canvas 2D (paredes, piso, cielo, banderas, lomos, caja de luz, pines).
- `src/lib/catNavigation.ts` — navegación de Milo (lógica pura, verificable con Node).
- `src/components/3d/PlayerCharacter.tsx` — avatar jugable (S2-T2).
- `src/components/3d/CameraController.tsx` — cámara orbital con seguimiento y modo escritorio (S1-T1 + S2-T2).
- `src/lib/playerNavigation.ts` — movimiento, colisiones y proximidad del jugador (lógica pura, verificable con Node).
- `src/data/appsRegistry.ts` — las 12 apps del Mini-OS (`PORTFOLIO_APPS`); sus `id` alimentan `openAppId` (S2-T4).
- `public/textures/milo-upright.webp`, `public/textures/badge-minas-card.webp` — derivadas de las fotos originales (generadas con `scripts/generate-derived-textures.js`; los originales no se tocan).

Alias de import: `@/*` → `src/*` (ver `tsconfig.json`).

> **Nota de rol.** Este bloque (correcciones visuales) lo escribió Kiro fuera del alcance habitual del rol ISO (componentes, no solo contratos) por encargo explícito del usuario. Antigravity conecta, calibra y hace QA; no debería reescribir la geometría sin actualizar este documento.

## Estado global — `useRoomStore` (S1-T1)
| Campo | Tipo | Descripción |
|---|---|---|
| `selectedArtifactId` | `string \| null` | Artefacto con tarjeta narrativa abierta. |
| `hoveredArtifactId` | `string \| null` | Artefacto bajo el cursor. |
| `cameraMode` | `CameraMode` | `'orbit' \| 'inspect' \| 'desk'`. |

Acciones: `selectArtifact(id)` (pasa a `inspect`; `null` → `orbit`), `setHoveredArtifact(id)`, `setCameraMode(mode)`, `closeArtifact()`.
Invariante: seleccionar un artefacto implica `cameraMode = 'inspect'`; deseleccionar vuelve a `'orbit'`. El modo `'desk'` queda reservado para Sprint 2.
Milo no añade estado: su clic usa `selectArtifact('photo-milo')` y reutiliza la ficha del lore.

## Contratos de tipos — `src/types/room.ts`
- `Vec3 = [number, number, number]` — posición / rotación (radianes) / escala.
- **S1-T1** `CameraMode`, `CameraConstraints`.
- **S1-T2** `AtmosphereLighting`, `AtmospherePostprocessing`.
- **S1-T3** `RoomArtifactSeed`, `RoomArtifact`, `ArtifactInteractionState`, `ArtifactLoreCard`, `ArtifactCategory`.
- **S1-T4** `ArtifactTransform`, `CalibrationExportEntry`, `CalibrationExport`.
- **S2-T1** `PlayerState` (los cinco campos del jugador), `PlayerTarget` (`id`, `position [x,z]`, `reach?`), `PlayerConfig` (velocidad, radio, límites ±2.2, radio de interacción, histéresis, aparición), `CameraPose` (`position`, `target`, `fov`).
- **Corrección visual** `CustomArtifactModelProps` (`id`, `glow`, `accent`), `CatBehavior` (`'walking' | 'sitting'`), `FloorObstacle` (AABB x,z), `CatWaypoint` (`position`, `sitSpot?`).

## Convención de transform de los modelos procedurales (CAMBIO DE CONTRATO)
Antes, `defaultScale` era el tamaño de una caja con foto. Ahora:
- Unidades en **metros**; cada modelo se construye a tamaño real.
- `defaultScale` es un **multiplicador** (todos `[1, 1, 1]`). El panel Leva lo sigue editando igual.
- `defaultPosition` es el **punto de apoyo**: base centrada para objetos de suelo/escritorio/repisa, y centro del objeto con la cara trasera sobre el muro para objetos de pared.
- Alturas de apoyo: suelo `0`, escritorio `0.78`, repisa baja `1.62`, repisa alta `2.12`. Planos de pared: fondo `z=-2.5`, izquierda `x=-2.5` (`rotY=+π/2`), derecha `x=+2.5` (`rotY=-π/2`).
- Los pósters respetan la proporción real de su textura (`useTexture` lee `image.width/height`).

## Estética de novela gráfica
`<Ink t={0.015} />` equivale a `<Outlines thickness={0.015} color="#1c1613" screenspace />`. **`screenspace` es obligatorio**: en drei 10.7.9 sin él el grosor se mide en píxeles y 0.015 es invisible (verificado con captura). Objetos pequeños usan grosores menores (0.002–0.008) para que el trazo sea proporcional.

## Entorno — `RoomEnvironment`
- Habitación de ±2.5 m en x/z, alto 3 m, **sin techo ni pared frontal** (diorama). Las paredes son planos de una sola cara con la normal hacia adentro: desde fuera son invisibles.
- **`room.glb` ya no se usa**: medía ~8×10 m con una textura de pared gris plana, incompatible con las coordenadas del lore (±2.5 m). `RoomModel.tsx` y `RoomFurniture.tsx` quedan en disco sin importarse (obsoletos, se pueden borrar).
- Paredes: crema `#f1dcb4` (fondo), crema `#eed3a6` (derecha), terracota suave `#d9a07e` (izquierda), con pinceladas pintadas a mano (Canvas 2D). Piso de tablones de madera cálida y zócalos crema.
- Ventanal en la pared izquierda: hueco en `WINDOW = { uMin:-0.45, uMax:1.25, yMin:0.8, yMax:2.6 }` (u = −z). Marco de madera, poste y travesaño, alféizar y una hoja abierta hacia el interior. Detrás, plano de cielo (degradado dorado → naranja → rosa → violeta) con 4 capas de montañas.
- La pared izquierda proyecta sombra (`castShadow`) para que la luz direccional dibuje el parche de la ventana en el piso. Sobre eso hay un haz diagonal (3 planos en abanico, mezcla aditiva) y `<Sparkles>`.
- Mobiliario con `Ink`: escritorio, monitor (`monitor-screen` intacto como ancla del Sprint 2), silla, repisas, cama, alfombra azul con pattern.
- Fondo de escena `#7a5870` (`<color attach="background">` directo bajo el Canvas).

## Artefactos — `CustomArtifactModel`
| id | Modelo procedural | Notas |
|---|---|---|
| `flag-unal`, `flag-aguilas` | Asta de madera + remates + tela (caja delgada con la bandera en ambas caras), 0.82×0.51 m | Texturas Canvas 2D (`unalFlagTexture`, `aguilasFlagTexture`); águila dorada `#D4AF37` |
| `poster-hp`, `poster-interstellar`, `poster-dune-sw-marvel`, `poster-muestra-proyectos`, `poster-cr7` | Marco biselado + plano con la textura sin deformar | `poster-hp` y `poster-cr7` usan imagen; Interstellar (`interstellarPosterTexture`), Dune y Muestra de Proyectos/SAMI (`src/lib/posterTextures.ts`) se dibujan con Canvas 2D |
| `xbox-series-s` | Consola 275×63.5×151 mm con rejilla circular negra + control blanco/verde | Control en el mismo grupo |
| `rubik-cube` | 27 cubitos biselados + 54 stickers, colores reales | Mezcla determinista (`rng(42)`) |
| `ukulele-wood` | Cuerpo en 8 (extrusión), boca y roseta, puente, mástil, 12 trastes, clavijero con 4 clavijas, 4 cuerdas | Escala 1.45, recostado contra la pared izquierda junto al ventanal (rotación Euler XYZ `[-π/2, 1.37, π/2]`) |
| `books-stephen-king` | 4 libros individuales (tapas, hojas, lomo con título): La Cúpula, Dune, Mesías de Dune, 11/22/63 | Sobre la repisa baja |
| `lightbox-lumos` | Caja negra con panel blanco emisivo "LUMOS MAXIMA" + `pointLight` suave | Sobre la repisa alta |
| `totto-backpack-pins` | Mochila azul oscuro/negra, bolsillos, asa y 8 pines metálicos | Junto al escritorio |
| `snoopy-figure` | Figura blanca y negra sentada (cuerpo, cabeza, orejas largas, nariz, mancha) | `snoopy.webp` **no se usa**: es una figura de Hollow Knight |
| `badge-minas` | Credencial plana con su foto real (`badge-minas-card.webp`) y cordón azul | Zona de impacto transparente ampliada |
| `photo-milo` | Marco de escritorio con la foto enderezada (`milo-upright.webp`) | |
| `music-avicii-garrix` | Cajón con 2 fundas, disco de vinilo y audífonos | Genérico: no se inventan portadas de artistas |

Las texturas `poster-cr7` son una tarjeta de texto generada (placeholder); `poster-dune.webp` y `poster-interstellar.webp` ya no se usan. `rubik.webp`, `xbox-series-s.webp` y `lumos-box.webp` ya no se usan.

`ArtifactMesh.tsx` conserva solo la interacción (hover, clic, escala animada) y delega la geometría en `CustomArtifactModel`. Glow: hover `0.3`, selección `0.5`.

## Vista exterior del ventanal — `WindowView` (`src/lib/windowView.ts`)
- Siete planos con alfa (cielo, nubes, montañas, torres, árboles, casas, calle) a 100 → 13.5 m de la cámara inicial `[3.8, 3.2, 4.2]`, orientados hacia ella y escalados con la distancia: desde esa cámara componen una sola imagen y al orbitar se separan (parallax).
- Si se cambia la cámara inicial de `RoomCanvas`, actualizar `WINDOW_VIEW.camera`.

## Milo — `MiloCat`
- Gato atigrado café/gris con rayas, ojos verdes de pupila vertical, bigotes, orejas, 4 patas y cola de 7 segmentos con anillos.
- Máquina de estados `walking` ⇄ `sitting` en `advanceCat` (función de módulo). Velocidad 0.34 m/s, giro suavizado, balanceo de patas en diagonal. Al sentarse levanta el torso, recoge las patas traseras y enrosca la cola.
- Camina entre `CAT_WAYPOINTS` (10 puntos del suelo y la alfombra). `FLOOR_OBSTACLES` (escritorio, silla, cama, morral+ukelele) se inflan 0.17 m; `buildNeighbors()` solo conecta puntos con segmento libre. Verificado con Node: los 10 puntos están libres, el grafo es conexo y los segmentos que cruzan escritorio, cama o silla se rechazan.
- Clic en el gato: `selectArtifact('photo-milo')`. Mientras esa ficha está abierta, Milo se queda sentado. Hover: cursor `pointer`, escala 1.07 y `hoveredArtifactId = 'photo-milo'`.
- Prop `pose?: CatBehavior` fija una pose en el origen (solo para verificación visual).
- Sin estado de React por fotograma: todo vive en refs; los nodos animados se localizan por nombre una vez.

## Sprint 2 — Jugador, proximidad y escritorio (S2-T1, S2-T2)

### Estado del jugador (`PlayerState`, mezclado en `RoomState`)
| Campo | Tipo | Descripción |
|---|---|---|
| `playerPosition` | `Vec3` | Pies del jugador, en metros (los ojos van 1.7 m más arriba). Inicial `[0.9, 0, 0.9]`. |
| `playerRotationY` | `number` | Yaw de la mirada en radianes (sale de la cámara). 0 mira a +z; `π` mira a −z (hacia el escritorio). Inicial `π`. |
| `nearbyTargetId` | `string \| null` | Objetivo interactuable más cercano a < 0.95 m: `'desk-pc'` o un `id` de `ROOM_LORE` (Milo = `'photo-milo'`). |
| `isAtDesk` | `boolean` | Jugador sentado frente al monitor. |
| `deskCameraReady` | `boolean` | (en `RoomState`, no en `PlayerState`) La cámara ya llegó al monitor. Monta el Mini-OS. |
| `openAppId` | `string \| null` | `id` de `PORTFOLIO_APPS` abierta en el Mini-OS. |

Acciones y reglas (las implementa `useRoomStore`; Antigravity solo las llama):
- `setIsAtDesk(true)`: `cameraMode='desk'`, `selectedArtifactId=null`, `nearbyTargetId=null`, `deskCameraReady=false`. `setIsAtDesk(false)`: `openAppId=null`, `cameraMode='orbit'`, `deskCameraReady=false`. Es idempotente. `setDeskCameraReady(v)` lo llama `CameraController`.
- `cameraMode='orbit'` ya no es una órbita: significa **vista libre en primera persona** (el nombre se conserva por compatibilidad del contrato).
- `openApp(id)`: **solo tiene efecto sentado**; de pie no hace nada. `closeApp()`: `openAppId=null`.
- `setPlayerPose(pos, yaw)` y `setNearbyTarget(id)`: los llama `PlayerCharacter`. La pose se publica solo si cambia más de 4 mm o 0.01 rad; `setNearbyTarget` no emite si el valor no cambia (los suscriptores no se re-renderizan por fotograma).
- `selectArtifact` / `closeArtifact` respetan el escritorio: sentado, `cameraMode` se queda en `'desk'`.
- Para el HUD (S2-T3): el prompt de `nearbyTargetId` debe ocultarse si `isAtDesk` o si hay ficha abierta (`selectedArtifactId`). El jugador se queda quieto mientras haya una ficha abierta (y el cursor se libera).

### Movimiento y colisiones (`playerNavigation.ts`)
- `WASD` y flechas, **relativos a la cámara** (W avanza hacia donde mira la cámara proyectada al suelo; A/D van de lado). Velocidad 1.6 m/s, arranque suavizado. El cuerpo no gira: la dirección de la mirada la manda el ratón.
- AABB: reutiliza `FLOOR_OBSTACLES` de `catNavigation.ts` (escritorio, silla, cama, morral+ukelele) inflados por el radio del jugador (0.22 m), más límites de ±2.2 m. Si el movimiento diagonal choca, **desliza** por cada eje por separado.
- Si se mueve algún mueble, cambiar `FLOOR_OBSTACLES`: el gato y el jugador lo comparten.
- Se ignoran las teclas con el foco en `input`/`textarea`/`select` (el panel Leva) y con `Ctrl`/`Alt`/`Meta`.
- Sentado, o con una ficha abierta, el jugador ignora el teclado de movimiento.

### Proximidad
- Objetivos: la zona del escritorio `DESK_ZONE = [0, -1.35]` (id `'desk-pc'`), los artefactos de `ROOM_LORE` y Milo. Las posiciones se leen **de la escena** (`artifact-<id>` y `milo-cat`), no del lore estático: respetan la calibración de Leva y el paseo del gato.
- Radio 0.95 m, con **histéresis de 0.15 m** (el objetivo activo se mantiene hasta 1.10 m) para que el prompt no parpadee. Gana el más cercano.
- **Alcance extra** (`EXTRA_REACH`) para objetos que el mobiliario impide acercar: `books-stephen-king` +0.4, `lightbox-lumos` +0.4, `flag-aguilas` +0.25. Sin esto su prompt nunca aparecería (a 1.11 m, 1.21 m y 0.95 m del punto caminable más cercano). Se calculó con las posiciones del lore actuales; recalcular si se recalibran.
- Sentado, `nearbyTargetId` es `null`.

### Sentarse y levantarse
- Sin avatar, el cambio es instantáneo en el estado y animado solo en la cámara. Al sentarse, el jugador pasa a `SEAT.position` `[0, -1.2]` y la cámara vuela hasta los ojos del asiento (ver *Cámara*). Al levantarse, reaparece en `STAND_SPOT` `[0.7, -0.8]` (caminable, a 0.82 m del escritorio: desde ahí `nearbyTargetId='desk-pc'`) y la cámara vuelve a la vista libre mirando hacia el escritorio.
- Cancelar a mitad de la transición es seguro: se interrumpe el tween y se vuela desde donde esté la cámara. No hay recorrido a pie que pueda dejar al jugador dentro de un obstáculo.
- `deskCameraReady` pasa a `true` cuando la cámara llega al monitor y vuelve a `false` en cuanto se pide levantarse. Es la señal para montar el Mini-OS.

### Cámara en primera persona (`CameraController`) — CAMBIO DE CONTRATO
Se eliminó la tercera persona y `OrbitControls`. **El jugador es la cámara**; no hay avatar visible.
- **Vista libre (`cameraMode='orbit'`):** ojos a `EYE_HEIGHT = 1.7 m` sobre `playerPosition`, FOV 70°, plano cercano 0.05 m, leve vaivén al caminar. Mirar arriba y abajo se limita a ±72°. `PlayerCharacter` corre con prioridad −2, antes que la cámara, para que ésta lea la posición del mismo fotograma.
- **Ratón:** clic en un espacio vacío captura el cursor (Pointer Lock) y el movimiento del ratón gira la vista (`LOOK_SENSITIVITY = 0.0022` rad/px). Si el navegador no permite el bloqueo, mantener el botón izquierdo y arrastrar también gira. `Esc` suelta el cursor. Un clic sobre un objeto con el cursor libre abre su ficha en vez de capturar.
- **Mira (cursor capturado):** el navegador congela las coordenadas del cursor, así que los eventos de puntero de R3F no sirven. En su lugar, cada 100 ms un rayo desde el centro de la pantalla (alcance 3.2 m) escribe `hoveredArtifactId`; el clic selecciona lo apuntado. Una pared o un mueble opaco tapa lo que hay detrás; el haz de luz, el paisaje del ventanal y las partículas no. Con el cursor capturado, `ArtifactMesh` y `MiloCat` **ignoran** los eventos de R3F (`isPointerLocked()` en `src/lib/pointerLock.ts`). `FirstPersonHUD` dibuja la mira, que crece al apuntar a algo.
- **Sentado (`isAtDesk`):** tween GSAP de 1.4 s (`power3.inOut`) de posición, orientación (`slerp`) y FOV hasta los ojos del asiento `SEATED_EYE = [0, 1.30, -1.20]`, mirando el centro de `monitor-screen`. FOV mínimo 44°, mayor si la ventana es más cuadrada para que quepan los 0.9 m de pantalla. Se suelta el cursor para poder usar el Mini-OS. La cabeza del avatar ya no tapa la pantalla, así que la cámara baja de `y=2.0` (antigua pose de tercera persona) a la altura real de los ojos.
- **Al levantarse:** tween de 1.1 s a los ojos sobre `STAND_SPOT`, mirando hacia el escritorio (yaw π, cabeceo −0.12). La vista libre retoma ahí; el cursor queda libre hasta el siguiente clic.
- **Espacio cerrado:** cuatro paredes más un **techo nuevo** (`Ceiling` en `RoomEnvironment`, cara hacia abajo). Los límites del jugador (±2.2 m) lo mantienen a 0.3 m de las paredes, por encima del plano cercano. Desde dentro no se ve el exterior de la página; lo único exterior visible es el paisaje del ventanal (`WindowView`).
- `CAMERA_CONSTRAINTS` (límites de órbita de S1-T1) queda exportado pero sin uso, para no romper importaciones.

### Jugador (`PlayerCharacter`)
- No renderiza geometría (`return null`). Sólo teclado, colisiones, proximidad y asiento. El modelado del avatar de 1.70 m (buzo azul, `Outlines`) se retiró por decisión de producto.
- `ArtifactMesh` expone cada artefacto como un nodo llamado `artifact-<id>` (lo usan la proximidad y la mira).

### Mini-OS en el monitor (`MonitorOS`)
- Solo existe **como interfaz interna de la pantalla 3D** y **solo sentado**: `RoomEnvironment > Monitor` lo monta dentro de `<Html transform>` únicamente con `deskCameraReady = true`, y `MonitorOS` devuelve `null` si `isAtDesk` es falso. De pie no hay ninguna capa DOM del Mini-OS, así que no puede flotar sobre el cuarto.
- Tamaño corregido: en modo `transform`, 1 m = `400 / distanceFactor` px. Con `distanceFactor=0.52` el DOM de 1024×592 medía ~1.33×0.77 m y desbordaba la pantalla (0.9×0.52 m). Ahora `distanceFactor = 400·0.9/1024 ≈ 0.352`, que lo ajusta exacto (misma proporción 1.73).
- Se quitó `occlude`: sentado no hay nada delante de la pantalla, y la prueba de oclusión por fotograma podía ocultar el Mini-OS por una partícula o un plano translúcido.
- Las ventanas de las apps (`absolute inset-4` dentro de un `main` con `overflow-hidden`) ya quedaban contenidas dentro de los 1024×592 px del OS.

## Notas de diseño
- `RoomArtifact.transform` usa la calibración exportada (S1-T4) o, en su defecto, los campos `default*` de `RoomArtifactSeed`.
- Rotaciones siempre en radianes.
- El store no guarda transforms ni atmósfera: son datos derivados/estáticos, no estado de UI.
- **Ubicación de banderas y pósters:** las banderas están en la pared izquierda (`z=1.03` y `z=2.0`, junto al ventanal) y `poster-cr7` al fondo (`x=2.15`). Con la cámara en primera persona las cuatro paredes se ven por dentro, así que ya podría colgarse algo en la pared derecha sin verse por detrás.
- **Póster de Harry Potter eliminado** (`poster-hp`, de `roomLore.ts` y de `CustomArtifacts`). El póster SAMI (`poster-muestra-proyectos`) ocupa su hueco: centrado en el tramo libre de la pared del fondo entre la esquina izquierda (`x=-2.5`) y la repisa (`x=-1.0`), en `[-1.75, 1.85, -2.5]`, hasta 1.0×1.4 m (antes 0.58×0.8). `public/textures/poster-hp.webp` quedó sin uso en disco.
- **Calibración con Leva desactivada por defecto.** `ArtifactsManager` usa los transforms fijos de `roomLore.ts` y no crea ningún control, así que no aparece panel. Para recalibrar: `NEXT_PUBLIC_CALIBRATION=1` en `.env.local` y reiniciar el servidor. Esto también corrige el `Date.now()` en render que `eslint` marcaba.
- **`WindowView` recalibrado.** Sus capas se alinean desde un punto de vista fijo (`WINDOW_VIEW.camera`); ahora son los ojos del punto de aparición `[0.9, 1.7, 0.9]` en vez de la antigua cámara orbital. Si cambia `PLAYER_CONFIG.spawn` o `EYE_HEIGHT`, actualizar ese valor.

## Pendiente para Antigravity (conectar y QA)
1. **Rendimiento real.** No se pudo validar los 60 FPS: el entorno de verificación (Edge headless con SwiftShader por software) rinde ~1.6 FPS. Medir con GPU real. La escena tiene cientos de mallas con contorno; si baja de 60 FPS, reducir `Outlines` en objetos lejanos o fusionar geometrías.
2. **Iluminación.** `Atmosphere.tsx` no se tocó. Revisar que las paredes crema no se quemen con `hemisphereLight` + `ambientLight` + ACES. Además, three 0.187 avisa `PCFSoftShadowMap has been removed`; el log lo emite Next, conviene cambiar el tipo de sombra a `PCFShadowMap`.
3. **Leva.** Desactivada por defecto (ver *Notas de diseño*). Al recalibrar con `NEXT_PUBLIC_CALIBRATION=1`, los defaults tienen otro significado (escala = multiplicador): reexportar la calibración y copiar los valores a `roomLore.ts`.
4. **Milo.** Comprobar a 60 FPS que no atraviesa muebles, que el clic funciona en movimiento y que la pose sentada no se corta con el suelo. Ajustar `CAT_WAYPOINTS` si se calibran muebles.
5. **Verificación visual de objetos.** Hay dudas de legibilidad en tamaño real: el título "LA CUPULA" del lomo, los pines del morral y el cordón de la credencial. Revisar con zoom de cámara.
6. **SIN VERIFICAR: la corrección a primera persona se escribió sin compilar ni ejecutar nada** (por indicación expresa de no usar la terminal). Antes de dar nada por bueno, correr `npx tsc --noEmit`, `npx eslint src` y `npm run build`, y probar a mano: (a) clic para capturar el cursor y mirar con el ratón; (b) caminar con WASD sin atravesar muebles ni paredes; (c) mirar hacia arriba y a las esquinas: no debe verse el exterior; (d) apuntar a un objeto con la mira (se ilumina) y hacer clic: abre la ficha y suelta el cursor; (e) `E` junto al escritorio: la cámara vuela al monitor y aparece el Mini-OS cubriendo exactamente la pantalla; (f) `Esc` sentado: vuelve y el Mini-OS desaparece; (g) caminando, no debe verse ninguna capa del Mini-OS flotando.
7. **Limpieza opcional.** `public/models/room.glb` (4.4 MB), `RoomModel.tsx` y `RoomFurniture.tsx` ya no se usan.

### Sprint 2: estado de verificación
1. **S2-T3 (HUD) y S2-T4 (Mini-OS)** los implementó Antigravity (`RoomOverlay`: `E` y `Escape`; `MonitorOS`). Este cambio de primera persona los toca solo en: el montaje del Mini-OS (ver *Mini-OS en el monitor*), una guarda en `MonitorOS`, y el texto de ayuda de `RoomOverlay`. `Esc` con el cursor capturado lo consume el navegador (suelta el cursor) y **no llega a la página**: hace falta pulsarlo una segunda vez para levantarse o cerrar. Sentado y con una ficha abierta el cursor ya está libre, así que ahí `Esc` funciona a la primera.
2. **Verificado antes del cambio a primera persona** (en la versión de tercera persona): colisiones, deslizamiento, límites, conectividad, proximidad con histéresis (Node) y, en navegador, movimiento por teclado, sentarse, levantarse, `openApp` solo sentado y teclado ignorado en campos de texto. **La lógica pura (`playerNavigation.ts`) no cambió y sigue vigente. Todo lo de cámara, ratón, mira y Mini-OS es nuevo y NO está verificado** (ver punto 6 de la lista anterior).
3. **Riesgos conocidos a revisar primero:** (a) el tamaño del Mini-OS se calculó con la fórmula de `Html transform` de drei (1 m = 400/`distanceFactor` px), no se vio en pantalla; (b) `WindowView` se recalibró a los ojos del punto de aparición, el horizonte del ventanal puede necesitar ajuste fino; (c) la mira hace un rayo contra toda la escena cada 100 ms: si cuesta FPS, restringirlo a `artifacts-group` y `milo-cat`.
