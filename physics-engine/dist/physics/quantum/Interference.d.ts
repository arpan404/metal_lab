/**
 * Wave interference calculations for double slit experiment
 */
export declare class Interference {
    /**
     * Calculate interference pattern intensity
     * I = I₀·cos²(πd·sin(θ)/λ)
     */
    static intensity(angle: number, wavelength: number, slitSeparation: number, maxIntensity?: number): number;
    /**
     * Calculate position of bright fringes
     * y = nλL/d
     */
    static brightFringePosition(order: number, wavelength: number, slitSeparation: number, screenDistance: number): number;
    /**
     * Calculate position of dark fringes
     * y = (n + 0.5)λL/d
     */
    static darkFringePosition(order: number, wavelength: number, slitSeparation: number, screenDistance: number): number;
    /**
     * Calculate fringe spacing
     * Δy = λL/d
     */
    static fringeSpacing(wavelength: number, slitSeparation: number, screenDistance: number): number;
    /**
     * Calculate path difference
     * Δ = d·sin(θ)
     */
    static pathDifference(angle: number, slitSeparation: number): number;
    /**
     * Calculate phase difference
     * Δφ = 2πΔ/λ
     */
    static phaseDifference(pathDifference: number, wavelength: number): number;
    /**
     * Check if constructive interference occurs
     * Δ = nλ
     */
    static isConstructive(pathDifference: number, wavelength: number, tolerance?: number): boolean;
    /**
     * Check if destructive interference occurs
     * Δ = (n + 0.5)λ
     */
    static isDestructive(pathDifference: number, wavelength: number, tolerance?: number): boolean;
    /**
     * Calculate angular position of fringe
     */
    static fringeAngle(order: number, wavelength: number, slitSeparation: number): number;
    /**
     * Calculate number of visible fringes
     */
    static numberOfFringes(wavelength: number, slitSeparation: number, screenWidth: number, screenDistance: number): number;
    /**
     * Calculate visibility (contrast) of fringes
     * V = (I_max - I_min)/(I_max + I_min)
     */
    static visibility(intensityMax: number, intensityMin: number): number;
    /**
     * Diffraction envelope for finite slit width
     * Single slit diffraction pattern: sinc²(πa·sin(θ)/λ)
     */
    static diffractionEnvelope(angle: number, wavelength: number, slitWidth: number): number;
    /**
     * Combined interference and diffraction pattern
     */
    static combinedPattern(angle: number, wavelength: number, slitSeparation: number, slitWidth: number, maxIntensity?: number): number;
    /**
     * Calculate coherence length
     * L_c = λ²/Δλ
     */
    static coherenceLength(wavelength: number, spectralWidth: number): number;
}
//# sourceMappingURL=Interference.d.ts.map