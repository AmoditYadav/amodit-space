'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '@/styles/loading.module.css'; // Reused for container transition
import { RocketLoader } from '@/components/RocketLoader';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function LoadingScreen({ minDuration = 2500 }: { minDuration?: number }) {
    const [visible, setVisible] = useState(true);
    const [fading, setFading] = useState(false);

    // Reduced motion check (RocketLoader handles its own internal reduced motion via CSS, 
    // but we can pass it down if we want explicit control, though CSS is sufficient per request)
    useReducedMotion(); // Just running the hook to init listeners if needed, but CSS handles it.

    const hide = useCallback(() => {
        setFading(true);
        setTimeout(() => {
            setVisible(false);
        }, 350); // Matches CSS opacity transition
    }, []);

    useEffect(() => {
        const minTime = Date.now() + minDuration;

        // Ensure we wait for both window load AND min duration
        const onComplete = () => {
            const remaining = Math.max(0, minTime - Date.now());
            setTimeout(hide, remaining);
        };

        if (document.readyState === 'complete') {
            onComplete();
        } else {
            window.addEventListener('load', onComplete, { once: true });
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') hide();
        };
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('load', onComplete);
        };
    }, [hide, minDuration]);

    if (!visible) return null;

    return (
        <div
            className={`${styles.loaderContainer} ${fading ? styles.hidden : ''}`}
            role="presentation" // The inner text has role="status"
        >
            <RocketLoader />
        </div>
    );
}
