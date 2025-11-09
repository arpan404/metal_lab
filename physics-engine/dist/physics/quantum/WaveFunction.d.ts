import type { WaveFunctionState } from '../../types';
/**
 * Quantum wave function calculations
 */
export declare class WaveFunction {
    /**
     * Create Gaussian wave packet
     */
    static createGaussianWavePacket(centerX: number, centerY: number, sigmaX: number, sigmaY: number, k0X: number, k0Y: number, gridSize: number): WaveFunctionState;
    /**
     * Create plane wave
     */
    static createPlaneWave(kX: number, kY: number, gridSize: number): WaveFunctionState;
    /**
     * Calculate probability density |ψ|²
     */
    static calculateProbability(real: Float32Array, imaginary: Float32Array): Float32Array;
    /**
     * Normalize wave function
     */
    static normalize(state: WaveFunctionState): WaveFunctionState;
    /**
     * Calculate expectation value of position
     */
    static expectationPosition(state: WaveFunctionState, gridSize: number): {
        x: number;
        y: number;
    };
    /**
     * Calculate expectation value of momentum
     */
    static expectationMomentum(state: WaveFunctionState, gridSize: number, dx: number): {
        px: number;
        py: number;
    };
    /**
     * Calculate uncertainty in position
     */
    static uncertaintyPosition(state: WaveFunctionState, gridSize: number): {
        sigmaX: number;
        sigmaY: number;
    };
    /**
     * Calculate de Broglie wavelength
     * λ = h/p
     */
    static deBroglieWavelength(momentum: number): number;
    /**
     * Calculate energy from wave number
     * E = ℏω = ℏck
     */
    static energyFromWaveNumber(k: number, c?: number): number;
}
//# sourceMappingURL=WaveFunction.d.ts.map