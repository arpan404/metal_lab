/**
 * General kinematic equations and motion calculations
 */
export class Kinematics {
    /**
     * Position with constant acceleration
     * x = x₀ + v₀t + (1/2)at²
     */
    static position(initialPosition, initialVelocity, acceleration, time) {
        return initialPosition + initialVelocity * time + 0.5 * acceleration * time * time;
    }
    /**
     * Velocity with constant acceleration
     * v = v₀ + at
     */
    static velocity(initialVelocity, acceleration, time) {
        return initialVelocity + acceleration * time;
    }
    /**
     * Final velocity from distance and acceleration
     * v² = v₀² + 2aΔx
     */
    static finalVelocity(initialVelocity, acceleration, distance) {
        const vSquared = initialVelocity * initialVelocity + 2 * acceleration * distance;
        return Math.sqrt(Math.max(0, vSquared));
    }
    /**
     * Time to reach final velocity
     * t = (v - v₀)/a
     */
    static timeToVelocity(initialVelocity, finalVelocity, acceleration) {
        if (Math.abs(acceleration) < 1e-10)
            return Infinity;
        return (finalVelocity - initialVelocity) / acceleration;
    }
    /**
     * Projectile motion - position
     */
    static projectilePosition(initialPosition, initialVelocity, time, g = 9.81) {
        return {
            x: initialPosition.x + initialVelocity.x * time,
            y: initialPosition.y + initialVelocity.y * time - 0.5 * g * time * time,
            z: initialPosition.z + initialVelocity.z * time
        };
    }
    /**
     * Projectile motion - velocity
     */
    static projectileVelocity(initialVelocity, time, g = 9.81) {
        return {
            x: initialVelocity.x,
            y: initialVelocity.y - g * time,
            z: initialVelocity.z
        };
    }
    /**
     * Maximum height of projectile
     */
    static maxHeight(initialVelocityY, g = 9.81) {
        return (initialVelocityY * initialVelocityY) / (2 * g);
    }
    /**
     * Range of projectile
     */
    static range(initialVelocity, angle, g = 9.81) {
        return (initialVelocity * initialVelocity * Math.sin(2 * angle)) / g;
    }
    /**
     * Time of flight
     */
    static timeOfFlight(initialVelocityY, initialHeight = 0, g = 9.81) {
        // Solve: h + v₀t - (1/2)gt² = 0
        const a = -0.5 * g;
        const b = initialVelocityY;
        const c = initialHeight;
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0)
            return 0;
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        return Math.max(t1, t2);
    }
    /**
     * Average velocity
     */
    static averageVelocity(displacement, time) {
        return displacement / time;
    }
    /**
     * Average acceleration
     */
    static averageAcceleration(initialVelocity, finalVelocity, time) {
        return (finalVelocity - initialVelocity) / time;
    }
    /**
     * Distance traveled (total path length)
     */
    static distanceTraveled(velocityFunction, duration, steps = 1000) {
        let distance = 0;
        const dt = duration / steps;
        for (let i = 0; i < steps; i++) {
            const t = i * dt;
            const v = Math.abs(velocityFunction(t));
            distance += v * dt;
        }
        return distance;
    }
}
