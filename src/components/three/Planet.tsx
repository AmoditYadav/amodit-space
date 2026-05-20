'use client';

import { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { PlanetConfig, calculateOrbitalPosition } from '@/lib/orbital-mechanics';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { TIMING } from '@/lib/constants';
import { Moon } from './Moon';

// Atmosphere shader — Fresnel glow ring
const atmosphereVert = /* glsl */`
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-worldPos.xyz);
  gl_Position = projectionMatrix * worldPos;
}
`;

const atmosphereFrag = /* glsl */`
varying vec3 vNormal;
varying vec3 vViewDir;
uniform vec3 uColor;
uniform float uIntensity;
void main() {
  float fresnel = 1.0 - dot(vNormal, vViewDir);
  fresnel = pow(fresnel, 3.0);
  float alpha = fresnel * uIntensity;
  alpha *= smoothstep(0.0, 0.4, fresnel);
  gl_FragColor = vec4(uColor, alpha);
}
`;

// Earth atmosphere shader from earth.html
const earthAtmosphereVert = /* glsl */`
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const earthAtmosphereFrag = /* glsl */`
varying vec3 vNormal;
void main() {
  float intensity = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
  gl_FragColor = vec4(0.3, 0.6, 1.0, 0.5) * intensity;
}
`;

interface PlanetProps {
  config: PlanetConfig;
  time: number;
  isMobile?: boolean;
}

export function Planet({ config, time, isMobile = false }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const scaleRef = useRef(config.size);
  const { camera } = useThree();

  const setHoveredPlanet = usePortfolioStore((s) => s.setHoveredPlanet);
  const introComplete = usePortfolioStore((s) => s.introComplete);
  const setZoomTarget = usePortfolioStore((s) => s.setZoomTarget);

  // Calculate current orbital position
  const position = useMemo(() => {
    return calculateOrbitalPosition(config.orbital, time);
  }, [config.orbital, time]);

  // Atmosphere uniforms
  const atmosphereUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(config.atmosphereColor || config.color) },
      uIntensity: { value: config.hasAtmosphere ? 0.8 : 0.4 },
    }),
    [config.atmosphereColor, config.color, config.hasAtmosphere]
  );

  // Load realistic planet textures
  const { earthTexture, cloudsTexture, marsTexture, jupiterTexture, neptuneTexture } = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const earth = loader.load('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Whole_world_-_land_and_oceans.jpg/1280px-Whole_world_-_land_and_oceans.jpg');
    const clouds = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png');
    const mars = loader.load('/textures/8k_mars.jpg');
    const jupiter = loader.load('/textures/8k_jupiter.jpg');
    const neptune = loader.load('/textures/2k_neptune.jpg');
    [earth, clouds, mars, jupiter, neptune].forEach(tex => {
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
    });
    return { earthTexture: earth, cloudsTexture: clouds, marsTexture: mars, jupiterTexture: jupiter, neptuneTexture: neptune };
  }, []);

  // Procedural texture — higher resolution for sharpness
  const planetTexture = useMemo(() => {
    const size = 512;
    const data = new Uint8Array(size * size * 4);
    const baseColor = new THREE.Color(config.color);
    const isEarthLike = config.id === 'about';
    const isMarsLike = config.id === 'projects';
    const isGasGiant = config.id === 'blog';

    for (let i = 0; i < size * size; i++) {
      const x = (i % size) / size;
      const y = Math.floor(i / size) / size;
      const lat = (y - 0.5) * Math.PI;

      let r: number, g: number, b: number;

      if (isEarthLike) {
        const continentNoise =
          Math.sin(x * 12 + y * 8) * 0.4 +
          Math.sin(x * 25 - y * 20) * 0.3 +
          Math.sin(x * 50 + y * 45) * 0.15;
        const cloudNoise = Math.sin(x * 35 + y * 28) * 0.15 + Math.random() * 0.05;
        if (continentNoise > 0.1) {
          r = 80 + continentNoise * 60;
          g = 120 + continentNoise * 40;
          b = 60 + continentNoise * 30;
        } else {
          r = 40 + Math.abs(continentNoise) * 20;
          g = 80 + Math.abs(continentNoise) * 30;
          b = 160 + Math.abs(continentNoise) * 40;
        }
        if (cloudNoise > 0.1) {
          const ci = cloudNoise * 150;
          r = Math.min(255, r + ci * 0.7);
          g = Math.min(255, g + ci * 0.7);
          b = Math.min(255, b + ci * 0.6);
        }
      } else if (isMarsLike) {
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
        // Ice/distant planet
        const surfaceNoise =
          Math.sin(x * 25 + y * 20) * 0.15 +
          Math.sin(x * 50 - y * 45) * 0.1 +
          (Math.random() - 0.5) * 0.03;
        const methaneStreak = Math.sin(lat * 6 + x * 8) * 0.15;
        const factor = 1 + surfaceNoise + methaneStreak;
        r = baseColor.r * 255 * factor * 0.9;
        g = baseColor.g * 255 * factor * 0.95;
        b = baseColor.b * 255 * factor;
      }

      data[i * 4] = Math.min(255, Math.max(0, r));
      data[i * 4 + 1] = Math.min(255, Math.max(0, g));
      data[i * 4 + 2] = Math.min(255, Math.max(0, b));
      data[i * 4 + 3] = 255;
    }

    const texture = new THREE.DataTexture(data, size, size);
    texture.needsUpdate = true;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    return texture;
  }, [config.color, config.id]);

  // Smooth scale animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += config.rotationSpeed;
    }

    // Rotate clouds independently, slightly faster
    if (cloudRef.current) {
      cloudRef.current.rotation.y += config.rotationSpeed * 1.2;
    }

    // Smooth hover scale transition
    const targetScale = hovered ? config.size * TIMING.planetHoverScale : config.size;
    scaleRef.current += (targetScale - scaleRef.current) * 0.08;

    if (groupRef.current) {
      groupRef.current.scale.setScalar(scaleRef.current / config.size);
    }
  });

  const displaySize = isMobile ? Math.max(config.size, 0.6) : config.size;

  const handleClick = useCallback(() => {
    if (!introComplete) return;
    // Set zoom target — the CameraController will animate toward the planet
    setZoomTarget({
      position: position as [number, number, number],
      route: config.route,
    });
  }, [introComplete, setZoomTarget, position, config.route]);

  const handlePointerOver = useCallback(() => {
    if (isMobile) return;
    setHovered(true);
    setHoveredPlanet(config.id);
    document.body.style.cursor = 'pointer';
  }, [isMobile, config.id, setHoveredPlanet]);

  const handlePointerOut = useCallback(() => {
    if (isMobile) return;
    setHovered(false);
    setHoveredPlanet(null);
    document.body.style.cursor = 'auto';
  }, [isMobile, setHoveredPlanet]);

  // Moon configuration — orbit radius in world coords, well outside planet surface
  const moonOrbitRadius = 1.8;
  const moonSize = 0.12;
  const moonOrbitSpeed = 0.015;

  const isEarth = config.id === 'about';

  return (
    <group>
      <group position={position} ref={groupRef}>
        {/* Main planet mesh */}
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          rotation={[0.1, 0, 0.05]}
        >
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial
            map={isEarth ? earthTexture : (config.id === 'projects' ? marsTexture : (config.id === 'blog' ? jupiterTexture : (config.id === 'contact' ? neptuneTexture : planetTexture)))}
            roughness={config.id === 'blog' ? 0.7 : 0.85}
            metalness={0.0}
            emissive={config.emissive || '#000000'}
            emissiveIntensity={hovered ? 0.1 : 0.04}
            transparent={false}
            depthWrite={true}
          />
        </mesh>

        {/* Cloud layer (Earth only) */}
        {isEarth && (
          <mesh ref={cloudRef} scale={1.02} rotation={[0.1, 0, 0.05]}>
            <sphereGeometry args={[1, 48, 48]} />
            <meshBasicMaterial
              map={cloudsTexture}
              transparent
              opacity={0.6}
              blending={THREE.NormalBlending}
              depthWrite={true}
            />
          </mesh>
        )}

        {/* Atmosphere glow — all planets get a subtle one */}
        <mesh scale={isEarth ? 1.15 : 1.12}>
          <sphereGeometry args={[1, 32, 32]} />
          <shaderMaterial
            vertexShader={isEarth ? earthAtmosphereVert : atmosphereVert}
            fragmentShader={isEarth ? earthAtmosphereFrag : atmosphereFrag}
            uniforms={isEarth ? {} : atmosphereUniforms}
            transparent
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>


        {/* Hover glow ring */}
        {hovered && (
          <mesh scale={1.2}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial
              color={config.color}
              transparent
              opacity={0.06}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Permanent label below planet */}
        <Html
          position={[0, -1.3, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          distanceFactor={8}
        >
          <div className="text-center">
            <span
              className={`text-[10px] sm:text-xs tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-500 ${
                hovered
                  ? 'text-white/90 font-normal'
                  : 'text-white/50 font-light'
              }`}
              style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
            >
              {config.name}
            </span>
          </div>
        </Html>

        {/* Hover tooltip */}
        {hovered && (
          <Html
            position={[0, 1.5, 0]}
            center
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div
              className="px-4 py-2 rounded-xl text-white text-sm font-medium whitespace-nowrap shadow-2xl"
              style={{
                background: 'rgba(10, 10, 20, 0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              }}
            >
              Explore {config.name}
            </div>
          </Html>
        )}
      </group>

      {/* Moon */}
      <Moon
        parentPosition={position}
        orbitRadius={moonOrbitRadius}
        size={moonSize}
        orbitSpeed={moonOrbitSpeed}
        orbitOffset={config.orbital.meanAnomalyAtEpoch}
      />
    </group>
  );
}
