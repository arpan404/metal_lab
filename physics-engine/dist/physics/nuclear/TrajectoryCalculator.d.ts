import type { Vector3D, ScatteringParams } from '../../types';
/**
 * Calculate particle trajectories under Coulomb force
 */
export declare class TrajectoryCalculator {
    /**
     * Calculate trajectory using Runge-Kutta 4th order
     */
    static calculateTrajectory(params: ScatteringParams, startPosition: Vector3D, startVelocity: Vector3D, nucleusPosition: Vector3D | undefined, duration: number, steps?: number): Vector3D[];
    /**
     * Calculate acceleration from Coulomb force
     */
    private static acceleration;
    /**
     * Find closest approach point in trajectory
     */
    static findClosestApproach(trajectory: Vector3D[], nucleusPosition?: Vector3D): {
        distance: number;
        position: Vector3D;
        index: number;
    };
    /**
     * Calculate scattering angle from trajectory
     */
    static calculateScatteringAngle(trajectory: Vector3D[], initialVelocity: Vector3D): number;
    /**
     * Check if trajectory hits detector at given angle range
     */
    static hitsDetector(finalPosition: Vector3D, detectorAngleMin: number, detectorAngleMax: number, nucleusPosition?: Vector3D): boolean;
}
//# sourceMappingURL=TrajectoryCalculator.d.ts.map