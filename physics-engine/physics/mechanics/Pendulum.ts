// physics-engine/physics/mechanics/Pendulum.ts
import type { Vector3D, PendulumParams } from '../../types';

/**
 * Pendulum physics calculations
 */

export class Pendulum {
  /**
   * Calculate period for small oscillations
   * T = 2π√(L/g)
   */
  static period(length: number, g: number = 9.81): number {
    return 2 * Math.PI * Math.sqrt(length / g);
  }
  
  /**
   * Calculate frequency
   * f = 1/T
   */
  static frequency(length: number, g: number = 9.81): number {
    return 1 / this.period(length, g);
  }
  
  /**
   * Calculate angular frequency
   * ω = √(g/L)
   */
  static angularFrequency(length: number, g: number = 9.81): number {
    return Math.sqrt(g / length);
  }
  
  /**
   * Calculate restoring force
   * F = -mg·sin(θ)
   */
  static restoringForce(mass: number, angle: number, g: number = 9.81): number {
    return -mass * g * Math.sin(angle);
  }
  
  /**
   * Calculate tension in string
   * T = mg·cos(θ) + mv²/L
   */
  static tension(
    mass: number,
    length: number,
    angle: number,
    angularVelocity: number,
    g: number = 9.81
  ): number {
    const velocity = angularVelocity * length;
    const centripetalForce = (mass * velocity * velocity) / length;
    const weightComponent = mass * g * Math.cos(angle);
    
    return weightComponent + centripetalForce;
  }
  
  /**
   * Calculate energy
   */
  static totalEnergy(params: PendulumParams, g: number = 9.81): number {
    const kineticEnergy = 0.5 * params.mass * Math.pow(params.angularVelocity * params.length, 2);
    const potentialEnergy = params.mass * g * params.length * (1 - Math.cos(params.angle));
    
    return kineticEnergy + potentialEnergy;
  }
  
  /**
   * Calculate maximum velocity (at bottom of swing)
   */
  static maxVelocity(
    length: number,
    initialAngle: number,
    g: number = 9.81
  ): number {
    // Energy conservation: mgh = (1/2)mv²
    const height = length * (1 - Math.cos(initialAngle));
    return Math.sqrt(2 * g * height);
  }
  
  /**
   * Calculate angular acceleration
   * α = -(g/L)·sin(θ) - damping·ω
   */
  static angularAcceleration(params: PendulumParams, g: number = 9.81): number {
    const { length, angle, angularVelocity, damping = 0 } = params;
    
    const gravityTerm = -(g / length) * Math.sin(angle);
    const dampingTerm = -damping * angularVelocity;
    
    return gravityTerm + dampingTerm;
  }
  
  /**
   * Update pendulum state (Runge-Kutta 4th order)
   */
  static updateState(params: PendulumParams, dt: number, g: number = 9.81): PendulumParams {
    const { angle, angularVelocity } = params;
    
    // RK4 integration
    const k1_theta = angularVelocity;
    const k1_omega = this.angularAcceleration(params, g);
    
    const k2_theta = angularVelocity + 0.5 * dt * k1_omega;
    const k2_omega = this.angularAcceleration(
      { ...params, angle: angle + 0.5 * dt * k1_theta, angularVelocity: k2_theta },
      g
    );
    
    const k3_theta = angularVelocity + 0.5 * dt * k2_omega;
    const k3_omega = this.angularAcceleration(
      { ...params, angle: angle + 0.5 * dt * k2_theta, angularVelocity: k3_theta },
      g
    );
    
    const k4_theta = angularVelocity + dt * k3_omega;
    const k4_omega = this.angularAcceleration(
      { ...params, angle: angle + dt * k3_theta, angularVelocity: k4_theta },
      g
    );
    
    const newAngle = angle + (dt / 6) * (k1_theta + 2 * k2_theta + 2 * k3_theta + k4_theta);
    const newAngularVelocity = angularVelocity + (dt / 6) * (k1_omega + 2 * k2_omega + 2 * k3_omega + k4_omega);
    
    return {
      ...params,
      angle: newAngle,
      angularVelocity: newAngularVelocity
    };
  }
  
  /**
   * Calculate bob position
   */
  static bobPosition(length: number, angle: number): Vector3D {
    return {
      x: length * Math.sin(angle),
      y: -length * Math.cos(angle),
      z: 0
    };
  }
  
  /**
   * Calculate bob velocity
   */
  static bobVelocity(length: number, angle: number, angularVelocity: number): Vector3D {
    return {
      x: length * angularVelocity * Math.cos(angle),
      y: length * angularVelocity * Math.sin(angle),
      z: 0
    };
  }
}