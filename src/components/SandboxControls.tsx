'use client';

import { useState } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';

/**
 * Universe sandbox controls — minimal glassmorphic panel
 * with sliders for sun brightness and orbit speed.
 * Collapses to a small icon to avoid clutter.
 */
export function SandboxControls() {
  const [isOpen, setIsOpen] = useState(false);
  const introComplete = usePortfolioStore((s) => s.introComplete);
  const sunBrightness = usePortfolioStore((s) => s.sunBrightness);
  const setSunBrightness = usePortfolioStore((s) => s.setSunBrightness);
  const orbitSpeedMultiplier = usePortfolioStore((s) => s.orbitSpeedMultiplier);
  const setOrbitSpeedMultiplier = usePortfolioStore((s) => s.setOrbitSpeedMultiplier);

  if (!introComplete) return null;

  return (
    <div
      className="fixed left-4 bottom-4 sm:left-5 sm:bottom-5 z-40"
      style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: isOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
        }}
        aria-label={isOpen ? 'Close sandbox controls' : 'Open sandbox controls'}
        title="Sandbox Controls"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={`text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
        </svg>
      </button>

      {/* Controls panel */}
      <div
        className={`absolute bottom-12 left-0 w-52 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
        style={{
          background: 'rgba(8, 8, 16, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '14px 16px',
        }}
      >
        <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-3 font-medium">
          Sandbox
        </p>

        {/* Sun Brightness */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] text-white/50">Sun Brightness</label>
            <span className="text-[10px] text-white/30 tabular-nums">
              {Math.round(sunBrightness * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sunBrightness * 100}
            onChange={(e) => setSunBrightness(Number(e.target.value) / 100)}
            className="sandbox-slider"
          />
        </div>

        {/* Orbit Speed */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] text-white/50">Orbit Speed</label>
            <span className="text-[10px] text-white/30 tabular-nums">
              {orbitSpeedMultiplier.toFixed(1)}×
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="300"
            value={orbitSpeedMultiplier * 100}
            onChange={(e) => setOrbitSpeedMultiplier(Number(e.target.value) / 100)}
            className="sandbox-slider"
          />
        </div>
      </div>
    </div>
  );
}
