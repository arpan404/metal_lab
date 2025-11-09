// physics-engine/physics/nuclear/ImpactParameter.ts
/**
 * Impact parameter calculations for scattering
 */
export class ImpactParameter {
    /**
     * Calculate impact parameter for given scattering angle
     * b = (kZ₁Z₂e²/2E)·cot(θ/2)
     */
    static fromAngle(energy, charge1, charge2, angle) {
        const numerator = this.k * charge1 * charge2 * this.e * this.e;
        const denominator = 2 * energy * this.e; // Convert eV to Joules
        const cotHalfAngle = 1 / Math.tan(angle / 2);
        return (numerator / denominator) * cotHalfAngle;
    }
    /**
     * Calculate scattering angle from impact parameter
     * θ = 2·arctan(kZ₁Z₂e²/2Eb)
     */
    static toAngle(energy, charge1, charge2, impactParameter) {
        if (impactParameter === 0)
            return Math.PI; // Head-on collision
        const numerator = this.k * charge1 * charge2 * this.e * this.e;
        const denominator = 2 * energy * this.e * impactParameter;
        return 2 * Math.atan(numerator / denominator);
    }
    /**
     * Calculate maximum impact parameter for given minimum angle
     * Particles with b > b_max scatter less than θ_min
     */
    static maximum(energy, charge1, charge2, minAngle) {
        return this.fromAngle(energy, charge1, charge2, minAngle);
    }
    /**
     * Generate random impact parameter (uniform distribution)
     */
    static random(maxImpactParameter) {
        return Math.random() * maxImpactParameter;
    }
    /**
     * Generate random impact parameter (weighted by cross-section)
     */
    static randomWeighted(maxImpactParameter) {
        // Probability ∝ 2πb·db, so P(b) = b/b_max²
        // Inverse CDF: b = b_max·√(random)
        return maxImpactParameter * Math.sqrt(Math.random());
    }
    /**
     * Calculate differential cross section element
     * dσ = 2πb·db
     */
    static crossSectionElement(impactParameter, db) {
        return 2 * Math.PI * impactParameter * db;
    }
    /**
     * Calculate number of particles in impact parameter range
     */
    static particlesInRange(totalParticles, beamRadius, bMin, bMax) {
        if (beamRadius === 0)
            return 0;
        const areaRing = Math.PI * (bMax * bMax - bMin * bMin);
        const totalArea = Math.PI * beamRadius * beamRadius;
        return totalParticles * (areaRing / totalArea);
    }
    /**
     * Calculate average impact parameter for random distribution
     */
    static average(maxImpactParameter) {
        // For uniform distribution over circle: ⟨b⟩ = (2/3)b_max
        return (2 / 3) * maxImpactParameter;
    }
    /**
     * Calculate most probable scattering angle
     * (corresponds to most particles per solid angle)
     */
    static mostProbableAngle(energy, charge1, charge2, maxImpactParameter) {
        // Most particles have b ≈ b_max, giving minimum scattering
        return this.toAngle(energy, charge1, charge2, maxImpactParameter);
    }
    /**
     * Calculate solid angle corresponding to impact parameter range
     */
    static solidAngle(energy, charge1, charge2, bMin, bMax) {
        const thetaMin = this.toAngle(energy, charge1, charge2, bMax);
        const thetaMax = this.toAngle(energy, charge1, charge2, bMin);
        // dΩ = 2π(cos(θ_min) - cos(θ_max))
        return 2 * Math.PI * (Math.cos(thetaMin) - Math.cos(thetaMax));
    }
}
ImpactParameter.k = 8.99e9; // Coulomb constant
ImpactParameter.e = 1.602176634e-19; // Elementary charge
