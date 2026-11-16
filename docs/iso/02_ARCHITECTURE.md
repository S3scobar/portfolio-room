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
| `poster-hp`, `poster-interstellar`, `poster-dune-sw-marvel`, `poster-cr7` | Marco biselado + plano con la textura sin deformar | `poster-hp` es una foto 4:3 horizontal |
| `xbox-series-s` | Consola 275×63.5×151 mm con rejilla circular negra + control blanco/verde | Control en el mismo grupo |
| `rubik-cube` | 27 cubitos biselados + 54 stickers, colores reales | Mezcla determinista (`rng(42)`) |
| `ukulele-wood` | Cuerpo en 8 (extrusión), boca y roseta, puente, mástil, 12 trastes, clavijero con 4 clavijas, 4 cuerdas | Apoyado contra la pata del escritorio |
| `books-stephen-king` | 4 libros individuales (tapas, hojas, lomo con título): La Cúpula, Dune, Mesías de Dune, 11/22/63 | Sobre la repisa baja |
| `lightbox-lumos` | Caja negra con panel blanco emisivo "LUMOS MAXIMA" + `pointLight` suave | Sobre la repisa alta |
| `totto-backpack-pins` | Mochila azul oscuro/negra, bolsillos, asa y 8 pines metálicos | Junto al escritorio |
| `snoopy-figure` | Figura blanca y negra sentada (cuerpo, cabeza, orejas largas, nariz, mancha) | `snoopy.webp` **no se usa**: es una figura de Hollow Knight |
| `badge-minas` | Credencial plana con su foto real (`badge-minas-card.webp`) y cordón azul | Zona de impacto transparente ampliada |
| `photo-milo` | Marco de escritorio con la foto enderezada (`milo-upright.webp`) | |
| `music-avicii-garrix` | Cajón con 2 fundas, disco de vinilo y audífonos | Genérico: no se inventan portadas de artistas |

Texturas `poster-cr7`, `poster-dune`, `poster-interstellar` son tarjetas de texto generadas (placeholders), no fotos reales. `rubik.webp`, `xbox-series-s.webp` y `lumos-box.webp` ya no se usan.

`ArtifactMesh.tsx` conserva solo la interacción (hover, clic, escala animada) y delega la geometría en `CustomArtifactModel`. Glow: hover `0.3`, selección `0.5`.

## Milo — `MiloCat`
- Gato atigrado café/gris con rayas, ojos verdes de pupila vertical, bigotes, orejas, 4 patas y cola de 7 segmentos con anillos.
- Máquina de estados `walking` ⇄ `sitting` en `advanceCat` (función de módulo). Velocidad 0.34 m/s, giro suavizado, balanceo de patas en diagonal. Al sentarse levanta el torso, recoge las patas traseras y enrosca la cola.
- Camina entre `CAT_WAYPOINTS` (10 puntos del suelo y la alfombra). `FLOOR_OBSTACLES` (escritorio, silla, cama, morral+ukelele) se inflan 0.17 m; `buildNeighbors()` solo conecta puntos con segmento libre. Verificado con Node: los 10 puntos están libres, el grafo es conexo y los segmentos que cruzan escritorio, cama o silla se rechazan.
- Clic en el gato: `selectArtifact('photo-milo')`. Mientras esa ficha está abierta, Milo se queda sentado. Hover: cursor `pointer`, escala 1.07 y `hoveredArtifactId = 'photo-milo'`.
- Prop `pose?: CatBehavior` fija una pose en el origen (solo para verificación visual).
- Sin estado de React por fotograma: todo vive en refs; los nodos animados se localizan por nombre una vez.

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
