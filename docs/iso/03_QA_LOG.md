# Registro de Verificación y Validación (QA ISO)
*(Antigravity registra aquí pruebas de consola y capturas; Gemini Pro registra observaciones visuales y aprobaciones).*

## Sprint 1: Entorno 3D Base, Atmósfera Mixtape/LiS y Decoración Personal

### Fecha de Ejecución: 2026-11-15 23:35 (Local)
**Ejecutor:** Antigravity (Ingeniero de Implementación y Ejecutor QA)

---

### Observación de Revisión Visual (QA Iterativo):
> **Hallazgos de la primera inspección:**
> 1. El entorno base carecía de mobiliario estructural complementario (escritorio amplio, silla ergonómica, monitor de cabecera, repisas flotantes, cama y alfombra).
> 2. La iluminación global resultaba demasiado oscura y tenue, dificultando la visibilidad de los detalles en paredes, muebles y pósters.
> 3. Las banderas de la UNAL y de Águilas Doradas presentaban tonos desaturados y sin la viveza ni tipografía representativa de la identidad institucional y deportiva.
> 4. Existían objetos flotando o superponiéndose a la sección de la ventana en la pared izquierda.

---

### Parche Visual Aplicado y Verificado:

#### 1. Mobiliario Estilizado Low-Poly (`src/components/3d/RoomFurniture.tsx`):
- **Escritorio amplio:** Madera cálida (`#8b5a2b`) con patas de metal oscuro situado contra la pared del fondo.
- **Monitor de PC:** Soporte y marco estilizados con la pantalla identificada con el nombre `monitor-screen` centrada y lista como ancla del Mini-OS para el Sprint 2.
- **Silla de estudio:** Con asiento acolchado azul/gris, respaldo y base giratoria frente al escritorio.
- **Repisas flotantes:** Dos estantes de madera en la pared del fondo sobre el escritorio (niveles `y = 1.6` y `y = 2.1`).
- **Alfombra azul:** En el centro del piso de madera (`#1e3a8a` con ribete celeste).
- **Cama sencilla:** En la esquina derecha con base de madera, colchón crema, almohada y cobija azul (`#1d4ed8`).
- **Ventana luminosa de atardecer:** En la pared izquierda, con marco de madera y vidrio emisivo cálido (`#ff9e5e`), actuando como foco emisor de la golden hour.

#### 2. Iluminación Golden Hour (Mixtape / Life is Strange):
- Incorporación de `hemisphereLight` (`intensity={1.1}`, cielo dorado `#ffe8cc` y suelo azul `#3b5998`).
- `directionalLight` dorada cálida (`#ffb36b`, `intensity={2.4}`) entrando diagonalmente por la ventana con sombras suaves (`PCFShadowMap`, `bias={-0.0005}`).
- Luz puntual azul suave (`#38bdf8`) cerca del monitor y foco cálido de atardecer en la ventana (`#ff9e5e`).
- `EffectComposer` ajustado con Bloom luminoso, Vignette y ToneMapping Filmic.

#### 3. Banderas y Reubicación de Artefactos (`src/data/roomLore.ts`):
- **Bandera UNAL:** Generada en Canvas 2D con franjas verde esmeralda y blanco, escudo central y textos oficiales de la Facultad de Minas / Ingeniería de Sistemas.
- **Bandera Águilas Doradas:** Fondo dorado vibrante (`#D4AF37`) con franjas negras diagonales y tipografía del Oriente Antioqueño.
- **Coordenadas y apoyos recalibrados:**
  * Banderas UNAL y Águilas Doradas: Colgadas en la pared derecha (`x = 2.44`).
  * Pósters (Harry Potter, Interstellar, Dune, CR7): Colocados en muros libres sin tapar la ventana.
  * Libros y luz Lumos Maxima: Apoyados en las repisas flotantes.
  * Xbox Series S, Cubo Rubik, Milo, Escarapela, Audífonos y Snoopy: Apoyados firmemente sobre el escritorio.
  * Ukelele apoyado contra el lateral del escritorio y Morral Totto sobre el piso.

---

### Evidencia de Pruebas:
1. **Compilación TypeScript (`npm run build`):**
   - 0 errores de TypeScript y 0 errores de Turbopack (código de salida 0).
   - Generación estática limpia de todas las rutas.
2. **Navegador en vivo (`http://localhost:3000`):**
   - Origen verificado por host: `http://localhost:3000`.
   - Captura de pantalla de evidencia: `browser_evidence/9bdb1d25-e8a3-40bb-af61-c88877413670/final_step_4.png`.
   - Consola: 0 errores críticos ni avisos de colisión en Leva (claves únicas por objeto).
   - Rendimiento: 60 FPS estables con OrbitControls restringidos y modales narrativos 100% interactivos.
