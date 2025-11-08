// physics-engine/physics/electromagnetism/ForceBalance.ts
import type { Vector3D } from '../../types';

/**
 * Force balance calculations for Millikan oil drop experiment
 */

export class ForceBalance {
  private static readonly g = 9.81; // Gravitational acceleration
  private static readonly eta = 1.8e-5; // Viscosity of air (Pa·s)
  
  /**
   * Calculate gravitational force
   * F_g = mg
   */
  static gravitationalForce(mass: number): number {
    return mass * this.g;
  }
  
  /**
   * Calculate electric force
   * F_e = qE
   */
  static electricForce(charge: number, fieldStrength: number): number {
    return charge * fieldStrength;
  }
  
  /**
   * Calculate drag force (Stokes' law for sphere)
   * F_d = 6πηrv
   */
  static dragForce(radius: number, velocity: number, viscosity: number = this.eta): number {
    return 6 * Math.PI * viscosity * radius * velocity;
  }
  
  /**
   * Calculate terminal velocity (falling)
   * v_terminal = (2r²ρg)/(9η)
   */
  static terminalVelocity(
    radius: number,
    density: number,
    viscosity: number = this.eta
  ): number {
    return (2 * radius * radius * density * this.g) / (9 * viscosity);
  }
  
  /**
   * Calculate electric field needed to balance gravity
   * E = mg/q
   */
  static balancingField(mass: number, charge: number): number {
    if (Math.abs(charge) < 1e-30) return Infinity;
    return (mass * this.g) / Math.abs(charge);
  }
  
  /**
   * Calculate charge from balancing condition
   * q = mg/E
   */
  static chargeFromBalance(mass: number, fieldStrength: number): number {
    if (Math.abs(fieldStrength) < 1e-10) return 0;
    return (mass * this.g) / fieldStrength;
  }
  
  /**
   * Calculate droplet mass from radius
   * m = (4/3)πr³ρ
   */
  static dropletMass(radius: number, density: number = 900): number {
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    return volume * density;
  }
  
  /**
   * Calculate radius from terminal velocity
   */
  static radiusFromTerminalVelocity(
    terminalVelocity: number,
    density: number,
    viscosity: number = this.eta
  ): number {
    return Math.sqrt((9 * viscosity * terminalVelocity) / (2 * density * this.g));
  }
  
  /**
   * Check if droplet is in equilibrium
   */
  static isInEquilibrium(
    mass: number,
    charge: number,
    fieldStrength: number,
    velocity: number,
    tolerance: number = 0.001
  ): boolean {
    const netForce = Math.abs(
      this.electricForce(charge, fieldStrength) - this.gravitationalForce(mass)
    );
    
    return Math.abs(velocity) < tolerance && netForce < tolerance;
  }
  
  /**
   * Calculate net force on droplet
   */
  static netForce(
    mass: number,
    charge: number,
    fieldStrength: number,
    velocity: number,
    radius: number
  ): number {
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
  static timeToEquilibrium(
    mass: number,
    initialVelocity: number,
    radius: number
  ): number {
    // Time constant: τ = m/(6πηr)
    const tau = mass / (6 * Math.PI * this.eta * radius);
    
    // Approximately 5τ to reach equilibrium
    return 5 * tau;
  }
}