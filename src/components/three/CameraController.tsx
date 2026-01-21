'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CameraControllerProps {
    prefersReducedMotion?: boolean;
    autoRotate?: boolean;
    enableZoom?: boolean;
    minDistance?: number;
    maxDistance?: number;
    isMobile?: boolean;
}

export function CameraController({
    prefersReducedMotion = false,
    autoRotate = true,
    enableZoom = true,
    minDistance = 10,
    maxDistance = 40,
    isMobile = false,
}: CameraControllerProps) {
    const controlsRef = useRef<any>(null);
    const { camera } = useThree();

    // Set initial camera position - adjusted for new planet spacing
    useEffect(() => {
        const distance = isMobile ? 22 : 18;
        const height = isMobile ? 10 : 8;
        camera.position.set(distance, height, distance);
        camera.lookAt(0, 0, 0);
    }, [camera, isMobile]);

    // Smooth damping
    useFrame(() => {
        if (controlsRef.current) {
            controlsRef.current.update();
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={enableZoom}
            enableRotate={true}
            autoRotate={autoRotate && !prefersReducedMotion}
            autoRotateSpeed={isMobile ? 0.15 : 0.25} // Slower on mobile
            minDistance={minDistance}
            maxDistance={maxDistance}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2 + 0.3}
            dampingFactor={isMobile ? 0.08 : 0.05}
            enableDamping={true}
            rotateSpeed={isMobile ? 0.4 : 0.5}
            zoomSpeed={0.7}
            touches={{
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN,
            }}
        />
    );
}
