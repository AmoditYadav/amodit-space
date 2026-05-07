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

  // Device
  isMobile: boolean;
  setIsMobile: (v: boolean) => void;

  // Audio
  audioEnabled: boolean;
  setAudioEnabled: (v: boolean) => void;
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

  isMobile: false,
  setIsMobile: (v) => set({ isMobile: v }),

  audioEnabled: false,
  setAudioEnabled: (v) => set({ audioEnabled: v }),
}));
