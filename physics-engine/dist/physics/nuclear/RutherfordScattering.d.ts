import type { ScatteringParams, ScatteringResult } from '../../types';
/**
 * Rutherford scattering calculations
 */
export declare class RutherfordScattering {
    private static readonly k;
    private static readonly e;
    /**
     * Calculate scattering angle from impact parameter
     * θ = 2·arctan(k·Z₁·Z₂·e²/(2·E·b))
     */
    static scatteringAngle(params: ScatteringParams): number;
    /**
     * Calculate impact parameter from scattering angle
     * b = (k·Z₁·Z₂·e²/(2·E))·cot(θ/2)
     */
    static impactParameter(energy: number, charge1: number, charge2: number, scatteringAngle: number): number;
    /**
     * Calculate closest approach distance
     * r_min = (k·Z₁·Z₂·e²/E)·(1 + 1/sin(θ/2))
     */
    static closestApproach(params: ScatteringParams, scatteringAngle: number): number;
    /**
     * Calculate differential cross section
     * dσ/dΩ = (k·Z₁·Z₂·e²/(4·E))² · 1/sin⁴(θ/2)
     */
    static differentialCrossSection(energy: number, charge1: number, charge2: number, scatteringAngle: number): number;
    /**
     * Calculate total cross section for scattering > θ_min
     */
    static totalCrossSection(energy: number, charge1: number, charge2: number, minAngle: number): number;
    /**
     * Calculate trajectory of particle
     */
    static calculateTrajectory(params: ScatteringParams, numPoints?: number): ScatteringResult;
    /**
     * Calculate fraction of particles scattered > θ
     * f = (b_max/b_0)² where b_max from θ
     */
    static fractionScattered(energy: number, charge1: number, charge2: number, angle: number, beamWidth: number): number;
    /**
     * Estimate nuclear radius from minimum scattering angle
     */
    static estimateNuclearRadius(energy: number, charge1: number, charge2: number, minObservedAngle: number): number;
    /**
     * Calculate Coulomb barrier
     */
    static coulombBarrier(charge1: number, charge2: number, distance: number): number;
}
//# sourceMappingURL=RutherfordScattering.d.ts.map