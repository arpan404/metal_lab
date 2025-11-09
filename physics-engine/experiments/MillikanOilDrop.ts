// physics-engine/experiments/MillikanOilDrop.ts
import { BaseExperiment } from './BaseExperiment';
import { ElectricFieldEngine } from '../engines/ElectricFieldEngine';
import type {
  ExperimentState,
  ExplanationPoint
} from '../types/Experiments';

import type { ParameterConfig, LearningObjective, ChargedParticle } from '../types/index';

export class MillikanOilDrop extends BaseExperiment {
  private electricEngine: ElectricFieldEngine;
  private droplets: Map<string, ChargedParticle> = new Map();
  private nextDropletId: number = 0;
  
  private plateVoltage: number = 5000; // volts
  private plateSeparation: number = 0.01; // meters
  private fieldStrength: number = 0;
  
  private measuredCharges: number[] = [];
  
  constructor() {
    const parameters: ParameterConfig[] = [
      {
        name: 'voltage',
        label: 'Plate Voltage',
        min: 0,
        max: 10000,
        default: 5000,
        step: 100,
        unit: 'V',
        description: 'Voltage across parallel plates'
      },
      {
        name: 'plateSeparation',
        label: 'Plate Separation',
        min: 0.005,
        max: 0.05,
        default: 0.01,
        step: 0.001,
        unit: 'm',
        description: 'Distance between parallel plates'
      },
      {
        name: 'dropletRadius',
        label: 'Droplet Radius',
        min: 0.5e-6,
        max: 5e-6,
        default: 1e-6,
        step: 0.1e-6,
        unit: 'µm',
        description: 'Radius of oil droplet'
      }
    ];
    
    const objectives: LearningObjective[] = [
      {
        id: 'balance-droplet',
        name: 'Balance a Droplet',
        description: 'Adjust voltage to suspend a droplet in mid-air',
        criteria: {
          type: 'measurement',
          key: 'dropletVelocity',
          target: 0,
          tolerance: 0.001
        }
      },
      {
        id: 'measure-charge',
        name: 'Measure Elementary Charge',
        description: 'Measure charges on multiple droplets',
        criteria: {
          type: 'measurement',
          key: 'chargesMeasured',
          target: 5,
          tolerance: 1
        }
      },
      {
        id: 'find-quantization',
        name: 'Discover Charge Quantization',
        description: 'Observe that all charges are multiples of e',
        criteria: {
          type: 'measurement',
          key: 'quantizationConfidence',
          target: 0.9,
          tolerance: 0.1
        }
      }
    ];
    
    super(
      'Millikan Oil Drop',
      'Measure the elementary charge by balancing charged oil droplets',
      parameters,
      objectives
    );
    
    this.electricEngine = new ElectricFieldEngine();
  }
  
  async initialize(): Promise<void> {
    this.plateVoltage = this.getParameter('voltage');
    this.plateSeparation = this.getParameter('plateSeparation');
    
    // Calculate electric field: E = V/d
    this.fieldStrength = this.plateVoltage / this.plateSeparation;
    
    // Set uniform electric field (pointing upward)
    this.electricEngine.setUniformField({
      x: 0,
      y: this.fieldStrength,
      z: 0
    });
    
    // Create initial droplet
    this.createDroplet();
    
    this.startTime = Date.now();
  }
  
  private createDroplet(): void {
    const radius = this.getParameter('dropletRadius');
    const oilDensity = 900; // kg/m³
    const volume = (4/3) * Math.PI * Math.pow(radius, 3);
    const mass = oilDensity * volume;
    
    // Random charge (integer multiple of e)
    const e = 1.602e-19; // Elementary charge
    const chargeMultiple = Math.floor(Math.random() * 10) + 1;
    const charge = -chargeMultiple * e; // Negative (electrons)
    
    const droplet: ChargedParticle = {
      position: {
        x: 0,
        y: this.plateSeparation / 2,
        z: 0
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0
      },
      mass,
      charge,
      radius
    };
    
    const id = `droplet-${this.nextDropletId++}`;
    this.electricEngine.addParticle(id, droplet);
    this.droplets.set(id, droplet);
  }
  
  update(deltaTime: number): void {
    this.elapsedTime += deltaTime;
    this.frameCount++;
    
    // Update electric field
    this.electricEngine.step(deltaTime);
    
    // Check if any droplets have left the chamber
    this.droplets.forEach((droplet, id) => {
      if (droplet.position.y < 0 || droplet.position.y > this.plateSeparation) {
        this.electricEngine.removeParticle(id);
        this.droplets.delete(id);
      }
    });
    
    // Sync droplet data
    this.droplets.forEach((_, id) => {
      const updated = this.electricEngine.getParticle(id);
      if (updated) {
        this.droplets.set(id, updated);
      }
    });
  }
  
  measureDropletCharge(dropletId: string): number | null {
    const droplet = this.droplets.get(dropletId);
    if (!droplet) return null;
    
    // Calculate charge from balancing equation: qE = mg
    const balancingField = this.electricEngine.calculateBalancingField(droplet);
    const charge = (droplet.mass * 9.81) / balancingField;
    
    this.measuredCharges.push(Math.abs(charge));
    return charge;
  }
  
  private calculateQuantizationConfidence(): number {
    if (this.measuredCharges.length < 3) return 0;
    
    // Check if all charges are approximately integer multiples of e
    const e = 1.602e-19;
    let matches = 0;
    
    this.measuredCharges.forEach(charge => {
      const ratio = charge / e;
      const nearest = Math.round(ratio);
      const error = Math.abs(ratio - nearest) / nearest;
      
      if (error < 0.1) matches++;
    });
    
    return matches / this.measuredCharges.length;
  }
  
  reset(): void {
    this.electricEngine.reset();
    this.droplets.clear();
    this.measuredCharges = [];
    this.nextDropletId = 0;
    this.elapsedTime = 0;
    this.frameCount = 0;
    this.initialize();
  }
  
  getState(): ExperimentState {
    return {
      name: this.name,
      parameters: Object.fromEntries(this.parameters),
      measurements: this.getMeasurements(),
      objects: Array.from(this.droplets.entries()).map(([id, droplet]) => ({
        id,
        position: droplet.position,
        velocity: droplet.velocity,
        charge: droplet.charge,
        mass: droplet.mass
      })),
      elapsedTime: this.elapsedTime,
      frameCount: this.frameCount
    };
  }
  
  setState(state: ExperimentState): void {
    Object.entries(state.parameters).forEach(([key, value]) => {
      this.parameters.set(key, value as number);
    });
    
    this.elapsedTime = state.elapsedTime;
    this.frameCount = state.frameCount;
    
    // Restore droplets
    this.droplets.clear();
    state.objects.forEach(obj => {
      const droplet: ChargedParticle = {
        position: obj.position,
        velocity: obj.velocity,
        mass: obj.mass ?? 1e-15,
        charge: obj.charge ?? -1.602e-19,
        radius: 1e-6
      };
      
      this.electricEngine.addParticle(obj.id, droplet);
      this.droplets.set(obj.id, droplet);
    });
  }
  
  getExplanationPoints(): ExplanationPoint[] {
    return [
      {
        id: 'intro',
        type: 'concept',
        priority: 'high',
        condition: 'elapsedTime < 2',
        message: 'In the Millikan oil drop experiment, we measure the charge of tiny oil droplets by balancing electric and gravitational forces.',
        audioRequired: true,
        pauseSimulation: true
      },
      {
        id: 'first-balance',
        type: 'achievement',
        priority: 'high',
        condition: 'dropletVelocity < 0.001 && dropletVelocity > -0.001',
        message: 'Perfect! You\'ve balanced a droplet. The electric force exactly cancels gravity. Now you can calculate its charge!',
        audioRequired: true,
        pauseSimulation: false
      },
      {
        id: 'quantization-observed',
        type: 'concept',
        priority: 'high',
        condition: 'quantizationConfidence > 0.8',
        message: 'Amazing! Notice that all measured charges are integer multiples of the same value. This is the elementary charge!',
        audioRequired: true,
        pauseSimulation: true
      }
    ];
  }
  
  getMeasurements(): Record<string, number> {
    const firstDroplet = this.droplets.values().next().value as ChargedParticle | undefined;
    
    return {
      elapsedTime: this.elapsedTime,
      fieldStrength: this.fieldStrength,
      dropletCount: this.droplets.size,
      chargesMeasured: this.measuredCharges.length,
      dropletVelocity: firstDroplet ? firstDroplet.velocity.y : 0,
      quantizationConfidence: this.calculateQuantizationConfidence(),
      voltage_changes: this.parameterHistory?.get('voltage')?.length ?? 0
    };
  }
  
  protected onParameterChanged(key: string, value: number): void {
    if (key === 'voltage') {
      this.plateVoltage = value;
      this.fieldStrength = this.plateVoltage / this.plateSeparation;
      
      this.electricEngine.setUniformField({
        x: 0,
        y: this.fieldStrength,
        z: 0
      });
    } else if (key === 'plateSeparation') {
      this.plateSeparation = value;
      this.fieldStrength = this.plateVoltage / this.plateSeparation;
      
      this.electricEngine.setUniformField({
        x: 0,
        y: this.fieldStrength,
        z: 0
      });
    }
  }
  
  // Public method to spawn new droplet
  spawnDroplet(): void {
    this.createDroplet();
  }
}