// physics-engine/physics/quantum/Interference.ts
import type { WaveParameters } from '../../types';

/**
 * Wave interference calculations for double slit experiment
 */

export class Interference {
  /**
   * Calculate interference pattern intensity
   * I = I₀·cos²(πd·sin(θ)/λ)
   */
  static intensity(
    angle: number,
    wavelength: number,
    slitSeparation: number,
    maxIntensity: number = 1.0
  ): number {
    const phase = (Math.PI * slitSeparation * Math.sin(angle)) / wavelength;
    return maxIntensity * Math.pow(Math.cos(phase), 2);
  }
  
  /**
   * Calculate position of bright fringes
   * y = nλL/d
   */
  static brightFringePosition(
    order: number,
    wavelength: number,
    slitSeparation: number,
    screenDistance: number
  ): number {
    return (order * wavelength * screenDistance) / slitSeparation;
  }
  
  /**
   * Calculate position of dark fringes
   * y = (n + 0.5)λL/d
   */
  static darkFringePosition(
    order: number,
    wavelength: number,
    slitSeparation: number,
    screenDistance: number
  ): number {
    return ((order + 0.5) * wavelength * screenDistance) / slitSeparation;
  }
  
  /**
   * Calculate fringe spacing
   * Δy = λL/d
   */
  static fringeSpacing(
    wavelength: number,
    slitSeparation: number,
    screenDistance: number
  ): number {
    return (wavelength * screenDistance) / slitSeparation;
  }
  
  /**
   * Calculate path difference
   * Δ = d·sin(θ)
   */
  static pathDifference(angle: number, slitSeparation: number): number {
    return slitSeparation * Math.sin(angle);
  }
  
  /**
   * Calculate phase difference
   * Δφ = 2πΔ/λ
   */
  static phaseDifference(
    pathDifference: number,
    wavelength: number
  ): number {
    return (2 * Math.PI * pathDifference) / wavelength;
  }
  
  /**
   * Check if constructive interference occurs
   * Δ = nλ
   */
  static isConstructive(
    pathDifference: number,
    wavelength: number,
    tolerance: number = 0.1
  ): boolean {
    const ratio = pathDifference / wavelength;
    const nearestInteger = Math.round(ratio);
    return Math.abs(ratio - nearestInteger) < tolerance;
  }
  
  /**
   * Check if destructive interference occurs
   * Δ = (n + 0.5)λ
   */
  static isDestructive(
    pathDifference: number,
    wavelength: number,
    tolerance: number = 0.1
  ): boolean {
    const ratio = pathDifference / wavelength;
    const nearestHalfInteger = Math.round(ratio - 0.5) + 0.5;
    return Math.abs(ratio - nearestHalfInteger) < tolerance;
  }
  
  /**
   * Calculate angular position of fringe
   */
  static fringeAngle(
    order: number,
    wavelength: number,
    slitSeparation: number
  ): number {
    const sinTheta = (order * wavelength) / slitSeparation;
    if (Math.abs(sinTheta) > 1) return NaN; // No solution
    return Math.asin(sinTheta);
  }
  
  /**
   * Calculate number of visible fringes
   */
  static numberOfFringes(
    wavelength: number,
    slitSeparation: number,
    screenWidth: number,
    screenDistance: number
  ): number {
    const maxAngle = Math.atan(screenWidth / (2 * screenDistance));
    const maxOrder = Math.floor((slitSeparation * Math.sin(maxAngle)) / wavelength);
    return 2 * maxOrder + 1; // Both sides + central maximum
  }
  
  /**
   * Calculate visibility (contrast) of fringes
   * V = (I_max - I_min)/(I_max + I_min)
   */
  static visibility(intensityMax: number, intensityMin: number): number {
    if (intensityMax + intensityMin === 0) return 0;
    return (intensityMax - intensityMin) / (intensityMax + intensityMin);
  }
  
  /**
   * Diffraction envelope for finite slit width
   * Single slit diffraction pattern: sinc²(πa·sin(θ)/λ)
   */
  static diffractionEnvelope(
    angle: number,
    wavelength: number,
    slitWidth: number
  ): number {
    const beta = (Math.PI * slitWidth * Math.sin(angle)) / wavelength;
    
    if (Math.abs(beta) < 1e-6) return 1.0;
    
    const sinc = Math.sin(beta) / beta;
    return sinc * sinc;
  }
  
  /**
   * Combined interference and diffraction pattern
   */
  static combinedPattern(
    angle: number,
    wavelength: number,
    slitSeparation: number,
    slitWidth: number,
    maxIntensity: number = 1.0
  ): number {
    const interference = this.intensity(angle, wavelength, slitSeparation, maxIntensity);
    const diffraction = this.diffractionEnvelope(angle, wavelength, slitWidth);
    
    return interference * diffraction;
  }
  
  /**
   * Calculate coherence length
   * L_c = λ²/Δλ
   */
  static coherenceLength(wavelength: number, spectralWidth: number): number {
    return (wavelength * wavelength) / spectralWidth;
  }
}