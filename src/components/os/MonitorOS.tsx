'use client';

import React from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import { PORTFOLIO_APPS, type PortfolioApp } from '@/data/appsRegistry';
import {
  Bot,
  CalendarCheck,
  Refrigerator,
  BrainCircuit,
  Coffee,
  Terminal,
  Mountain,
  Leaf,
  Flame,
  Zap,
  FlaskConical,
  Pickaxe,
  Cog,
  LogOut,
  ExternalLink,
  X,
  Globe,
  Maximize2,
  Folder,
  Code2,
} from 'lucide-react';

// Mapeo dinámico de iconos de Lucide
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Bot,
  CalendarCheck,
  Refrigerator,
  BrainCircuit,
  Coffee,
  Terminal,
  Mountain,
  Leaf,
  Flame,
  Zap,
  FlaskConical,
  Pickaxe,
  Cog,
};

export function MonitorOS() {
  const isAtDesk = useRoomStore((state) => state.isAtDesk);
  const openAppId = useRoomStore((state) => state.openAppId);
  const openApp = useRoomStore((state) => state.openApp);
  const closeApp = useRoomStore((state) => state.closeApp);
  const setIsAtDesk = useRoomStore((state) => state.setIsAtDesk);

  const currentApp: PortfolioApp | undefined = PORTFOLIO_APPS.find(
    (app) => app.id === openAppId
  );

  // El Mini-OS solo existe como interfaz interna de la pantalla 3D mientras estas sentado frente al monitor.
  // De pie no se renderiza nada, asi que nunca puede flotar sobre el cuarto.
  if (!isAtDesk) return null;

  return (
    <div className="w-[1024px] h-[592px] select-none bg-gradient-to-br from-[#0a0f1d] via-[#111827] to-[#0d1527] text-zinc-100 font-sans flex flex-col justify-between overflow-hidden rounded-md border border-sky-500/20 shadow-inner">
      {/* Barra superior de estado / Mini-OS Header */}
      <header className="h-10 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-sky-400 font-mono flex items-center gap-1.5 ml-2">
            <Bot className="w-3.5 h-3.5" />
            LUKA OS · v2.6
          </span>
        </div>

        {/* Info central */}
        <div className="text-[11px] text-zinc-400 font-mono">
          {currentApp ? (
            <span className="text-zinc-200">
              Ventana activa: <strong className="text-sky-300">{currentApp.name}</strong>
            </span>
          ) : (
            <span>Escritorio de Proyectos · Santiago Escobar</span>
          )}
        </div>

        {/* Botón Levantarse del escritorio */}
        <button
          onClick={() => setIsAtDesk(false)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/80 hover:text-white transition-all text-xs font-medium cursor-pointer shadow-sm active:scale-95"
          title="Levantarse del escritorio (Escape)"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Levantarse</span>
        </button>
      </header>

      {/* Área del Escritorio / Ventana */}
      <main className="flex-1 relative p-6 overflow-hidden">
        {/* Fondo sutil del escritorio con logo y gradientes */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
          <Bot className="w-72 h-72 text-sky-400" />
        </div>

        {/* Grid de iconos del escritorio cuando no hay app abierta */}
        {!currentApp && (
          <div className="grid grid-cols-4 gap-y-7 gap-x-6 max-w-2xl mx-auto py-8">
            {PORTFOLIO_APPS.map((app) => {
              const IconComp = ICON_MAP[app.iconName] || Folder;
              const isLuka = app.id === 'luka';

              return (
                <button
                  key={app.id}
                  onClick={() => openApp(app.id)}
                  className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 hover:scale-105 hover:bg-zinc-800/40 cursor-pointer ${
                    isLuka
                      ? 'ring-1 ring-sky-400/50 bg-sky-950/20'
                      : 'hover:border-zinc-700/60'
                  }`}
                >
                  <div
                    className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:-translate-y-1"
                    style={{
                      backgroundColor: `${app.accentColor}25`,
                      border: `1.5px solid ${app.accentColor}70`,
                      boxShadow: `0 8px 16px ${app.accentColor}20`,
                    }}
                  >
                    <IconComp className="w-6 h-6" style={{ color: app.accentColor }} />
                  </div>
                  <span className="text-[11px] font-medium text-zinc-200 text-center line-clamp-2 leading-tight group-hover:text-sky-300">
                    {app.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Ventana de la App abierta */}
        {currentApp && (
          <div className="absolute inset-4 bg-zinc-950/95 border border-zinc-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Barra de título de la ventana */}
            <div className="h-10 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentApp.accentColor }}
                />
                <h3 className="text-xs font-semibold text-zinc-200">{currentApp.name}</h3>
                <span className="text-[10px] text-zinc-400 hidden sm:inline">
                  — {currentApp.tagline}
                </span>
              </div>

              {/* Botones de acción de la ventana */}
              <div className="flex items-center gap-2">
                {currentApp.repoUrl && (
                  <a
                    href={currentApp.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Ver repositorio de código"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                  </a>
                )}
                <a
                  href={currentApp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-950/60 border border-sky-500/40 text-sky-300 hover:bg-sky-900 text-[11px] font-medium transition-colors"
                  title="Abrir en pestaña nueva si hay bloqueo X-Frame"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Pestaña nueva</span>
                </a>
                <button
                  onClick={closeApp}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-red-900/60 hover:text-red-300 transition-colors cursor-pointer"
                  title="Cerrar ventana"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenido de la ventana: iframe con fallback elegante */}
            <div className="flex-1 relative bg-zinc-900 overflow-hidden">
              <iframe
                src={currentApp.url}
                title={currentApp.name}
                className="w-full h-full border-0 bg-white"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />

              {/* Banner inferior de respaldo por si el iframe es bloqueado por políticas de origen */}
              <div className="absolute bottom-2 right-3 pointer-events-auto bg-zinc-950/90 border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] text-zinc-400 flex items-center gap-2 shadow-lg backdrop-blur-md">
                <Globe className="w-3 h-3 text-sky-400" />
                <span>¿No carga por políticas X-Frame?</span>
                <a
                  href={currentApp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 font-semibold underline hover:text-sky-200"
                >
                  Abrir enlace directo
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Barra de tareas inferior (Dock) */}
      <footer className="h-11 bg-zinc-950/90 border-t border-zinc-800/80 px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {/* Botón Inicio / Apps */}
          <button
            onClick={() => closeApp()}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              !currentApp
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Escritorio</span>
          </button>
        </div>

        {/* Reloj y Estado */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            En línea
          </span>
          <span>12:00 PM</span>
        </div>
      </footer>
    </div>
  );
}
