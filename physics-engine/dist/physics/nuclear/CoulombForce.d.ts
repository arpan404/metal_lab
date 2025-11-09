import type { Vector3D } from '../../types';
/**
 * Coulomb force calculations for nuclear physics
 */
export declare class CoulombForce {
    private static readonly k;
    private static readonly e;
    /**
     * Calculate Coulomb force magnitude
     * F = k·q₁·q₂/r²
     */
    static forceMagnitude(charge1: number, charge2: number, distance: number): number;
    /**
     * Calculate Coulomb force vector
     */
    static forceVector(charge1: number, position1: Vector3D, charge2: number, position2: Vector3D): Vector3D;
    /**
     * Calculate Coulomb potential energy
     * U = k·q₁·q₂/r
     */
    static potentialEnergy(charge1: number, charge2: number, distance: number): number;
    /**
     * Calculate electric field from nucleus
     * E = k·Z·e/r²
     */
    static electricField(charge: number, distance: number): number;
    /**
     * Calculate potential at distance
     * V = k·Z·e/r
     */
    static potential(charge: number, distance: number): number;
    /**
     * Calculate work done moving particle
     * W = q·ΔV
     */
    static work(movingCharge: number, fixedCharge: number, initialDistance: number, finalDistance: number): number;
    /**
     * Calculate escape velocity from Coulomb potential
     */
    static escapeVelocity(charge1: number, charge2: number, distance: number, mass: number): number;
    /**
     * Calculate orbital velocity (if attractive)
     */
    static orbitalVelocity(charge1: number, charge2: number, radius: number, mass: number): number;
    /**
     * Calculate Bohr radius (for hydrogen-like atoms)
     * a₀ = ℏ²/(m·k·e²)
     */
    static bohrRadius(mass: number, charge?: number): number;
    /**
     * Calculate binding energy (magnitude)
     */
    static bindingEnergy(charge1: number, charge2: number, radius: number): number;
}
//# sourceMappingURL=CoulombForce.d.ts.map