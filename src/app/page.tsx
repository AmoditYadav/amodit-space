'use client';

import dynamic from 'next/dynamic';
import { CVButton } from '@/components/CVButton';
import { usePortfolioStore } from '@/store/usePortfolioStore';

const SolarSystem = dynamic(
  () => import('@/components/three/SolarSystem').then((mod) => mod.SolarSystem),
  { ssr: false }
);

export default function Home() {
  const introComplete = usePortfolioStore((s) => s.introComplete);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* 3D Solar System */}
      <div className="absolute inset-0">
        <SolarSystem />
      </div>

      {/* CV Download Button */}
      <CVButton />

      {/* Tagline below CV button */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-10 flex justify-center pointer-events-none pb-6 sm:pb-8 transition-opacity duration-1000 ${
          introComplete ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <p
          className="text-[9px] sm:text-[10px] font-light tracking-[0.35em] text-white/20 select-none"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          M T W T F S S it goes on
        </p>
      </div>
    </div>
  );
}
