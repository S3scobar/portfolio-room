'use client';

import React from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import { ROOM_LORE } from '@/data/roomLore';
import type { ArtifactCategory } from '@/types/room';
import { X, BookOpen, Compass, Award, Gamepad2, Music, Sparkles } from 'lucide-react';

const CATEGORY_LABELS: Record<
  ArtifactCategory,
  { label: string; icon: React.ReactNode; bg: string }
> = {
  academico: {
    label: 'Academia & UNAL',
    icon: <Award className="w-4 h-4 text-emerald-400" />,
    bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
  },
  cine_libros: {
    label: 'Cine & Lectura',
    icon: <BookOpen className="w-4 h-4 text-amber-400" />,
    bg: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
  },
  gaming_tech: {
    label: 'Tech & Gaming',
    icon: <Gamepad2 className="w-4 h-4 text-cyan-400" />,
    bg: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300',
  },
  musica_hobbies: {
    label: 'Música & Hobbies',
    icon: <Music className="w-4 h-4 text-sky-400" />,
    bg: 'bg-sky-950/40 border-sky-500/30 text-sky-300',
  },
  deporte_personal: {
    label: 'Personal & Pasión',
    icon: <Compass className="w-4 h-4 text-indigo-400" />,
    bg: 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300',
  },
};

export function ArtifactModal() {
  const selectedArtifactId = useRoomStore((state) => state.selectedArtifactId);
  const closeArtifact = useRoomStore((state) => state.closeArtifact);

  if (!selectedArtifactId) return null;

  const artifact = ROOM_LORE.find((item) => item.id === selectedArtifactId);
  if (!artifact) return null;

  const categoryMeta = CATEGORY_LABELS[artifact.category];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={closeArtifact}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/30 bg-zinc-950/90 p-6 text-zinc-100 shadow-2xl backdrop-blur-md"
        style={{
          boxShadow: `0 0 40px ${artifact.accentColor}25, 0 20px 25px -5px rgba(0, 0, 0, 0.5)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Borde sutil superior con el color de acento */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: artifact.accentColor }}
        />

        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 pt-2">
          <div className="space-y-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryMeta.bg}`}
            >
              {categoryMeta.icon}
              {categoryMeta.label}
            </span>
            <h2 className="text-xl font-bold text-zinc-50 tracking-tight">
              {artifact.title}
            </h2>
            <p className="text-xs font-medium text-amber-300/80">
              {artifact.subtitle}
            </p>
          </div>

          <button
            onClick={closeArtifact}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Separador */}
        <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent" />

        {/* Contenido / Anécdota */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Diario Narrativo
            </div>
            <p className="text-sm leading-relaxed text-zinc-300 font-normal">
              {artifact.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
            <span>ID: <code className="text-zinc-400 font-mono">{artifact.id}</code></span>
            <span>Tipo: <span className="capitalize">{artifact.geometryType.replace('_', ' ')}</span></span>
          </div>
        </div>

        {/* Botón Cerrar */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={closeArtifact}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            Volver a la habitación
          </button>
        </div>
      </div>
    </div>
  );
}
