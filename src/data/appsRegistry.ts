export type AppCategory = 'featured' | 'academic' | 'tech_tools' | 'faculty_portals';

export interface PortfolioApp {
  id: string;
  name: string;
  tagline: string;
  category: AppCategory;
  url: string;
  repoUrl?: string;
  accentColor: string;
  iconName: string;
}

export const PORTFOLIO_APPS: PortfolioApp[] = [
  {
    id: 'luka',
    name: 'LUKA',
    tagline: 'Asistente de Inteligencia Artificial & Ecosistema de Productividad',
    category: 'featured',
    url: 'https://luka-ai.vercel.app', // placeholder para desplegar/enlazar
    repoUrl: 'https://github.com/S3scobar/LUKA',
    accentColor: '#38BDF8',
    iconName: 'Bot',
  },
  {
    id: 'semana-sistemas-2026',
    name: 'Semana de Sistemas e Informática 2026',
    tagline: 'Plataforma oficial del congreso de estudiantes y egresados UNAL',
    category: 'academic',
    url: 'https://semana-sistemas-2026.vercel.app',
    repoUrl: 'https://github.com/S3scobar',
    accentColor: '#10B981',
    iconName: 'CalendarCheck',
  },
  {
    id: 'qrefri',
    name: 'QRefri',
    tagline: 'Gestión inteligente de refrigeración, inventario y sostenibilidad',
    category: 'tech_tools',
    url: 'https://qrefri.vercel.app',
    repoUrl: 'https://github.com/S3scobar',
    accentColor: '#06B6D4',
    iconName: 'Refrigerator',
  },
  {
    id: 'cognispectrum',
    name: 'Cognispectrum',
    tagline: 'Herramienta de análisis cognitivo, neurodivergencia y accesibilidad',
    category: 'tech_tools',
    url: 'https://cognispectrum.vercel.app',
    repoUrl: 'https://github.com/S3scobar',
    accentColor: '#A855F7',
    iconName: 'BrainCircuit',
  },
  {
    id: 'orbtea',
    name: 'orbTea',
    tagline: 'Experiencia interactiva de té, relajación y audio espacial',
    category: 'tech_tools',
    url: 'https://orbtea.vercel.app',
    repoUrl: 'https://github.com/S3scobar',
    accentColor: '#F59E0B',
    iconName: 'Coffee',
  },
  {
    id: 'portal-minas-sistemas',
    name: 'Ingeniería de Sistemas e Informática',
    tagline: 'Portal del programa curricular · Facultad de Minas UNAL',
    category: 'faculty_portals',
    url: 'https://minas-sistemas.vercel.app',
    accentColor: '#16A34A',
    iconName: 'Terminal',
  },
  {
    id: 'portal-minas-geologica',
    name: 'Ingeniería Geológica',
    tagline: 'Portal del programa curricular · Facultad de Minas UNAL',
    category: 'faculty_portals',
    url: 'https://minas-geologica.vercel.app',
    accentColor: '#CA8A04',
    iconName: 'Mountain',
  },
  {
    id: 'portal-minas-ambiental',
    name: 'Ingeniería Ambiental',
    tagline: 'Portal del programa curricular · Facultad de Minas UNAL',
    category: 'faculty_portals',
    url: 'https://minas-ambiental.vercel.app',
    accentColor: '#059669',
    iconName: 'Leaf',
  },
  {
    id: 'portal-minas-petroleos',
    name: 'Ingeniería de Petróleos',
    tagline: 'Portal del programa curricular · Facultad de Minas UNAL',
    category: 'faculty_portals',
    url: 'https://minas-petroleos.vercel.app',
    accentColor: '#475569',
    iconName: 'Flame',
  },
  {
    id: 'portal-minas-electrica',
    name: 'Ingeniería Eléctrica',
    tagline: 'Portal del programa curricular · Facultad de Minas UNAL',
    category: 'faculty_portals',
    url: 'https://minas-electrica.vercel.app',
    accentColor: '#EAB308',
    iconName: 'Zap',
  },
  {
    id: 'portal-minas-quimica',
    name: 'Ingeniería Química',
    tagline: 'Portal del programa curricular · Facultad de Minas UNAL',
    category: 'faculty_portals',
    url: 'https://minas-quimica.vercel.app',
    accentColor: '#EA580C',
    iconName: 'FlaskConical',
  },
  {
    id: 'portal-minas-minas',
    name: 'Ingeniería de Minas y Metalurgia',
    tagline: 'Portal del programa curricular · Facultad de Minas UNAL',
    category: 'faculty_portals',
    url: 'https://minas-metalurgia.vercel.app',
    accentColor: '#78350F',
    iconName: 'Pickaxe',
  },
  {
    id: 'portal-minas-mecanica',
    name: 'Ingeniería Mecánica',
    tagline: 'Portal del programa curricular · Facultad de Minas UNAL',
    category: 'faculty_portals',
    url: 'https://minas-mecanica.vercel.app',
    accentColor: '#2563EB',
    iconName: 'Cog',
  },
];
