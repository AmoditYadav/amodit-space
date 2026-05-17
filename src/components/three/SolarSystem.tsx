'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { Starfield } from './Starfield';
import { CameraController } from './CameraController';
import { CinematicIntro } from './CinematicIntro';
import { PostProcessing } from './PostProcessing';
import { NebulaLayer } from './NebulaLayer';
import { OrbitRings } from './OrbitRings';
import { PLANETS } from '@/lib/orbital-mechanics';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Scene time manager (uses useFrame instead of setInterval) ───────────────
function TimeManager({ children }: { children: (time: number) => React.ReactNode }) {
  const [time, setTime] = useState(0);
  const isMobile = usePortfolioStore((s) => s.isMobile);
  const orbitSpeedMultiplier = usePortfolioStore((s) => s.orbitSpeedMultiplier);

  return <TimeUpdater isMobile={isMobile} speedMultiplier={orbitSpeedMultiplier} onTimeUpdate={setTime}>{children(time)}</TimeUpdater>;
}

function TimeUpdater({ 
  isMobile, 
  speedMultiplier,
  onTimeUpdate, 
  children 
}: { 
  isMobile: boolean; 
  speedMultiplier: number;
  onTimeUpdate: (t: number) => void; 
  children: React.ReactNode 
}) {
  const timeRef = { current: 0 };
  
  useFrame((_, delta) => {
    const speed = isMobile ? 0.06 : 0.1;
    timeRef.current += delta * speed * 60 * speedMultiplier;
    onTimeUpdate(timeRef.current);
  });

  return <>{children}</>;
}

// ─── Planet fade-in controller ───────────────────────────────────────────────
// Sun appears first (~0-1.5s), then planets + orbits fade in (~2-3.5s)
function PlanetFadeController({ children }: { children: (opacity: number) => React.ReactNode }) {
  const [opacity, setOpacity] = useState(0);
  const startedRef = useRef(false);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    // Planets start fading in at 2s, fully visible by 3.5s
    if (elapsed > 2.0) {
      if (!startedRef.current) startedRef.current = true;
      const t = Math.min(1, (elapsed - 2.0) / 1.5);
      // Smooth ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      setOpacity(eased);
    }
  });

  return <>{children(opacity)}</>;
}

// ─── Fading group wrapper ────────────────────────────────────────────────────
function FadingGroup({ opacity, children }: { opacity: number; children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Control visibility via scale (0→1). Using scale instead of opacity
      // because Three.js meshes don't have a global opacity property.
      // At opacity=0 we scale to near-zero, ramping to 1.
      const s = Math.max(0.001, opacity);
      groupRef.current.scale.setScalar(s);
      groupRef.current.visible = opacity > 0.01;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// ─── Main Scene ──────────────────────────────────────────────────────────────
function SolarSystemScene({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      {/* Cinematic intro camera animation */}
      <CinematicIntro />

      {/* Camera controls (activate after intro) */}
      <CameraController isMobile={isMobile} />

      {/* Multi-layer starfield */}
      <Starfield isMobile={isMobile} />

      {/* Subtle nebula fog (desktop only) */}
      {!isMobile && <NebulaLayer />}

      {/* The Sun — appears first during intro */}
      <Sun />

      {/* Planets + orbit rings fade in after sun */}
      <PlanetFadeController>
        {(opacity) => (
          <FadingGroup opacity={opacity}>
            {/* Orbit rings */}
            {PLANETS.map((planet) => (
              <OrbitRings key={`orbit-${planet.id}`} config={planet} />
            ))}

            {/* Planets */}
            <TimeManager>
              {(time) => (
                <>
                  {PLANETS.map((planet) => (
                    <Planet
                      key={planet.id}
                      config={planet}
                      time={time}
                      isMobile={isMobile}
                    />
                  ))}
                </>
              )}
            </TimeManager>
          </FadingGroup>
        )}
      </PlanetFadeController>

      {/* Post-processing (desktop only) */}
      <PostProcessing enabled={!isMobile} />
    </>
  );
}

// ─── Loading fallback ────────────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-8 h-8 border border-white/15 border-t-white/50 rounded-full animate-spin mx-auto mb-3" />
        <p
          className="text-white/30 text-[11px] tracking-[0.3em] uppercase"
          style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
        >
          Initializing
        </p>
      </div>
    </div>
  );
}

// ─── WebGL error fallback ────────────────────────────────────────────────────
function WebGLFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="text-center px-8">
        <div className="text-4xl mb-4 opacity-40">✦</div>
        <h2
          className="text-lg font-medium text-white/70 mb-2"
          style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
        >
          WebGL Not Available
        </h2>
        <p className="text-white/40 text-sm max-w-sm">
          Use the navigation above to explore.
        </p>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
interface SolarSystemProps {
  className?: string;
}

export function SolarSystem({ className = '' }: SolarSystemProps) {
  const [isClient, setIsClient] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [error, setError] = useState(false);

  const setIsMobile = usePortfolioStore((s) => s.setIsMobile);
  const isMobile = usePortfolioStore((s) => s.isMobile);

  useEffect(() => {
    setIsClient(true);

    const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
    setIsMobile(mobile);

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(!!gl);
    } catch {
      setHasWebGL(false);
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  const handleError = useCallback(() => setError(true), []);

  if (!isClient) return <LoadingFallback />;
  if (!hasWebGL || error) return <WebGLFallback />;

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        gl={{
          antialias: !isMobile,
          alpha: false,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          failIfMajorPerformanceCaveat: false,
          toneMapping: 0,
        }}
        camera={{ fov: isMobile ? 55 : 50, near: 0.1, far: 500 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000');
        }}
        onError={handleError}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
      >
        <Suspense fallback={null}>
          <SolarSystemScene isMobile={isMobile} />
        </Suspense>
      </Canvas>
    </div>
  );
}
