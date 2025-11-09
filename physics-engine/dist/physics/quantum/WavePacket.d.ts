/**
 * Gaussian wave packet calculations
 */
export declare class WavePacket {
    /**
     * Calculate width of wave packet at time t
     * σ(t) = σ₀√(1 + (ℏt/2mσ₀²)²)
     */
    static width(initialWidth: number, mass: number, time: number): number;
    /**
     * Calculate center position at time t
     * x(t) = x₀ + v₀t
     */
    static centerPosition(initialPosition: number, velocity: number, time: number): number;
    /**
     * Calculate spreading rate
     */
    static spreadingRate(initialWidth: number, mass: number): number;
    /**
     * Calculate group velocity
     * v_g = ℏk/m
     */
    static groupVelocity(waveNumber: number, mass: number): number;
    /**
     * Calculate phase velocity
     * v_p = ω/k = ℏk/2m
     */
    static phaseVelocity(waveNumber: number, mass: number): number;
    /**
     * Heisenberg uncertainty relation
     * Δx·Δp ≥ ℏ/2
     */
    static minimumUncertaintyProduct(): number;
    /**
     * Check if minimum uncertainty is satisfied
     */
    static isMinimumUncertainty(positionUncertainty: number, momentumUncertainty: number): boolean;
    /**
     * Calculate momentum uncertainty for Gaussian
     * Δp = ℏ/(2σ)
     */
    static momentumUncertainty(positionWidth: number): number;
    /**
     * Calculate time to double width
     */
    static doublingTime(initialWidth: number, mass: number): number;
}
//# sourceMappingURL=WavePacket.d.ts.map