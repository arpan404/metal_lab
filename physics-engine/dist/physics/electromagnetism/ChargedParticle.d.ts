import type { Vector3D, ChargedParticleParams } from '../../types';
/**
 * Charged particle motion in electric and magnetic fields
 */
export declare class ChargedParticleMotion {
    /**
     * Calculate Lorentz force
     * F = q(E + v × B)
     */
    static lorentzForce(charge: number, electricField: Vector3D, velocity: Vector3D, magneticField: Vector3D): Vector3D;
    /**
     * Calculate acceleration
     */
    static acceleration(params: ChargedParticleParams, electricField: Vector3D, magneticField?: Vector3D): Vector3D;
    /**
     * Update particle state (using Euler method)
     */
    static updateState(params: ChargedParticleParams, electricField: Vector3D, magneticField: Vector3D, dt: number): ChargedParticleParams;
    /**
     * Calculate cyclotron frequency
     * ω = qB/m
     */
    static cyclotronFrequency(charge: number, mass: number, magneticField: number): number;
    /**
     * Calculate cyclotron radius
     * r = mv/(qB)
     */
    static cyclotronRadius(mass: number, velocity: number, charge: number, magneticField: number): number;
    /**
     * Calculate drift velocity in crossed E and B fields
     * v_d = (E × B)/B²
     */
    static driftVelocity(electricField: Vector3D, magneticField: Vector3D): Vector3D;
    /**
     * Kinetic energy of charged particle
     */
    static kineticEnergy(params: ChargedParticleParams): number;
    /**
     * Calculate stopping potential
     * V = (1/2)mv²/q
     */
    static stoppingPotential(mass: number, velocity: number, charge: number): number;
}
//# sourceMappingURL=ChargedParticle.d.ts.map