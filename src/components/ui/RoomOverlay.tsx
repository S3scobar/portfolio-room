'use client';

import React from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import { ROOM_LORE } from '@/data/roomLore';
import { Eye } from 'lucide-react';

export function RoomOverlay() {
  const hoveredArtifactId = useRoomStore((state) => state.hoveredArtifactId);
  const selectedArtifactId = useRoomStore((state) => state.selectedArtifactId);

  const activeArtifact = hoveredArtifactId
    ? ROOM_LORE.find((i) => i.id === hoveredArtifactId)
    : null;

  return (
    <>
      {/* Banner superior de navegación / atmósfera */}
      <div className="pointer-events-none fixed top-5 left-5 z-20 flex flex-col gap-1 text-zinc-100">
        <h1 className="text-lg font-bold tracking-tight text-zinc-100 flex items-center gap-2 drop-shadow-md">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          Santiago Escobar · Portfolio Room
        </h1>
        <p className="text-xs text-zinc-400 drop-shadow">
          Habitación 3D Interactiva · Estética Mixtape &amp; Life is Strange
        </p>
      </div>

      {/* Indicador tooltip inferior cuando se hace hover sobre un artefacto */}
      {activeArtifact && !selectedArtifactId && (
        <div className="pointer-events-none fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-950/80 border border-amber-500/40 text-zinc-100 text-xs shadow-xl backdrop-blur-md animate-bounce">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Haz clic para examinar <strong className="text-amber-300">{activeArtifact.title}</strong></span>
        </div>
      )}

      {/* Instrucciones mínimas de navegación */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-20 text-[11px] text-zinc-400/80 bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800/50 backdrop-blur-sm">
        Arrastra para rotar · Rueda para zoom
      </div>
    </>
  );
}
