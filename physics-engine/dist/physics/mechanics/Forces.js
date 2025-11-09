import { vectorAdd, vectorScale, vectorMagnitude } from '../../utils/math';
/**
 * Force calculations
 */
export class Forces {
    /**
     * Calculate gravitational force
     * F = mg
     */
    static gravity(mass, g = 9.81) {
        return mass * g;
    }
    /**
     * Calculate gravitational force vector (downward)
     */
    static gravityVector(mass, g = 9.81) {
        return {
            x: 0,
            y: -mass * g,
            z: 0
        };
    }
    /**
     * Calculate normal force on horizontal surface
     */
    static normalForce(mass, g = 9.81) {
        return mass * g;
    }
    /**
     * Calculate friction force
     * F_f = μN
     */
    static friction(normalForce, coefficient) {
        return coefficient * normalForce;
    }
    /**
     * Calculate drag force (air resistance)
     * F_d = (1/2)ρv²AC_d
     */
    static drag(velocity, density = 1.225, // air at sea level
    area = 1, dragCoefficient = 0.47 // sphere
    ) {
        return 0.5 * density * velocity * velocity * area * dragCoefficient;
    }
    /**
     * Calculate drag force vector (opposite to velocity)
     */
    static dragVector(velocity, density = 1.225, area = 1, dragCoefficient = 0.47) {
        const speed = vectorMagnitude(velocity);
        if (speed === 0)
            return { x: 0, y: 0, z: 0 };
        const dragMagnitude = this.drag(speed, density, area, dragCoefficient);
        // Opposite direction to velocity
        return {
            x: -(velocity.x / speed) * dragMagnitude,
            y: -(velocity.y / speed) * dragMagnitude,
            z: -(velocity.z / speed) * dragMagnitude
        };
    }
    /**
     * Calculate spring force
     * F = -kx
     */
    static spring(displacement, springConstant) {
        return -springConstant * displacement;
    }
    /**
     * Calculate tension force in rope/string
     */
    static tension(mass, acceleration, angle = 0, g = 9.81) {
        // T - mg·cos(θ) = ma
        return mass * (g * Math.cos(angle) + acceleration);
    }
    /**
     * Net force from multiple forces
     */
    static netForce(forces) {
        return forces.reduce((sum, force) => vectorAdd(sum, force), { x: 0, y: 0, z: 0 });
    }
    /**
     * Calculate acceleration from net force
     * a = F/m
     */
    static acceleration(netForce, mass) {
        return vectorScale(netForce, 1 / mass);
    }
    /**
     * Resolve force into components
     */
    static resolveForce(magnitude, angle) {
        return {
            parallel: magnitude * Math.cos(angle),
            perpendicular: magnitude * Math.sin(angle)
        };
    }
    /**
     * Calculate buoyant force (Archimedes)
     * F_b = ρVg
     */
    static buoyancy(fluidDensity, volume, g = 9.81) {
        return fluidDensity * volume * g;
    }
    /**
     * Check if object floats
     */
    static willFloat(objectDensity, fluidDensity) {
        return objectDensity < fluidDensity;
    }
}
