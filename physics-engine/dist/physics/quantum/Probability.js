/**
 * Quantum probability calculations
 */
export class Probability {
    /**
     * Calculate probability of finding particle in region
     */
    static probabilityInRegion(state, gridSize, region) {
        let totalProb = 0;
        for (let y = region.yMin; y <= region.yMax && y < gridSize; y++) {
            for (let x = region.xMin; x <= region.xMax && x < gridSize; x++) {
                const idx = y * gridSize + x;
                totalProb += state.probability[idx];
            }
        }
        return totalProb;
    }
    /**
     * Calculate cumulative probability distribution
     */
    static cumulativeDistribution(state, gridSize, axis) {
        const distribution = new Float32Array(gridSize);
        if (axis === 'x') {
            for (let x = 0; x < gridSize; x++) {
                let sum = 0;
                for (let y = 0; y < gridSize; y++) {
                    const idx = y * gridSize + x;
                    sum += state.probability[idx];
                }
                distribution[x] = x > 0 ? distribution[x - 1] + sum : sum;
            }
        }
        else {
            for (let y = 0; y < gridSize; y++) {
                let sum = 0;
                for (let x = 0; x < gridSize; x++) {
                    const idx = y * gridSize + x;
                    sum += state.probability[idx];
                }
                distribution[y] = y > 0 ? distribution[y - 1] + sum : sum;
            }
        }
        return distribution;
    }
    /**
     * Calculate marginal probability distribution
     */
    static marginalDistribution(state, gridSize, axis) {
        const distribution = new Float32Array(gridSize);
        if (axis === 'x') {
            // P(x) = ∫|ψ(x,y)|²dy
            for (let x = 0; x < gridSize; x++) {
                let sum = 0;
                for (let y = 0; y < gridSize; y++) {
                    const idx = y * gridSize + x;
                    sum += state.probability[idx];
                }
                distribution[x] = sum;
            }
        }
        else {
            // P(y) = ∫|ψ(x,y)|²dx
            for (let y = 0; y < gridSize; y++) {
                let sum = 0;
                for (let x = 0; x < gridSize; x++) {
                    const idx = y * gridSize + x;
                    sum += state.probability[idx];
                }
                distribution[y] = sum;
            }
        }
        return distribution;
    }
    /**
     * Find most probable position
     */
    static mostProbablePosition(state, gridSize) {
        let maxProb = 0;
        let maxX = 0;
        let maxY = 0;
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const idx = y * gridSize + x;
                if (state.probability[idx] > maxProb) {
                    maxProb = state.probability[idx];
                    maxX = x;
                    maxY = y;
                }
            }
        }
        return { x: maxX, y: maxY, probability: maxProb };
    }
    /**
     * Calculate entropy of probability distribution
     * S = -Σ p·ln(p)
     */
    static entropy(state) {
        let entropy = 0;
        for (let i = 0; i < state.probability.length; i++) {
            const p = state.probability[i];
            if (p > 1e-10) {
                entropy -= p * Math.log(p);
            }
        }
        return entropy;
    }
    /**
     * Calculate overlap between two wave functions
     * ⟨ψ₁|ψ₂⟩ = ∫ψ₁*·ψ₂
     */
    static overlap(state1, state2) {
        let overlapReal = 0;
        let overlapImag = 0;
        for (let i = 0; i < state1.real.length; i++) {
            // Complex conjugate of state1 times state2
            overlapReal += state1.real[i] * state2.real[i] + state1.imaginary[i] * state2.imaginary[i];
            overlapImag += state1.real[i] * state2.imaginary[i] - state1.imaginary[i] * state2.real[i];
        }
        return Math.sqrt(overlapReal * overlapReal + overlapImag * overlapImag);
    }
    /**
     * Calculate survival probability
     * P(t) = |⟨ψ(0)|ψ(t)⟩|²
     */
    static survivalProbability(initialState, currentState) {
        const overlap = this.overlap(initialState, currentState);
        return overlap * overlap;
    }
    /**
     * Sample position from probability distribution
     */
    static samplePosition(state, gridSize) {
        const random = Math.random();
        let cumulative = 0;
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const idx = y * gridSize + x;
                cumulative += state.probability[idx];
                if (cumulative >= random) {
                    return { x, y };
                }
            }
        }
        return { x: 0, y: 0 };
    }
}
