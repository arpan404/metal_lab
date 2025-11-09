import type { Vector3D } from '../../types';
/**
 * General kinematic equations and motion calculations
 */
export declare class Kinematics {
    /**
     * Position with constant acceleration
     * x = x₀ + v₀t + (1/2)at²
     */
    static position(initialPosition: number, initialVelocity: number, acceleration: number, time: number): number;
    /**
     * Velocity with constant acceleration
     * v = v₀ + at
     */
    static velocity(initialVelocity: number, acceleration: number, time: number): number;
    /**
     * Final velocity from distance and acceleration
     * v² = v₀² + 2aΔx
     */
    static finalVelocity(initialVelocity: number, acceleration: number, distance: number): number;
    /**
     * Time to reach final velocity
     * t = (v - v₀)/a
     */
    static timeToVelocity(initialVelocity: number, finalVelocity: number, acceleration: number): number;
    /**
     * Projectile motion - position
     */
    static projectilePosition(initialPosition: Vector3D, initialVelocity: Vector3D, time: number, g?: number): Vector3D;
    /**
     * Projectile motion - velocity
     */
    static projectileVelocity(initialVelocity: Vector3D, time: number, g?: number): Vector3D;
    /**
     * Maximum height of projectile
     */
    static maxHeight(initialVelocityY: number, g?: number): number;
    /**
     * Range of projectile
     */
    static range(initialVelocity: number, angle: number, g?: number): number;
    /**
     * Time of flight
     */
    static timeOfFlight(initialVelocityY: number, initialHeight?: number, g?: number): number;
    /**
     * Average velocity
     */
    static averageVelocity(displacement: number, time: number): number;
    /**
     * Average acceleration
     */
    static averageAcceleration(initialVelocity: number, finalVelocity: number, time: number): number;
    /**
     * Distance traveled (total path length)
     */
    static distanceTraveled(velocityFunction: (t: number) => number, duration: number, steps?: number): number;
}
//# sourceMappingURL=Kinematics.d.ts.map