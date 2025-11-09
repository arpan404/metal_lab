import type { WaveFunctionState } from '../../types';
/**
 * Numerical solver for time-dependent Schrödinger equation
 * iℏ∂ψ/∂t = Ĥψ
 */
export declare class SchrodingerSolver {
    private static readonly hbar;
    /**
     * Evolve wave function using split-operator method
     */
    static evolve(state: WaveFunctionState, potential: Float32Array, gridSize: number, dx: number, dt: number, mass: number): WaveFunctionState;
    /**
     * Apply potential operator: ψ → e^(-iVt/ℏ)ψ
     */
    private static applyPotentialOperator;
    /**
     * Apply kinetic operator (simplified - real implementation would use FFT)
     */
    private static applyKineticOperator;
    /**
     * Calculate expected energy
     * ⟨E⟩ = ⟨ψ|Ĥ|ψ⟩
     */
    static expectedEnergy(state: WaveFunctionState, potential: Float32Array, gridSize: number, dx: number, mass: number): number;
}
//# sourceMappingURL=SchrodingerSolver.d.ts.map