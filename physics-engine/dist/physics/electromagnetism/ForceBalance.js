/**
 * Force balance calculations for Millikan oil drop experiment
 */
export class ForceBalance {
    /**
     * Calculate gravitational force
     * F_g = mg
     */
    static gravitationalForce(mass) {
        return mass * this.g;
    }
    /**
     * Calculate electric force
     * F_e = qE
     */
    static electricForce(charge, fieldStrength) {
        return charge * fieldStrength;
    }
    /**
     * Calculate drag force (Stokes' law for sphere)
     * F_d = 6πηrv
     */
    static dragForce(radius, velocity, viscosity = this.eta) {
        return 6 * Math.PI * viscosity * radius * velocity;
    }
    /**
     * Calculate terminal velocity (falling)
     * v_terminal = (2r²ρg)/(9η)
     */
    static terminalVelocity(radius, density, viscosity = this.eta) {
        return (2 * radius * radius * density * this.g) / (9 * viscosity);
    }
    /**
     * Calculate electric field needed to balance gravity
     * E = mg/q
     */
    static balancingField(mass, charge) {
        if (Math.abs(charge) < 1e-30)
            return Infinity;
        return (mass * this.g) / Math.abs(charge);
    }
    /**
     * Calculate charge from balancing condition
     * q = mg/E
     */
    static chargeFromBalance(mass, fieldStrength) {
        if (Math.abs(fieldStrength) < 1e-10)
            return 0;
        return (mass * this.g) / fieldStrength;
    }
    /**
     * Calculate droplet mass from radius
     * m = (4/3)πr³ρ
     */
    static dropletMass(radius, density = 900) {
        const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
        return volume * density;
    }
    /**
     * Calculate radius from terminal velocity
     */
    static radiusFromTerminalVelocity(terminalVelocity, density, viscosity = this.eta) {
        return Math.sqrt((9 * viscosity * terminalVelocity) / (2 * density * this.g));
    }
    /**
     * Check if droplet is in equilibrium
     */
    static isInEquilibrium(mass, charge, fieldStrength, velocity, tolerance = 0.001) {
        const netForce = Math.abs(this.electricForce(charge, fieldStrength) - this.gravitationalForce(mass));
        return Math.abs(velocity) < tolerance && netForce < tolerance;
    }
    /**
     * Calculate net force on droplet
     */
    static netForce(mass, charge, fieldStrength, velocity, radius) {
        const Fg = this.gravitationalForce(mass);
        const Fe = this.electricForce(charge, fieldStrength);
        const Fd = this.dragForce(radius, velocity);
        // Sign convention: positive = upward
        const dragSign = velocity > 0 ? -1 : 1;
        return Fe - Fg + dragSign * Fd;
    }
    /**
     * Predict time to equilibrium
     */
    static timeToEquilibrium(mass, initialVelocity, radius) {
        // Time constant: τ = m/(6πηr)
        const tau = mass / (6 * Math.PI * this.eta * radius);
        // Approximately 5τ to reach equilibrium
        return 5 * tau;
    }
}
ForceBalance.g = 9.81; // Gravitational acceleration
ForceBalance.eta = 1.8e-5; // Viscosity of air (Pa·s)
