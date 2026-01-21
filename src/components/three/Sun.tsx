'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SunProps {
    position?: [number, number, number];
}

export function Sun({ position = [0, 0, 0] }: SunProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    // Create procedural noise texture for sun surface
    const noiseTexture = useMemo(() => {
        const size = 256;
        const data = new Uint8Array(size * size * 4);

        for (let i = 0; i < size * size; i++) {
            const x = (i % size) / size;
            const y = Math.floor(i / size) / size;

            // Multi-octave noise for solar granulation
            let noise = 0;
            noise += Math.sin(x * 20 + y * 15) * 0.3;
            noise += Math.sin(x * 40 - y * 35) * 0.2;
            noise += Math.sin(x * 80 + y * 70) * 0.1;
            noise += Math.random() * 0.1;

            const intensity = 200 + noise * 55;

            data[i * 4] = Math.min(255, intensity + 40);     // R - warm
            data[i * 4 + 1] = Math.min(255, intensity);       // G
            data[i * 4 + 2] = Math.min(255, intensity - 60);  // B - less blue
            data[i * 4 + 3] = 255;
        }

        const texture = new THREE.DataTexture(data, size, size);
        texture.needsUpdate = true;
        return texture;
    }, []);

    // Animate sun rotation and light flickering
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.0008;
        }

        // Subtle light intensity variation
        if (lightRef.current) {
            const flicker = Math.sin(state.clock.elapsedTime * 0.4) * 0.15 +
                Math.sin(state.clock.elapsedTime * 1.1) * 0.08;
            lightRef.current.intensity = 800 + flicker * 100; // High intensity for physically correct lights
        }
    });

    return (
        <group position={position}>
            {/* Sun mesh */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[1.5, 64, 64]} />
                <meshBasicMaterial
                    map={noiseTexture}
                    color="#FFCC44"
                    toneMapped={false}
                />
            </mesh>

            {/* Corona glow effect - inner */}
            <mesh>
                <sphereGeometry args={[1.85, 32, 32]} />
                <meshBasicMaterial
                    color="#FFAA33"
                    transparent
                    opacity={0.2}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Outer glow */}
            <mesh>
                <sphereGeometry args={[2.3, 32, 32]} />
                <meshBasicMaterial
                    color="#FF8800"
                    transparent
                    opacity={0.08}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Primary sun light - high intensity for physically correct lighting */}
            <pointLight
                ref={lightRef}
                color="#FFF8E8"
                intensity={800}
                distance={0} // Infinite distance
                decay={2}    // Physically correct inverse-square falloff
                castShadow={false}
            />

            {/* Soft ambient fill - simulates eye adaptation, prevents pitch black */}
            <ambientLight intensity={0.25} color="#6b7280" />

            {/* Hemisphere light for subtle environmental fill */}
            <hemisphereLight
                color="#ffffff"
                groundColor="#1a1a2e"
                intensity={0.15}
            />
        </group>
    );
}
