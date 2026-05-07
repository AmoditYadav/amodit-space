// ─── Design System Constants ─────────────────────────────────────────────────

export const COLORS = {
  // Background
  void: '#000000',
  deepSpace: '#030308',

  // Sun
  sunCore: '#FFF4E0',
  sunMid: '#FFAA33',
  sunEdge: '#FF6600',
  sunGlow: '#FF8800',

  // Planets
  earthBlue: '#4A8BC2',
  marsRust: '#C26B4A',
  saturnGold: '#C9A86C',
  neptuneIce: '#5A7FA0',

  // UI
  glassBackground: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassBackgroundHover: 'rgba(255, 255, 255, 0.08)',
  textPrimary: 'rgba(255, 255, 255, 0.9)',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textTertiary: 'rgba(255, 255, 255, 0.35)',
  accentBlue: '#6B9FD4',
};

// Camera positions for overview + each section
export const CAMERA_POSITIONS = {
  intro: { position: [0, 2, 60] as const, lookAt: [0, 0, 0] as const },
  overview: { position: [18, 8, 18] as const, lookAt: [0, 0, 0] as const },
  overviewMobile: { position: [22, 10, 22] as const, lookAt: [0, 0, 0] as const },
};

// Animation timing
export const TIMING = {
  introTotal: 3500,     // ms
  introStarFade: 800,
  introSunIgnite: 1200,
  introPlanetReveal: 2000,
  introTitleFade: 2800,
  cameraFlyDuration: 2.0,  // seconds (GSAP)
  cameraReturnDuration: 1.5,
  planetHoverScale: 1.12,
  planetClickDelay: 800, // ms before navigation after click
};

// Performance tiers
export const PERF = {
  desktop: {
    starCount: [4000, 2000, 500],  // far, mid, near
    nebulaEnabled: true,
    postProcessing: true,
    antialias: true,
    shadowMap: false,
  },
  mobile: {
    starCount: [2000, 800, 100],
    nebulaEnabled: false,
    postProcessing: false,
    antialias: false,
    shadowMap: false,
  },
};
