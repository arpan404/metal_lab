// physics-engine/physics/mechanics/Forces.ts
import type { Vector3D } from '../../types';
import { vectorAdd, vectorScale, vectorMagnitude } from '../../utils/math';

/**
 * Force calculations
 */

export class Forces {
  /**
   * Calculate gravitational force
   * F = mg
   */
  static gravity(mass: number, g: number = 9.81): number {
    return mass * g;
  }
  
  /**
   * Calculate gravitational force vector (downward)
   */
  static gravityVector(mass: number, g: number = 9.81): Vector3D {
    return {
      x: 0,
      y: -mass * g,
      z: 0
    };
  }
  
  /**
   * Calculate normal force on horizontal surface
   */
  static normalForce(mass: number, g: number = 9.81): number {
    return mass * g;
  }
  
  /**
   * Calculate friction force
   * F_f = μN
   */
  static friction(normalForce: number, coefficient: number): number {
    return coefficient * normalForce;
  }
  
  /**
   * Calculate drag force (air resistance)
   * F_d = (1/2)ρv²AC_d
   */
  static drag(
    velocity: number,
    density: number = 1.225, // air at sea level
    area: number = 1,
    dragCoefficient: number = 0.47 // sphere
  ): number {
    return 0.5 * density * velocity * velocity * area * dragCoefficient;
  }
  
  /**
   * Calculate drag force vector (opposite to velocity)
   */
  static dragVector(
    velocity: Vector3D,
    density: number = 1.225,
    area: number = 1,
    dragCoefficient: number = 0.47
  ): Vector3D {
    const speed = vectorMagnitude(velocity);
    if (speed === 0) return { x: 0, y: 0, z: 0 };
    
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
  static spring(displacement: number, springConstant: number): number {
    return -springConstant * displacement;
  }
  
  /**
   * Calculate tension force in rope/string
   */
  static tension(
    mass: number,
    acceleration: number,
    angle: number = 0,
    g: number = 9.81
  ): number {
    // T - mg·cos(θ) = ma
    return mass * (g * Math.cos(angle) + acceleration);
  }
  
  /**
   * Net force from multiple forces
   */
  static netForce(forces: Vector3D[]): Vector3D {
    return forces.reduce((sum, force) => vectorAdd(sum, force), { x: 0, y: 0, z: 0 });
  }
  
  /**
   * Calculate acceleration from net force
   * a = F/m
   */
  static acceleration(netForce: Vector3D, mass: number): Vector3D {
    return vectorScale(netForce, 1 / mass);
  }
  
  /**
   * Resolve force into components
   */
  static resolveForce(magnitude: number, angle: number): { parallel: number; perpendicular: number } {
    return {
      parallel: magnitude * Math.cos(angle),
      perpendicular: magnitude * Math.sin(angle)
    };
  }
  
  /**
   * Calculate buoyant force (Archimedes)
   * F_b = ρVg
   */
  static buoyancy(
    fluidDensity: number,
    volume: number,
    g: number = 9.81
  ): number {
    return fluidDensity * volume * g;
  }
  
  /**
   * Check if object floats
   */
  static willFloat(objectDensity: number, fluidDensity: number): boolean {
    return objectDensity < fluidDensity;
  }
}