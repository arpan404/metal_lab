/**
 * Rutherford scattering calculations
 */
export class RutherfordScattering {
    /**
     * Calculate scattering angle from impact parameter
     * θ = 2·arctan(k·Z₁·Z₂·e²/(2·E·b))
     */
    static scatteringAngle(params) {
        const { impactParameter, energy, charge1, charge2 } = params;
        const numerator = this.k * charge1 * charge2 * this.e * this.e;
        const denominator = 2 * energy * this.e * impactParameter; // Convert eV to J
        return 2 * Math.atan(numerator / denominator);
    }
    /**
     * Calculate impact parameter from scattering angle
     * b = (k·Z₁·Z₂·e²/(2·E))·cot(θ/2)
     */
    static impactParameter(energy, charge1, charge2, scatteringAngle) {
        const numerator = this.k * charge1 * charge2 * this.e * this.e;
        const denominator = 2 * energy * this.e;
        return (numerator / denominator) * (1 / Math.tan(scatteringAngle / 2));
    }
    /**
     * Calculate closest approach distance
     * r_min = (k·Z₁·Z₂·e²/E)·(1 + 1/sin(θ/2))
     */
    static closestApproach(params, scatteringAngle) {
        const { energy, charge1, charge2 } = params;
        const factor = (this.k * charge1 * charge2 * this.e * this.e) / (energy * this.e);
        return factor * (1 + 1 / Math.sin(scatteringAngle / 2));
    }
    /**
     * Calculate differential cross section
     * dσ/dΩ = (k·Z₁·Z₂·e²/(4·E))² · 1/sin⁴(θ/2)
     */
    static differentialCrossSection(energy, charge1, charge2, scatteringAngle) {
        const factor = (this.k * charge1 * charge2 * this.e * this.e) / (4 * energy * this.e);
        const sin2 = Math.sin(scatteringAngle / 2);
        return (factor * factor) / (sin2 * sin2 * sin2 * sin2);
    }
    /**
     * Calculate total cross section for scattering > θ_min
     */
    static totalCrossSection(energy, charge1, charge2, minAngle) {
        const b_max = this.impactParameter(energy, charge1, charge2, minAngle);
        return Math.PI * b_max * b_max;
    }
    /**
     * Calculate trajectory of particle
     */
    static calculateTrajectory(params, numPoints = 1000) {
        const angle = this.scatteringAngle(params);
        const closest = this.closestApproach(params, angle);
        const trajectory = [];
        // Initial conditions
        const velocity = Math.sqrt(2 * params.energy * this.e / params.mass);
        // Time span
        const maxTime = (10 * closest) / velocity;
        const dt = maxTime / numPoints;
        let position = {
            x: -5 * closest,
            y: params.impactParameter,
            z: 0
        };
        let velocityVec = {
            x: velocity,
            y: 0,
            z: 0
        };
        for (let i = 0; i < numPoints; i++) {
            trajectory.push({ ...position });
            // Calculate force (Coulomb repulsion)
            const r = Math.sqrt(position.x * position.x + position.y * position.y + position.z * position.z);
            if (r < 1e-15)
                break; // Avoid singularity
            const forceMag = (this.k * params.charge1 * params.charge2 * this.e * this.e) / (r * r);
            const force = {
                x: forceMag * position.x / r,
                y: forceMag * position.y / r,
                z: forceMag * position.z / r
            };
            // Update velocity (F = ma)
            const acc = {
                x: force.x / params.mass,
                y: force.y / params.mass,
                z: force.z / params.mass
            };
            velocityVec.x += acc.x * dt;
            velocityVec.y += acc.y * dt;
            velocityVec.z += acc.z * dt;
            // Update position
            position.x += velocityVec.x * dt;
            position.y += velocityVec.y * dt;
            position.z += velocityVec.z * dt;
            // Stop if far enough
            if (position.x > 5 * closest && r > 10 * closest)
                break;
        }
        return {
            deflectionAngle: angle,
            closestApproach: closest,
            trajectory
        };
    }
    /**
     * Calculate fraction of particles scattered > θ
     * f = (b_max/b_0)² where b_max from θ
     */
    static fractionScattered(energy, charge1, charge2, angle, beamWidth) {
        const b = this.impactParameter(energy, charge1, charge2, angle);
        return (b * b) / (beamWidth * beamWidth);
    }
    /**
     * Estimate nuclear radius from minimum scattering angle
     */
    static estimateNuclearRadius(energy, charge1, charge2, minObservedAngle) {
        // At contact, Coulomb energy equals kinetic energy
        // This gives upper bound on nuclear radius
        return this.closestApproach({ impactParameter: 0, energy, charge1, charge2, mass: 6.64e-27 }, minObservedAngle);
    }
    /**
     * Calculate Coulomb barrier
     */
    static coulombBarrier(charge1, charge2, distance) {
        return (this.k * charge1 * charge2 * this.e * this.e) / distance;
    }
}
RutherfordScattering.k = 8.99e9; // Coulomb constant
RutherfordScattering.e = 1.602176634e-19; // Elementary charge
