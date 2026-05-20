'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { GALAXY_SYSTEMS } from './GalaxyCluster';

interface CameraControllerProps {
  isMobile?: boolean;
}

export function CameraController({ isMobile = false }: CameraControllerProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const router = useRouter();
  const introComplete = usePortfolioStore((s) => s.introComplete);
  const zoomTarget = usePortfolioStore((s) => s.zoomTarget);
  const setZoomTarget = usePortfolioStore((s) => s.setZoomTarget);
  const audioEnabled = usePortfolioStore((s) => s.audioEnabled);

  // Zoom animation state
  const zoomStartPos = useRef(new THREE.Vector3());
  const zoomEndPos = useRef(new THREE.Vector3());
  const zoomStartTarget = useRef(new THREE.Vector3());
  const zoomEndTarget = useRef(new THREE.Vector3());
  const zoomStartTime = useRef(0);
  const zoomDuration = 1.5; // Slightly longer for majestic galactic sweep
  const isZooming = useRef(false);
  const zoomRoute = useRef('');

  // Set initial camera position
  useEffect(() => {
    if (!introComplete) {
      camera.position.set(0, 3, 55);
      camera.lookAt(0, 0, 0);
    } else {
      const distance = isMobile ? 22 : 18;
      const height = isMobile ? 10 : 8;
      camera.position.set(distance, height, distance);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, isMobile, introComplete]);

  // When zoomTarget changes, start the zoom animation
  useEffect(() => {
    if (zoomTarget) {
      zoomStartPos.current.copy(camera.position);
      const planetPos = new THREE.Vector3(...zoomTarget.position);
      const dirToCamera = new THREE.Vector3().subVectors(camera.position, planetPos).normalize();
      
      // Determine camera stop distance
      // 120.0 for other stars, 18.0 for Sol itself, 2.5 for planets of Sol
      let stopDistance = 2.5;
      if (planetPos.length() > 20.0) {
        stopDistance = 120.0;
      } else if (planetPos.length() < 0.1) {
        stopDistance = isMobile ? 22.0 : 18.0;
      }

      zoomEndPos.current.copy(planetPos).add(dirToCamera.multiplyScalar(stopDistance));
      
      // Interpolate the controls target as well
      if (controlsRef.current) {
        zoomStartTarget.current.copy(controlsRef.current.target);
      } else {
        zoomStartTarget.current.set(0, 0, 0);
      }
      zoomEndTarget.current.copy(planetPos);

      zoomStartTime.current = 0; // will be set on first frame
      isZooming.current = true;
      zoomRoute.current = zoomTarget.route;

      // Disable orbit controls during zoom
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    }
  }, [zoomTarget, camera, isMobile]);

  useFrame((state) => {
    // Handle zoom animation
    if (isZooming.current) {
      if (zoomStartTime.current === 0) {
        zoomStartTime.current = state.clock.elapsedTime;
      }

      const elapsed = state.clock.elapsedTime - zoomStartTime.current;
      const t = Math.min(1, elapsed / zoomDuration);
      // Ease-in-out cubic
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      camera.position.lerpVectors(zoomStartPos.current, zoomEndPos.current, eased);

      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(zoomStartTarget.current, zoomEndTarget.current, eased);
      }
      camera.lookAt(controlsRef.current ? controlsRef.current.target : zoomEndTarget.current);

      // When zoom is complete, navigate or re-enable
      if (t >= 1) {
        isZooming.current = false;
        const route = zoomRoute.current;
        setZoomTarget(null);
        
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }

        // Determine focused star system
        const targetPos = zoomEndTarget.current;
        const found = GALAXY_SYSTEMS.find((s) => {
          const sysPos = new THREE.Vector3(s.x * 15.0, s.y * 15.0, s.z * 15.0);
          return sysPos.distanceTo(targetPos) < 1.0;
        });
        if (found) {
          usePortfolioStore.getState().setFocusedSystem(found.name);
        } else {
          usePortfolioStore.getState().setFocusedSystem(null);
        }

        if (route && route !== '/') {
          router.push(route);
        }
      }
      return; // skip normal updates during zoom
    }

    if (controlsRef.current) {
      controlsRef.current.update();
    }

    // Track galaxy view state and manually focused system
    const dist = camera.position.length();
    const nextInGalaxy = dist > 100;
    if (nextInGalaxy !== usePortfolioStore.getState().inGalaxyView) {
      usePortfolioStore.getState().setInGalaxyView(nextInGalaxy);
    }

    const focusedSystem = usePortfolioStore.getState().focusedSystem;
    if (focusedSystem) {
      const sys = GALAXY_SYSTEMS.find((s) => s.name === focusedSystem);
      if (sys) {
        const sysPos = new THREE.Vector3(sys.x * 15.0, sys.y * 15.0, sys.z * 15.0);
        const distToSys = camera.position.distanceTo(sysPos);
        if (distToSys > 300) {
          usePortfolioStore.getState().setFocusedSystem(null);
        }
      }
    }

    // Cinematic breathing — subtle sinusoidal drift (disabled when far out in galaxy)
    if (introComplete && camera.position.length() < 100) {
      const t = state.clock.elapsedTime;
      const breathX = Math.sin(t * 0.15) * 0.08;
      const breathY = Math.cos(t * 0.12) * 0.05;

      if (controlsRef.current) {
        controlsRef.current.target.x = breathX;
        controlsRef.current.target.y = breathY;
      }
    }
  });

  // Open-world camera: free panning, full 360° rotation, dynamic zoom limits
  const cameraDist = camera.position.length();
  const dynamicMinDist = cameraDist < 50 ? 1.0 : 8;

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      autoRotate={introComplete && !isZooming.current}
      autoRotateSpeed={cameraDist > 100 ? 0.05 : (isMobile ? 0.12 : 0.2)}
      minDistance={dynamicMinDist}
      maxDistance={12000}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      dampingFactor={isMobile ? 0.06 : 0.04}
      enableDamping={true}
      rotateSpeed={isMobile ? 0.4 : 0.5}
      zoomSpeed={0.8}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}
