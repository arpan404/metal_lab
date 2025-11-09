import { CoulombForce } from './CoulombForce';
/**
 * Calculate particle trajectories under Coulomb force
 */
export class TrajectoryCalculator {
    /**
     * Calculate trajectory using Runge-Kutta 4th order
     */
    static calculateTrajectory(params, startPosition, startVelocity, nucleusPosition = { x: 0, y: 0, z: 0 }, duration, steps = 1000) {
        const trajectory = [];
        const dt = duration / steps;
        let position = { ...startPosition };
        let velocity = { ...startVelocity };
        for (let i = 0; i < steps; i++) {
            trajectory.push({ ...position });
            // RK4 integration
            const k1v = this.acceleration(position, nucleusPosition, params);
            const k1x = velocity;
            const pos2 = {
                x: position.x + 0.5 * dt * k1x.x,
                y: position.y + 0.5 * dt * k1x.y,
                z: position.z + 0.5 * dt * k1x.z
            };
            const vel2 = {
                x: velocity.x + 0.5 * dt * k1v.x,
                y: velocity.y + 0.5 * dt * k1v.y,
                z: velocity.z + 0.5 * dt * k1v.z
            };
            const k2v = this.acceleration(pos2, nucleusPosition, params);
            const k2x = vel2;
            const pos3 = {
                x: position.x + 0.5 * dt * k2x.x,
                y: position.y + 0.5 * dt * k2x.y,
                z: position.z + 0.5 * dt * k2x.z
            };
            const vel3 = {
                x: velocity.x + 0.5 * dt * k2v.x,
                y: velocity.y + 0.5 * dt * k2v.y,
                z: velocity.z + 0.5 * dt * k2v.z
            };
            const k3v = this.acceleration(pos3, nucleusPosition, params);
            const k3x = vel3;
            const pos4 = {
                x: position.x + dt * k3x.x,
                y: position.y + dt * k3x.y,
                z: position.z + dt * k3x.z
            };
            const vel4 = {
                x: velocity.x + dt * k3v.x,
                y: velocity.y + dt * k3v.y,
                z: velocity.z + dt * k3v.z
            };
            const k4v = this.acceleration(pos4, nucleusPosition, params);
            const k4x = vel4;
            // Update position
            position.x += (dt / 6) * (k1x.x + 2 * k2x.x + 2 * k3x.x + k4x.x);
            position.y += (dt / 6) * (k1x.y + 2 * k2x.y + 2 * k3x.y + k4x.y);
            position.z += (dt / 6) * (k1x.z + 2 * k2x.z + 2 * k3x.z + k4x.z);
            // Update velocity
            velocity.x += (dt / 6) * (k1v.x + 2 * k2v.x + 2 * k3v.x + k4v.x);
            velocity.y += (dt / 6) * (k1v.y + 2 * k2v.y + 2 * k3v.y + k4v.y);
            velocity.z += (dt / 6) * (k1v.z + 2 * k2v.z + 2 * k3v.z + k4v.z);
        }
        return trajectory;
    }
    /**
     * Calculate acceleration from Coulomb force
     */
    static acceleration(position, nucleusPosition, params) {
        const force = CoulombForce.forceVector(params.charge1, position, params.charge2, nucleusPosition);
        return {
            x: force.x / params.mass,
            y: force.y / params.mass,
            z: force.z / params.mass
        };
    }
    /**
     * Find closest approach point in trajectory
     */
    static findClosestApproach(trajectory, nucleusPosition = { x: 0, y: 0, z: 0 }) {
        let minDistance = Infinity;
        let minPosition = trajectory[0];
        let minIndex = 0;
        trajectory.forEach((pos, idx) => {
            const dx = pos.x - nucleusPosition.x;
            const dy = pos.y - nucleusPosition.y;
            const dz = pos.z - nucleusPosition.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (distance < minDistance) {
                minDistance = distance;
                minPosition = pos;
                minIndex = idx;
            }
        });
        return { distance: minDistance, position: minPosition, index: minIndex };
    }
    /**
     * Calculate scattering angle from trajectory
     */
    static calculateScatteringAngle(trajectory, initialVelocity) {
        if (trajectory.length < 2)
            return 0;
        // Final velocity direction
        const lastPoints = trajectory.slice(-10);
        const finalDirection = {
            x: lastPoints[lastPoints.length - 1].x - lastPoints[0].x,
            y: lastPoints[lastPoints.length - 1].y - lastPoints[0].y,
            z: lastPoints[lastPoints.length - 1].z - lastPoints[0].z
        };
        // Normalize
        const magInitial = Math.sqrt(initialVelocity.x ** 2 + initialVelocity.y ** 2 + initialVelocity.z ** 2);
        const magFinal = Math.sqrt(finalDirection.x ** 2 + finalDirection.y ** 2 + finalDirection.z ** 2);
        if (magInitial === 0 || magFinal === 0)
            return 0;
        // Dot product
        const dot = (initialVelocity.x * finalDirection.x +
            initialVelocity.y * finalDirection.y +
            initialVelocity.z * finalDirection.z) / (magInitial * magFinal);
        return Math.acos(Math.max(-1, Math.min(1, dot)));
    }
    /**
     * Check if trajectory hits detector at given angle range
     */
    static hitsDetector(finalPosition, detectorAngleMin, detectorAngleMax, nucleusPosition = { x: 0, y: 0, z: 0 }) {
        const dx = finalPosition.x - nucleusPosition.x;
        const dz = finalPosition.z - nucleusPosition.z;
        const angle = Math.atan2(Math.abs(dz), dx);
        return angle >= detectorAngleMin && angle <= detectorAngleMax;
    }
}
