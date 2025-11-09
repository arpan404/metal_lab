import type { WaveFunctionState } from '../../types';
/**
 * Quantum probability calculations
 */
export declare class Probability {
    /**
     * Calculate probability of finding particle in region
     */
    static probabilityInRegion(state: WaveFunctionState, gridSize: number, region: {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    }): number;
    /**
     * Calculate cumulative probability distribution
     */
    static cumulativeDistribution(state: WaveFunctionState, gridSize: number, axis: 'x' | 'y'): Float32Array;
    /**
     * Calculate marginal probability distribution
     */
    static marginalDistribution(state: WaveFunctionState, gridSize: number, axis: 'x' | 'y'): Float32Array;
    /**
     * Find most probable position
     */
    static mostProbablePosition(state: WaveFunctionState, gridSize: number): {
        x: number;
        y: number;
        probability: number;
    };
    /**
     * Calculate entropy of probability distribution
     * S = -Σ p·ln(p)
     */
    static entropy(state: WaveFunctionState): number;
    /**
     * Calculate overlap between two wave functions
     * ⟨ψ₁|ψ₂⟩ = ∫ψ₁*·ψ₂
     */
    static overlap(state1: WaveFunctionState, state2: WaveFunctionState): number;
    /**
     * Calculate survival probability
     * P(t) = |⟨ψ(0)|ψ(t)⟩|²
     */
    static survivalProbability(initialState: WaveFunctionState, currentState: WaveFunctionState): number;
    /**
     * Sample position from probability distribution
     */
    static samplePosition(state: WaveFunctionState, gridSize: number): {
        x: number;
        y: number;
    };
}
//# sourceMappingURL=Probability.d.ts.map