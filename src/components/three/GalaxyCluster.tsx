'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { usePortfolioStore } from '@/store/usePortfolioStore';

export interface StarSystem {
  name: string;
  distance: number;
  x: number;
  y: number;
  z: number;
}

export const GALAXY_SYSTEMS: StarSystem[] = [
  { name: 'Sol', distance: 0, x: 0, y: 0, z: 0 },
];

const SCALE_FACTOR = 15.0;

export function GalaxyCluster() {
  const groupRef = useRef<THREE.Group>(null);
  const skyboxRef = useRef<THREE.Mesh>(null);
  const skyboxMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const pointsMatRef = useRef<THREE.PointsMaterial>(null);
  
  const setZoomTarget = usePortfolioStore((s) => s.setZoomTarget);
  const audioEnabled = usePortfolioStore((s) => s.audioEnabled);

  // Milky Way Skybox texture
  const skyboxTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('/textures/8k_stars_milky_way.jpg');
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }, []);

  // 10,000 galaxy background stars
  const starCount = 10000;
  const maxStarRadius = 10000;
  const starPositions = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = maxStarRadius * Math.cbrt(Math.random());
      pos[i] = r * Math.sin(phi) * Math.cos(theta);
      pos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  // Track zoom-dependent fade values in useFrame to avoid React state lag
  useFrame((state) => {
    const distance = state.camera.position.length();

    // Fade factor goes from 0 (at distance 60) to 1 (at distance 150)
    const fadeFactor = Math.min(1, Math.max(0, (distance - 60) / 90));

    if (groupRef.current) {
      // Toggle group visibility safely
      groupRef.current.visible = distance > 55;
      
      // Scale group elements or set child visibility
      groupRef.current.children.forEach((child) => {
        // Find if child is a star system group and set its scale
        if (child.name === 'galaxy-skybox') return;
        if (child.name === 'galaxy-starfield') return;
        
        // Scale star system icons based on zoom distance
        const scaleVal = Math.min(1.5, Math.max(0.4, distance / 2000)) * fadeFactor;
        child.scale.setScalar(scaleVal);
      });
    }

    // Slowly rotate skybox
    if (skyboxRef.current) {
      skyboxRef.current.rotation.y = state.clock.elapsedTime * 0.0003;
      skyboxRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.0001) * 0.02;
    }

    // Set material opacities for seamless fade transition
    if (skyboxMatRef.current) {
      skyboxMatRef.current.opacity = fadeFactor;
    }
    if (pointsMatRef.current) {
      pointsMatRef.current.opacity = fadeFactor * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Milky Way Skybox */}
      <mesh ref={skyboxRef} name="galaxy-skybox">
        <sphereGeometry args={[9000, 64, 64]} />
        <meshBasicMaterial
          ref={skyboxMatRef}
          map={skyboxTexture}
          side={THREE.BackSide}
          transparent
          opacity={0.0}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* 2. Deep Space Galaxy Starfield */}
      <points name="galaxy-starfield">
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMatRef}
          color="#ffffff"
          size={5}
          sizeAttenuation
          transparent
          opacity={0.0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 3. Star System Nodes */}
      {GALAXY_SYSTEMS.map((system) => (
        <StarSystemNode
          key={system.name}
          system={system}
          audioEnabled={audioEnabled}
          setZoomTarget={setZoomTarget}
        />
      ))}
    </group>
  );
}

export const getSystemDetails = (name: string) => {
  if (name === 'Sol') {
    return { color: '#FFE853', glowColor: '#FFF176', starType: 'Yellow Dwarf (G2V)', size: 12, planetsCount: 8, temp: '5,778K' };
  }
  return { color: '#FFE853', glowColor: '#FFF176', starType: 'Yellow Dwarf', size: 11, planetsCount: 3, temp: '5,500K' };
};

interface StarNodeProps {
  system: StarSystem;
  audioEnabled: boolean;
  setZoomTarget: any;
}

function StarSystemNode({ system, audioEnabled, setZoomTarget }: StarNodeProps) {
  const [hovered, setHovered] = useState(false);
  const coreRef = useRef<THREE.Mesh>(null);
  const [labelVisible, setLabelVisible] = useState(false);

  const systemDetails = useMemo(() => getSystemDetails(system.name), [system.name]);

  const position: [number, number, number] = useMemo(() => [
    system.x * SCALE_FACTOR,
    system.y * SCALE_FACTOR,
    system.z * SCALE_FACTOR
  ], [system]);

  // Check camera distance to toggle text label visibility dynamically
  useFrame((state) => {
    const camDist = state.camera.position.length();
    setLabelVisible(camDist > 80);
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    
    // Play zoom sound if audio is enabled
    if (audioEnabled) {
      const zoomSound = new Audio('/Sounds/Zooming_in.mp3');
      zoomSound.volume = 0.5;
      zoomSound.play().catch(() => {});
    }

    // Set camera target coordinates. Zoom target triggers animation in CameraController.
    setZoomTarget({
      position,
      route: '/',
    });
  };

  // Star size
  const coreRadius = 8;
  const glowRadius = 25;

  return (
    <group position={position} name={`star-system-${system.name}`}>
      {/* 0. Invisible proxy click/hover target — large sphere for easy selection */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[Math.max(glowRadius * 1.8, 35), 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 1. Static Star Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[coreRadius, 32, 32]} />
        <meshBasicMaterial
          color={hovered ? '#00B7EB' : systemDetails.color}
          toneMapped={false}
        />
      </mesh>

      {/* 2. Outer Corona Glow */}
      <mesh>
        <sphereGeometry args={[glowRadius, 32, 32]} />
        <meshBasicMaterial
          color={hovered ? '#00B7EB' : systemDetails.glowColor}
          transparent
          opacity={hovered ? 0.35 : 0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. HTML System Label */}
      {labelVisible && (
        <Html
          position={[0, -coreRadius - 15, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          distanceFactor={100}
        >
          <div className="flex flex-col items-center">
            <span
              className={`text-sm sm:text-base tracking-[0.25em] uppercase font-medium whitespace-nowrap transition-all duration-300 ${
                hovered ? 'text-[#00B7EB] drop-shadow-[0_0_12px_rgba(0,183,235,0.8)]' : 'text-white/80'
              }`}
              style={{
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                textShadow: '0 0 10px rgba(0,0,0,0.9), 0 0 5px rgba(0,0,0,0.9)',
              }}
            >
              {system.name}
            </span>
            {hovered && (
              <span
                className="text-[10px] text-white/50 tracking-widest uppercase mt-1 transition-all duration-200"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  textShadow: '0 0 4px rgba(0,0,0,0.9)',
                }}
              >
                Click to Explore
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
