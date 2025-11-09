import type { Vector3D } from '../../types';
/**
 * Rotating reference frame calculations
 * Includes Coriolis and centrifugal forces
 */
export declare class RotatingFrame {
    /**
     * Calculate Coriolis force
     * F_c = -2m(ω × v)
     */
    static coriolisForce(mass: number, velocity: Vector3D, angularVelocity: Vector3D): Vector3D;
    /**
     * Calculate centrifugal force
     * F_cf = -m(ω × (ω × r))
     */
    static centrifugalForce(mass: number, position: Vector3D, angularVelocity: Vector3D): Vector3D;
    /**
     * Calculate Euler force (for non-uniform rotation)
     * F_e = -m(α × r)
     */
    static eulerForce(mass: number, position: Vector3D, angularAcceleration: Vector3D): Vector3D;
    /**
     * Total fictitious forces in rotating frame
     */
    static totalFictitiousForce(mass: number, position: Vector3D, velocity: Vector3D, angularVelocity: Vector3D, angularAcceleration?: Vector3D): Vector3D;
    /**
     * Earth's angular velocity at given latitude
     */
    static earthAngularVelocity(latitude: number): Vector3D;
    /**
     * Coriolis parameter (for meteorology)
     * f = 2Ω·sin(latitude)
     */
    static coriolisParameter(latitude: number): number;
    /**
     * Foucault pendulum precession rate
     */
    static foucaultPrecessionRate(latitude: number): number;
    /**
     * Foucault pendulum precession period (in seconds)
     */
    static foucaultPeriod(latitude: number): number;
    /**
     * Transform velocity from inertial to rotating frame
     */
    static velocityToRotatingFrame(velocityInertial: Vector3D, position: Vector3D, angularVelocity: Vector3D): Vector3D;
    /**
     * Transform velocity from rotating to inertial frame
     */
    static velocityToInertialFrame(velocityRotating: Vector3D, position: Vector3D, angularVelocity: Vector3D): Vector3D;
}
//# sourceMappingURL=RotatingFrame.d.ts.map