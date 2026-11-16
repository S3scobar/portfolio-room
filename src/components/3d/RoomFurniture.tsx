'use client';

import React from 'react';
import * as THREE from 'three';

export function RoomFurniture() {
  return (
    <group name="room-furniture">
      {/* =================================================================== */}
      {/* 1. VENTANA LUMINOSA DE ATARDECER (Pared izquierda: x = -2.48, z = -0.5) */}
      {/* =================================================================== */}
      <group position={[-2.48, 1.85, -0.4]}>
        {/* Vidrio emisivo cálido tipo atardecer */}
        <mesh position={[0.01, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.6, 1.5]} />
          <meshBasicMaterial color="#ff9e5e" side={THREE.DoubleSide} />
        </mesh>

        {/* Marco exterior de madera */}
        <mesh position={[0.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.68, 1.58, 0.05]} />
          <meshStandardMaterial color="#3a2312" roughness={0.7} />
        </mesh>
        {/* Hueco / Marco interior para biseles */}
        {/* Cruceta de ventana */}
        <mesh position={[0.03, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.06, 1.5, 0.04]} />
          <meshStandardMaterial color="#2d1a0c" roughness={0.7} />
        </mesh>
        <mesh position={[0.03, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.6, 0.06, 0.04]} />
          <meshStandardMaterial color="#2d1a0c" roughness={0.7} />
        </mesh>
      </group>

      {/* =================================================================== */}
      {/* 2. ALFOMBRA AZUL (Centro del piso) */}
      {/* =================================================================== */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.4, 2.0]} />
        <meshStandardMaterial
          color="#1e3a8a"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      {/* Borde sutil alfombra */}
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0.95, 1.05, 4]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.8} />
      </mesh>

      {/* =================================================================== */}
      {/* 3. ESCRITORIO AMPLIO CONTRA LA PARED DEL FONDO (z = -1.8, y = 0.75) */}
      {/* =================================================================== */}
      <group position={[0, 0, -1.8]}>
        {/* Tablero de madera cálida */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.06, 0.9]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Patas de metal oscuro */}
        <mesh position={[-1.15, 0.36, -0.38]} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
        <mesh position={[1.15, 0.36, -0.38]} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
        <mesh position={[-1.15, 0.36, 0.38]} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
        <mesh position={[1.15, 0.36, 0.38]} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>

        {/* =================================================================== */}
        {/* MONITOR DE PC CENTRADO (Sprint 2 anchor: monitor-screen) */}
        {/* =================================================================== */}
        <group position={[0, 0.78, -0.2]}>
          {/* Base y soporte */}
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.18, 0.03, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.16, -0.04]} castShadow>
            <boxGeometry args={[0.06, 0.3, 0.04]} />
            <meshStandardMaterial color="#1f2937" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Marco del monitor */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <boxGeometry args={[0.96, 0.58, 0.04]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Pantalla del monitor (preparada para el Mini-OS de LUKA) */}
          <mesh name="monitor-screen" position={[0, 0.38, 0.022]}>
            <planeGeometry args={[0.9, 0.52]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>

        {/* Teclado y Mousepad */}
        <mesh position={[0, 0.79, 0.15]} receiveShadow>
          <boxGeometry args={[0.7, 0.01, 0.28]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[-0.05, 0.8, 0.15]} castShadow>
          <boxGeometry args={[0.42, 0.015, 0.14]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[0.22, 0.8, 0.15]} castShadow>
          <boxGeometry args={[0.07, 0.02, 0.11]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
      </group>

      {/* =================================================================== */}
      {/* 4. SILLA DE ESTUDIO (Frente al escritorio: z = -1.1) */}
      {/* =================================================================== */}
      <group position={[0, 0, -1.15]}>
        {/* Asiento acolchado azul/gris oscuro */}
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[0.48, 0.08, 0.46]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Respaldo ergonómico */}
        <mesh position={[0, 0.82, 0.2]} castShadow>
          <boxGeometry args={[0.44, 0.56, 0.06]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
        {/* Tubo de soporte y base de 5 ruedas */}
        <mesh position={[0, 0.24, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.44, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.04, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* =================================================================== */}
      {/* 5. DOS REPISAS FLOTANTES DE MADERA (Pared del fondo: z = -2.38) */}
      {/* =================================================================== */}
      <group position={[0, 0, -2.36]}>
        {/* Repisa Superior */}
        <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.04, 0.3]} />
          <meshStandardMaterial color="#6e421f" roughness={0.5} />
        </mesh>
        {/* Repisa Inferior */}
        <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.04, 0.3]} />
          <meshStandardMaterial color="#6e421f" roughness={0.5} />
        </mesh>
      </group>

      {/* =================================================================== */}
      {/* 6. CAMA SENCILLA (Esquina derecha: x = 1.6, z = 0.5) */}
      {/* =================================================================== */}
      <group position={[1.55, 0, 0.4]}>
        {/* Base de madera de la cama */}
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.32, 2.1]} />
          <meshStandardMaterial color="#543318" roughness={0.6} />
        </mesh>
        {/* Colchón y cobijas tonos crema / azul */}
        <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.04, 0.16, 2.02]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.42, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[1.06, 0.14, 1.5]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.8} />
        </mesh>
        {/* Almohada */}
        <mesh position={[0, 0.48, -0.75]} castShadow>
          <boxGeometry args={[0.7, 0.12, 0.38]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
