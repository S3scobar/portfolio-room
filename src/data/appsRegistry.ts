export type AppCategory = 'featured' | 'academic' | 'faculty_portals';

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
    url: 'https://luka-phi-tan.vercel.app/',
    repoUrl: 'https://github.com/S3scobar/LUKA',
    accentColor: '#38BDF8',
    iconName: 'Bot',
  },
  {
    id: 'sustometro',
    name: 'Sustómetro · Semana Sistemas',
    tagline: 'Mide la tensión académica y sobrevive al semestre en la UNAL',
    category: 'academic',
    url: 'https://semanasistemas.vercel.app/sustometro.html',
    repoUrl: 'https://github.com/S3scobar',
    accentColor: '#EF4444',
    iconName: 'Flame',
  },
  {
    id: 'sistemas-unal',
    name: 'Sistemas UNAL',
    tagline: 'Comunidad y recursos de Ingeniería de Sistemas e Informática UNAL',
    category: 'academic',
    url: 'https://sistemasunal.vercel.app/',
    repoUrl: 'https://github.com/S3scobar',
    accentColor: '#16A34A',
    iconName: 'Terminal',
  },
  {
    id: 'facultad-minas',
    name: 'Facultad de Minas',
    tagline: 'Portal institucional y de proyectos · Facultad de Minas Sede Medellín',
    category: 'faculty_portals',
    url: 'https://minas-self.vercel.app/',
    accentColor: '#15803D',
    iconName: 'Mountain',
  },
  {
    id: 'mecanica-unmed',
    name: 'Ingeniería Mecánica UNMED',
    tagline: 'Portal de Ingeniería Mecánica · Universidad Nacional de Colombia',
    category: 'faculty_portals',
    url: 'https://mecanicaunmed.vercel.app/',
    accentColor: '#2563EB',
    iconName: 'Cog',
  },
  {
    id: 'electrica-unal',
    name: 'Ingeniería Eléctrica',
    tagline: 'Portal oficial de Ingeniería Eléctrica · Facultad de Minas',
    category: 'faculty_portals',
    url: 'https://electrica-chi.vercel.app/',
    accentColor: '#EAB308',
    iconName: 'Zap',
  },
  {
    id: 'petroleos-unal',
    name: 'Ingeniería de Petróleos',
    tagline: 'Portal de Ingeniería de Petróleos · Facultad de Minas',
    category: 'faculty_portals',
    url: 'https://petroleos.vercel.app/',
    accentColor: '#475569',
    iconName: 'Flame',
  },
  {
    id: 'ambiental-unal',
    name: 'Ingeniería Ambiental',
    tagline: 'Portal de Ingeniería Ambiental · Facultad de Minas',
    category: 'faculty_portals',
    url: 'https://ambiental-beta.vercel.app/',
    accentColor: '#059669',
    iconName: 'Leaf',
  },
];
