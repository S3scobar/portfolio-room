'use client';

import React, { useEffect, useState } from 'react';
import { useRoomStore } from '@/store/useRoomStore';

/**
 * HUD de primera persona: mira central y ayuda para capturar el cursor.
 * - Con el cursor capturado se muestra la mira; crece y se ilumina al apuntar a un objeto interactivo.
 * - Con el cursor libre (al cargar, o tras `Esc`) se muestra "Clic para mirar".
 * - Sentado o con una ficha abierta no se muestra nada (el cursor se usa normal).
 */
export function FirstPersonHUD() {
  const [locked, setLocked] = useState(false);
  const isAtDesk = useRoomStore((s) => s.isAtDesk);
  const selectedArtifactId = useRoomStore((s) => s.selectedArtifactId);
  const aimingAtObject = useRoomStore((s) => s.hoveredArtifactId !== null);

  useEffect(() => {
    const onChange = () => setLocked(document.pointerLockElement !== null);
    document.addEventListener('pointerlockchange', onChange);
    return () => document.removeEventListener('pointerlockchange', onChange);
  }, []);

  if (isAtDesk || selectedArtifactId !== null) return null;

  if (locked) {
    return (
      <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center" aria-hidden="true">
        <div
          className={`rounded-full border transition-all duration-150 ${
            aimingAtObject
              ? 'h-5 w-5 border-amber-300 bg-amber-300/30 shadow-[0_0_12px_rgba(252,211,77,0.7)]'
              : 'h-1.5 w-1.5 border-white/80 bg-white/70'
          }`}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center">
      <div className="rounded-xl border border-zinc-700/60 bg-zinc-950/70 px-4 py-2 text-xs text-zinc-200 backdrop-blur-md">
        <span className="font-semibold text-amber-300">Clic</span> para mirar con el ratón ·{' '}
        <kbd className="font-mono text-zinc-100">Esc</kbd> para soltar el cursor
      </div>
    </div>
  );
}
