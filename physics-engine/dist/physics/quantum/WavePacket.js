/**
 * Gaussian wave packet calculations
 */
export class WavePacket {
    /**
     * Calculate width of wave packet at time t
     * σ(t) = σ₀√(1 + (ℏt/2mσ₀²)²)
     */
    static width(initialWidth, mass, time) {
        const hbar = 1.054571817e-34;
        const ratio = (hbar * time) / (2 * mass * initialWidth * initialWidth);
        return initialWidth * Math.sqrt(1 + ratio * ratio);
    }
    /**
     * Calculate center position at time t
     * x(t) = x₀ + v₀t
     */
    static centerPosition(initialPosition, velocity, time) {
        return initialPosition + velocity * time;
    }
    /**
     * Calculate spreading rate
     */
    static spreadingRate(initialWidth, mass) {
        const hbar = 1.054571817e-34;
        return hbar / (2 * mass * initialWidth * initialWidth);
    }
    /**
     * Calculate group velocity
     * v_g = ℏk/m
     */
    static groupVelocity(waveNumber, mass) {
        const hbar = 1.054571817e-34;
        return (hbar * waveNumber) / mass;
    }
    /**
     * Calculate phase velocity
     * v_p = ω/k = ℏk/2m
     */
    static phaseVelocity(waveNumber, mass) {
        const hbar = 1.054571817e-34;
        return (hbar * waveNumber) / (2 * mass);
    }
    /**
     * Heisenberg uncertainty relation
     * Δx·Δp ≥ ℏ/2
     */
    static minimumUncertaintyProduct() {
        const hbar = 1.054571817e-34;
        return hbar / 2;
    }
    /**
     * Check if minimum uncertainty is satisfied
     */
    static isMinimumUncertainty(positionUncertainty, momentumUncertainty) {
        const product = positionUncertainty * momentumUncertainty;
        const minimum = this.minimumUncertaintyProduct();
        return Math.abs(product - minimum) < minimum * 0.01; // Within 1%
    }
    /**
     * Calculate momentum uncertainty for Gaussian
     * Δp = ℏ/(2σ)
     */
    static momentumUncertainty(positionWidth) {
        const hbar = 1.054571817e-34;
        return hbar / (2 * positionWidth);
    }
    /**
     * Calculate time to double width
     */
    static doublingTime(initialWidth, mass) {
        const spreadRate = this.spreadingRate(initialWidth, mass);
        return initialWidth * Math.sqrt(3) / spreadRate;
    }
}
