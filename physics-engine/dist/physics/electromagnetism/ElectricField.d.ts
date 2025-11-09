import type { Vector3D } from '../../types';
/**
 * Electric field calculations
 */
export declare class ElectricField {
    private static readonly k;
    private static readonly epsilon0;
    /**
     * Calculate electric field from point charge
     * E = kq/r²
     */
    static pointCharge(charge: number, position: Vector3D, testPoint: Vector3D): Vector3D;
    /**
     * Calculate electric field from multiple point charges
     */
    static multipleCharges(charges: Array<{
        charge: number;
        position: Vector3D;
    }>, testPoint: Vector3D): Vector3D;
    /**
     * Uniform electric field between parallel plates
     * E = V/d
     */
    static uniformField(voltage: number, separation: number): number;
    /**
     * Electric field from infinite line charge
     * E = λ/(2πε₀r)
     */
    static lineCharge(linearChargeDensity: number, distance: number): number;
    /**
     * Electric field from infinite plane
     * E = σ/(2ε₀)
     */
    static planeCharge(surfaceChargeDensity: number): number;
    /**
     * Electric field inside spherical shell
     */
    static insideSphericalShell(): number;
    /**
     * Electric field outside spherical shell
     * E = kQ/r² (same as point charge)
     */
    static outsideSphericalShell(totalCharge: number, distance: number): number;
    /**
     * Electric potential from point charge
     * V = kq/r
     */
    static potential(charge: number, distance: number): number;
    /**
     * Electric potential difference (voltage)
     * ΔV = Ed (for uniform field)
     */
    static potentialDifference(fieldStrength: number, distance: number): number;
    /**
     * Electric force on charge in field
     * F = qE
     */
    static forceOnCharge(charge: number, field: Vector3D): Vector3D;
    /**
     * Work done moving charge in field
     * W = qΔV
     */
    static work(charge: number, potentialDifference: number): number;
    /**
     * Electric field energy density
     * u = (1/2)ε₀E²
     */
    static energyDensity(fieldStrength: number): number;
    /**
     * Capacitance of parallel plates
     * C = ε₀A/d
     */
    static capacitance(area: number, separation: number): number;
    /**
     * Energy stored in capacitor
     * U = (1/2)CV²
     */
    static capacitorEnergy(capacitance: number, voltage: number): number;
}
//# sourceMappingURL=ElectricField.d.ts.map