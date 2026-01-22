import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user prefers reduced motion or is on a low-end device.
 * Used to disable expensive animations/WebGL.
 */
export function useReducedMotion() {
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        // 1. Check prefers-reduced-motion media query
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        // 2. Check for low-end device signals
        const isLowEnd = () => {
            // Very crude heuristic
            if (typeof navigator !== 'undefined') {
                const hardwareConcurrency = navigator.hardwareConcurrency || 4;
                // @ts-ignore
                const deviceMemory = navigator.deviceMemory || 8;

                // If < 4 cores or < 4GB RAM, treat as low-end
                if (hardwareConcurrency < 4 || deviceMemory < 4) {
                    return true;
                }
            }
            return false;
        };

        const updateMotionPreference = () => {
            setReducedMotion(mediaQuery.matches || isLowEnd());
        };

        // Initial check
        updateMotionPreference();

        // Listen for changes
        mediaQuery.addEventListener('change', updateMotionPreference);

        return () => {
            mediaQuery.removeEventListener('change', updateMotionPreference);
        };
    }, []);

    return reducedMotion;
}
