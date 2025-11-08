// physics-engine/physics/electromagnetism/ChargedParticle.ts
import type { Vector3D, ChargedParticleParams } from '../../types';
import { vectorAdd, vectorScale } from '../../utils/math';

/**
 * Charged particle motion in electric and magnetic fields
 */

export class ChargedParticleMotion {
  /**
   * Calculate Lorentz force
   * F = q(E + v × B)
   */
  static lorentzForce(
    charge: number,
    electricField: Vector3D,
    velocity: Vector3D,
    magneticField: Vector3D
  ): Vector3D {
    // Electric force
    const Fe = vectorScale(electricField, charge);
    
    // Magnetic force: q(v × B)
    const vCrossB: Vector3D = {
      x: velocity.y * magneticField.z - velocity.z * magneticField.y,
      y: velocity.z * magneticField.x - velocity.x * magneticField.z,
      z: velocity.x * magneticField.y - velocity.y * magneticField.x
    };
    const Fm = vectorScale(vCrossB, charge);
    
    return vectorAdd(Fe, Fm);
  }
  
  /**
   * Calculate acceleration
   */
  static acceleration(
    params: ChargedParticleParams,
    electricField: Vector3D,
    magneticField: Vector3D = { x: 0, y: 0, z: 0 }
  ): Vector3D {
    const force = this.lorentzForce(
      params.charge,
      electricField,
      params.velocity,
      magneticField
    );
    
    return vectorScale(force, 1 / params.mass);
  }
  
  /**
   * Update particle state (using Euler method)
   */
  static updateState(
    params: ChargedParticleParams,
    electricField: Vector3D,
    magneticField: Vector3D,
    dt: number
  ): ChargedParticleParams {
    const acc = this.acceleration(params, electricField, magneticField);
    
    // Update velocity
    const newVelocity: Vector3D = {
      x: params.velocity.x + acc.x * dt,
      y: params.velocity.y + acc.y * dt,
      z: params.velocity.z + acc.z * dt
    };
    
    // Update position
    const newPosition: Vector3D = {
      x: params.position.x + newVelocity.x * dt,
      y: params.position.y + newVelocity.y * dt,
      z: params.position.z + newVelocity.z * dt
    };
    
    return {
      ...params,
      position: newPosition,
      velocity: newVelocity
    };
  }
  
  /**
   * Calculate cyclotron frequency
   * ω = qB/m
   */
  static cyclotronFrequency(
    charge: number,
    mass: number,
    magneticField: number
  ): number {
    return (charge * magneticField) / mass;
  }
  
  /**
   * Calculate cyclotron radius
   * r = mv/(qB)
   */
  static cyclotronRadius(
    mass: number,
    velocity: number,
    charge: number,
    magneticField: number
  ): number {
    if (Math.abs(charge * magneticField) < 1e-10) return Infinity;
    return (mass * velocity) / (charge * magneticField);
  }
  
  /**
   * Calculate drift velocity in crossed E and B fields
   * v_d = (E × B)/B²
   */
  static driftVelocity(
    electricField: Vector3D,
    magneticField: Vector3D
  ): Vector3D {
    const ECrossB: Vector3D = {
      x: electricField.y * magneticField.z - electricField.z * magneticField.y,
      y: electricField.z * magneticField.x - electricField.x * magneticField.z,
      z: electricField.x * magneticField.y - electricField.y * magneticField.x
    };
    
    const BSquared = 
      magneticField.x * magneticField.x +
      magneticField.y * magneticField.y +
      magneticField.z * magneticField.z;
    
    if (BSquared < 1e-10) return { x: 0, y: 0, z: 0 };
    
    return vectorScale(ECrossB, 1 / BSquared);
  }
  
  /**
   * Kinetic energy of charged particle
   */
  static kineticEnergy(params: ChargedParticleParams): number {
    const vSquared =
      params.velocity.x * params.velocity.x +
      params.velocity.y * params.velocity.y +
      params.velocity.z * params.velocity.z;
    
    return 0.5 * params.mass * vSquared;
  }
  
  /**
   * Calculate stopping potential
   * V = (1/2)mv²/q
   */
  static stoppingPotential(mass: number, velocity: number, charge: number): number {
    return (0.5 * mass * velocity * velocity) / charge;
  }
}