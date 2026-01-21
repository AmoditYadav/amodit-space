'use client';

import { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { PlanetConfig, calculateOrbitalPosition } from '@/lib/orbital-mechanics';
import { Moon } from './Moon';

interface PlanetProps {
    config: PlanetConfig;
    time: number;
    prefersReducedMotion?: boolean;
    isMobile?: boolean;
}

export function Planet({ config, time, prefersReducedMotion = false, isMobile = false }: PlanetProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const atmosphereRef = useRef<THREE.Mesh>(null);
    const router = useRouter();
    const [hovered, setHovered] = useState(false);

    // Calculate current orbital position
    const position = useMemo(() => {
        return calculateOrbitalPosition(config.orbital, time);
    }, [config.orbital, time]);

    // NASA-style planet texture with realistic features
    const planetTexture = useMemo(() => {
        const size = 256;
        const data = new Uint8Array(size * size * 4);

        const baseColor = new THREE.Color(config.color);
        const secondaryColor = new THREE.Color(config.secondaryColor || config.color);

        // Determine planet type for texture style
        const isEarthLike = config.id === 'about';
        const isMarsLike = config.id === 'projects';
        const isGasGiant = config.id === 'blog';

        for (let i = 0; i < size * size; i++) {
            const x = (i % size) / size;
            const y = Math.floor(i / size) / size;
            const lat = (y - 0.5) * Math.PI; // -PI/2 to PI/2

            let r: number, g: number, b: number;

            if (isEarthLike) {
                // Earth-like: oceans, continents, some cloud cover
                const continentNoise =
                    Math.sin(x * 12 + y * 8) * 0.4 +
                    Math.sin(x * 25 - y * 20) * 0.3 +
                    Math.sin(x * 50 + y * 45) * 0.15;

                const cloudNoise = Math.sin(x * 35 + y * 28) * 0.15 + Math.random() * 0.05;

                if (continentNoise > 0.1) {
                    // Land - greens and browns
                    r = 80 + continentNoise * 60;
                    g = 120 + continentNoise * 40;
                    b = 60 + continentNoise * 30;
                } else {
                    // Ocean - blues
                    r = 40 + Math.abs(continentNoise) * 20;
                    g = 80 + Math.abs(continentNoise) * 30;
                    b = 160 + Math.abs(continentNoise) * 40;
                }

                // Add cloud cover (whitish overlay)
                if (cloudNoise > 0.1) {
                    const cloudIntensity = cloudNoise * 150;
                    r = Math.min(255, r + cloudIntensity * 0.7);
                    g = Math.min(255, g + cloudIntensity * 0.7);
                    b = Math.min(255, b + cloudIntensity * 0.6);
                }

            } else if (isMarsLike) {
                // Mars-like: rusty reds, oranges with subtle variation
                const surfaceNoise =
                    Math.sin(x * 20 + y * 15) * 0.2 +
                    Math.sin(x * 45 - y * 35) * 0.15 +
                    Math.sin(x * 80 + y * 70) * 0.08 +
                    (Math.random() - 0.5) * 0.05;

                const darkSpot = Math.sin(x * 8 + y * 6) * 0.2;

                r = 180 + surfaceNoise * 40 + darkSpot * 30;
                g = 100 + surfaceNoise * 25 + darkSpot * 20;
                b = 70 + surfaceNoise * 20 + darkSpot * 15;

            } else if (isGasGiant) {
                // Gas giant: horizontal bands
                const bandFreq = lat * 8;
                const bandNoise =
                    Math.sin(bandFreq) * 0.3 +
                    Math.sin(bandFreq * 2.3) * 0.15 +
                    Math.sin(bandFreq * 4.7 + x * 10) * 0.1;

                const stormNoise = Math.sin(x * 15 + y * 12) * 0.1;

                const factor = 1 + bandNoise + stormNoise;
                r = baseColor.r * 255 * factor;
                g = baseColor.g * 255 * factor;
                b = baseColor.b * 255 * factor;

            } else {
                // Ice/distant planet: pale blues/grays
                const surfaceNoise =
                    Math.sin(x * 25 + y * 20) * 0.15 +
                    Math.sin(x * 50 - y * 45) * 0.1 +
                    (Math.random() - 0.5) * 0.03;

                const methaneStreak = Math.sin(lat * 6 + x * 8) * 0.15;

                const factor = 1 + surfaceNoise + methaneStreak;
                r = (baseColor.r * 255 * factor) * 0.9;
                g = (baseColor.g * 255 * factor) * 0.95;
                b = baseColor.b * 255 * factor;
            }

            // Clamp values
            data[i * 4] = Math.min(255, Math.max(0, r));
            data[i * 4 + 1] = Math.min(255, Math.max(0, g));
            data[i * 4 + 2] = Math.min(255, Math.max(0, b));
            data[i * 4 + 3] = 255;
        }

        const texture = new THREE.DataTexture(data, size, size);
        texture.needsUpdate = true;
        return texture;
    }, [config.color, config.secondaryColor, config.id]);

    // Self-rotation (axial tilt)
    useFrame(() => {
        if (meshRef.current && !prefersReducedMotion) {
            meshRef.current.rotation.y += config.rotationSpeed;
        }
    });

    const handleClick = useCallback(() => {
        router.push(config.route);
    }, [router, config.route]);

    const handlePointerOver = useCallback(() => {
        if (!isMobile) {
            setHovered(true);
            document.body.style.cursor = 'pointer';
        }
    }, [isMobile]);

    const handlePointerOut = useCallback(() => {
        if (!isMobile) {
            setHovered(false);
            document.body.style.cursor = 'auto';
        }
    }, [isMobile]);

    // Size with mobile adjustment
    const displaySize = isMobile ? Math.max(config.size, 0.6) : config.size;
    const scale = hovered ? displaySize * 1.08 : displaySize;

    // Moon configuration based on planet
    const moonOrbitRadius = displaySize * 1.8;
    const moonSize = displaySize * 0.2;
    const moonOrbitSpeed = 0.02 + Math.random() * 0.01;

    return (
        <group>
            {/* Planet group at orbital position */}
            <group position={position}>
                {/* Main planet mesh */}
                <mesh
                    ref={meshRef}
                    onClick={handleClick}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                    scale={scale}
                    rotation={[0.1, 0, 0.05]} // Slight axial tilt
                >
                    <sphereGeometry args={[1, 48, 48]} />
                    <meshStandardMaterial
                        map={planetTexture}
                        roughness={config.id === 'blog' ? 0.6 : 0.8} // Gas giants smoother
                        metalness={0.02}
                        emissive={config.emissive || '#000000'}
                        emissiveIntensity={0.03}
                    />
                </mesh>

                {/* Atmosphere rim for Earth-like planet only */}
                {config.hasAtmosphere && (
                    <mesh ref={atmosphereRef} scale={scale * 1.08}>
                        <sphereGeometry args={[1, 32, 32]} />
                        <meshBasicMaterial
                            color={config.atmosphereColor || '#88CCFF'}
                            transparent
                            opacity={0.18}
                            side={THREE.BackSide}
                        />
                    </mesh>
                )}

                {/* Permanent label below planet */}
                <Html
                    position={[0, -displaySize - 0.45, 0]}
                    center
                    style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                    distanceFactor={8}
                >
                    <div className="text-center">
                        <span className="text-[10px] sm:text-xs font-light tracking-wider text-white/70 uppercase whitespace-nowrap">
                            {config.name}
                        </span>
                    </div>
                </Html>

                {/* Hover tooltip */}
                {hovered && (
                    <Html
                        position={[0, displaySize + 0.5, 0]}
                        center
                        style={{
                            pointerEvents: 'none',
                            userSelect: 'none',
                        }}
                    >
                        <div className="px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg border border-white/25 text-white text-sm font-medium whitespace-nowrap shadow-xl">
                            Visit {config.name}
                        </div>
                    </Html>
                )}
            </group>

            {/* Moon orbiting the planet */}
            <Moon
                parentPosition={position}
                orbitRadius={moonOrbitRadius}
                size={moonSize}
                orbitSpeed={moonOrbitSpeed}
                orbitOffset={config.orbital.meanAnomalyAtEpoch}
                prefersReducedMotion={prefersReducedMotion}
            />
        </group>
    );
}

interface OrbitPathProps {
    config: PlanetConfig;
    opacity?: number;
}

export function OrbitPath({ config, opacity = 0.08 }: OrbitPathProps) {
    const points = useMemo(() => {
        const segments = 128;
        const pts: [number, number, number][] = [];

        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * config.orbital.orbitalPeriod;
            const pos = calculateOrbitalPosition(config.orbital, t);
            pts.push(pos);
        }

        return pts;
    }, [config.orbital]);

    return (
        <Line
            points={points}
            color="#ffffff"
            lineWidth={0.5}
            opacity={opacity}
            transparent
        />
    );
}
