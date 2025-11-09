import type { Vector3D, PendulumParams } from '../../types';
/**
 * Pendulum physics calculations
 */
export declare class Pendulum {
    /**
     * Calculate period for small oscillations
     * T = 2π√(L/g)
     */
    static period(length: number, g?: number): number;
    /**
     * Calculate frequency
     * f = 1/T
     */
    static frequency(length: number, g?: number): number;
    /**
     * Calculate angular frequency
     * ω = √(g/L)
     */
    static angularFrequency(length: number, g?: number): number;
    /**
     * Calculate restoring force
     * F = -mg·sin(θ)
     */
    static restoringForce(mass: number, angle: number, g?: number): number;
    /**
     * Calculate tension in string
     * T = mg·cos(θ) + mv²/L
     */
    static tension(mass: number, length: number, angle: number, angularVelocity: number, g?: number): number;
    /**
     * Calculate energy
     */
    static totalEnergy(params: PendulumParams, g?: number): number;
    /**
     * Calculate maximum velocity (at bottom of swing)
     */
    static maxVelocity(length: number, initialAngle: number, g?: number): number;
    /**
     * Calculate angular acceleration
     * α = -(g/L)·sin(θ) - damping·ω
     */
    static angularAcceleration(params: PendulumParams, g?: number): number;
    /**
     * Update pendulum state (Runge-Kutta 4th order)
     */
    static updateState(params: PendulumParams, dt: number, g?: number): PendulumParams;
    /**
     * Calculate bob position
     */
    static bobPosition(length: number, angle: number): Vector3D;
    /**
     * Calculate bob velocity
     */
    static bobVelocity(length: number, angle: number, angularVelocity: number): Vector3D;
}
//# sourceMappingURL=Pendulum.d.ts.map