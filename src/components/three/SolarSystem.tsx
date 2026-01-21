'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sun } from './Sun';
import { Planet, OrbitPath } from './Planet';
import { Starfield, DistantStars } from './Starfield';
import { CameraController } from './CameraController';
import { PLANETS } from '@/lib/orbital-mechanics';

interface SolarSystemProps {
    className?: string;
}

interface SceneProps {
    prefersReducedMotion: boolean;
    isMobile: boolean;
}

function SolarSystemScene({ prefersReducedMotion, isMobile }: SceneProps) {
    const [time, setTime] = useState(0);

    // Update orbital time - slower on mobile for readability
    useEffect(() => {
        if (prefersReducedMotion) return;

        const updateInterval = isMobile ? 80 : 50; // Slower updates on mobile
        const timeStep = isMobile ? 0.06 : 0.1;    // Slower orbit on mobile

        const interval = setInterval(() => {
            setTime((t) => t + timeStep);
        }, updateInterval);

        return () => clearInterval(interval);
    }, [prefersReducedMotion, isMobile]);

    return (
        <>
            {/* Camera */}
            <CameraController
                prefersReducedMotion={prefersReducedMotion}
                autoRotate={!prefersReducedMotion}
                isMobile={isMobile}
            />

            {/* Background stars */}
            <Starfield
                count={isMobile ? 2500 : 4000}
                prefersReducedMotion={prefersReducedMotion}
            />
            <DistantStars count={isMobile ? 800 : 1500} />

            {/* The Sun */}
            <Sun />

            {/* Orbit paths - more visible */}
            {PLANETS.map((planet) => (
                <OrbitPath key={`orbit-${planet.id}`} config={planet} opacity={0.08} />
            ))}

            {/* Planets */}
            {PLANETS.map((planet) => (
                <Planet
                    key={planet.id}
                    config={planet}
                    time={time}
                    prefersReducedMotion={prefersReducedMotion}
                    isMobile={isMobile}
                />
            ))}
        </>
    );
}

// Loading fallback
function LoadingFallback() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white/40 text-xs tracking-wider uppercase">Loading</p>
            </div>
        </div>
    );
}

// WebGL error fallback
function WebGLFallback() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 via-black to-gray-900">
            <div className="text-center px-8">
                <div className="text-5xl mb-4 opacity-60">✦</div>
                <h2 className="text-lg font-medium text-white/80 mb-2">WebGL Not Available</h2>
                <p className="text-white/50 text-sm max-w-sm">
                    Use the navigation above to explore.
                </p>
            </div>
        </div>
    );
}

export function SolarSystem({ className = '' }: SolarSystemProps) {
    const [isClient, setIsClient] = useState(false);
    const [hasWebGL, setHasWebGL] = useState(true);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [error, setError] = useState(false);

    // Check for client-side rendering and capabilities
    useEffect(() => {
        setIsClient(true);

        // Check mobile
        setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);

        // Check WebGL support
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            setHasWebGL(!!gl);
        } catch {
            setHasWebGL(false);
        }

        // Check reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
        };

        mediaQuery.addEventListener('change', handleChange);
        window.addEventListener('resize', handleResize);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleError = useCallback(() => {
        setError(true);
    }, []);

    if (!isClient) {
        return <LoadingFallback />;
    }

    if (!hasWebGL || error) {
        return <WebGLFallback />;
    }

    return (
        <div className={`relative w-full h-full ${className}`}>
            <Canvas
                gl={{
                    antialias: !isMobile, // Disable antialiasing on mobile for performance
                    alpha: false,
                    powerPreference: isMobile ? 'low-power' : 'high-performance',
                    failIfMajorPerformanceCaveat: false,
                }}
                camera={{ fov: isMobile ? 55 : 50, near: 0.1, far: 500 }}
                onCreated={({ gl }) => {
                    gl.setClearColor('#000000');
                    gl.toneMapping = 0;
                }}
                onError={handleError}
            >
                <Suspense fallback={null}>
                    <SolarSystemScene
                        prefersReducedMotion={prefersReducedMotion}
                        isMobile={isMobile}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
