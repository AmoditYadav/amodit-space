'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarfieldProps {
    count?: number;
    radius?: number;
    prefersReducedMotion?: boolean;
}

export function Starfield({
    count = 3000,
    radius = 100,
    prefersReducedMotion = false
}: StarfieldProps) {
    const pointsRef = useRef<THREE.Points>(null);

    // Generate star positions and attributes
    const { positions, sizes, colors } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Distribute stars on a sphere shell
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * (0.5 + Math.random() * 0.5); // Vary distance

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Varying star sizes (most small, few bright)
            const sizeRandom = Math.random();
            sizes[i] = sizeRandom < 0.9
                ? 0.5 + Math.random() * 1.0  // 90% small stars
                : 1.5 + Math.random() * 2.0;  // 10% bright stars

            // Subtle color variation (white to warm to cool)
            const colorType = Math.random();
            if (colorType < 0.6) {
                // White/warm stars
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.95 + Math.random() * 0.05;
                colors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
            } else if (colorType < 0.85) {
                // Blue-white stars
                colors[i * 3] = 0.85 + Math.random() * 0.15;
                colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
                colors[i * 3 + 2] = 1.0;
            } else {
                // Orange/red stars
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
                colors[i * 3 + 2] = 0.5 + Math.random() * 0.3;
            }
        }

        return { positions, sizes, colors };
    }, [count, radius]);

    // Subtle rotation for parallax effect
    useFrame((state) => {
        if (pointsRef.current && !prefersReducedMotion) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.003;
            pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.002) * 0.02;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-size"
                    args={[sizes, 1]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[colors, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                sizeAttenuation
                vertexColors
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

// Secondary distant star layer for depth
export function DistantStars({ count = 1000 }: { count?: number }) {
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const radius = 200;

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = radius * Math.cos(phi);
        }

        return pos;
    }, [count]);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                sizeAttenuation
                color="#ffffff"
                transparent
                opacity={0.4}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}
