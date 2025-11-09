/**
 * Numerical solver for time-dependent Schrödinger equation
 * iℏ∂ψ/∂t = Ĥψ
 */
export class SchrodingerSolver {
    /**
     * Evolve wave function using split-operator method
     */
    static evolve(state, potential, gridSize, dx, dt, mass) {
        // Split-operator method: e^(-iĤt/ℏ) ≈ e^(-iV̂t/2ℏ)·e^(-iT̂t/ℏ)·e^(-iV̂t/2ℏ)
        // Step 1: Apply potential operator (half step)
        let newState = this.applyPotentialOperator(state, potential, dt / 2, gridSize);
        // Step 2: Apply kinetic operator (full step) - requires FFT
        newState = this.applyKineticOperator(newState, gridSize, dx, dt, mass);
        // Step 3: Apply potential operator (half step)
        newState = this.applyPotentialOperator(newState, potential, dt / 2, gridSize);
        return newState;
    }
    /**
     * Apply potential operator: ψ → e^(-iVt/ℏ)ψ
     */
    static applyPotentialOperator(state, potential, dt, gridSize) {
        const real = new Float32Array(state.real.length);
        const imaginary = new Float32Array(state.imaginary.length);
        const probability = new Float32Array(state.probability.length);
        for (let i = 0; i < state.real.length; i++) {
            const phase = -(potential[i] * dt) / this.hbar;
            const cosPhase = Math.cos(phase);
            const sinPhase = Math.sin(phase);
            // Complex multiplication: e^(iφ)·ψ
            real[i] = cosPhase * state.real[i] - sinPhase * state.imaginary[i];
            imaginary[i] = sinPhase * state.real[i] + cosPhase * state.imaginary[i];
            probability[i] = real[i] * real[i] + imaginary[i] * imaginary[i];
        }
        return { real, imaginary, probability };
    }
    /**
     * Apply kinetic operator (simplified - real implementation would use FFT)
     */
    static applyKineticOperator(state, gridSize, dx, dt, mass) {
        const real = new Float32Array(state.real.length);
        const imaginary = new Float32Array(state.imaginary.length);
        const probability = new Float32Array(state.probability.length);
        const factor = (this.hbar * dt) / (2 * mass * dx * dx);
        // Finite difference approximation of ∇²ψ
        for (let y = 1; y < gridSize - 1; y++) {
            for (let x = 1; x < gridSize - 1; x++) {
                const idx = y * gridSize + x;
                // Laplacian using 5-point stencil
                const laplacianReal = state.real[idx - 1] + state.real[idx + 1] +
                    state.real[idx - gridSize] + state.real[idx + gridSize] -
                    4 * state.real[idx];
                const laplacianImag = state.imaginary[idx - 1] + state.imaginary[idx + 1] +
                    state.imaginary[idx - gridSize] + state.imaginary[idx + gridSize] -
                    4 * state.imaginary[idx];
                // Apply kinetic operator: ψ → ψ + i(ℏt/2m)∇²ψ
                real[idx] = state.real[idx] - factor * laplacianImag;
                imaginary[idx] = state.imaginary[idx] + factor * laplacianReal;
                probability[idx] = real[idx] * real[idx] + imaginary[idx] * imaginary[idx];
            }
        }
        // Handle boundaries (absorbing boundary conditions)
        for (let i = 0; i < gridSize; i++) {
            // Top and bottom edges
            real[i] = 0;
            imaginary[i] = 0;
            probability[i] = 0;
            real[(gridSize - 1) * gridSize + i] = 0;
            imaginary[(gridSize - 1) * gridSize + i] = 0;
            probability[(gridSize - 1) * gridSize + i] = 0;
            // Left and right edges
            real[i * gridSize] = 0;
            imaginary[i * gridSize] = 0;
            probability[i * gridSize] = 0;
            real[i * gridSize + gridSize - 1] = 0;
            imaginary[i * gridSize + gridSize - 1] = 0;
            probability[i * gridSize + gridSize - 1] = 0;
        }
        return { real, imaginary, probability };
    }
    /**
     * Calculate expected energy
     * ⟨E⟩ = ⟨ψ|Ĥ|ψ⟩
     */
    static expectedEnergy(state, potential, gridSize, dx, mass) {
        let kineticEnergy = 0;
        let potentialEnergy = 0;
        for (let y = 1; y < gridSize - 1; y++) {
            for (let x = 1; x < gridSize - 1; x++) {
                const idx = y * gridSize + x;
                // Kinetic energy term: -(ℏ²/2m)⟨ψ|∇²|ψ⟩
                const laplacianReal = state.real[idx - 1] + state.real[idx + 1] +
                    state.real[idx - gridSize] + state.real[idx + gridSize] -
                    4 * state.real[idx];
                const laplacianImag = state.imaginary[idx - 1] + state.imaginary[idx + 1] +
                    state.imaginary[idx - gridSize] + state.imaginary[idx + gridSize] -
                    4 * state.imaginary[idx];
                kineticEnergy -= (this.hbar * this.hbar / (2 * mass * dx * dx)) *
                    (state.real[idx] * laplacianReal + state.imaginary[idx] * laplacianImag);
                // Potential energy term: ⟨ψ|V|ψ⟩
                potentialEnergy += potential[idx] * state.probability[idx];
            }
        }
        return kineticEnergy + potentialEnergy;
    }
}
SchrodingerSolver.hbar = 1.054571817e-34;
