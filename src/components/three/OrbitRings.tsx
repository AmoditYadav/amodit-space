'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { calculateOrbitalPosition, PlanetConfig } from '@/lib/orbital-mechanics';
import { usePortfolioStore } from '@/store/usePortfolioStore';

/**
 * Premium orbit rings with soft glow effect.
 * Uses a custom tube-like line rendering for elegant, luminous paths.
 */
interface OrbitRingsProps {
  config: PlanetConfig;
  baseOpacity?: number;
}

export function OrbitRings({ config, baseOpacity = 0.06 }: OrbitRingsProps) {
  const hoveredPlanet = usePortfolioStore((s) => s.hoveredPlanet);
  const isHovered = hoveredPlanet === config.id;

  const { curve, glowCurve } = useMemo(() => {
    const segments = 128;
    const points: THREE.Vector3[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * config.orbital.orbitalPeriod;
      const [x, y, z] = calculateOrbitalPosition(config.orbital, t);
      points.push(new THREE.Vector3(x, y, z));
    }

    const mainCurve = new THREE.CatmullRomCurve3(points, true);
    return { curve: mainCurve, glowCurve: mainCurve };
  }, [config.orbital]);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 128, 0.015, 4, true);
  }, [curve]);

  const glowGeometry = useMemo(() => {
    return new THREE.TubeGeometry(glowCurve, 128, 0.06, 4, true);
  }, [glowCurve]);

  const opacity = isHovered ? baseOpacity * 3 : baseOpacity;
  const glowOpacity = isHovered ? 0.08 : 0.02;

  return (
    <group>
      {/* Main thin orbit line */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Soft glow around orbit */}
      <mesh geometry={glowGeometry}>
        <meshBasicMaterial
          color={config.color}
          transparent
          opacity={glowOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
