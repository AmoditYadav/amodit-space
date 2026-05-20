'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { Sun } from './Sun';

export interface StarSystem {
  name: string;
  distance: number;
  x: number;
  y: number;
  z: number;
}

export const GALAXY_SYSTEMS: StarSystem[] = [
  { name: 'Sol', distance: 0, x: 0, y: 0, z: 0 },
  { name: 'Proxima Centauri', distance: 4.24, x: -1.531, y: 0.849, z: -3.768 },
  { name: "Barnard's Star", distance: 5.96, x: 5.822, y: -0.475, z: 0.488 },
  { name: "Luyten's Star", distance: 12.36, x: 11.554, y: 4.196, z: 1.124 },
  { name: "Teegarden's Star", distance: 12.5, x: 11.557, y: 8.496, z: 3.632 },
  { name: 'TRAPPIST-1', distance: 40.7, x: 39.943, y: -6.988, z: -3.577 },
  { name: 'HD 209458', distance: 159, x: 147.714, y: -48.322, z: 51.496 },
  { name: '55 Cancri', distance: 41, x: 33.013, y: 14.966, z: 19.416 },
  { name: 'HD 189733', distance: 64.5, x: 54.814, y: -24.193, z: 24.908 },
  { name: 'Kepler-186', distance: 582, x: 429.771, y: -189.698, z: 402.076 },
  { name: 'Kepler-452', distance: 1800, x: 1321.000, y: -583.000, z: 1266.000 },
  { name: 'WASP-12', distance: 1410, x: 1197.000, y: 408.00, z: 698.000 },
  { name: 'Gliese 581', distance: 20.4, x: 18.058, y: 8.307, z: -2.737 },
  { name: 'HD 40307', distance: 42, x: 19.694, y: 3.769, z: -36.297 },
  { name: 'Kepler-22', distance: 620, x: 492.000, y: -217.000, z: 388.000 },
  { name: 'GJ 1214', distance: 48, x: 45.087, y: -9.698, z: 12.598 },
  { name: 'K2-18', distance: 124, x: 108.155, y: 49.465, z: 16.374 },
  { name: 'HD 69830', distance: 41, x: 37.452, y: 10.397, z: -8.947 },
  { name: 'Kepler-62', distance: 980, x: 695.000, y: -306.000, z: 704.000 },
  { name: 'TOI-700', distance: 101, x: 39.886, y: 7.723, z: -92.626 },
];

const SCALE_FACTOR = 15.0;

export function GalaxyCluster() {
  const groupRef = useRef<THREE.Group>(null);
  const skyboxRef = useRef<THREE.Mesh>(null);
  const skyboxMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const pointsMatRef = useRef<THREE.PointsMaterial>(null);
  
  const setZoomTarget = usePortfolioStore((s) => s.setZoomTarget);
  const audioEnabled = usePortfolioStore((s) => s.audioEnabled);
  const introComplete = usePortfolioStore((s) => s.introComplete);

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
        // As you zoom further out, make them larger to remain visible, but capped
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
  switch (name) {
    case 'Sol':
      return { color: '#FFE853', glowColor: '#FFF176', starType: 'Yellow Dwarf (G2V)', size: 12, planetsCount: 8, temp: '5,778K' };
    case 'Proxima Centauri':
      return { color: '#FF3C00', glowColor: '#FF5E00', starType: 'Red Dwarf (M5.5V)', size: 8, planetsCount: 3, temp: '3,050K' };
    case "Barnard's Star":
      return { color: '#FF5A00', glowColor: '#FF7D00', starType: 'Red Dwarf (M4.0V)', size: 8.5, planetsCount: 4, temp: '3,220K' };
    case "Luyten's Star":
      return { color: '#FF6D00', glowColor: '#FF9100', starType: 'Red Dwarf (M3.5V)', size: 8, planetsCount: 2, temp: '3,150K' };
    case "Teegarden's Star":
      return { color: '#FF7B00', glowColor: '#FFA000', starType: 'Red Dwarf (M7.0V)', size: 7.5, planetsCount: 2, temp: '2,900K' };
    case 'TRAPPIST-1':
      return { color: '#FF2A00', glowColor: '#FF5722', starType: 'Ultra-cool Red Dwarf (M8V)', size: 7, planetsCount: 7, temp: '2,550K' };
    case 'HD 209458':
      return { color: '#FFF6A3', glowColor: '#FFE77D', starType: 'Yellow Star (G0V)', size: 13, planetsCount: 1, temp: '6,070K' };
    case '55 Cancri':
      return { color: '#FFE853', glowColor: '#FFF176', starType: 'Yellow Dwarf (K0IV)', size: 11, planetsCount: 5, temp: '5,200K' };
    case 'HD 189733':
      return { color: '#FFA040', glowColor: '#FF8F00', starType: 'Orange Dwarf (K2V)', size: 10.5, planetsCount: 3, temp: '5,040K' };
    case 'Kepler-186':
      return { color: '#FF5722', glowColor: '#FF7A47', starType: 'Red Dwarf (M1V)', size: 9, planetsCount: 3, temp: '3,750K' };
    case 'Kepler-452':
      return { color: '#FFE853', glowColor: '#FFF176', starType: 'Yellow Dwarf (G2V)', size: 12.5, planetsCount: 4, temp: '5,760K' };
    case 'WASP-12':
      return { color: '#FFF9E6', glowColor: '#E0F7FA', starType: 'Yellow-White Star (F8V)', size: 15, planetsCount: 2, temp: '6,300K' };
    case 'Gliese 581':
      return { color: '#FF3D00', glowColor: '#FF6D00', starType: 'Red Dwarf (M3V)', size: 8, planetsCount: 4, temp: '3,500K' };
    case 'HD 40307':
      return { color: '#FF9800', glowColor: '#FFB74D', starType: 'Orange Dwarf (K2.5V)', size: 10, planetsCount: 6, temp: '4,980K' };
    case 'Kepler-22':
      return { color: '#FFE082', glowColor: '#FFE082', starType: 'Yellow Dwarf (G5V)', size: 11.5, planetsCount: 3, temp: '5,520K' };
    case 'GJ 1214':
      return { color: '#FF1E00', glowColor: '#FF5252', starType: 'Red Dwarf (M4.5V)', size: 8, planetsCount: 1, temp: '3,030K' };
    case 'K2-18':
      return { color: '#FF5722', glowColor: '#FF8A50', starType: 'Red Dwarf (M2.5V)', size: 9, planetsCount: 3, temp: '3,500K' };
    case 'HD 69830':
      return { color: '#FFB74D', glowColor: '#FFE082', starType: 'Yellow-Orange (K0V)', size: 11, planetsCount: 3, temp: '5,390K' };
    case 'Kepler-62':
      return { color: '#FFA726', glowColor: '#FFCC80', starType: 'Orange Dwarf (K2V)', size: 10, planetsCount: 4, temp: '4,900K' };
    case 'TOI-700':
      return { color: '#FF3D00', glowColor: '#FF7043', starType: 'Red Dwarf (M2V)', size: 8, planetsCount: 4, temp: '3,480K' };
    default:
      return { color: '#FFE853', glowColor: '#FFF176', starType: 'Yellow Dwarf', size: 11, planetsCount: 3, temp: '5,500K' };
  }
};

interface ProceduralPlanetConfig {
  name: string;
  radius: number;
  speed: number;
  size: number;
  rotationSpeed: number;
  texturePath: string;
  startAngle: number;
}

interface ProceduralPlanetProps {
  planet: ProceduralPlanetConfig;
  starColor: string;
}

function ProceduralPlanet({ planet, starColor }: ProceduralPlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Precompute circle points for orbit lines
  const orbitGeometry = useMemo(() => {
    const pts = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * planet.radius, 0, Math.sin(angle) * planet.radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [planet.radius]);

  // Dynamic texture loading
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(planet.texturePath);
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    return tex;
  }, [planet.texturePath]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Animate orbit
    if (groupRef.current) {
      const angle = planet.startAngle + t * planet.speed;
      groupRef.current.position.set(
        Math.cos(angle) * planet.radius,
        0,
        Math.sin(angle) * planet.radius
      );
    }
    // Axial rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += planet.rotationSpeed;
    }
  });

  const isSaturn = planet.texturePath.includes('saturn');

  return (
    <group>
      {/* Orbit path line */}
      <primitive
        object={useMemo(() => {
          const material = new THREE.LineBasicMaterial({
            color: starColor,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          return new THREE.Line(orbitGeometry, material);
        }, [orbitGeometry, starColor])}
        ref={(lineObj: any) => {
          if (lineObj && lineObj.material) {
            lineObj.material.opacity = hovered ? 0.35 : 0.12;
          }
        }}
      />

      {/* Orbiting body group */}
      <group ref={groupRef}>
        <mesh
          ref={meshRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[planet.size, 32, 32]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Saturn Rings */}
        {isSaturn && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[planet.size * 1.4, planet.size * 2.3, 64]} />
            <meshStandardMaterial
              color="#c5ab7f"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
              roughness={0.8}
            />
          </mesh>
        )}

        {/* Planet Tooltip Info */}
        {hovered && (
          <Html
            position={[0, planet.size + 2.5, 0]}
            center
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div
              className="px-2.5 py-1 rounded bg-black/85 border border-white/10 backdrop-blur-md text-[10px] text-white/90 tracking-widest uppercase whitespace-nowrap shadow-xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {planet.name}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

interface ProceduralSystemProps {
  system: StarSystem;
  starColor: string;
}

function ProceduralSystem({ system, starColor }: ProceduralSystemProps) {
  const systemDetails = useMemo(() => getSystemDetails(system.name), [system.name]);

  const planets = useMemo(() => {
    const list = [];
    const count = systemDetails.planetsCount;

    // Simple deterministic PRNG
    let seed = 0;
    for (let i = 0; i < system.name.length; i++) {
      seed = (seed * 31 + system.name.charCodeAt(i)) & 0xffffffff;
    }

    const rand = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 0xffffffff;
    };

    const texturesList = [
      '/textures/8k_mercury.jpg',
      '/textures/8k_venus_surface.jpg',
      '/textures/8k_mars.jpg',
      '/textures/8k_jupiter.jpg',
      '/textures/8k_saturn.jpg',
      '/textures/2k_uranus.jpg',
      '/textures/2k_neptune.jpg',
      '/textures/Pluto-map-sept-16-2015.jpg'
    ];

    for (let i = 0; i < count; i++) {
      let texturePath = texturesList[Math.floor(rand() * texturesList.length)];
      let name = `${system.name} ${String.fromCharCode(98 + i)}`; // b, c, d, e...

      // Core overrides for specific stars
      if (system.name === 'Proxima Centauri' && i === 0) {
        texturePath = '/textures/proxima_centauri_b.jpg';
        name = 'Proxima Centauri b';
      } else if (system.name === "Barnard's Star" && i === 0) {
        texturePath = '/textures/4k_Barnard.jpg';
        name = "Barnard's Star b";
      }

      const radius = 35 + i * (25 + rand() * 15);
      const speed = (0.012 + rand() * 0.015) * (0.8 + (1.2 / Math.sqrt(radius)));
      const size = 1.3 + rand() * 2.2;
      const rotationSpeed = 0.005 + rand() * 0.015;
      const startAngle = rand() * Math.PI * 2;

      list.push({
        name,
        radius,
        speed,
        size,
        rotationSpeed,
        texturePath,
        startAngle
      });
    }
    return list;
  }, [system.name, systemDetails.planetsCount]);

  return (
    <group>
      {/* Central Star PointLight */}
      <pointLight
        position={[0, 0, 0]}
        intensity={70}
        distance={450}
        decay={1.2}
        color={starColor}
      />
      {/* Space ambient booster */}
      <ambientLight intensity={0.02} />

      {planets.map((planet) => (
        <ProceduralPlanet key={planet.name} planet={planet} starColor={starColor} />
      ))}
    </group>
  );
}

interface StarNodeProps {
  system: StarSystem;
  audioEnabled: boolean;
  setZoomTarget: any;
}

function StarSystemNode({ system, audioEnabled, setZoomTarget }: StarNodeProps) {
  const [hovered, setHovered] = useState(false);
  const coreRef = useRef<THREE.Mesh>(null);
  const [labelVisible, setLabelVisible] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const focusedSystem = usePortfolioStore((s) => s.focusedSystem);

  const systemDetails = useMemo(() => getSystemDetails(system.name), [system.name]);

  const position: [number, number, number] = useMemo(() => [
    system.x * SCALE_FACTOR,
    system.y * SCALE_FACTOR,
    system.z * SCALE_FACTOR
  ], [system]);

  const isSol = system.name === 'Sol';

  // Check camera distance to toggle text label visibility dynamically
  useFrame((state) => {
    const camDist = state.camera.position.length();
    
    // Sol's label shows when zoomed out past 80, others show past 100
    const threshold = isSol ? 80 : 100;
    setLabelVisible(camDist > threshold);

    // LOD: Mount orbital systems only when close to them (prevents huge memory draw in galaxy map)
    if (!isSol) {
      const nodePos = new THREE.Vector3(...position);
      const dist = state.camera.position.distanceTo(nodePos);
      const nextNear = dist < 450;
      if (nextNear !== isNear) {
        setIsNear(nextNear);
      }
    }
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
      route: isSol ? '/' : '',
    });
  };

  // Star size
  const coreRadius = isSol ? 8 : systemDetails.size;
  const glowRadius = isSol ? 25 : systemDetails.size * 3.125;

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

      {/* 1. Static Star Core (hidden when dynamic Sun is active) */}
      {(!isNear || isSol) && (
        <>
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
        </>
      )}

      {/* Dynamic animated star with noise shader + flares (when camera is close to non-Sol) */}
      {isNear && !isSol && (
        <Sun
          position={[0, 0, 0]}
          size={systemDetails.size / 1.5}
          color={systemDetails.color}
          glowColor={systemDetails.glowColor}
          isSol={false}
        />
      )}

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

      {/* 4. Sci-Fi HUD Card Overlay (only when this star is actively focused/clicked) */}
      {focusedSystem === system.name && !isSol && (
        <Html
          position={[0, glowRadius + 15, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            className="px-4 py-3 text-left min-w-[200px] shadow-2xl transition-all duration-500 animate-fade-in-up"
            style={{
              background: 'rgba(8, 8, 16, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              fontFamily: "'Space Grotesk', sans-serif"
            }}
          >
            <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 font-medium mb-1">
              SYSTEM TELEMETRY
            </p>
            <h3
              className="text-sm font-semibold tracking-wider text-white"
              style={{ textShadow: `0 0 10px ${systemDetails.color}50` }}
            >
              {system.name}
            </h3>
            <div className="h-[1px] bg-white/10 my-2" />
            <div className="flex flex-col gap-1 text-[10px] text-white/60 tracking-wider">
              <div className="flex justify-between">
                <span>Spectral Class:</span>
                <span className="font-semibold text-white/80">{systemDetails.starType.split(' (')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span>Star Temp:</span>
                <span className="font-semibold" style={{ color: systemDetails.color }}>
                  {systemDetails.temp}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Planets Detected:</span>
                <span className="font-semibold text-white/80">{systemDetails.planetsCount}</span>
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* 5. Procedural Planet System (mounted when camera is close) */}
      {isNear && !isSol && (
        <ProceduralSystem system={system} starColor={systemDetails.color} />
      )}
    </group>
  );
}
