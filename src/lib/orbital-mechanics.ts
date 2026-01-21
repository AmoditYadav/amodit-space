// Keplerian orbital mechanics utilities
// Deterministic, no physics engine - pure math

export interface OrbitalElements {
    semiMajorAxis: number;      // Distance from sun (AU-like units)
    eccentricity: number;       // 0 = circle, 0.1 = slight ellipse
    inclination: number;        // Orbital tilt in radians
    longitudeOfAscendingNode: number; // Rotation of orbital plane
    argumentOfPeriapsis: number;      // Where closest approach is
    meanAnomalyAtEpoch: number;       // Starting position
    orbitalPeriod: number;            // Time for one orbit (seconds)
}

export interface PlanetConfig {
    id: string;
    name: string;
    route: string;
    color: string;
    secondaryColor?: string;   // For surface variation
    emissive?: string;
    size: number;
    hasAtmosphere?: boolean;   // Only for Earth-like
    atmosphereColor?: string;
    orbital: OrbitalElements;
    rotationSpeed: number;
}

// Planet configurations - improved for visibility and realism
export const PLANETS: PlanetConfig[] = [
    {
        id: 'about',
        name: 'About',
        route: '/about',
        color: '#5B8FD4',        // Earth-like blue
        secondaryColor: '#4A7BAB',
        emissive: '#1a3a5c',
        size: 0.55,              // Increased for mobile
        hasAtmosphere: true,     // Earth gets atmosphere glow
        atmosphereColor: '#88CCFF',
        orbital: {
            semiMajorAxis: 4.5,
            eccentricity: 0.02,
            inclination: Math.PI / 90,
            longitudeOfAscendingNode: 0,
            argumentOfPeriapsis: 0,
            meanAnomalyAtEpoch: 0,
            orbitalPeriod: 80,     // Slower for readability
        },
        rotationSpeed: 0.003,
    },
    {
        id: 'projects',
        name: 'Projects',
        route: '/projects',
        color: '#C26B4A',        // Mars-like rust
        secondaryColor: '#8B4332',
        emissive: '#3d1a10',
        size: 0.48,
        hasAtmosphere: false,
        orbital: {
            semiMajorAxis: 7,
            eccentricity: 0.04,
            inclination: -Math.PI / 60,
            longitudeOfAscendingNode: Math.PI / 4,
            argumentOfPeriapsis: Math.PI / 6,
            meanAnomalyAtEpoch: Math.PI / 3,
            orbitalPeriod: 120,
        },
        rotationSpeed: 0.0025,
    },
    {
        id: 'blog',
        name: 'Blog',
        route: '/blog',
        color: '#C9A86C',        // Saturn-like golden tan
        secondaryColor: '#A68B55',
        emissive: '#3a3020',
        size: 0.65,              // Largest planet
        hasAtmosphere: false,
        orbital: {
            semiMajorAxis: 10,
            eccentricity: 0.03,
            inclination: Math.PI / 45,
            longitudeOfAscendingNode: Math.PI / 2,
            argumentOfPeriapsis: Math.PI / 3,
            meanAnomalyAtEpoch: Math.PI * 0.7,
            orbitalPeriod: 160,
        },
        rotationSpeed: 0.004,
    },
    {
        id: 'contact',
        name: 'Contact',
        route: '/contact',
        color: '#6B8FAF',        // Neptune-like muted blue
        secondaryColor: '#5A7A95',
        emissive: '#1a2a3c',
        size: 0.45,
        hasAtmosphere: false,
        orbital: {
            semiMajorAxis: 13,
            eccentricity: 0.01,
            inclination: -Math.PI / 72,
            longitudeOfAscendingNode: Math.PI,
            argumentOfPeriapsis: Math.PI / 2,
            meanAnomalyAtEpoch: Math.PI * 1.5,
            orbitalPeriod: 200,
        },
        rotationSpeed: 0.003,
    },
];

/**
 * Solve Kepler's equation iteratively to find eccentric anomaly
 * M = E - e*sin(E)
 */
function solveKeplerEquation(meanAnomaly: number, eccentricity: number, tolerance = 1e-6): number {
    let E = meanAnomaly;

    for (let i = 0; i < 100; i++) {
        const deltaE = (meanAnomaly - E + eccentricity * Math.sin(E)) / (1 - eccentricity * Math.cos(E));
        E += deltaE;
        if (Math.abs(deltaE) < tolerance) break;
    }

    return E;
}

/**
 * Calculate true anomaly from eccentric anomaly
 */
function eccentricToTrueAnomaly(eccentricAnomaly: number, eccentricity: number): number {
    const cosE = Math.cos(eccentricAnomaly);
    const sinE = Math.sin(eccentricAnomaly);
    const cosTrueAnomaly = (cosE - eccentricity) / (1 - eccentricity * cosE);
    const sinTrueAnomaly = (Math.sqrt(1 - eccentricity * eccentricity) * sinE) / (1 - eccentricity * cosE);
    return Math.atan2(sinTrueAnomaly, cosTrueAnomaly);
}

/**
 * Calculate orbital radius at given true anomaly
 */
function calculateOrbitalRadius(semiMajorAxis: number, eccentricity: number, trueAnomaly: number): number {
    return (semiMajorAxis * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(trueAnomaly));
}

/**
 * Get 3D position on orbital plane, then rotate by orbital elements
 */
export function calculateOrbitalPosition(
    orbital: OrbitalElements,
    time: number
): [number, number, number] {
    const meanAnomaly = orbital.meanAnomalyAtEpoch + (2 * Math.PI * time) / orbital.orbitalPeriod;
    const eccentricAnomaly = solveKeplerEquation(meanAnomaly, orbital.eccentricity);
    const trueAnomaly = eccentricToTrueAnomaly(eccentricAnomaly, orbital.eccentricity);
    const r = calculateOrbitalRadius(orbital.semiMajorAxis, orbital.eccentricity, trueAnomaly);

    const xOrbital = r * Math.cos(trueAnomaly + orbital.argumentOfPeriapsis);
    const yOrbital = r * Math.sin(trueAnomaly + orbital.argumentOfPeriapsis);

    const i = orbital.inclination;
    const yInclined = yOrbital * Math.cos(i);
    const zInclined = yOrbital * Math.sin(i);

    const omega = orbital.longitudeOfAscendingNode;
    const xFinal = xOrbital * Math.cos(omega) - yInclined * Math.sin(omega);
    const yFinal = xOrbital * Math.sin(omega) + yInclined * Math.cos(omega);
    const zFinal = zInclined;

    return [xFinal, zFinal, yFinal];
}

/**
 * Calculate orbital velocity (for Kepler's 2nd law)
 */
export function calculateOrbitalVelocity(
    orbital: OrbitalElements,
    time: number
): number {
    const meanAnomaly = orbital.meanAnomalyAtEpoch + (2 * Math.PI * time) / orbital.orbitalPeriod;
    const eccentricAnomaly = solveKeplerEquation(meanAnomaly, orbital.eccentricity);
    const trueAnomaly = eccentricToTrueAnomaly(eccentricAnomaly, orbital.eccentricity);
    const r = calculateOrbitalRadius(orbital.semiMajorAxis, orbital.eccentricity, trueAnomaly);
    return orbital.semiMajorAxis / r;
}

/**
 * Generate points for drawing an orbit path
 */
export function generateOrbitPath(orbital: OrbitalElements, segments = 128): [number, number, number][] {
    const points: [number, number, number][] = [];
    for (let i = 0; i <= segments; i++) {
        const time = (i / segments) * orbital.orbitalPeriod;
        points.push(calculateOrbitalPosition(orbital, time));
    }
    return points;
}
