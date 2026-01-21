'use client';

import dynamic from 'next/dynamic';

// Dynamically import SolarSystem to avoid SSR issues with Three.js
const SolarSystem = dynamic(
  () => import('@/components/three/SolarSystem').then((mod) => mod.SolarSystem),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* 3D Solar System - The hero */}
      <div className="absolute inset-0">
        <SolarSystem />
      </div>

      {/* Subtle poetic micro-text at bottom - safe area aware */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 flex justify-center pointer-events-none pb-6 sm:pb-8"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <p className="text-[10px] sm:text-xs font-extralight tracking-[0.35em] text-white/15 select-none uppercase">
          M T W T F S S it goes on
        </p>
      </div>
    </div>
  );
}
