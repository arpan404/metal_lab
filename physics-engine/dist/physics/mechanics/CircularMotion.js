/**
 * Circular motion calculations
 */
export class CircularMotion {
    /**
     * Calculate centripetal acceleration
     * a_c = v²/r
     */
    static centripetalAcceleration(velocity, radius) {
        return (velocity * velocity) / radius;
    }
    /**
     * Calculate centripetal force
     * F_c = mv²/r
     */
    static centripetalForce(mass, velocity, radius) {
        return mass * this.centripetalAcceleration(velocity, radius);
    }
    /**
     * Calculate angular velocity
     * ω = v/r
     */
    static angularVelocity(velocity, radius) {
        return velocity / radius;
    }
    /**
     * Calculate period of circular motion
     * T = 2πr/v
     */
    static period(velocity, radius) {
        return (2 * Math.PI * radius) / velocity;
    }
    /**
     * Calculate optimal banking speed (no friction needed)
     * v = √(gr·tan(θ))
     */
    static optimalBankingSpeed(radius, bankAngle, g = 9.81) {
        return Math.sqrt(g * radius * Math.tan(bankAngle));
    }
    /**
     * Calculate required friction force for banked turn
     */
    static requiredFriction(params) {
        const { radius, velocity, mass, bankAngle = 0, frictionCoefficient = 0 } = params;
        const centripetalForce = this.centripetalForce(mass, velocity, radius);
        const normalForce = (mass * 9.81) / Math.cos(bankAngle);
        const bankingComponent = normalForce * Math.sin(bankAngle);
        // Friction needed = centripetal - banking component
        return Math.abs(centripetalForce - bankingComponent);
    }
    /**
     * Calculate normal force on banked curve
     */
    static normalForce(mass, velocity, radius, bankAngle, g = 9.81) {
        const centripetalAcc = this.centripetalAcceleration(velocity, radius);
        // N·cos(θ) = mg + F_friction·sin(θ)
        // N·sin(θ) = mv²/r + F_friction·cos(θ)
        // Simplified for no friction:
        return (mass * g) / Math.cos(bankAngle);
    }
    /**
     * Check if car can stay on track
     */
    static canStayOnTrack(params) {
        const frictionNeeded = this.requiredFriction(params);
        const maxFriction = params.mass * 9.81 * (params.frictionCoefficient ?? 0);
        return frictionNeeded <= maxFriction;
    }
    /**
     * Calculate position on circular path
     */
    static positionOnPath(radius, angle, center = { x: 0, y: 0, z: 0 }) {
        return {
            x: center.x + radius * Math.cos(angle),
            y: center.y,
            z: center.z + radius * Math.sin(angle)
        };
    }
    /**
     * Calculate velocity vector (tangent to circle)
     */
    static velocityVector(velocity, angle) {
        return {
            x: -velocity * Math.sin(angle),
            y: 0,
            z: velocity * Math.cos(angle)
        };
    }
    /**
     * Calculate centripetal acceleration vector (toward center)
     */
    static centripetalVector(velocity, radius, angle) {
        const ac = this.centripetalAcceleration(velocity, radius);
        return {
            x: -ac * Math.cos(angle),
            y: 0,
            z: -ac * Math.sin(angle)
        };
    }
}
