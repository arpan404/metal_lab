import type { Vector3D } from '../types';
export declare class RotationalEngine {
    private angularVelocity;
    private latitude;
    /**
     * Set Earth's rotation (for Foucault pendulum)
     */
    setEarthRotation(latitude: number): void;
    /**
     * Calculate Coriolis force: Fc = -2m(ω × v)
     */
    calculateCoriolisForce(mass: number, velocity: Vector3D): Vector3D;
    /**
     * Calculate centrifugal force: Fcf = -m(ω × (ω × r))
     */
    calculateCentrifugalForce(mass: number, position: Vector3D): Vector3D;
    /**
     * Get rotation rate at current latitude
     */
    getRotationRate(): number;
    /**
     * Get precession period (Foucault pendulum)
     * T = 24 hours / sin(latitude)
     */
    getPrecessionPeriod(): number;
    getLatitude(): number;
    getAngularVelocity(): Vector3D;
}
//# sourceMappingURL=RotationalEngine.d.ts.map