'use client';

import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useEffect, useState } from 'react';

export function GoHomeButton() {
  const inGalaxyView = usePortfolioStore((s) => s.inGalaxyView);
  const focusedSystem = usePortfolioStore((s) => s.focusedSystem);
  const introComplete = usePortfolioStore((s) => s.introComplete);
  const setZoomTarget = usePortfolioStore((s) => s.setZoomTarget);
  const audioEnabled = usePortfolioStore((s) => s.audioEnabled);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !introComplete) return null;

  const isVisible = inGalaxyView || focusedSystem !== null;

  const handleClick = () => {
    // Play the premium zoom transition sound
    if (audioEnabled) {
      const zoomSound = new Audio('/Sounds/Zooming_in.mp3');
      zoomSound.volume = 0.45;
      zoomSound.play().catch(() => {});
    }

    // Set camera target coordinates to the home solar system (Sol)
    setZoomTarget({
      position: [0, 0, 0],
      route: '/',
    });

    // Reset focused star system to unmount procedural systems
    usePortfolioStore.getState().setFocusedSystem(null);
  };

  return (
    <div
      className={`fixed right-6 bottom-[88px] z-40 transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
      style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      <button
        onClick={handleClick}
        className="group relative flex items-center gap-2.5 px-4.5 py-2.5 rounded-full overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }}
        title="Return to Home Solar System"
      >
        {/* Futuristic glowing backdrop hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Animated border glow element */}
        <div className="absolute -inset-px rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

        {/* Dynamic Compass / Home Icon */}
        <svg
          className="w-4 h-4 text-white/50 group-hover:text-cyan-400 group-hover:rotate-12 transition-all duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>

        {/* Text with letter-spacing tracking-wider */}
        <span className="text-[11px] font-medium tracking-[0.2em] text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300 uppercase">
          Go Home
        </span>

        {/* Corner Telemetry lines for sci-fi look */}
        <span className="absolute top-1 left-2 w-1 h-[2px] bg-white/20 rounded-full" />
        <span className="absolute bottom-1 right-2 w-1 h-[2px] bg-white/20 rounded-full" />
      </button>
    </div>
  );
}
