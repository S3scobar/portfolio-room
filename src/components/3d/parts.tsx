'use client';

// Piezas compartidas por RoomEnvironment, CustomArtifacts y MiloCat.
import React from 'react';
import type * as THREE from 'three';
import { Outlines, RoundedBox } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import type { Vec3 } from '@/types/room';

/** Color de tinta de los contornos (acabado novela grafica / arte indie). */
export const INK_COLOR = '#1c1613';

/**
 * Contorno de tinta. En drei v10 el modo `screenspace` es el que mide el grosor
 * en unidades del objeto (metros), por eso `thickness={0.015}` solo se ve con
 * `screenspace` activo. Sin el, el grosor se interpreta como pixeles.
 */
export function Ink({ t = 0.015, color = INK_COLOR }: { t?: number; color?: string }) {
  return <Outlines thickness={t} color={color} screenspace />;
}

type MeshProps = Omit<ThreeElements['mesh'], 'ref' | 'args' | 'children'>;

export interface RBoxProps extends MeshProps {
  size: Vec3;
  /** Radio del bisel en metros (se limita automaticamente a la mitad de la dimension menor). */
  r?: number;
  color?: string;
  /** Grosor del contorno de tinta; `false` lo desactiva. */
  ink?: number | false;
  rough?: number;
  metal?: number;
  /** Brillo de hover/seleccion (emisivo con el color de acento del lore). */
  glow?: number;
  accent?: string;
  map?: THREE.Texture | null;
  emissive?: string;
  emissiveIntensity?: number;
  children?: React.ReactNode;
}

/** Caja biselada con material estandar y contorno de tinta opcional. */
export function RBox({
  size,
  r = 0.01,
  color = '#ffffff',
  ink = 0.012,
  rough = 0.7,
  metal = 0,
  glow = 0,
  accent,
  map = null,
  emissive,
  emissiveIntensity,
  children,
  ...rest
}: RBoxProps) {
  const radius = Math.max(0.0004, Math.min(r, Math.min(size[0], size[1], size[2]) * 0.45));
  return (
    <RoundedBox
      args={size}
      radius={radius}
      smoothness={3}
      bevelSegments={2}
      castShadow
      receiveShadow
      {...rest}
    >
      <meshStandardMaterial
        color={color}
        roughness={rough}
        metalness={metal}
        map={map}
        emissive={emissive ?? (glow > 0 && accent ? accent : '#000000')}
        emissiveIntensity={emissiveIntensity ?? glow}
      />
      {ink !== false && <Ink t={ink} />}
      {children}
    </RoundedBox>
  );
}
