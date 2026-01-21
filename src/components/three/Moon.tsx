'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MoonProps {
    parentPosition: [number, number, number];
    orbitRadius?: number;
    size?: number;
    orbitSpeed?: number;
    orbitOffset?: number;
    prefersReducedMotion?: boolean;
}

export function Moon({
    parentPosition,
    orbitRadius = 0.8,
    size = 0.12,
    orbitSpeed = 0.015,
    orbitOffset = 0,
    prefersReducedMotion = false,
}: MoonProps) {
    const moonRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const angleRef = useRef(orbitOffset);

    // Moon texture - cratered gray surface
    const moonTexture = useMemo(() => {
        const textureSize = 64;
        const data = new Uint8Array(textureSize * textureSize * 4);

        for (let i = 0; i < textureSize * textureSize; i++) {
            const x = (i % textureSize) / textureSize;
            const y = Math.floor(i / textureSize) / textureSize;

            // Base gray color
            let gray = 180;

            // Add crater-like features (darker spots)
            const crater1 = Math.sin(x * 30 + 0.5) * Math.sin(y * 25) * 0.3;
            const crater2 = Math.sin(x * 50 - y * 40) * 0.15;
            const crater3 = Math.sin(x * 80 + y * 60) * 0.1;
            const microNoise = (Math.random() - 0.5) * 0.08;

            const variation = crater1 + crater2 + crater3 + microNoise;
            gray = gray * (1 + variation * 0.4);

            // Clamp values
            gray = Math.min(220, Math.max(120, gray));

            data[i * 4] = gray;
            data[i * 4 + 1] = gray - 5;
            data[i * 4 + 2] = gray - 8;
            data[i * 4 + 3] = 255;
        }

        const texture = new THREE.DataTexture(data, textureSize, textureSize);
        texture.needsUpdate = true;
        return texture;
    }, []);

    // Orbit the moon around the planet
    useFrame(() => {
        if (!prefersReducedMotion) {
            angleRef.current += orbitSpeed;
        }

        if (groupRef.current) {
            // Calculate moon position relative to parent planet
            const moonX = parentPosition[0] + Math.cos(angleRef.current) * orbitRadius;
            const moonY = parentPosition[1] + Math.sin(angleRef.current * 0.3) * orbitRadius * 0.1; // Slight tilt
            const moonZ = parentPosition[2] + Math.sin(angleRef.current) * orbitRadius;

            groupRef.current.position.set(moonX, moonY, moonZ);
        }

        // Self rotation
        if (moonRef.current && !prefersReducedMotion) {
            moonRef.current.rotation.y += 0.002;
        }
    });

    return (
        <group ref={groupRef}>
            <mesh ref={moonRef}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshStandardMaterial
                    map={moonTexture}
                    roughness={0.95}
                    metalness={0.0}
                    emissive="#000000"
                    emissiveIntensity={0}
                />
            </mesh>
        </group>
    );
}
