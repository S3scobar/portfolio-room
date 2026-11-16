'use client';

import React, { useEffect } from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import { ROOM_LORE } from '@/data/roomLore';
import { Monitor, Sparkles } from 'lucide-react';

export function RoomOverlay() {
  const nearbyTargetId = useRoomStore((state) => state.nearbyTargetId);
  const isAtDesk = useRoomStore((state) => state.isAtDesk);
  const selectedArtifactId = useRoomStore((state) => state.selectedArtifactId);
  const selectArtifact = useRoomStore((state) => state.selectArtifact);
  const setIsAtDesk = useRoomStore((state) => state.setIsAtDesk);
  const closeArtifact = useRoomStore((state) => state.closeArtifact);

  // Escuchar teclas E y Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input/textarea/select
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'e' || e.key === 'E') {
        if (isAtDesk || selectedArtifactId) return;

        if (nearbyTargetId === 'desk-pc') {
          e.preventDefault();
          setIsAtDesk(true);
        } else if (nearbyTargetId) {
          e.preventDefault();
          selectArtifact(nearbyTargetId);
        }
      } else if (e.key === 'Escape') {
        if (selectedArtifactId) {
          e.preventDefault();
          closeArtifact();
        } else if (isAtDesk) {
          e.preventDefault();
          setIsAtDesk(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearbyTargetId, isAtDesk, selectedArtifactId, setIsAtDesk, selectArtifact, closeArtifact]);

  // Si está sentado o examinando un objeto, no mostramos el HUD de proximidad
  const showPrompt = !isAtDesk && !selectedArtifactId && Boolean(nearbyTargetId);

  let targetTitle = '';
  const isDesk = nearbyTargetId === 'desk-pc';

  if (nearbyTargetId) {
    if (isDesk) {
      targetTitle = 'Sentarse en el PC';
    } else if (nearbyTargetId === 'photo-milo') {
      targetTitle = 'Milo (Gato)';
    } else {
      const art = ROOM_LORE.find((i) => i.id === nearbyTargetId);
      targetTitle = art ? art.title : nearbyTargetId;
    }
  }

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

      {/* HUD de Proximidad estilo Life is Strange */}
      {showPrompt && (
        <div className="pointer-events-auto fixed bottom-12 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
          <div
            onClick={() => {
              if (isDesk) setIsAtDesk(true);
              else if (nearbyTargetId) selectArtifact(nearbyTargetId);
            }}
            className="cursor-pointer group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-zinc-950/85 border border-amber-500/50 shadow-2xl backdrop-blur-md hover:scale-105 hover:border-amber-400 transition-all"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/60 text-amber-300 font-mono font-bold text-sm shadow-inner group-hover:bg-amber-500 group-hover:text-black transition-colors">
              E
            </div>
            <div className="flex items-center gap-2 text-zinc-100 text-sm font-medium">
              {isDesk ? (
                <>
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span>Sentarse en el PC</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    Inspeccionar <strong className="text-amber-300 font-semibold">{targetTitle}</strong>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Indicador de ayuda contextual en modo escritorio */}
      {isAtDesk && (
        <div className="pointer-events-none fixed top-5 right-5 z-40 flex items-center gap-2 bg-zinc-950/70 border border-zinc-700/60 px-3.5 py-1.5 rounded-xl text-xs text-zinc-300 backdrop-blur-md shadow-lg">
          <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-600 font-mono text-[11px] text-amber-300">
            Esc
          </kbd>
          <span>para levantarse del escritorio</span>
        </div>
      )}

      {/* Instrucciones mínimas de navegación en modo libre */}
      {!isAtDesk && (
        <div className="pointer-events-none fixed bottom-5 right-5 z-20 flex flex-col items-end gap-1 text-[11px] text-zinc-400/90 bg-zinc-950/60 px-3.5 py-2 rounded-xl border border-zinc-800/60 backdrop-blur-sm">
          <span><kbd className="font-mono text-zinc-200">WASD / Flechas</kbd> para moverte</span>
          <span>Ratón para mirar · <kbd className="font-mono text-zinc-200">E</kbd> para interactuar</span>
        </div>
      )}
    </>
  );
}
