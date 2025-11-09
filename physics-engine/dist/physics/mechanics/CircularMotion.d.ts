import type { Vector3D, CircularMotionParams } from '../../types';
/**
 * Circular motion calculations
 */
export declare class CircularMotion {
    /**
     * Calculate centripetal acceleration
     * a_c = v²/r
     */
    static centripetalAcceleration(velocity: number, radius: number): number;
    /**
     * Calculate centripetal force
     * F_c = mv²/r
     */
    static centripetalForce(mass: number, velocity: number, radius: number): number;
    /**
     * Calculate angular velocity
     * ω = v/r
     */
    static angularVelocity(velocity: number, radius: number): number;
    /**
     * Calculate period of circular motion
     * T = 2πr/v
     */
    static period(velocity: number, radius: number): number;
    /**
     * Calculate optimal banking speed (no friction needed)
     * v = √(gr·tan(θ))
     */
    static optimalBankingSpeed(radius: number, bankAngle: number, g?: number): number;
    /**
     * Calculate required friction force for banked turn
     */
    static requiredFriction(params: CircularMotionParams): number;
    /**
     * Calculate normal force on banked curve
     */
    static normalForce(mass: number, velocity: number, radius: number, bankAngle: number, g?: number): number;
    /**
     * Check if car can stay on track
     */
    static canStayOnTrack(params: CircularMotionParams): boolean;
    /**
     * Calculate position on circular path
     */
    static positionOnPath(radius: number, angle: number, center?: Vector3D): Vector3D;
    /**
     * Calculate velocity vector (tangent to circle)
     */
    static velocityVector(velocity: number, angle: number): Vector3D;
    /**
     * Calculate centripetal acceleration vector (toward center)
     */
    static centripetalVector(velocity: number, radius: number, angle: number): Vector3D;
}
//# sourceMappingURL=CircularMotion.d.ts.map