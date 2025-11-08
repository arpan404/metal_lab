// physics-engine/engines/RotationalEngine.ts
import type { Vector3D } from '../types';

export class RotationalEngine {
  private angularVelocity: Vector3D = { x: 0, y: 0, z: 0 };
  private latitude: number = 0; // in radians
  
  /**
   * Set Earth's rotation (for Foucault pendulum)
   */
  setEarthRotation(latitude: number): void {
    this.latitude = latitude;
    
    // Earth's angular velocity: 2π/24 hours = 7.27e-5 rad/s
    const earthOmega = 7.27e-5;
    
    this.angularVelocity = {
      x: earthOmega * Math.cos(latitude),
      y: earthOmega * Math.sin(latitude),
      z: 0
    };
  }
  
  /**
   * Calculate Coriolis force: Fc = -2m(ω × v)
   */
  calculateCoriolisForce(
    mass: number,
    velocity: Vector3D
  ): Vector3D {
    const omega = this.angularVelocity;
    
    // Cross product: ω × v
    const cross = {
      x: omega.y * velocity.z - omega.z * velocity.y,
      y: omega.z * velocity.x - omega.x * velocity.z,
      z: omega.x * velocity.y - omega.y * velocity.x
    };
    
    // Multiply by -2m
    return {
      x: -2 * mass * cross.x,
      y: -2 * mass * cross.y,
      z: -2 * mass * cross.z
    };
  }
  
  /**
   * Calculate centrifugal force: Fcf = -m(ω × (ω × r))
   */
  calculateCentrifugalForce(
    mass: number,
    position: Vector3D
  ): Vector3D {
    const omega = this.angularVelocity;
    
    // First cross product: ω × r
    const cross1 = {
      x: omega.y * position.z - omega.z * position.y,
      y: omega.z * position.x - omega.x * position.z,
      z: omega.x * position.y - omega.y * position.x
    };
    
    // Second cross product: ω × (ω × r)
    const cross2 = {
      x: omega.y * cross1.z - omega.z * cross1.y,
      y: omega.z * cross1.x - omega.x * cross1.z,
      z: omega.x * cross1.y - omega.y * cross1.x
    };
    
    // Multiply by -m
    return {
      x: -mass * cross2.x,
      y: -mass * cross2.y,
      z: -mass * cross2.z
    };
  }
  
  /**
   * Get rotation rate at current latitude
   */
  getRotationRate(): number {
    const earthOmega = 7.27e-5;
    return earthOmega * Math.sin(this.latitude);
  }
  
  /**
   * Get precession period (Foucault pendulum)
   * T = 24 hours / sin(latitude)
   */
  getPrecessionPeriod(): number {
    const dayInSeconds = 24 * 3600;
    return dayInSeconds / Math.sin(this.latitude);
  }
  
  getLatitude(): number {
    return this.latitude;
  }
  
  getAngularVelocity(): Vector3D {
    return { ...this.angularVelocity };
  }
}