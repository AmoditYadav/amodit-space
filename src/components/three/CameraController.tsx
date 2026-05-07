'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { usePortfolioStore } from '@/store/usePortfolioStore';

interface CameraControllerProps {
  isMobile?: boolean;
}

export function CameraController({ isMobile = false }: CameraControllerProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const introComplete = usePortfolioStore((s) => s.introComplete);

  // Set initial camera position
  useEffect(() => {
    // Start far away for intro, then animate in
    if (!introComplete) {
      camera.position.set(0, 2, 55);
      camera.lookAt(0, 0, 0);
    } else {
      const distance = isMobile ? 22 : 18;
      const height = isMobile ? 10 : 8;
      camera.position.set(distance, height, distance);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, isMobile, introComplete]);

  // Subtle camera breathing when idle
  useFrame((state) => {
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
