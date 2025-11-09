/**
 * Force balance calculations for Millikan oil drop experiment
 */
export declare class ForceBalance {
    private static readonly g;
    private static readonly eta;
    /**
     * Calculate gravitational force
     * F_g = mg
     */
    static gravitationalForce(mass: number): number;
    /**
     * Calculate electric force
     * F_e = qE
     */
    static electricForce(charge: number, fieldStrength: number): number;
    /**
     * Calculate drag force (Stokes' law for sphere)
     * F_d = 6πηrv
     */
    static dragForce(radius: number, velocity: number, viscosity?: number): number;
    /**
     * Calculate terminal velocity (falling)
     * v_terminal = (2r²ρg)/(9η)
     */
    static terminalVelocity(radius: number, density: number, viscosity?: number): number;
    /**
     * Calculate electric field needed to balance gravity
     * E = mg/q
     */
    static balancingField(mass: number, charge: number): number;
    /**
     * Calculate charge from balancing condition
     * q = mg/E
     */
    static chargeFromBalance(mass: number, fieldStrength: number): number;
    /**
     * Calculate droplet mass from radius
     * m = (4/3)πr³ρ
     */
    static dropletMass(radius: number, density?: number): number;
    /**
     * Calculate radius from terminal velocity
     */
    static radiusFromTerminalVelocity(terminalVelocity: number, density: number, viscosity?: number): number;
    /**
     * Check if droplet is in equilibrium
     */
    static isInEquilibrium(mass: number, charge: number, fieldStrength: number, velocity: number, tolerance?: number): boolean;
    /**
     * Calculate net force on droplet
     */
    static netForce(mass: number, charge: number, fieldStrength: number, velocity: number, radius: number): number;
    /**
     * Predict time to equilibrium
     */
    static timeToEquilibrium(mass: number, initialVelocity: number, radius: number): number;
}
//# sourceMappingURL=ForceBalance.d.ts.map