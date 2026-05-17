'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolioStore } from '@/store/usePortfolioStore';

/**
 * Cinematic intro sequence — two-phase animation:
 * Phase 1: Camera starts far away and sweeps toward the sun (dramatic approach)
 * Phase 2: Camera pulls back to the orbital overview position
 *
 * Works on both desktop and mobile with adjusted positions.
 */
export function CinematicIntro() {
  const { camera } = useThree();
  const setIntroComplete = usePortfolioStore((s) => s.setIntroComplete);
  const introComplete = usePortfolioStore((s) => s.introComplete);
  const isMobile = usePortfolioStore((s) => s.isMobile);

  const startTime = useRef(0);
  const hasStarted = useRef(false);

  // Three keyframes: start → close to sun → final overview
  const startPos = useRef(new THREE.Vector3(0, 3, 55));
  const midPos = useRef(new THREE.Vector3(5, 2, 8));     // close fly-by of the sun
  const endPos = useRef(new THREE.Vector3(18, 8, 18));

  useEffect(() => {
    if (isMobile) {
      startPos.current.set(0, 4, 50);
      midPos.current.set(4, 2.5, 10);     // still get the sun fly-by on mobile
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
    const totalDuration = 4.0; // total seconds
    const midPoint = 0.45;     // 45% of time: approach sun, 55%: pull back

    if (elapsed >= totalDuration) {
      camera.position.copy(endPos.current);
      camera.lookAt(0, 0, 0);
      setIntroComplete(true);
      return;
    }

    const t = elapsed / totalDuration;

    if (t <= midPoint) {
      // Phase 1: sweep toward the sun
      const phase1 = t / midPoint;
      const eased = 1 - Math.pow(1 - phase1, 3); // ease-out
      camera.position.lerpVectors(startPos.current, midPos.current, eased);

      // Look slightly above the sun for dramatic framing
      const lookY = (1 - eased) * 2;
      camera.lookAt(0, lookY, 0);
    } else {
      // Phase 2: pull back to overview
      const phase2 = (t - midPoint) / (1 - midPoint);
      const eased = phase2 < 0.5
        ? 4 * phase2 * phase2 * phase2
        : 1 - Math.pow(-2 * phase2 + 2, 3) / 2; // ease-in-out
      camera.position.lerpVectors(midPos.current, endPos.current, eased);

      // Smooth look target transition
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}
