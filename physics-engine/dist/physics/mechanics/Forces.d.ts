import type { Vector3D } from '../../types';
/**
 * Force calculations
 */
export declare class Forces {
    /**
     * Calculate gravitational force
     * F = mg
     */
    static gravity(mass: number, g?: number): number;
    /**
     * Calculate gravitational force vector (downward)
     */
    static gravityVector(mass: number, g?: number): Vector3D;
    /**
     * Calculate normal force on horizontal surface
     */
    static normalForce(mass: number, g?: number): number;
    /**
     * Calculate friction force
     * F_f = μN
     */
    static friction(normalForce: number, coefficient: number): number;
    /**
     * Calculate drag force (air resistance)
     * F_d = (1/2)ρv²AC_d
     */
    static drag(velocity: number, density?: number, // air at sea level
    area?: number, dragCoefficient?: number): number;
    /**
     * Calculate drag force vector (opposite to velocity)
     */
    static dragVector(velocity: Vector3D, density?: number, area?: number, dragCoefficient?: number): Vector3D;
    /**
     * Calculate spring force
     * F = -kx
     */
    static spring(displacement: number, springConstant: number): number;
    /**
     * Calculate tension force in rope/string
     */
    static tension(mass: number, acceleration: number, angle?: number, g?: number): number;
    /**
     * Net force from multiple forces
     */
    static netForce(forces: Vector3D[]): Vector3D;
    /**
     * Calculate acceleration from net force
     * a = F/m
     */
    static acceleration(netForce: Vector3D, mass: number): Vector3D;
    /**
     * Resolve force into components
     */
    static resolveForce(magnitude: number, angle: number): {
        parallel: number;
        perpendicular: number;
    };
    /**
     * Calculate buoyant force (Archimedes)
     * F_b = ρVg
     */
    static buoyancy(fluidDensity: number, volume: number, g?: number): number;
    /**
     * Check if object floats
     */
    static willFloat(objectDensity: number, fluidDensity: number): boolean;
}
//# sourceMappingURL=Forces.d.ts.map