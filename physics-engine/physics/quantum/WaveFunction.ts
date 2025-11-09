// physics-engine/physics/quantum/WaveFunction.ts
import type { WaveFunctionState, WaveParameters } from '../../types';

/**
 * Quantum wave function calculations
 */

export class WaveFunction {
  /**
   * Create Gaussian wave packet
   */
  static createGaussianWavePacket(
    centerX: number,
    centerY: number,
    sigmaX: number,
    sigmaY: number,
    k0X: number,
    k0Y: number,
    gridSize: number
  ): WaveFunctionState {
    const real = new Float32Array(gridSize * gridSize);
    const imaginary = new Float32Array(gridSize * gridSize);
    const probability = new Float32Array(gridSize * gridSize);
    
    let norm = 0;
    
    // Generate wave packet
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const idx = y * gridSize + x;
        
        const dx = x - centerX;
        const dy = y - centerY;
        
        // Gaussian envelope
        const envelope = Math.exp(
          -(dx * dx) / (2 * sigmaX * sigmaX) - 
          (dy * dy) / (2 * sigmaY * sigmaY)
        );
        
        // Plane wave phase
        const phase = k0X * dx + k0Y * dy;
        
        real[idx] = envelope * Math.cos(phase);
        imaginary[idx] = envelope * Math.sin(phase);
        
        norm += real[idx] * real[idx] + imaginary[idx] * imaginary[idx];
      }
    }
    
    // Normalize
    norm = Math.sqrt(norm);
    for (let i = 0; i < real.length; i++) {
      real[i] /= norm;
      imaginary[i] /= norm;
      probability[i] = real[i] * real[i] + imaginary[i] * imaginary[i];
    }
    
    return { real, imaginary, probability };
  }
  
  /**
   * Create plane wave
   */
  static createPlaneWave(
    kX: number,
    kY: number,
    gridSize: number
  ): WaveFunctionState {
    const real = new Float32Array(gridSize * gridSize);
    const imaginary = new Float32Array(gridSize * gridSize);
    const probability = new Float32Array(gridSize * gridSize);
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const idx = y * gridSize + x;
        const phase = kX * x + kY * y;
        
        real[idx] = Math.cos(phase);
        imaginary[idx] = Math.sin(phase);
        probability[idx] = 1.0 / (gridSize * gridSize); // Uniform
      }
    }
    
    return { real, imaginary, probability };
  }
  
  /**
   * Calculate probability density |ψ|²
   */
  static calculateProbability(
    real: Float32Array,
    imaginary: Float32Array
  ): Float32Array {
    const probability = new Float32Array(real.length);
    
    for (let i = 0; i < real.length; i++) {
      probability[i] = real[i] * real[i] + imaginary[i] * imaginary[i];
    }
    
    return probability;
  }
  
  /**
   * Normalize wave function
   */
  static normalize(state: WaveFunctionState): WaveFunctionState {
    let norm = 0;
    
    for (let i = 0; i < state.real.length; i++) {
      norm += state.real[i] * state.real[i] + state.imaginary[i] * state.imaginary[i];
    }
    
    norm = Math.sqrt(norm);
    
    if (norm < 1e-10) return state;
    
    const real = new Float32Array(state.real.length);
    const imaginary = new Float32Array(state.imaginary.length);
    const probability = new Float32Array(state.probability.length);
    
    for (let i = 0; i < state.real.length; i++) {
      real[i] = state.real[i] / norm;
      imaginary[i] = state.imaginary[i] / norm;
      probability[i] = real[i] * real[i] + imaginary[i] * imaginary[i];
    }
    
    return { real, imaginary, probability };
  }
  
  /**
   * Calculate expectation value of position
   */
  static expectationPosition(
    state: WaveFunctionState,
    gridSize: number
  ): { x: number; y: number } {
    let sumX = 0;
    let sumY = 0;
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const idx = y * gridSize + x;
        const prob = state.probability[idx];
        
        sumX += x * prob;
        sumY += y * prob;
      }
    }
    
    return { x: sumX, y: sumY };
  }
  
  /**
   * Calculate expectation value of momentum
   */
  static expectationMomentum(
    state: WaveFunctionState,
    gridSize: number,
    dx: number
  ): { px: number; py: number } {
    let sumPx = 0;
    let sumPy = 0;
    
    // Use finite differences for momentum operator
    for (let y = 1; y < gridSize - 1; y++) {
      for (let x = 1; x < gridSize - 1; x++) {
        const idx = y * gridSize + x;
        
        // ∂ψ/∂x
        const dPsiDx_real = (state.real[idx + 1] - state.real[idx - 1]) / (2 * dx);
        const dPsiDx_imag = (state.imaginary[idx + 1] - state.imaginary[idx - 1]) / (2 * dx);
        
        // ∂ψ/∂y
        const dPsiDy_real = (state.real[idx + gridSize] - state.real[idx - gridSize]) / (2 * dx);
        const dPsiDy_imag = (state.imaginary[idx + gridSize] - state.imaginary[idx - gridSize]) / (2 * dx);
        
        // ⟨p⟩ = -iℏ⟨ψ|∂ψ/∂x⟩
        sumPx += state.real[idx] * dPsiDx_imag - state.imaginary[idx] * dPsiDx_real;
        sumPy += state.real[idx] * dPsiDy_imag - state.imaginary[idx] * dPsiDy_real;
      }
    }
    
    const hbar = 1.054571817e-34;
    return { px: hbar * sumPx, py: hbar * sumPy };
  }
  
  /**
   * Calculate uncertainty in position
   */
  static uncertaintyPosition(
    state: WaveFunctionState,
    gridSize: number
  ): { sigmaX: number; sigmaY: number } {
    const expectation = this.expectationPosition(state, gridSize);
    
    let sumX2 = 0;
    let sumY2 = 0;
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const idx = y * gridSize + x;
        const prob = state.probability[idx];
        
        sumX2 += (x - expectation.x) * (x - expectation.x) * prob;
        sumY2 += (y - expectation.y) * (y - expectation.y) * prob;
      }
    }
    
    return {
      sigmaX: Math.sqrt(sumX2),
      sigmaY: Math.sqrt(sumY2)
    };
  }
  
  /**
   * Calculate de Broglie wavelength
   * λ = h/p
   */
  static deBroglieWavelength(momentum: number): number {
    const h = 6.62607015e-34; // Planck constant
    return h / momentum;
  }
  
  /**
   * Calculate energy from wave number
   * E = ℏω = ℏck
   */
  static energyFromWaveNumber(k: number, c: number = 299792458): number {
    const hbar = 1.054571817e-34;
    return hbar * c * k;
  }
}