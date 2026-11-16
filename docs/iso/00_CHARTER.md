# Project Charter: 3D Interactive Portfolio Room
- **Visión:** Portafolio web estilo juego narrativo (estética visual tipo *Mixtape* y *Life is Strange*: iluminación cálida de atardecer, sombras suaves, estilo ilustrado/low-poly). El usuario explora una habitación 3D decorada con objetos personales interactivos y puede sentarse en el escritorio para usar un Mini-OS dentro del monitor que ejecuta **LUKA** y 12 proyectos web.
- **Stack Técnico:** Next.js (App Router), TypeScript, Tailwind CSS, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), Postprocessing (`@react-three/postprocessing`), GSAP, Zustand y Lucide React.
- **Gobernanza ISO/IEC 12207:**
  - **Gemini Pro:** Analista de Requisitos (`01_SPRINT_BOARD.md`), generador de lore/assets y Auditor QA final.
  - **Kiro:** Arquitecto de Software (`02_ARCHITECTURE.md` e interfaces en `src/types/`). No escribe CSS ni ajusta posiciones 3D.
  - **Antigravity:** Ingeniero de Implementación 3D/UI y Ejecutor de pruebas en navegador (`03_QA_LOG.md`).