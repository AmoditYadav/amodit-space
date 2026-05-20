'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolioStore } from '@/store/usePortfolioStore';

// ─── Simplex Noise GLSL Code ─────────────────────────────────────────────────
const simplexNoise = /* glsl */`
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) { 
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.7, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.7;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 6; ++i) {
        v += a * snoise(p);
        p = p * 2.0 + shift;
        a *= 0.7;
    }
    return v;
}

float fbmDetail(vec3 p) {
    float v = 0.0;
    float a = 0.7;
    vec3 shift = vec3(50.0);
    for (int i = 0; i < 4; ++i) {
        v += a * snoise(p);
        p = p * 3.0 + shift;
        a *= 0.7;
    }
    return v;
}
`;

// ─── Sun Shaders ─────────────────────────────────────────────────────────────
const sunVertexShader = /* glsl */`
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const sunFragmentShader = /* glsl */`
${simplexNoise}
uniform float uTime;
uniform float uIntensity;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vec3 pos = vPosition * 1.5 + uTime * 0.1;

    float n1 = fbm(pos);
    n1 = n1 * 0.7 + 0.7;

    float n2 = fbm(pos + vec3(10.0));
    n2 = n2 * 0.7 + 0.7;

    float baseNoise = (n1 * 0.6 + n2 * 0.4);
    baseNoise = clamp(baseNoise, 0.0, 1.0);

    float detail = fbmDetail(pos * 5.0 + vec3(20.0));
    detail = detail * 0.9 + 0.9;
    baseNoise += detail * 0.1;
    baseNoise = clamp(baseNoise, 0.0, 1.0);

    float glowFactor = pow(max(dot(vNormal, normalize(cameraPosition - vPosition)), 0.0), 2.0);
    vec3 glowColor = uColor1;
    vec3 radiantGlow = glowColor * glowFactor * 0.3;

    vec3 color = mix(uColor1, uColor2, baseNoise);
    color = mix(color, uColor3, detail * 0.2);
    color += radiantGlow;
    
    // Incorporate overall brightness/intro uIntensity
    color *= uIntensity;

    gl_FragColor = vec4(color, 1.0);
}
`;

// ─── Gaseous Clouds Shader ────────────────────────────────────────────────────
const gaseousVertexShader = /* glsl */`
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
    vNormal = normal;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const gaseousFragmentShader = /* glsl */`
uniform float uTime;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uOpacity;
uniform float uCloudScale;
uniform float uCloudSharpness;
uniform float uLayerThickness;
uniform float uIntensity;

varying vec3 vNormal;
varying vec3 vPosition;

${simplexNoise}

void main() {
    vec3 pos = vPosition * uCloudScale + uTime * uSpeed;
    pos *= vec3(1.0, 1.0, uLayerThickness);
    float n1 = snoise(pos);
    float n2 = snoise(pos * 9.0 + vec3(10.0));
    float n = 0.6 * n1 + 0.3 * n2;
    float cloud = smoothstep(0.4, 0.4 + uCloudSharpness, n);
    float alpha = cloud * uOpacity * uIntensity;
    gl_FragColor = vec4(uColor, alpha);
}
`;

// ─── Atmosphere Glow Shader ──────────────────────────────────────────────────
const atmosphereVertexShader = /* glsl */`
varying vec3 vNormal;
void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const atmosphereFragmentShader = /* glsl */`
uniform vec3 uGlowColor;
uniform float uGlowIntensity;
uniform float uIntensity;
varying vec3 vNormal;
void main() {
    float intensity = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(uGlowColor * intensity * uGlowIntensity * uIntensity, intensity * uIntensity);
}
`;

interface SunProps {
  position?: [number, number, number];
  size?: number;
  color?: string;
  glowColor?: string;
  isSol?: boolean;
}

export function Sun({ position = [0, 0, 0], size = 1, color = '#FFE853', glowColor = '#FFF176', isSol = true }: SunProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const sunGroupRef = useRef<THREE.Group>(null);
  const storeIntroComplete = usePortfolioStore((s) => s.introComplete);
  const storeSunBrightness = usePortfolioStore((s) => s.sunBrightness);
  const introComplete = isSol ? storeIntroComplete : true;
  const sunBrightness = isSol ? storeSunBrightness : 0.5;

  // Derive spectral color palette from the base hex color
  const starColors = useMemo(() => {
    const base = new THREE.Color(color);
    const highlight = base.clone().lerp(new THREE.Color('#ffffff'), 0.55);
    const shadow = base.clone().lerp(new THREE.Color('#000000'), 0.65);
    return {
      color1: highlight,
      color2: base.clone(),
      color3: shadow,
      glow: new THREE.Color(glowColor),
    };
  }, [color, glowColor]);

  // Gaseous Cloud Layers Refs
  const gaseousLayerRefs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];

  // Flares Ref Group
  const flaresGroupRef = useRef<THREE.Group>(null);

  // Setup base uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uColor1: { value: starColors.color1 },
      uColor2: { value: starColors.color2 },
      uColor3: { value: starColors.color3 },
    }),
    [starColors]
  );

  const gaseousLayerConfigs = useMemo(
    () => [
      {
        radius: 1.5 * 1.020,
        color: starColors.color2.clone().lerp(starColors.color3, 0.3),
        speed: 0.05,
        opacity: 0.8,
        cloudScale: 1.0,
        cloudSharpness: 0.4,
        layerThickness: 1.0,
      },
      {
        radius: 1.5 * 1.021,
        color: starColors.color3.clone(),
        speed: -0.075,
        opacity: 0.9,
        cloudScale: 1.2,
        cloudSharpness: 0.6,
        layerThickness: 1.5,
      },
    ],
    [starColors]
  );

  // Custom triangular shape for flares
  const triangularShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.003); 
    shape.lineTo(-0.0015, -0.0015); 
    shape.lineTo(0.0015, -0.0015); 
    shape.lineTo(0, 0.003); 
    return shape;
  }, []);

  // Pre-calculate flare metadata
  const flaresData = useMemo(() => {
    const unboundCount = 18; // Reduced slightly from 30 for seamless client performance
    const boundCount = 12;   // Reduced slightly from 20 for seamless client performance
    const totalCount = unboundCount + boundCount;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    const data: any[] = [];
    for (let i = 0; i < totalCount; i++) {
      const isUnbound = i < unboundCount;
      let thetaStart, phiStart;

      if (isUnbound) {
        // Fibonacci sphere distribution
        const idx = i + 0.5;
        phiStart = Math.acos(1 - 2 * idx / unboundCount);
        thetaStart = 2 * Math.PI * idx / goldenRatio;
      } else {
        // Random distribution
        thetaStart = Math.random() * Math.PI * 2;
        phiStart = Math.acos(2 * Math.random() - 1);
      }

      // Radius is 1.45 (slightly inside Sun radius 1.5)
      const radius = 1.45;
      const startPos = new THREE.Vector3(
        radius * Math.sin(phiStart) * Math.cos(thetaStart),
        radius * Math.sin(phiStart) * Math.sin(thetaStart),
        radius * Math.cos(phiStart)
      );

      // Arc params
      const arcLength = isUnbound ? 0.1 : 0.8;
      const thetaEnd = thetaStart + (Math.random() - 0.5) * Math.PI * arcLength;
      const phiEnd = phiStart + (Math.random() - 0.5) * Math.PI * arcLength;
      const endRadius = isUnbound ? 1.75 : 1.45;
      
      const endPos = new THREE.Vector3(
        endRadius * Math.sin(phiEnd) * Math.cos(thetaEnd),
        endRadius * Math.sin(phiEnd) * Math.sin(thetaEnd),
        endRadius * Math.cos(phiEnd)
      );

      const normal = startPos.clone().normalize();
      const tangent = startPos.clone().cross(endPos).normalize();

      const phases = Array.from({ length: 5 }, () => Math.random() * Math.PI * 2);

      data.push({
        isUnbound,
        startPos,
        endPos,
        tangent,
        normal,
        lifetime: isUnbound ? 5.0 : 3.0,
        time: Math.random() * (isUnbound ? 5.0 : 3.0),
        delay: Math.random() * 2.0,
        phases,
        arcHeight: isUnbound ? 0.25 : 0.45,
      });
    }

    return data;
  }, []);

  const shades = useMemo(() => {
    const c1 = starColors.color1.getHex();
    const c2 = starColors.color2.getHex();
    return [c2, c2, c1, c1, c2];
  }, [starColors]);

  // Update loop for Sun shaders, lights, and animated flaring tubes
  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    uniforms.uTime.value = elapsed;

    // Zoom fade logic for Sol only; other stars remain visible at all distances
    if (sunGroupRef.current) {
      if (isSol) {
        const distance = state.camera.position.length();
        const zoomFade = Math.min(1, Math.max(0, (120 - distance) / 60));
        sunGroupRef.current.scale.setScalar(Math.max(0.001, zoomFade));
        sunGroupRef.current.visible = zoomFade > 0.01;
      } else {
        sunGroupRef.current.scale.setScalar(size);
        sunGroupRef.current.visible = true;
      }
    }

    // Smooth intensity ramp during intro (0→1 over ~2 seconds)
    const brightnessMultiplier = 0.3 + sunBrightness * 1.4; // range: 0.3–1.7
    const targetIntensity = introComplete ? brightnessMultiplier : Math.min(brightnessMultiplier, (elapsed / 2.0) * brightnessMultiplier);
    uniforms.uIntensity.value += (targetIntensity - uniforms.uIntensity.value) * 0.05;

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0004;
    }

    // Light flickering and scaling
    if (lightRef.current) {
      const flicker = Math.sin(elapsed * 0.4) * 0.1 + Math.sin(elapsed * 1.1) * 0.05;
      lightRef.current.intensity = (450 + flicker * 50) * uniforms.uIntensity.value;
    }

    // Rotate gaseous clouds layers slowly
    gaseousLayerRefs.forEach((ref, idx) => {
      if (ref.current) {
        ref.current.rotation.y += (idx === 0 ? 0.0003 : -0.0004);
      }
    });

    // Update flares geometries
    if (flaresGroupRef.current) {
      const uIntensityVal = uniforms.uIntensity.value;

      flaresData.forEach((flare, flareIdx) => {
        flare.time += 0.01;
        const totalDuration = flare.lifetime + flare.delay;
        
        if (flare.time >= totalDuration) {
          flare.time = 0;
          flare.delay = Math.random() * 2.0;
        }

        const t = flare.time / totalDuration;
        const fade = t < 0.5 ? t * 2 : 1 - (t - 0.5) * 2;

        const flareGroup = flaresGroupRef.current!.children[flareIdx] as THREE.Group;
        if (!flareGroup) return;

        const startPos = flare.startPos;
        const endPos = flare.endPos;
        const tangent = flare.tangent;
        const normal = flare.normal;
        const arcHeight = flare.arcHeight;

        for (let l = 0; l < 5; l++) {
          const tubePoints: THREE.Vector3[] = [];
          const segments = 12; // Optimized segment count for high smooth fps

          const controlPoint = startPos.clone().lerp(endPos, 0.5).add(normal.clone().multiplyScalar(arcHeight));

          for (let j = 0; j <= segments; j++) {
            const s = j / segments;
            const p0 = startPos.clone().lerp(controlPoint, s);
            const p1 = controlPoint.clone().lerp(endPos, s);
            const pos = p0.lerp(p1, s);
            
            const offset = (l - 2) * 0.018;
            const tangentOffset = tangent.clone().multiplyScalar(offset);
            const taper = flare.isUnbound ? (1 - s * 1.3) : (s < 0.5 ? Math.sin(s * Math.PI) : 1);
            const taperedOffset = tangentOffset.multiplyScalar(taper);

            const waveAmplitude = flare.isUnbound ? 0.04 : 0.06;
            const waveFrequency = 3;
            const waveSpeed = 2.5;
            const waveOffset = normal.clone().multiplyScalar(
              Math.sin(s * Math.PI * waveFrequency + elapsed * waveSpeed + flare.phases[l]) * waveAmplitude * (flare.isUnbound ? (1 - s) : 1)
            );

            tubePoints.push(pos.add(taperedOffset).add(waveOffset));
          }

          const curve = new THREE.CatmullRomCurve3(tubePoints);
          const extrudeSettings = {
            steps: 12,
            bevelEnabled: false,
            extrudePath: curve
          };

          const tube = flareGroup.children[l] as THREE.Mesh;
          if (tube) {
            tube.geometry.dispose();
            tube.geometry = new THREE.ExtrudeGeometry(triangularShape, extrudeSettings);
            const mat = tube.material as THREE.MeshBasicMaterial;
            mat.opacity = fade * 0.09 * uIntensityVal;
          }
        }
      });
    }
  });

  // Safe disposes of flare geometries when component unmounts
  useEffect(() => {
    return () => {
      if (flaresGroupRef.current) {
        flaresGroupRef.current.children.forEach(flareGroup => {
          flareGroup.children.forEach(mesh => {
            const m = mesh as THREE.Mesh;
            m.geometry.dispose();
            if (Array.isArray(m.material)) {
              m.material.forEach(mat => mat.dispose());
            } else {
              m.material.dispose();
            }
          });
        });
      }
    };
  }, []);

  return (
    <group position={position} ref={sunGroupRef}>
      {/* 1. Main Sun Mesh with Noise Shader */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <shaderMaterial
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
          uniforms={uniforms}
          transparent={false}
          toneMapped={false}
        />
      </mesh>

      {/* 2. Gaseous Cloud Layers */}
      {gaseousLayerConfigs.map((config, idx) => (
        <mesh ref={gaseousLayerRefs[idx]} key={`gaseous-${idx}`}>
          <sphereGeometry args={[config.radius, 48, 48]} />
          <shaderMaterial
            vertexShader={gaseousVertexShader}
            fragmentShader={gaseousFragmentShader}
            uniforms={{
              uTime: uniforms.uTime,
              uColor: { value: config.color },
              uSpeed: { value: config.speed },
              uOpacity: { value: config.opacity },
              uCloudScale: { value: config.cloudScale },
              uCloudSharpness: { value: config.cloudSharpness },
              uLayerThickness: { value: config.layerThickness },
              uIntensity: uniforms.uIntensity,
            }}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* 3. Glowing Atmosphere Layers (Yellow, Orange, Red) */}
      {/* Inner Glow Layer */}
      <mesh scale={1.0}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={{
            uGlowColor: { value: starColors.color1 },
            uGlowIntensity: { value: 1.5 },
            uIntensity: uniforms.uIntensity,
          }}
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Mid Glow Layer */}
      <mesh scale={1.1}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={{
            uGlowColor: { value: starColors.color2 },
            uGlowIntensity: { value: 2.0 },
            uIntensity: uniforms.uIntensity,
          }}
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Glow Layer */}
      <mesh scale={1.16}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={{
            uGlowColor: { value: starColors.color3 },
            uGlowIntensity: { value: 2.2 },
            uIntensity: uniforms.uIntensity,
          }}
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Solar Flares Tube Group */}
      <group ref={flaresGroupRef}>
        {flaresData.map((flare, fIdx) => (
          <group key={`flare-${fIdx}`}>
            {Array.from({ length: 5 }).map((_, lIdx) => (
              <mesh key={`tube-${fIdx}-${lIdx}`}>
                <sphereGeometry args={[0.001, 2, 2]} /> {/* Temporary geometry before extrusions on first frame */}
                <meshBasicMaterial
                  color={shades[lIdx]}
                  transparent
                  opacity={0.0}
                  side={THREE.DoubleSide}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* 5. Lights */}
      <pointLight
        ref={lightRef}
        color={isSol ? '#FFF8E8' : color}
        intensity={isSol ? 450 : 70}
        distance={isSol ? 0 : 450}
        decay={isSol ? 2 : 1.2}
        castShadow={false}
      />
      <ambientLight intensity={0.2} color="#6b7280" />
      <hemisphereLight color="#ffffff" groundColor="#1a1a2e" intensity={0.12} />
    </group>
  );
}
