// physics-engine/physics/mechanics/CircularMotion.ts
import type { Vector3D, CircularMotionParams } from '../../types';

/**
 * Circular motion calculations
 */

export class CircularMotion {
  /**
   * Calculate centripetal acceleration
   * a_c = v²/r
   */
  static centripetalAcceleration(velocity: number, radius: number): number {
    return (velocity * velocity) / radius;
  }
  
  /**
   * Calculate centripetal force
   * F_c = mv²/r
   */
  static centripetalForce(mass: number, velocity: number, radius: number): number {
    return mass * this.centripetalAcceleration(velocity, radius);
  }
  
  /**
   * Calculate angular velocity
   * ω = v/r
   */
  static angularVelocity(velocity: number, radius: number): number {
    return velocity / radius;
  }
  
  /**
   * Calculate period of circular motion
   * T = 2πr/v
   */
  static period(velocity: number, radius: number): number {
    return (2 * Math.PI * radius) / velocity;
  }
  
  /**
   * Calculate optimal banking speed (no friction needed)
   * v = √(gr·tan(θ))
   */
  static optimalBankingSpeed(
    radius: number,
    bankAngle: number,
    g: number = 9.81
  ): number {
    return Math.sqrt(g * radius * Math.tan(bankAngle));
  }
  
  /**
   * Calculate required friction force for banked turn
   */
  static requiredFriction(params: CircularMotionParams): number {
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
  static normalForce(
    mass: number,
    velocity: number,
    radius: number,
    bankAngle: number,
    g: number = 9.81
  ): number {
    const centripetalAcc = this.centripetalAcceleration(velocity, radius);
    
    // N·cos(θ) = mg + F_friction·sin(θ)
    // N·sin(θ) = mv²/r + F_friction·cos(θ)
    
    // Simplified for no friction:
    return (mass * g) / Math.cos(bankAngle);
  }
  
  /**
   * Check if car can stay on track
   */
  static canStayOnTrack(params: CircularMotionParams): boolean {
    const frictionNeeded = this.requiredFriction(params);
    const maxFriction = params.mass * 9.81 * (params.frictionCoefficient ?? 0);
    
    return frictionNeeded <= maxFriction;
  }
  
  /**
   * Calculate position on circular path
   */
  static positionOnPath(
    radius: number,
    angle: number,
    center: Vector3D = { x: 0, y: 0, z: 0 }
  ): Vector3D {
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y,
      z: center.z + radius * Math.sin(angle)
    };
  }
  
  /**
   * Calculate velocity vector (tangent to circle)
   */
  static velocityVector(
    velocity: number,
    angle: number
  ): Vector3D {
    return {
      x: -velocity * Math.sin(angle),
      y: 0,
      z: velocity * Math.cos(angle)
    };
  }
  
  /**
   * Calculate centripetal acceleration vector (toward center)
   */
  static centripetalVector(
    velocity: number,
    radius: number,
    angle: number
  ): Vector3D {
    const ac = this.centripetalAcceleration(velocity, radius);
    
    return {
      x: -ac * Math.cos(angle),
      y: 0,
      z: -ac * Math.sin(angle)
    };
  }
}