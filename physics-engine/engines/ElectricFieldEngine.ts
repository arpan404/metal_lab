// physics-engine/engines/ElectricFieldEngine.ts
import type { Vector3D, ChargedParticle } from '../types';

export class ElectricFieldEngine {
  private electricField: Vector3D = { x: 0, y: 0, z: 0 };
  private particles: Map<string, ChargedParticle> = new Map();
  
  // Millikan constants
  private readonly k = 8.99e9; // Coulomb constant
  private readonly g = 9.81;   // Gravity
  
  setUniformField(field: Vector3D): void {
    this.electricField = { ...field };
  }
  
  addParticle(id: string, particle: ChargedParticle): void {
    this.particles.set(id, { ...particle });
  }
  
  removeParticle(id: string): void {
    this.particles.delete(id);
  }
  
  getParticle(id: string): ChargedParticle | undefined {
    return this.particles.get(id);
  }
  
  /**
   * Calculate electric force on a particle
   */
  calculateElectricForce(particle: ChargedParticle): Vector3D {
    return {
      x: particle.charge * this.electricField.x,
      y: particle.charge * this.electricField.y,
      z: particle.charge * this.electricField.z
    };
  }
  
  /**
   * Calculate gravitational force
   */
  calculateGravitationalForce(particle: ChargedParticle): Vector3D {
    return {
      x: 0,
      y: -particle.mass * this.g,
      z: 0
    };
  }
  
  /**
   * Calculate net force (electric + gravity + drag)
   */
  calculateNetForce(
    particle: ChargedParticle,
    dragCoefficient: number = 0
  ): Vector3D {
    const Fe = this.calculateElectricForce(particle);
    const Fg = this.calculateGravitationalForce(particle);
    
    // Drag force (Stokes' law for small spheres)
    const v = particle.velocity;
    const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    const Fd = {
      x: -dragCoefficient * v.x,
      y: -dragCoefficient * v.y,
      z: -dragCoefficient * v.z
    };
    
    return {
      x: Fe.x + Fg.x + Fd.x,
      y: Fe.y + Fg.y + Fd.y,
      z: Fe.z + Fg.z + Fd.z
    };
  }
  
  /**
   * Update particle positions (Millikan oil drop)
   */
  step(deltaTime: number): void {
    this.particles.forEach((particle, id) => {
      const netForce = this.calculateNetForce(particle, 6 * Math.PI * 1.8e-5 * particle.radius);
      
      // F = ma => a = F/m
      const acceleration = {
        x: netForce.x / particle.mass,
        y: netForce.y / particle.mass,
        z: netForce.z / particle.mass
      };
      
      // Update velocity
      particle.velocity.x += acceleration.x * deltaTime;
      particle.velocity.y += acceleration.y * deltaTime;
      particle.velocity.z += acceleration.z * deltaTime;
      
      // Update position
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;
      particle.position.z += particle.velocity.z * deltaTime;
      
      this.particles.set(id, particle);
    });
  }
  
  /**
   * Calculate required electric field to balance gravity
   */
  calculateBalancingField(particle: ChargedParticle): number {
    // For equilibrium: qE = mg
    // E = mg/q
    return (particle.mass * this.g) / Math.abs(particle.charge);
  }
  
  getAllParticles(): Map<string, ChargedParticle> {
    return this.particles;
  }
  
  reset(): void {
    this.particles.clear();
    this.electricField = { x: 0, y: 0, z: 0 };
  }
}