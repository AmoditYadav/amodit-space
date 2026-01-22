'use client';

import styles from '@/styles/rocket-loader.module.css';

export function RocketLoader() {
    return (
        <div className={styles.container}>
            {/* Background Stars (Pure CSS) */}
            <div className={styles.stars} aria-hidden="true" />

            {/* Rocket Group */}
            <div className={styles.rocketWrapper}>
                {/* Simple Rocket SVG */}
                <svg
                    viewBox="0 0 24 24"
                    className={styles.rocketSvg}
                    aria-hidden="true"
                >
                    {/* Simple rocket body shape */}
                    <path d="M12 2.5c0 0-4.5 5-4.5 11 0 2.5 1 4.5 4.5 4.5s4.5-2 4.5-4.5c0-6-4.5-11-4.5-11z" />
                    {/* Fins */}
                    <path d="M7.5 13.5L5 18l3-1M16.5 13.5L19 18l-3-1" stroke="currentColor" strokeWidth="0" fill="#cccccc" />
                    {/* Window */}
                    <circle cx="12" cy="11" r="1.5" fill="#333" fillOpacity="0.2" />
                </svg>

                {/* Engine Flame */}
                <div className={styles.flame} />

                {/* Smoke Trail */}
                <div className={styles.smoke} />
            </div>

            {/* Loading Text */}
            <div className={styles.statusText} role="status" aria-live="polite">
                Initialising...
            </div>
        </div>
    );
}
