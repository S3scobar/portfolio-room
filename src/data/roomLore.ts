export type ArtifactCategory = 'academico' | 'cine_libros' | 'gaming_tech' | 'musica_hobbies' | 'deporte_personal';

/**
 * Convencion de transform (modelos procedurales en CustomArtifacts.tsx):
 * - unidades en metros; `defaultScale` es un multiplicador (1 = tamano real).
 * - `defaultPosition` es el punto de apoyo (base) o de montaje en pared (cara trasera sobre el muro).
 */
export interface RoomArtifactSeed {
  id: string;
  title: string;
  subtitle: string;
  category: ArtifactCategory;
  description: string;
  texturePath?: string;
  accentColor: string;
  defaultPosition: [number, number, number];
  defaultRotation: [number, number, number];
  defaultScale: [number, number, number];
  geometryType: 'poster' | 'flag' | 'prop_box' | 'photo_frame';
}

export const ROOM_LORE: RoomArtifactSeed[] = [
  // 1. Bandera UNAL (Pared izquierda, junto al ventanal: visible de frente desde la camara por defecto)
  {
    id: 'flag-unal',
    title: 'Bandera Universidad Nacional de Colombia',
    subtitle: 'Facultad de Minas · Ingeniería de Sistemas e Informática',
    category: 'academico',
    description: 'Mi casa académica en Medellín. Representante estudiantil de Ingeniería de Sistemas e Informática desde 2024.',
    texturePath: '/textures/flag-unal.webp',
    accentColor: '#4A773C',
    defaultPosition: [-2.5, 2.2, 1.03],
    defaultRotation: [0, Math.PI / 2, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'flag',
  },
  // 2. Bandera Águilas Doradas (Pared izquierda a continuación de la UNAL)
  {
    id: 'flag-aguilas',
    title: 'Bandera Águilas Doradas de Rionegro',
    subtitle: 'Pasión del Oriente Antioqueño',
    category: 'deporte_personal',
    description: 'Alentando siempre al equipo dorado del nido.',
    texturePath: '/textures/flag-aguilas.webp',
    accentColor: '#D4AF37',
    defaultPosition: [-2.5, 2.2, 2],
    defaultRotation: [0, Math.PI / 2, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'flag',
  },
  // 3. Escarapela Muestra de Proyectos UNAL (Sobre el escritorio, apoyada inclinada a la izquierda del teclado)
  {
    id: 'badge-minas',
    title: 'Escarapela Muestra de Proyectos',
    subtitle: 'Expositor · Facultad de Minas UNAL',
    category: 'academico',
    description: 'Recuerdo de exponer proyectos de ingeniería y construir soluciones reales desde la universidad.',
    texturePath: '/textures/badge-minas.webp',
    accentColor: '#1E6B8C',
    defaultPosition: [-1, 0.78, -1.6],
    defaultRotation: [0, 0.35, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'photo_frame',
  },
  // 4. Póster Undesirable No. 1 (Harry Potter) - Pared del fondo a la izquierda sobre el escritorio
  {
    id: 'poster-hp',
    title: 'Undesirable No. 1 · Harry Potter',
    subtitle: 'Casa Ravenclaw',
    category: 'cine_libros',
    description: 'Ingenio, curiosidad y aprendizaje sin límites. Un clásico colgado directo en la pared de mi cuarto.',
    texturePath: '/textures/poster-hp.webp',
    accentColor: '#1D4ED8',
    defaultPosition: [-1.65, 2.1, -2.5],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'poster',
  },
  // 5. Póster Interstellar & La Odisea - Pared del fondo a la derecha de las repisas
  {
    id: 'poster-interstellar',
    title: 'Interstellar & La Odisea',
    subtitle: 'Letterboxd @s_escobar__',
    category: 'cine_libros',
    description: 'Viajes espaciales, relatividad y épicas clásicas que definen mi top en Letterboxd.',
    texturePath: '/textures/poster-interstellar.webp',
    accentColor: '#2563EB',
    defaultPosition: [1.45, 2.1, -2.5],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'poster',
  },
  // 6. Póster Dune - Pared izquierda en sección libre, entre la ventana y la esquina del fondo (z = -1.85)
  {
    id: 'poster-dune-sw-marvel',
    title: 'Dune',
    subtitle: 'Arrakis al atardecer',
    category: 'cine_libros',
    description: 'Desde Arrakis hasta una galaxia muy lejana: las sagas que inspiran mi lado creativo.',
    accentColor: '#D97706',
    defaultPosition: [-2.5, 2.1, -1.85],
    defaultRotation: [0, Math.PI / 2, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'poster',
  },
  // 7. Colección de libros Stephen King & Dune - Apoyados en la repisa inferior (y = 1.62, z = -2.36)
  {
    id: 'books-stephen-king',
    title: 'Colección Stephen King & Dune',
    subtitle: 'La Cúpula · Frank Herbert · Santaolalla',
    category: 'cine_libros',
    description: 'El terror y suspenso de Stephen King junto a la ciencia ficción dura de Frank Herbert.',
    texturePath: '/textures/books-stack.webp',
    accentColor: '#991B1B',
    defaultPosition: [-0.45, 1.62, -2.34],
    defaultRotation: [0, 0.05, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'prop_box',
  },
  // 8. Caja de luz "LUMOS MAXIMA" - Apoyada en la repisa superior (y = 2.12, z = -2.36)
  {
    id: 'lightbox-lumos',
    title: 'Caja de Luz: LUMOS MAXIMA',
    subtitle: 'Iluminación de escritorio',
    category: 'cine_libros',
    description: 'Un toque de magia en la repisa para iluminar las noches de código.',
    texturePath: '/textures/lumos-box.webp',
    accentColor: '#60A5FA',
    defaultPosition: [0.35, 2.12, -2.36],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'prop_box',
  },
  // 9. Consola Xbox Series S Blanco - Apoyada en el escritorio a la derecha (x = 0.85, y = 0.83, z = -1.8)
  {
    id: 'xbox-series-s',
    title: 'Xbox Series S Blanco',
    subtitle: 'Setup Gamer & Game Pass',
    category: 'gaming_tech',
    description: 'Mi consola de cabecera para desconectar entre semestres y partidas nocturnas.',
    texturePath: '/textures/xbox-series-s.webp',
    accentColor: '#F8FAFC',
    defaultPosition: [0.75, 0.78, -1.9],
    defaultRotation: [0, -0.15, 0],
    defaultScale: [1.4, 1.4, 1.4],
    geometryType: 'prop_box',
  },
  // 10. Cubo de Rubik 3x3 - Apoyado en el escritorio (x = -0.42, y = 0.83, z = -1.65)
  {
    id: 'rubik-cube',
    title: 'Cubo de Rubik 3x3',
    subtitle: 'Algoritmos en las manos',
    category: 'musica_hobbies',
    description: 'Resolverlo entre compilaciones es la mejor pausa activa.',
    texturePath: '/textures/rubik.webp',
    accentColor: '#3B82F6',
    defaultPosition: [-0.72, 0.78, -1.55],
    defaultRotation: [0, 0.5, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'prop_box',
  },
  // 11. Vinilos & Audífonos Avicii y Martin Garrix - Apoyados en el escritorio (x = 0.55, y = 0.86, z = -1.75)
  {
    id: 'music-avicii-garrix',
    title: 'Vinilos & Audífonos: Avicii y Martin Garrix',
    subtitle: 'Soundtrack de programación',
    category: 'musica_hobbies',
    description: 'Melodías progressive house y electrónica que acompañan cada sprint de desarrollo.',
    texturePath: '/textures/music-edm.webp',
    accentColor: '#0284C7',
    defaultPosition: [1.12, 0.78, -2.03],
    defaultRotation: [0, -0.2, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'prop_box',
  },
  // 12. Ukelele acústico - Recostado contra la pared izquierda, junto a la ventana (lado del fondo, z = -1.62).
  // Rotación Euler XYZ equivalente a: girar 90° en Y (cara hacia la habitación) e inclinar 0.2 rad hacia el muro.
  {
    id: 'ukulele-wood',
    title: 'Ukelele Acústico',
    subtitle: 'Acordes entre líneas de código',
    category: 'musica_hobbies',
    description: 'Siempre a la mano junto a la ventana para despejar la mente.',
    texturePath: '/textures/ukulele.webp',
    accentColor: '#B45309',
    defaultPosition: [-2.31, 0.008, -1.62],
    defaultRotation: [-Math.PI / 2, 1.3708, Math.PI / 2],
    defaultScale: [1.45, 1.45, 1.45],
    geometryType: 'prop_box',
  },
  // 13. Retrato de Milo - Apoyado sobre el escritorio junto al monitor (x = -0.7, y = 0.92, z = -1.95)
  {
    id: 'photo-milo',
    title: 'Retrato de Milo',
    subtitle: 'Copiloto felino oficial',
    category: 'deporte_personal',
    description: 'Supervisando cada commit y cada entrega de la universidad.',
    texturePath: '/textures/milo.webp',
    accentColor: '#38BDF8',
    defaultPosition: [-1.05, 0.78, -2.12],
    defaultRotation: [0, 0.3, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'photo_frame',
  },
  // 14. Póster de Cristiano Ronaldo (CR7) - Pared del fondo, a la derecha de las repisas
  {
    id: 'poster-cr7',
    title: 'Cristiano Ronaldo · CR7',
    subtitle: 'Mentalidad competitiva',
    category: 'deporte_personal',
    description: 'Disciplina, trabajo duro y el ídolo máximo del fútbol.',
    texturePath: '/textures/poster-cr7.webp',
    accentColor: '#1D4ED8',
    defaultPosition: [2.15, 2, -2.5],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'poster',
  },
  // 15. Morral Totto con pines - Apoyado en el suelo junto al escritorio (x = -1.4, y = 0.35, z = -1.25)
  {
    id: 'totto-backpack-pins',
    title: 'Morral Totto con Pines',
    subtitle: 'Ravenclaw · Pi · Trust me, I’m a Programmer',
    category: 'academico',
    description: 'El compañero diario hacia la Facultad de Minas cargado de pines de matemáticas y código.',
    texturePath: '/textures/backpack-pins.webp',
    accentColor: '#1E40AF',
    defaultPosition: [-1.62, 0, -1.55],
    defaultRotation: [0, 0.45, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'prop_box',
  },
  // 16. Figura de Snoopy - Apoyada sobre el escritorio a la izquierda del monitor (x = -0.48, y = 0.86, z = -1.82)
  {
    id: 'snoopy-figure',
    title: 'Snoopy en el Escritorio',
    subtitle: 'Clásico atemporal',
    category: 'deporte_personal',
    description: 'Un detalle nostálgico junto al monitor.',
    texturePath: '/textures/snoopy.webp',
    accentColor: '#EFF6FF',
    defaultPosition: [-0.82, 0.78, -1.95],
    defaultRotation: [0, 0.2, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'prop_box',
  },
  // 17. Póster Muestra de Proyectos (SAMI) - Pared del fondo, a la izquierda bajo el póster de Harry Potter
  {
    id: 'poster-muestra-proyectos',
    title: 'Muestra de Proyectos en Ingeniería · SAMI',
    subtitle: 'Facultad de Minas · UNAL Sede Medellín',
    category: 'academico',
    description: 'El póster de SAMI, un wearable de monitoreo para adultos mayores que sufren soledad, que presenté en la Muestra de Proyectos junto a mi equipo.',
    accentColor: '#1E6B8C',
    defaultPosition: [-1.9, 1.22, -2.5],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    geometryType: 'poster',
  },
];
