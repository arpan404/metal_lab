// physics-engine/experiments/MillikanOilDrop.ts
import { BaseExperiment } from './BaseExperiment';
import { ElectricFieldEngine } from '../engines/ElectricFieldEngine';
import type { 
  ExperimentState, 
  ParameterConfig, 
  LearningObjective,
  ExplanationPoint 
} from '../types';

export class MillikanOilDrop extends BaseExperiment {
  private electricEngine: ElectricFieldEngine;
  
  // Oil drops
  private oilDrops: OilDrop[] = [];
  private selectedDropId: string | null = null;
  
  // Measurements
  private measuredCharges: number[] = [];
  private elementaryChargeEstimate: number = 0;
  
  constructor() {
    const parameters: ParameterConfig[] = [
      {
        name: 'electricField',
        label: 'Electric Field',
        default: 0,
        min: -100000,
        max: 100000,
        step: 1000,
        unit: 'V/m',
        description: 'Voltage between plates'
      },
      {
        name: 'plateSpacing',
        label: 'Plate Spacing',
        default: 0.01,
        min: 0.005,
        max: 0.02,
        step: 0.001,
        unit: 'm',
        description: 'Distance between parallel plates'
      },
      {
        name: 'airViscosity',
        label: 'Air Viscosity',
        default: 1.8e-5,
        min: 1.5e-5,
        max: 2.1e-5,
        step: 1e-6,
        unit: 'Pa⋅s',
        description: 'Viscosity of air'
      },
      {
        name: 'xrayIntensity',
        label: 'X-ray Intensity',
        default: 0,
        min: 0,
        max: 10,
        step: 1,
        description: 'Ionization intensity (adds/removes electrons)'
      }
    ];
    
    const objectives: LearningObjective[] = [
      {
        id: 'balance_drop',
        name: 'Balance a Drop',
        description: 'Balance an oil drop by adjusting the electric field',
        criteria: {
          type: 'custom',
          customCheck: (state) => {
            const data = state.customData as any;
            return data?.balancedDrops > 0;
          }
        },
        hint: 'Adjust the field until a drop hovers motionless',
        points: 20
      },
      {
        id: 'measure_charges',
        name: 'Measure Multiple Charges',
        description: 'Measure the charge on at least 5 different drops',
        criteria: {
          type: 'measurement',
          key: 'measuredCharges',
          target: 5,
          tolerance: 0
        },
        hint: 'Balance different drops and record their charges',
        points: 25
      },
      {
        id: 'find_pattern',
        name: 'Find the Pattern',
        description: 'Discover that charges are quantized',
        criteria: {
          type: 'custom',
          customCheck: (state) => {
            const data = state.customData as any;
            const charges = data?.measuredCharges || [];
            if (charges.length < 3) return false;
            
            // Check if charges are multiples of smallest
            const minCharge = Math.min(...charges.map(Math.abs).filter(c => c > 0));
            const multiples = charges.map(c => Math.round(Math.abs(c) / minCharge));
            
            return multiples.every(m => m >= 1 && m <= 10);
          }
        },
        hint: 'Look for a common factor in all measured charges',
        points: 30
      },
      {
        id: 'elementary_charge',
        name: 'Find Elementary Charge',
        description: 'Determine the fundamental unit of charge',
        criteria: {
          type: 'measurement',
          key: 'elementaryChargeAccuracy',
          target: 0.9,
          tolerance: 0.1
        },
        hint: 'The smallest common factor is the elementary charge e',
        points: 40
      }
    ];
    
    super(
      'Millikan Oil Drop',
      'Measure the fundamental unit of electric charge',
      parameters,
      objectives
    );
    
    this.electricEngine = new ElectricFieldEngine();
  }
  
  async initialize(): Promise<void> {
    this.reset();
    this.sprayOilDrops();
  }
  
  update(deltaTime: number): void {
    this.elapsedTime += deltaTime;
    this.frameCount++;
    
    // Update electric field
    const fieldStrength = this.getParameter('electricField');
    const plateSpacing = this.getParameter('plateSpacing');
    
    this.electricEngine.setUniformField({
      x: 0,
      y: fieldStrength,
      z: 0
    });
    
    // Update oil drops
    this.electricEngine.step(deltaTime);
    this.updateOilDrops(deltaTime);
    
    // Apply X-ray ionization
    this.applyXrayIonization();
    
    // Check for balanced drops
    this.checkBalancedDrops();
    
    // Remove drops that have fallen out of view
    this.cleanupDrops();
  }
  
  private sprayOilDrops(): void {
    // Create initial oil drops
    for (let i = 0; i < 20; i++) {
      this.createOilDrop();
    }
  }
  
  private createOilDrop(): void {
    // Random oil drop properties
    const radius = (0.5 + Math.random() * 2) * 1e-6; // 0.5-2.5 μm
    const density = 900; // kg/m³ (oil density)
    const volume = (4/3) * Math.PI * radius ** 3;
    const mass = density * volume;
    
    // Random charge (multiple of elementary charge)
    const elementaryCharge = 1.602e-19;
    const chargeMultiple = Math.floor(Math.random() * 5) - 2; // -2 to +2 e
    const charge = chargeMultiple * elementaryCharge;
    
    const drop: OilDrop = {
      id: `drop_${Date.now()}_${Math.random()}`,
      position: {
        x: (Math.random() - 0.5) * 0.01,
        y: 0.005 + Math.random() * 0.005,
        z: (Math.random() - 0.5) * 0.01
      },
      velocity: {
        x: (Math.random() - 0.5) * 0.0001,
        y: -0.0001,
        z: (Math.random() - 0.5) * 0.0001
      },
      mass,
      charge,
      radius,
      isBalanced: false,
      balanceTime: 0,
      chargeHistory: [charge]
    };
    
    this.oilDrops.push(drop);
    this.electricEngine.addParticle(drop.id, drop);
  }
  
  private updateOilDrops(deltaTime: number): void {
    this.oilDrops.forEach(drop => {
      // Get updated particle from engine
      const particle = this.electricEngine.getParticle(drop.id);
      if (particle) {
        drop.position = { ...particle.position };
        drop.velocity = { ...particle.velocity };
        drop.charge = particle.charge;
        
        // Check if drop is balanced (hovering)
        const speed = Math.sqrt(
          drop.velocity.x ** 2 + 
          drop.velocity.y ** 2 + 
          drop.velocity.z ** 2
        );
        
        if (speed < 0.00001) { // Less than 0.01 mm/s
          if (!drop.isBalanced) {
            drop.isBalanced = true;
            drop.balanceTime = this.elapsedTime;
            this.onDropBalanced(drop);
          }
        } else {
          drop.isBalanced = false;
          drop.balanceTime = 0;
        }
      }
    });
  }
  
  private applyXrayIonization(): void {
    const intensity = this.getParameter('xrayIntensity');
    if (intensity === 0) return;
    
    // Randomly ionize drops
    this.oilDrops.forEach(drop => {
      if (Math.random() < intensity * 0.001) {
        const elementaryCharge = 1.602e-19;
        
        // Add or remove an electron
        if (Math.random() < 0.5) {
          drop.charge -= elementaryCharge; // Gain electron
        } else {
          drop.charge += elementaryCharge; // Lose electron
        }
        
        drop.chargeHistory.push(drop.charge);
        
        // Update in engine
        const particle = this.electricEngine.getParticle(drop.id);
        if (particle) {
          particle.charge = drop.charge;
        }
      }
    });
  }
  
  private checkBalancedDrops(): void {
    const fieldStrength = this.getParameter('electricField');
    
    this.oilDrops.forEach(drop => {
      if (drop.isBalanced && fieldStrength !== 0) {
        // Calculate charge from balance condition: qE = mg
        const calculatedCharge = (drop.mass * 9.81) / fieldStrength;
        
        // Only record if this is a new measurement
        if (!this.measuredCharges.includes(calculatedCharge)) {
          this.measuredCharges.push(calculatedCharge);
          this.estimateElementaryCharge();
        }
      }
    });
  }
  
  private estimateElementaryCharge(): void {
    if (this.measuredCharges.length < 2) return;
    
    // Find GCD of all measured charges (simplified)
    const charges = this.measuredCharges.map(Math.abs).filter(c => c > 0);
    if (charges.length === 0) return;
    
    // Simple GCD estimation
    const minCharge = Math.min(...charges);
    const actualElementaryCharge = 1.602e-19;
    
    // Round to nearest multiple of actual e
    const multiple = Math.round(minCharge / actualElementaryCharge);
    if (multiple > 0) {
      this.elementaryChargeEstimate = minCharge / multiple;
    }
  }
  
  private onDropBalanced(drop: OilDrop): void {
    console.log(`Drop balanced! Charge: ${drop.charge} C`);
    
    // Record the measurement
    const fieldStrength = this.getParameter('electricField');
    if (fieldStrength !== 0) {
      const measuredCharge = (drop.mass * 9.81) / fieldStrength;
      
      if (!this.measuredCharges.includes(measuredCharge)) {
        this.measuredCharges.push(measuredCharge);
      }
    }
  }
  
  private cleanupDrops(): void {
    // Remove drops that have fallen too far
    this.oilDrops = this.oilDrops.filter(drop => {
      if (drop.position.y < -0.01 || drop.position.y > 0.02) {
        this.electricEngine.removeParticle(drop.id);
        return false;
      }
      return true;
    });
    
    // Add new drops if needed
    while (this.oilDrops.length < 10) {
      this.createOilDrop();
    }
  }
  
  selectDrop(dropId: string): void {
    this.selectedDropId = dropId;
  }
  
  reset(): void {
    this.elapsedTime = 0;
    this.frameCount = 0;
    this.oilDrops = [];
    this.measuredCharges = [];
    this.elementaryChargeEstimate = 0;
    this.selectedDropId = null;
    this.electricEngine.reset();
    this.startTime = Date.now();
  }
  
  getState(): ExperimentState {
    const balancedDrops = this.oilDrops.filter(d => d.isBalanced).length;
    const actualElementaryCharge = 1.602e-19;
    const accuracy = this.elementaryChargeEstimate > 0 
      ? 1 - Math.abs(this.elementaryChargeEstimate - actualElementaryCharge) / actualElementaryCharge
      : 0;
    
    return {
      name: this.name,
      elapsedTime: this.elapsedTime,
      frameCount: this.frameCount,
      parameters: Array.from(this.parameters.entries()),
      measurements: this.getMeasurements(),
      customData: {
        oilDrops: this.oilDrops.length,
        balancedDrops,
        measuredCharges: [...this.measuredCharges],
        elementaryChargeEstimate: this.elementaryChargeEstimate,
        elementaryChargeAccuracy: accuracy,
        selectedDropId: this.selectedDropId
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
      this.measuredCharges = state.customData.measuredCharges || [];
      this.elementaryChargeEstimate = state.customData.elementaryChargeEstimate || 0;
      this.selectedDropId = state.customData.selectedDropId || null;
    }
  }
  
  getExplanationPoints(): ExplanationPoint[] {
    return [
      {
        id: 'drops_falling',
        type: 'concept',
        condition: 'elapsedTime > 2',
        message: 'The oil drops fall due to gravity. But if they have electric charge, the electric field can push them up!',
        priority: 'low',
        audioRequired: false,
        pauseSimulation: false
      },
      {
        id: 'first_balance',
        type: 'milestone',
        condition: 'balancedDrops > 0',
        message: 'Excellent! You\'ve balanced a drop! When qE = mg, we can calculate the charge from the field strength.',
        priority: 'high',
        audioRequired: true,
        pauseSimulation: true,
        highlight: ['balanced_drop']
      },
      {
        id: 'charge_quantization',
        type: 'concept',
        condition: 'measuredCharges > 3',
        message: 'Notice something? All the charges are multiples of a smallest value. Charge is quantized!',
        priority: 'high',
        audioRequired: true,
        pauseSimulation: false
      }
    ];
  }
  
  getMeasurements(): Record<string, number> {
    const balancedDrops = this.oilDrops.filter(d => d.isBalanced).length;
    
    return {
      elapsedTime: this.elapsedTime,
      oilDropCount: this.oilDrops.length,
      balancedDrops,
      measuredCharges: this.measuredCharges.length,
      electricField: this.getParameter('electricField'),
      elementaryChargeEstimate: this.elementaryChargeEstimate,
      elementaryChargeAccuracy: this.elementaryChargeEstimate > 0 
        ? 1 - Math.abs(this.elementaryChargeEstimate - 1.602e-19) / 1.602e-19
        : 0
    };
  }
}

interface OilDrop {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  mass: number;
  charge: number;
  radius: number;
  isBalanced: boolean;
  balanceTime: number;
  chargeHistory: number[];
}