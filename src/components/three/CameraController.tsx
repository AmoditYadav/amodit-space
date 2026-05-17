'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { usePortfolioStore } from '@/store/usePortfolioStore';

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

  // Zoom animation state
  const zoomStartPos = useRef(new THREE.Vector3());
  const zoomEndPos = useRef(new THREE.Vector3());
  const zoomStartTime = useRef(0);
  const zoomDuration = 1.2; // seconds
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
      // Calculate a position close to the planet (offset slightly toward camera)
      const planetPos = new THREE.Vector3(...zoomTarget.position);
      const dirToCamera = new THREE.Vector3().subVectors(camera.position, planetPos).normalize();
      // Stop about 2.5 units from the planet center
      zoomEndPos.current.copy(planetPos).add(dirToCamera.multiplyScalar(2.5));
      zoomStartTime.current = 0; // will be set on first frame
      isZooming.current = true;
      zoomRoute.current = zoomTarget.route;

      // Disable orbit controls during zoom
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    }
  }, [zoomTarget, camera]);

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

      // Look at the planet during zoom
      if (zoomTarget) {
        camera.lookAt(...zoomTarget.position);
      }

      // When zoom is complete, navigate
      if (t >= 1) {
        isZooming.current = false;
        const route = zoomRoute.current;
        setZoomTarget(null);
        router.push(route);
      }
      return; // skip normal updates during zoom
    }

    if (controlsRef.current) {
      controlsRef.current.update();
    }

    // Cinematic breathing — subtle sinusoidal drift
    if (introComplete) {
      const t = state.clock.elapsedTime;
      const breathX = Math.sin(t * 0.15) * 0.08;
      const breathY = Math.cos(t * 0.12) * 0.05;

      if (controlsRef.current) {
        controlsRef.current.target.x = breathX;
        controlsRef.current.target.y = breathY;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      autoRotate={introComplete}
      autoRotateSpeed={isMobile ? 0.12 : 0.2}
      minDistance={8}
      maxDistance={45}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2 + 0.3}
      dampingFactor={isMobile ? 0.06 : 0.04}
      enableDamping={true}
      rotateSpeed={isMobile ? 0.4 : 0.5}
      zoomSpeed={0.6}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}
