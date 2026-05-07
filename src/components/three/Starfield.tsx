'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Twinkle star shader ─────────────────────────────────────────────────────
const starVertexShader = /* glsl */`
attribute float aSize;
attribute float aOffset;
attribute vec3 aColor;

varying vec3 vColor;
varying float vAlpha;

uniform float uTime;
uniform float uFade;

void main() {
  vColor = aColor;
  
  // Per-star twinkle using offset
  float twinkle = sin(uTime * (0.5 + aOffset * 2.0) + aOffset * 100.0) * 0.3 + 0.7;
  vAlpha = twinkle * uFade;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (200.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const starFragmentShader = /* glsl */`
varying vec3 vColor;
varying float vAlpha;

void main() {
  // Soft circular point
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;
  
  float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
  gl_FragColor = vec4(vColor, alpha);
}
`;

// ─── Far Stars (background sphere) ──────────────────────────────────────────
interface StarLayerProps {
  count: number;
  minRadius: number;
  maxRadius: number;
  minSize?: number;
  maxSize?: number;
  baseOpacity?: number;
  rotationSpeed?: number;
}

function StarLayer({
  count,
  minRadius,
  maxRadius,
  minSize = 0.3,
  maxSize = 1.5,
  rotationSpeed = 0.001,
}: StarLayerProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const offsets = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = minRadius + Math.random() * (maxRadius - minRadius);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Size distribution — mostly small, few bright
      const sizeRand = Math.random();
      sizes[i] = sizeRand < 0.92
        ? minSize + Math.random() * (maxSize - minSize) * 0.3
        : maxSize * (0.6 + Math.random() * 0.4);

      offsets[i] = Math.random();

      // Color temperature variation
      const colorType = Math.random();
      if (colorType < 0.55) {
        // White / warm
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.95 + Math.random() * 0.05;
        colors[i * 3 + 2] = 0.88 + Math.random() * 0.12;
      } else if (colorType < 0.8) {
        // Blue-white
        colors[i * 3] = 0.85 + Math.random() * 0.15;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 1.0;
      } else {
        // Orange-red
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.65 + Math.random() * 0.25;
        colors[i * 3 + 2] = 0.4 + Math.random() * 0.3;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    const unis = {
      uTime: { value: 0 },
      uFade: { value: 0 },
    };

    return { geometry: geo, uniforms: unis };
  }, [count, minRadius, maxRadius, minSize, maxSize]);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    // Smooth fade in
    uniforms.uFade.value = Math.min(1, uniforms.uFade.value + 0.008);

    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed;
      pointsRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * rotationSpeed * 0.5) * 0.02;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Drifting near particles ─────────────────────────────────────────────────
function NearParticles({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.0003;
      // Slight vertical drift
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.3;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        sizeAttenuation
        color="#ffffff"
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Main Starfield export ───────────────────────────────────────────────────
interface StarfieldProps {
  isMobile?: boolean;
}

export function Starfield({ isMobile = false }: StarfieldProps) {
  const farCount = isMobile ? 2000 : 4000;
  const midCount = isMobile ? 800 : 2000;
  const nearParticleCount = isMobile ? 80 : 200;

  return (
    <>
      {/* Far background stars — tiny, slow, distant */}
      <StarLayer
        count={farCount}
        minRadius={150}
        maxRadius={300}
        minSize={0.2}
        maxSize={1.0}
        rotationSpeed={0.0005}
      />

      {/* Mid-layer stars — slightly brighter, parallax */}
      <StarLayer
        count={midCount}
        minRadius={60}
        maxRadius={150}
        minSize={0.3}
        maxSize={1.8}
        rotationSpeed={0.0015}
      />

      {/* Near drifting particles */}
      <NearParticles count={nearParticleCount} />
    </>
  );
}
