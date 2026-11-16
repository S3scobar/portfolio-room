'use client';

import dynamic from 'next/dynamic';
import { ArtifactModal } from '@/components/ui/ArtifactModal';
import { RoomOverlay } from '@/components/ui/RoomOverlay';
import { FirstPersonHUD } from '@/components/ui/FirstPersonHUD';

// Cargar el canvas 3D dinámicamente deshabilitando SSR para evitar problemas de WebGL en Node
const RoomCanvas = dynamic(
  () => import('@/components/3d/RoomCanvas').then((mod) => mod.RoomCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-[#0d1117] text-amber-300 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <p className="text-sm tracking-wide">Cargando habitación 3D...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0d1117]">
      {/* Canvas 3D R3F */}
      <RoomCanvas />

      {/* Capas UI y tarjetas de lore */}
      <RoomOverlay />
      <FirstPersonHUD />
      <ArtifactModal />
    </main>
  );
}
