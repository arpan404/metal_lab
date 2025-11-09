// physics-engine/physics/mechanics/Kinematics.ts
import type { Vector3D } from '../../types';

/**
 * General kinematic equations and motion calculations
 */

export class Kinematics {
  /**
   * Position with constant acceleration
   * x = x₀ + v₀t + (1/2)at²
   */
  static position(
    initialPosition: number,
    initialVelocity: number,
    acceleration: number,
    time: number
  ): number {
    return initialPosition + initialVelocity * time + 0.5 * acceleration * time * time;
  }
  
  /**
   * Velocity with constant acceleration
   * v = v₀ + at
   */
  static velocity(
    initialVelocity: number,
    acceleration: number,
    time: number
  ): number {
    return initialVelocity + acceleration * time;
  }
  
  /**
   * Final velocity from distance and acceleration
   * v² = v₀² + 2aΔx
   */
  static finalVelocity(
    initialVelocity: number,
    acceleration: number,
    distance: number
  ): number {
    const vSquared = initialVelocity * initialVelocity + 2 * acceleration * distance;
    return Math.sqrt(Math.max(0, vSquared));
  }
  
  /**
   * Time to reach final velocity
   * t = (v - v₀)/a
   */
  static timeToVelocity(
    initialVelocity: number,
    finalVelocity: number,
    acceleration: number
  ): number {
    if (Math.abs(acceleration) < 1e-10) return Infinity;
    return (finalVelocity - initialVelocity) / acceleration;
  }
  
  /**
   * Projectile motion - position
   */
  static projectilePosition(
    initialPosition: Vector3D,
    initialVelocity: Vector3D,
    time: number,
    g: number = 9.81
  ): Vector3D {
    return {
      x: initialPosition.x + initialVelocity.x * time,
      y: initialPosition.y + initialVelocity.y * time - 0.5 * g * time * time,
      z: initialPosition.z + initialVelocity.z * time
    };
  }
  
  /**
   * Projectile motion - velocity
   */
  static projectileVelocity(
    initialVelocity: Vector3D,
    time: number,
    g: number = 9.81
  ): Vector3D {
    return {
      x: initialVelocity.x,
      y: initialVelocity.y - g * time,
      z: initialVelocity.z
    };
  }
  
  /**
   * Maximum height of projectile
   */
  static maxHeight(initialVelocityY: number, g: number = 9.81): number {
    return (initialVelocityY * initialVelocityY) / (2 * g);
  }
  
  /**
   * Range of projectile
   */
  static range(
    initialVelocity: number,
    angle: number,
    g: number = 9.81
  ): number {
    return (initialVelocity * initialVelocity * Math.sin(2 * angle)) / g;
  }
  
  /**
   * Time of flight
   */
  static timeOfFlight(
    initialVelocityY: number,
    initialHeight: number = 0,
    g: number = 9.81
  ): number {
    // Solve: h + v₀t - (1/2)gt² = 0
    const a = -0.5 * g;
    const b = initialVelocityY;
    const c = initialHeight;
    
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return 0;
    
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    
    return Math.max(t1, t2);
  }
  
  /**
   * Average velocity
   */
  static averageVelocity(displacement: number, time: number): number {
    return displacement / time;
  }
  
  /**
   * Average acceleration
   */
  static averageAcceleration(
    initialVelocity: number,
    finalVelocity: number,
    time: number
  ): number {
    return (finalVelocity - initialVelocity) / time;
  }
  
  /**
   * Distance traveled (total path length)
   */
  static distanceTraveled(velocityFunction: (t: number) => number, duration: number, steps: number = 1000): number {
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