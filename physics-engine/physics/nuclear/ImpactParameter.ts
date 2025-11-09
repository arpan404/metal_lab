// physics-engine/physics/nuclear/ImpactParameter.ts

/**
 * Impact parameter calculations for scattering
 */

export class ImpactParameter {
    private static readonly k = 8.99e9; // Coulomb constant
    private static readonly e = 1.602176634e-19; // Elementary charge
    
    /**
     * Calculate impact parameter for given scattering angle
     * b = (kZ₁Z₂e²/2E)·cot(θ/2)
     */
    static fromAngle(
      energy: number,
      charge1: number,
      charge2: number,
      angle: number
    ): number {
      const numerator = this.k * charge1 * charge2 * this.e * this.e;
      const denominator = 2 * energy * this.e; // Convert eV to Joules
      
      const cotHalfAngle = 1 / Math.tan(angle / 2);
      return (numerator / denominator) * cotHalfAngle;
    }
    
    /**
     * Calculate scattering angle from impact parameter
     * θ = 2·arctan(kZ₁Z₂e²/2Eb)
     */
    static toAngle(
      energy: number,
      charge1: number,
      charge2: number,
      impactParameter: number
    ): number {
      if (impactParameter === 0) return Math.PI; // Head-on collision
      
      const numerator = this.k * charge1 * charge2 * this.e * this.e;
      const denominator = 2 * energy * this.e * impactParameter;
      
      return 2 * Math.atan(numerator / denominator);
    }
    
    /**
     * Calculate maximum impact parameter for given minimum angle
     * Particles with b > b_max scatter less than θ_min
     */
    static maximum(
      energy: number,
      charge1: number,
      charge2: number,
      minAngle: number
    ): number {
      return this.fromAngle(energy, charge1, charge2, minAngle);
    }
    
    /**
     * Generate random impact parameter (uniform distribution)
     */
    static random(maxImpactParameter: number): number {
      return Math.random() * maxImpactParameter;
    }
    
    /**
     * Generate random impact parameter (weighted by cross-section)
     */
    static randomWeighted(maxImpactParameter: number): number {
      // Probability ∝ 2πb·db, so P(b) = b/b_max²
      // Inverse CDF: b = b_max·√(random)
      return maxImpactParameter * Math.sqrt(Math.random());
    }
    
    /**
     * Calculate differential cross section element
     * dσ = 2πb·db
     */
    static crossSectionElement(impactParameter: number, db: number): number {
      return 2 * Math.PI * impactParameter * db;
    }
    
    /**
     * Calculate number of particles in impact parameter range
     */
    static particlesInRange(
      totalParticles: number,
      beamRadius: number,
      bMin: number,
      bMax: number
    ): number {
      if (beamRadius === 0) return 0;
      
      const areaRing = Math.PI * (bMax * bMax - bMin * bMin);
      const totalArea = Math.PI * beamRadius * beamRadius;
      
      return totalParticles * (areaRing / totalArea);
    }
    
    /**
     * Calculate average impact parameter for random distribution
     */
    static average(maxImpactParameter: number): number {
      // For uniform distribution over circle: ⟨b⟩ = (2/3)b_max
      return (2 / 3) * maxImpactParameter;
    }
    
    /**
     * Calculate most probable scattering angle
     * (corresponds to most particles per solid angle)
     */
    static mostProbableAngle(
      energy: number,
      charge1: number,
      charge2: number,
      maxImpactParameter: number
    ): number {
      // Most particles have b ≈ b_max, giving minimum scattering
      return this.toAngle(energy, charge1, charge2, maxImpactParameter);
    }
    
    /**
     * Calculate solid angle corresponding to impact parameter range
     */
    static solidAngle(
      energy: number,
      charge1: number,
      charge2: number,
      bMin: number,
      bMax: number
    ): number {
      const thetaMin = this.toAngle(energy, charge1, charge2, bMax);
      const thetaMax = this.toAngle(energy, charge1, charge2, bMin);
      
      // dΩ = 2π(cos(θ_min) - cos(θ_max))
      return 2 * Math.PI * (Math.cos(thetaMin) - Math.cos(thetaMax));
    }
  }