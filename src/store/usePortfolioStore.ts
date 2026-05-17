import { create } from 'zustand';

interface PortfolioState {
  // Intro
  introComplete: boolean;
  setIntroComplete: (v: boolean) => void;

  // Planet focus
  activePlanet: string | null;
  setActivePlanet: (id: string | null) => void;

  hoveredPlanet: string | null;
  setHoveredPlanet: (id: string | null) => void;

  // Camera
  cameraMode: 'orbit' | 'flyTo' | 'section';
  setCameraMode: (mode: 'orbit' | 'flyTo' | 'section') => void;

  // Planet zoom target (for click-to-zoom)
  zoomTarget: { position: [number, number, number]; route: string } | null;
  setZoomTarget: (target: { position: [number, number, number]; route: string } | null) => void;

  // Device
  isMobile: boolean;
  setIsMobile: (v: boolean) => void;

  // Audio
  audioEnabled: boolean;
  setAudioEnabled: (v: boolean) => void;

  // Sandbox controls
  sunBrightness: number;       // 0–1, default 0.5
  setSunBrightness: (v: number) => void;
  orbitSpeedMultiplier: number; // 0.1–3, default 1
  setOrbitSpeedMultiplier: (v: number) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  introComplete: false,
  setIntroComplete: (v) => set({ introComplete: v }),

  activePlanet: null,
  setActivePlanet: (id) => set({ activePlanet: id }),

  hoveredPlanet: null,
  setHoveredPlanet: (id) => set({ hoveredPlanet: id }),

  cameraMode: 'orbit',
  setCameraMode: (mode) => set({ cameraMode: mode }),

  zoomTarget: null,
  setZoomTarget: (target) => set({ zoomTarget: target }),

  isMobile: false,
  setIsMobile: (v) => set({ isMobile: v }),

  audioEnabled: false,
  setAudioEnabled: (v) => set({ audioEnabled: v }),

  sunBrightness: 0.5,
  setSunBrightness: (v) => set({ sunBrightness: v }),

  orbitSpeedMultiplier: 1,
  setOrbitSpeedMultiplier: (v) => set({ orbitSpeedMultiplier: v }),
}));
