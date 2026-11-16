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
| `playerPosition` | `Vec3` | Pies del avatar, en metros. Inicial `[0.9, 0, 0.9]`. |
| `playerRotationY` | `number` | Yaw en radianes. 0 mira a +z; `π` mira a −z (hacia el escritorio). Inicial `π`. |
| `nearbyTargetId` | `string \| null` | Objetivo interactuable más cercano a < 0.95 m: `'desk-pc'` o un `id` de `ROOM_LORE` (Milo = `'photo-milo'`). |
| `isAtDesk` | `boolean` | Avatar sentado frente al monitor. |
| `openAppId` | `string \| null` | `id` de `PORTFOLIO_APPS` abierta en el Mini-OS. |

Acciones y reglas (las implementa `useRoomStore`; Antigravity solo las llama):
- `setIsAtDesk(true)`: `cameraMode='desk'`, `selectedArtifactId=null`, `nearbyTargetId=null`. `setIsAtDesk(false)`: `openAppId=null`, `cameraMode='orbit'`. Es idempotente.
- `openApp(id)`: **solo tiene efecto sentado**; de pie no hace nada. `closeApp()`: `openAppId=null`.
- `setPlayerPose(pos, yaw)` y `setNearbyTarget(id)`: los llama `PlayerCharacter`. La pose se publica solo si cambia más de 4 mm o 0.01 rad; `setNearbyTarget` no emite si el valor no cambia (los suscriptores no se re-renderizan por fotograma).
- `selectArtifact` / `closeArtifact` respetan el escritorio: sentado, `cameraMode` se queda en `'desk'`.
- Para el HUD (S2-T3): el prompt de `nearbyTargetId` debe ocultarse si `isAtDesk` o si hay ficha abierta (`selectedArtifactId`). El avatar se queda quieto mientras haya una ficha abierta.

### Movimiento y colisiones (`playerNavigation.ts`)
- `WASD` y flechas, **relativos a la cámara** (W avanza hacia donde mira la cámara proyectada al suelo). El yaw gira suavemente hacia el avance. Velocidad 1.6 m/s, arranque suavizado.
- AABB: reutiliza `FLOOR_OBSTACLES` de `catNavigation.ts` (escritorio, silla, cama, morral+ukelele) inflados por el radio del avatar (0.22 m), más límites de ±2.2 m. Si el movimiento diagonal choca, **desliza** por cada eje por separado.
- Si se mueve algún mueble, cambiar `FLOOR_OBSTACLES`: el gato y el jugador lo comparten.
- Se ignoran las teclas con el foco en `input`/`textarea`/`select` (el panel Leva) y con `Ctrl`/`Alt`/`Meta`.
- Los modos no libres (sentándose, sentado, levantándose) ignoran el teclado.

### Proximidad
- Objetivos: la zona del escritorio `DESK_ZONE = [0, -1.35]` (id `'desk-pc'`), los artefactos de `ROOM_LORE` y Milo. Las posiciones se leen **de la escena** (`artifact-<id>` y `milo-cat`), no del lore estático: respetan la calibración de Leva y el paseo del gato.
- Radio 0.95 m, con **histéresis de 0.15 m** (el objetivo activo se mantiene hasta 1.10 m) para que el prompt no parpadee. Gana el más cercano.
- **Alcance extra** (`EXTRA_REACH`) para objetos que el mobiliario impide acercar: `books-stephen-king` +0.4, `lightbox-lumos` +0.4, `flag-aguilas` +0.25. Sin esto su prompt nunca aparecería (a 1.11 m, 1.21 m y 0.95 m del punto caminable más cercano). Se calculó con las posiciones del lore actuales; recalcular si se recalibran.
- Mientras el avatar se sienta, está sentado o se levanta, `nearbyTargetId` es `null`.

### Sentarse y levantarse
- El avatar rodea la silla por el lado (`SEAT_SIDE_STEP` `[0.62, -1.0]`), se sienta en `SEAT.position` `[0, -1.2]` mirando a −z, y al levantarse termina en `STAND_SPOT` `[0.7, -0.8]` (caminable, a 0.82 m del escritorio: desde ahí `nearbyTargetId='desk-pc'`).
- Duración sentarse ≈ 0.9–1.5 s, levantarse 0.9 s. **Cancelar a mitad de camino no es instantáneo**: el avatar completa el paso y se levanta; así nunca queda dentro de un obstáculo.
- Pose sentada: cadera a 0.58 m, muslos casi horizontales, pantorrillas verticales, antebrazos sobre el teclado.

### Cámara (`CameraController`)
- **Seguimiento (modo `orbit`):** `OrbitControls` se conserva (arrastrar y zoom). Cámara y punto de mira se desplazan juntos hacia el torso del jugador (`y=1.05`) con suavizado exponencial (rapidez 7/s), así que el ángulo y el zoom elegidos por el usuario se mantienen. Desplazamiento inicial `(3.2, 2.4, 3.7)`.
- **Escritorio (`isAtDesk`):** tween GSAP de 1.5 s (`power3.inOut`) de posición, objetivo y FOV hacia una pose calculada desde la malla `monitor-screen` (desplazamiento `(0, 0.84, 1.48)`, FOV 28°). `OrbitControls` se desactiva mientras dura el modo escritorio. Si `monitor-screen` no existe, usa `DESK_CAMERA_FALLBACK`.
- **La pose NO es arbitraria:** con la cámara a `y=1.75` la cabeza del avatar sentado tapaba la fila inferior de la pantalla (8 de 81 puntos de la línea de visión). A `y≈2.0, z≈-0.5` quedan 0/81 tapados. Importa para S2-T4: un `<Html transform occlude>` se ocultaría detrás de la cabeza.
- Al levantarse, vuelve a la pose de seguimiento que tenía antes de sentarse (1.2 s) y reactiva `OrbitControls`.
- La cámara por defecto ya no mira al centro de la habitación (`CAMERA_CONSTRAINTS.target` quedó solo como referencia).

### Avatar (`PlayerCharacter`)
- 1.70 m, procedural, buzo azul con capucha y cordones, vaqueros, zapatillas blancas. Contorno de tinta con el mismo `Ink` del resto de la escena (`<Outlines thickness={0.015} color="#1c1613" screenspace />`).
- Caminata: piernas en diagonal, brazos opuestos, balanceo del torso y rebote; respiración en reposo. Sin estado de React por fotograma (todo en refs).
- El avatar no intercepta el raycast, así que no tapa los clics de los artefactos que tiene detrás.
- `ArtifactMesh` expone cada artefacto como un nodo llamado `artifact-<id>` (lo usa la proximidad).

## Notas de diseño
- `RoomArtifact.transform` usa la calibración exportada (S1-T4) o, en su defecto, los campos `default*` de `RoomArtifactSeed`.
- Rotaciones siempre en radianes.
- El store no guarda transforms ni atmósfera: son datos derivados/estáticos, no estado de UI.
- **Ubicación de banderas y pósters:** la cámara por defecto (`[3.8, 3.2, 4.2]`) queda fuera de la pared derecha, que es invisible desde ahí. Por eso las banderas pasaron a la pared izquierda (`z=1.03` y `z=2.0`, junto al ventanal) y `poster-cr7` al fondo (`x=2.15`). Colgar algo en la pared derecha se vería por detrás.

## Pendiente para Antigravity (conectar y QA)
1. **Rendimiento real.** No se pudo validar los 60 FPS: el entorno de verificación (Edge headless con SwiftShader por software) rinde ~1.6 FPS. Medir con GPU real. La escena tiene cientos de mallas con contorno; si baja de 60 FPS, reducir `Outlines` en objetos lejanos o fusionar geometrías.
2. **Iluminación.** `Atmosphere.tsx` no se tocó. Revisar que las paredes crema no se quemen con `hemisphereLight` + `ambientLight` + ACES. Además, three 0.187 avisa `PCFSoftShadowMap has been removed`; el log lo emite Next, conviene cambiar el tipo de sombra a `PCFShadowMap`.
3. **Leva.** Los defaults cambiaron de significado (escala = multiplicador). Reexportar la calibración y comprobar que los rangos de escala (0.01–3) y posición siguen siendo útiles.
4. **Milo.** Comprobar a 60 FPS que no atraviesa muebles, que el clic funciona en movimiento y que la pose sentada no se corta con el suelo. Ajustar `CAT_WAYPOINTS` si se calibran muebles.
5. **Verificación visual de objetos.** Hay dudas de legibilidad en tamaño real: el título "LA CUPULA" del lomo, los pines del morral y el cordón de la credencial. Revisar con zoom de cámara.
6. **Deuda previa (no de este cambio).** `ArtifactsManager.tsx:96` llama `Date.now()` durante el render y `eslint` lo marca (`react-hooks/purity`). No se tocó. El resto de `src/` pasa `eslint` sin errores, y `npm run build` y `tsc --noEmit` pasan limpios.
7. **Limpieza opcional.** `public/models/room.glb` (4.4 MB), `RoomModel.tsx` y `RoomFurniture.tsx` ya no se usan.

### Sprint 2: pendiente para Antigravity (S2-T3, S2-T4 y QA)
1. **S2-T3 (HUD).** Leer `nearbyTargetId`: `'desk-pc'` → `[E] Sentarse en el PC`; otro id → `[E] Inspeccionar <title>`. `E` ejecuta `selectArtifact(id)` o `setIsAtDesk(true)`; `Escape` ejecuta `setIsAtDesk(false)` (y `closeArtifact()` si hay ficha). Ocultar el prompt con `isAtDesk` o ficha abierta. **No hay tecla `E` ni `Escape` en este sprint: nada conecta todavía el teclado con `setIsAtDesk`.**
2. **S2-T4 (Mini-OS).** La cámara de escritorio ya deja el monitor completo a la vista. Anclar `<Html transform occlude>` a `monitor-screen` (`0.9 × 0.52 m`). `openApp(id)` solo funciona sentado.
3. **Rendimiento.** No se pudo medir en GPU real: el entorno de verificación (SwiftShader) rinde < 2 FPS. Con `dt` limitado a 0.05 s, el avatar avanza ~0.04 m por fotograma a velocidad máxima. Validar a 60 FPS la fluidez del seguimiento de cámara y de la caminata.
4. **Verificado aquí:** colisiones, deslizamiento, límites, conectividad (no hay celdas caminables inalcanzables salvo el rincón cerrado tras el morral), proximidad con histéresis (Node); y con el navegador: movimiento por teclado, sentarse, cámara de escritorio, levantarse, `openApp` solo sentado, cancelar a mitad de camino y teclado ignorado en campos de texto.
5. **No verificado visualmente:** la animación de caminata en movimiento continuo (solo poses estáticas por la tasa de fotogramas), y la comodidad de la cámara de seguimiento en el rango completo de zoom/órbita.
