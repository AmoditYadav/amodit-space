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
}

export function Moon({
  parentPosition,
  orbitRadius = 0.8,
  size = 0.12,
  orbitSpeed = 0.015,
  orbitOffset = 0,
}: MoonProps) {
  const moonRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(orbitOffset);

  // Load realistic Moon textures
  const { colorMap, displacementMap } = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const color = loader.load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg");
    const disp = loader.load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/ldem_3_8bit.jpg");
    
    // Set wrapping and filtering for high quality
    color.minFilter = THREE.LinearMipmapLinearFilter;
    color.generateMipmaps = true;
    disp.minFilter = THREE.LinearMipmapLinearFilter;
    disp.generateMipmaps = true;
    
    return { colorMap: color, displacementMap: disp };
  }, []);

  useFrame(() => {
    angleRef.current += orbitSpeed;

    if (groupRef.current) {
      const moonX = parentPosition[0] + Math.cos(angleRef.current) * orbitRadius;
      const moonY = parentPosition[1] + Math.sin(angleRef.current * 0.3) * orbitRadius * 0.1;
      const moonZ = parentPosition[2] + Math.sin(angleRef.current) * orbitRadius;
      groupRef.current.position.set(moonX, moonY, moonZ);
    }

    if (moonRef.current) {
      moonRef.current.rotation.y += 0.002;
    }
  });

  // Calculate appropriate displacement and bump scale based on moon's actual size.
  // The original template used radius 2 and displacement scale 0.06 (3% of radius).
  const scaleRatio = size / 2.0;
  const displacementScale = 0.06 * scaleRatio;
  const bumpScale = 0.04 * scaleRatio;

  return (
    <group ref={groupRef}>
      <mesh ref={moonRef}>
        {/* Increased segments to 64 for rich bumpy detail rendering */}
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          displacementMap={displacementMap}
          displacementScale={displacementScale}
          bumpMap={displacementMap}
          bumpScale={bumpScale}
          roughness={1.0}
          metalness={0.0}
        />
      </mesh>
      {/* Subtle moon glow */}
      <mesh>
        <sphereGeometry args={[size * 1.15, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

