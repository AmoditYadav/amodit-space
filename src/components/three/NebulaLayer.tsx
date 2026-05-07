'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Extremely subtle nebula/fog layers for volumetric depth.
 * Uses billboard planes with procedural noise textures at very low opacity.
 */
export function NebulaLayer() {
  const groupRef = useRef<THREE.Group>(null);

  // Generate subtle noise texture for each nebula plane
  const textures = useMemo(() => {
    return [
      createNebulaTexture(256, [0.15, 0.1, 0.2]),   // Cool purple
      createNebulaTexture(256, [0.1, 0.12, 0.2]),    // Deep blue
      createNebulaTexture(256, [0.2, 0.12, 0.08]),   // Warm amber
    ];
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.0002;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Large nebula planes at different positions and rotations */}
      <mesh position={[40, 10, -80]} rotation={[0.2, 0.5, 0.1]}>
        <planeGeometry args={[120, 80]} />
        <meshBasicMaterial
          map={textures[0]}
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[-60, -15, -100]} rotation={[-0.3, -0.4, 0.2]}>
        <planeGeometry args={[100, 70]} />
        <meshBasicMaterial
          map={textures[1]}
          transparent
          opacity={0.035}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[20, 30, -120]} rotation={[0.1, 0.8, -0.1]}>
        <planeGeometry args={[140, 90]} />
        <meshBasicMaterial
          map={textures[2]}
          transparent
          opacity={0.025}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function createNebulaTexture(
  size: number,
  baseColor: [number, number, number]
): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);

  for (let i = 0; i < size * size; i++) {
    const x = (i % size) / size;
    const y = Math.floor(i / size) / size;

    // Multi-octave noise approximation
    let n = 0;
    n += Math.sin(x * 8 + y * 6) * 0.5 + 0.5;
    n += (Math.sin(x * 16 - y * 12) * 0.5 + 0.5) * 0.5;
    n += (Math.sin(x * 32 + y * 24) * 0.5 + 0.5) * 0.25;
    n /= 1.75;

    // Radial falloff from center
    const cx = x - 0.5;
    const cy = y - 0.5;
    const radial = 1.0 - Math.min(1.0, Math.sqrt(cx * cx + cy * cy) * 2.0);
    n *= radial * radial;

    data[i * 4] = Math.floor(baseColor[0] * n * 255);
    data[i * 4 + 1] = Math.floor(baseColor[1] * n * 255);
    data[i * 4 + 2] = Math.floor(baseColor[2] * n * 255);
    data[i * 4 + 3] = Math.floor(n * 200);
  }

  const texture = new THREE.DataTexture(data, size, size);
  texture.needsUpdate = true;
  return texture;
}
