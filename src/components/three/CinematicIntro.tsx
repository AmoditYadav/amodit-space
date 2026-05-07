'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolioStore } from '@/store/usePortfolioStore';

/**
 * Cinematic intro sequence — animates camera from far → overview,
 * then sets introComplete in the store.
 *
 * The intro uses manual camera interpolation (no GSAP dependency in the 3D scene)
 * to keep it lightweight. The effect runs for ~3.5 seconds.
 */
export function CinematicIntro() {
  const { camera } = useThree();
  const setIntroComplete = usePortfolioStore((s) => s.setIntroComplete);
  const introComplete = usePortfolioStore((s) => s.introComplete);
  const isMobile = usePortfolioStore((s) => s.isMobile);

  const startTime = useRef(0);
  const hasStarted = useRef(false);

  // Intro positions
  const startPos = useRef(new THREE.Vector3(0, 2, 55));
  const endPos = useRef(new THREE.Vector3(18, 8, 18));

  useEffect(() => {
    if (isMobile) {
      endPos.current.set(22, 10, 22);
    }
  }, [isMobile]);

  useFrame((state) => {
    if (introComplete) return;

    if (!hasStarted.current) {
      hasStarted.current = true;
      startTime.current = state.clock.elapsedTime;
      camera.position.copy(startPos.current);
    }

    const elapsed = state.clock.elapsedTime - startTime.current;
    const duration = 3.5; // seconds

    if (elapsed >= duration) {
      camera.position.copy(endPos.current);
      camera.lookAt(0, 0, 0);
      setIntroComplete(true);
      return;
    }

    // Smooth easing (ease-in-out cubic)
    let t = elapsed / duration;
    t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Interpolate position
    camera.position.lerpVectors(startPos.current, endPos.current, t);

    // Look at origin with slight vertical offset during intro
    const lookOffset = (1 - t) * 1.5;
    camera.lookAt(0, lookOffset, 0);
  });

  return null;
}
