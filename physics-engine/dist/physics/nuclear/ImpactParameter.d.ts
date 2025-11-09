/**
 * Impact parameter calculations for scattering
 */
export declare class ImpactParameter {
    private static readonly k;
    private static readonly e;
    /**
     * Calculate impact parameter for given scattering angle
     * b = (kZ₁Z₂e²/2E)·cot(θ/2)
     */
    static fromAngle(energy: number, charge1: number, charge2: number, angle: number): number;
    /**
     * Calculate scattering angle from impact parameter
     * θ = 2·arctan(kZ₁Z₂e²/2Eb)
     */
    static toAngle(energy: number, charge1: number, charge2: number, impactParameter: number): number;
    /**
     * Calculate maximum impact parameter for given minimum angle
     * Particles with b > b_max scatter less than θ_min
     */
    static maximum(energy: number, charge1: number, charge2: number, minAngle: number): number;
    /**
     * Generate random impact parameter (uniform distribution)
     */
    static random(maxImpactParameter: number): number;
    /**
     * Generate random impact parameter (weighted by cross-section)
     */
    static randomWeighted(maxImpactParameter: number): number;
    /**
     * Calculate differential cross section element
     * dσ = 2πb·db
     */
    static crossSectionElement(impactParameter: number, db: number): number;
    /**
     * Calculate number of particles in impact parameter range
     */
    static particlesInRange(totalParticles: number, beamRadius: number, bMin: number, bMax: number): number;
    /**
     * Calculate average impact parameter for random distribution
     */
    static average(maxImpactParameter: number): number;
    /**
     * Calculate most probable scattering angle
     * (corresponds to most particles per solid angle)
     */
    static mostProbableAngle(energy: number, charge1: number, charge2: number, maxImpactParameter: number): number;
    /**
     * Calculate solid angle corresponding to impact parameter range
     */
    static solidAngle(energy: number, charge1: number, charge2: number, bMin: number, bMax: number): number;
}
//# sourceMappingURL=ImpactParameter.d.ts.map