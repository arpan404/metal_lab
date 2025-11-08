// physics-engine/experiments/RutherfordGoldFoil.ts
import { BaseExperiment } from './BaseExperiment';
import { ClassicalEngine } from '../engines/ClassicalEngine';
import type { 
  ExperimentState, 
  ParameterConfig, 
  LearningObjective,
  ExplanationPoint 
} from '../types';

export class RutherfordGoldFoil extends BaseExperiment {
  private classicalEngine: ClassicalEngine;
  private particles: AlphaParticle[] = [];
  private scatteredCount: Record<number, number> = {};
  private totalParticles: number = 0;
  private detectorAngles: number[] = [15, 30, 45, 60, 75, 90, 120, 150, 180];
  
  constructor() {
    const parameters: ParameterConfig[] = [
      {
        name: 'alphaEnergy',
        label: 'Alpha Energy',
        default: 5.3,
        min: 1.0,
        max: 10.0,
        step: 0.1,
        unit: 'MeV',
        description: 'Kinetic energy of alpha particles'
      },
      {
        name: 'nucleusCharge',
        label: 'Nucleus Charge',
        default: 79,
        min: 20,
        max: 92,
        step: 1,
        unit: 'e',
        description: 'Atomic number of target nucleus (79=Gold)'
      },
      {
        name: 'foilThickness',
        label: 'Foil Thickness',
        default: 3,
        min: 1,
        max: 10,
        step: 1,
        unit: 'layers',
        description: 'Number of atomic layers in foil'
      },
      {
        name: 'beamIntensity',
        label: 'Beam Intensity',
        default: 100,
        min: 10,
        max: 1000,
        step: 10,
        unit: 'particles/s',
        description: 'Alpha particle emission rate'
      },
      {
        name: 'impactParameter',
        label: 'Impact Parameter',
        default: 0,
        min: -100,
        max: 100,
        step: 1,
        unit: 'fm',
        description: 'Targeting offset from nucleus center'
      }
    ];
    
    const objectives: LearningObjective[] = [
      {
        id: 'observe_scattering',
        name: 'Observe Scattering',
        description: 'Watch alpha particles scatter from gold nuclei',
        criteria: {
          type: 'measurement',
          key: 'totalParticles',
          target: 100,
          tolerance: 10
        },
        hint: 'Let the simulation run to see particle trajectories',
        points: 10
      },
      {
        id: 'backward_scattering',
        name: 'Backward Scattering',
        description: 'Observe particles scattered at angles > 90°',
        criteria: {
          type: 'measurement',
          key: 'backscattered',
          target: 5,
          tolerance: 2
        },
        hint: 'Watch for particles bouncing back',
        points: 20
      },
      {
        id: 'energy_dependence',
        name: 'Energy Dependence',
        description: 'See how alpha energy affects scattering',
        criteria: {
          type: 'parameter_exploration',
          parameter: 'alphaEnergy',
          minChanges: 3
        },
        hint: 'Try different alpha particle energies',
        points: 15
      },
      {
        id: 'nuclear_size',
        name: 'Nuclear Size',
        description: 'Understand the tiny size of the nucleus',
        criteria: {
          type: 'custom',
          customCheck: (state) => {
            const data = state.customData as any;
            return data?.directHits > 0 && data?.totalParticles > 1000;
          }
        },
        hint: 'Most particles pass straight through',
        points: 25
      }
    ];
    
    super(
      'Rutherford Gold Foil',
      'Discover the atomic nucleus through alpha particle scattering',
      parameters,
      objectives
    );
    
    this.classicalEngine = new ClassicalEngine();
    this.initializeDetectors();
  }
  
  private initializeDetectors(): void {
    this.detectorAngles.forEach(angle => {
      this.scatteredCount[angle] = 0;
    });
  }
  
  async initialize(): Promise<void> {
    // Set up the scattering environment
    this.classicalEngine.setGravity({ x: 0, y: 0, z: 0 }); // No gravity in atomic physics
    this.reset();
  }
  
  update(deltaTime: number): void {
    this.elapsedTime += deltaTime;
    this.frameCount++;
    
    // Emit new alpha particles
    this.emitAlphaParticles(deltaTime);
    
    // Update particle trajectories
    this.updateParticles(deltaTime);
    
    // Clean up particles that have left the interaction zone
    this.cleanupParticles();
    
    // Update physics engine
    this.classicalEngine.step(deltaTime);
  }
  
  private emitAlphaParticles(deltaTime: number): void {
    const beamIntensity = this.getParameter('beamIntensity');
    const particlesToEmit = Math.floor(beamIntensity * deltaTime);
    
    for (let i = 0; i < particlesToEmit; i++) {
      const particle = this.createAlphaParticle();
      this.particles.push(particle);
      this.totalParticles++;
    }
  }
  
  private createAlphaParticle(): AlphaParticle {
    const energy = this.getParameter('alphaEnergy');
    const impactParam = this.getParameter('impactParameter');
    
    // Convert MeV to joules
    const energyJ = energy * 1.602e-13;
    
    // Alpha particle mass (4 amu)
    const mass = 6.644e-27; // kg
    
    // Calculate velocity from kinetic energy
    const velocity = Math.sqrt(2 * energyJ / mass);
    
    // Random impact parameter within beam width
    const b = impactParam + (Math.random() - 0.5) * 50; // fm
    
    return {
      id: `alpha_${Date.now()}_${Math.random()}`,
      position: { x: -1000, y: b, z: 0 }, // Start 1000 fm away
      velocity: { x: velocity, y: 0, z: 0 },
      energy,
      scattered: false,
      scatteringAngle: 0,
      trajectory: []
    };
  }
  
  private updateParticles(deltaTime: number): void {
    const nucleusCharge = this.getParameter('nucleusCharge');
    const alphaCharge = 2; // Alpha particle has +2e charge
    
    // Coulomb constant
    const k = 8.99e9; // N⋅m²/C²
    const e = 1.602e-19; // Elementary charge in coulombs
    
    this.particles.forEach(particle => {
      if (particle.scattered) return;
      
      // Calculate distance from nucleus (at origin)
      const r = Math.sqrt(
        particle.position.x ** 2 + 
        particle.position.y ** 2 + 
        particle.position.z ** 2
      );
      
      // Coulomb force: F = k * q1 * q2 / r²
      const forceMagnitude = k * (alphaCharge * e) * (nucleusCharge * e) / (r * r);
      
      // Force direction (repulsive, away from nucleus)
      const forceDirection = {
        x: particle.position.x / r,
        y: particle.position.y / r,
        z: particle.position.z / r
      };
      
      // Apply force (F = ma)
      const mass = 6.644e-27; // Alpha particle mass
      const acceleration = {
        x: (forceMagnitude * forceDirection.x) / mass,
        y: (forceMagnitude * forceDirection.y) / mass,
        z: (forceMagnitude * forceDirection.z) / mass
      };
      
      // Update velocity
      particle.velocity.x += acceleration.x * deltaTime;
      particle.velocity.y += acceleration.y * deltaTime;
      particle.velocity.z += acceleration.z * deltaTime;
      
      // Update position
      particle.position.x += particle.velocity.x * deltaTime * 1e15; // Convert to fm
      particle.position.y += particle.velocity.y * deltaTime * 1e15;
      particle.position.z += particle.velocity.z * deltaTime * 1e15;
      
      // Record trajectory
      particle.trajectory.push({ ...particle.position });
      
      // Check if particle has been scattered (passed the nucleus)
      if (particle.position.x > 0 && !particle.scattered) {
        this.recordScattering(particle);
      }
    });
  }
  
  private recordScattering(particle: AlphaParticle): void {
    particle.scattered = true;
    
    // Calculate scattering angle
    const vx = particle.velocity.x;
    const vy = particle.velocity.y;
    const angle = Math.atan2(vy, vx) * 180 / Math.PI;
    
    particle.scatteringAngle = Math.abs(angle);
    
    // Record in nearest detector
    const nearestDetector = this.detectorAngles.reduce((prev, curr) => 
      Math.abs(curr - particle.scatteringAngle) < Math.abs(prev - particle.scatteringAngle) 
        ? curr : prev
    );
    
    this.scatteredCount[nearestDetector]++;
  }
  
  private cleanupParticles(): void {
    // Remove particles that have moved far away
    this.particles = this.particles.filter(particle => {
      const distance = Math.sqrt(
        particle.position.x ** 2 + 
        particle.position.y ** 2 + 
        particle.position.z ** 2
      );
      return distance < 2000; // Keep within 2000 fm
    });
  }
  
  private calculateRutherfordFormula(angle: number): number {
    // Theoretical Rutherford scattering formula
    const Z = this.getParameter('nucleusCharge');
    const E = this.getParameter('alphaEnergy');
    const theta = angle * Math.PI / 180;
    
    // Simplified formula (relative probability)
    return Math.pow(Z / (2 * E * Math.sin(theta / 2)), 2);
  }
  
  reset(): void {
    this.elapsedTime = 0;
    this.frameCount = 0;
    this.particles = [];
    this.totalParticles = 0;
    this.initializeDetectors();
    this.startTime = Date.now();
    this.classicalEngine.reset();
  }
  
  getState(): ExperimentState {
    const backscattered = Object.entries(this.scatteredCount)
      .filter(([angle]) => parseInt(angle) > 90)
      .reduce((sum, [, count]) => sum + count, 0);
    
    return {
      name: this.name,
      elapsedTime: this.elapsedTime,
      frameCount: this.frameCount,
      parameters: Array.from(this.parameters.entries()),
      measurements: this.getMeasurements(),
      customData: {
        particles: this.particles.length,
        totalParticles: this.totalParticles,
        scatteredCount: { ...this.scatteredCount },
        backscattered,
        directHits: this.particles.filter(p => 
          p.scattered && Math.abs(p.scatteringAngle - 180) < 10
        ).length
      }
    };
  }
  
  setState(state: ExperimentState): void {
    this.elapsedTime = state.elapsedTime;
    this.frameCount = state.frameCount;
    
    state.parameters.forEach(([key, value]) => {
      this.parameters.set(key, value);
    });
    
    if (state.customData) {
      this.totalParticles = state.customData.totalParticles || 0;
      this.scatteredCount = state.customData.scatteredCount || {};
    }
  }
  
  getExplanationPoints(): ExplanationPoint[] {
    return [
      {
        id: 'most_pass_through',
        type: 'concept',
        condition: 'totalParticles > 100 && backscattered < 5',
        message: 'Notice how most alpha particles pass straight through! This tells us the atom is mostly empty space.',
        priority: 'high',
        audioRequired: true,
        pauseSimulation: false
      },
      {
        id: 'backward_bounce',
        type: 'milestone',
        condition: 'backscattered > 0',
        message: 'Amazing! Some particles bounced backward! This was Rutherford\'s key discovery - there must be something very small and dense at the atom\'s center.',
        priority: 'high',
        audioRequired: true,
        pauseSimulation: true,
        highlight: ['detector_180']
      },
      {
        id: 'energy_effect',
        type: 'concept',
        condition: 'alphaEnergy_changes > 0',
        message: 'Higher energy particles are deflected less because they have more momentum to overcome the Coulomb repulsion.',
        priority: 'medium',
        audioRequired: true,
        pauseSimulation: false
      }
    ];
  }
  
  getMeasurements(): Record<string, number> {
    const backscattered = Object.entries(this.scatteredCount)
      .filter(([angle]) => parseInt(angle) > 90)
      .reduce((sum, [, count]) => sum + count, 0);
    
    const directHits = this.particles.filter(p => 
      p.scattered && Math.abs(p.scatteringAngle - 180) < 10
    ).length;
    
    return {
      elapsedTime: this.elapsedTime,
      totalParticles: this.totalParticles,
      backscattered,
      directHits,
      alphaEnergy_changes: this.parameters.get('alphaEnergy') !== 5.3 ? 1 : 0,
      nucleusCharge_changes: this.parameters.get('nucleusCharge') !== 79 ? 1 : 0,
      scatteringRate: this.totalParticles > 0 
        ? Object.values(this.scatteredCount).reduce((a, b) => a + b, 0) / this.totalParticles 
        : 0
    };
  }
}

interface AlphaParticle {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  energy: number;
  scattered: boolean;
  scatteringAngle: number;
  trajectory: { x: number; y: number; z: number }[];
}