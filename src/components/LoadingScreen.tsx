'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Cinematic loading screen — minimal fade-from-black with subtle text.
 * Replaces the previous RocketLoader with a more atmospheric intro.
 */
export function LoadingScreen({ minDuration = 3500 }: { minDuration?: number }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const hide = useCallback(() => {
    setFading(true);
    setTimeout(() => setVisible(false), 600);
  }, []);

  useEffect(() => {
    const minTime = Date.now() + minDuration;

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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
      role="presentation"
    >
      {/* Subtle pulsing dot */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.5)',
          marginBottom: 24,
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />

      {/* Status text */}
      <p
        style={{
          fontFamily: "'Space Grotesk', 'Inter', sans-serif",
          fontSize: '0.65rem',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.3)',
          fontWeight: 300,
        }}
        role="status"
        aria-live="polite"
      >
        Initializing
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
