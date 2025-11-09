// physics-engine/experiments/NASCARBanking.ts
import { BaseExperiment } from './BaseExperiment';
import { ClassicalEngine } from '../engines/ClassicalEngine';
import type {
  ParameterConfig,
  LearningObjective,
  Vector3D
} from '../types';

import type { ExperimentState, ExplanationPoint } from '../types/Experiments';

export class NASCARBanking extends BaseExperiment {
  private classicalEngine: ClassicalEngine;
  private carId = 'car';
  
  private trackRadius: number = 200; // meters
  private bankAngle: number = 33; // degrees
  private velocity: number = 50; // m/s
  
  private currentAngle: number = 0; // radians around track
  private lapCount: number = 0;
  
  constructor() {
    const parameters: ParameterConfig[] = [
      {
        name: 'bankAngle',
        label: 'Bank Angle',
        min: 0,
        max: 45,
        default: 33,
        step: 1,
        unit: '°',
        description: 'Banking angle of the track'
      },
      {
        name: 'velocity',
        label: 'Velocity',
        min: 20,
        max: 80,
        default: 50,
        step: 1,
        unit: 'm/s',
        description: 'Speed of the car'
      },
      {
        name: 'trackRadius',
        label: 'Track Radius',
        min: 100,
        max: 400,
        default: 200,
        step: 10,
        unit: 'm',
        description: 'Radius of the circular track'
      },
      {
        name: 'friction',
        label: 'Friction Coefficient',
        min: 0,
        max: 1,
        default: 0.7,
        step: 0.05,
        unit: '',
        description: 'Coefficient of friction between tires and track'
      }
    ];
    
    const objectives: LearningObjective[] = [
      {
        id: 'find-optimal-speed',
        name: 'Find Optimal Speed',
        description: 'Find the speed where friction is not needed',
        criteria: {
          type: 'measurement',
          key: 'frictionForce',
          target: 0,
          tolerance: 50
        }
      },
      {
        id: 'explore-angles',
        name: 'Explore Bank Angles',
        description: 'Test different banking angles',
        criteria: {
          type: 'parameter_exploration',
          parameter: 'bankAngle',
          minChanges: 5
        }
      },
      {
        id: 'complete-lap',
        name: 'Complete a Lap',
        description: 'Successfully complete one lap around the track',
        criteria: {
          type: 'measurement',
          key: 'lapCount',
          target: 1,
          tolerance: 0.1
        }
      }
    ];
    
    super(
      'NASCAR Banking',
      'Explore how banked turns allow race cars to maintain high speeds',
      parameters,
      objectives
    );
    
    this.classicalEngine = new ClassicalEngine();
  }
  
  async initialize(): Promise<void> {
    this.trackRadius = this.getParameter('trackRadius');
    this.bankAngle = this.getParameter('bankAngle') * Math.PI / 180;
    this.velocity = this.getParameter('velocity');
    
    // Create car at starting position
    this.classicalEngine.addRigidBody(this.carId, {
      mass: 1500, // kg
      position: {
        x: this.trackRadius,
        y: 0,
        z: 0
      },
      velocity: {
        x: 0,
        y: 0,
        z: this.velocity
      },
      shape: {
        type: 'box',
        width: 2,
        height: 1.5,
        depth: 4.5
      }
    });
    
    this.currentAngle = 0;
    this.lapCount = 0;
    this.startTime = Date.now();
  }
  
  update(deltaTime: number): void {
    this.elapsedTime += deltaTime;
    this.frameCount++;
    
    const car = this.classicalEngine.getBody(this.carId);
    if (!car) return;
    
    // Calculate circular motion
    const angularVelocity = this.velocity / this.trackRadius;
    this.currentAngle += angularVelocity * deltaTime;
    
    // Track laps
    if (this.currentAngle >= 2 * Math.PI) {
      this.lapCount++;
      this.currentAngle -= 2 * Math.PI;
    }
    
    // Calculate position on track
    const position: Vector3D = {
      x: this.trackRadius * Math.cos(this.currentAngle),
      y: this.trackRadius * Math.sin(this.bankAngle),
      z: this.trackRadius * Math.sin(this.currentAngle)
    };
    
    // Calculate velocity (tangent to circle)
    const velocity: Vector3D = {
      x: -this.velocity * Math.sin(this.currentAngle),
      y: 0,
      z: this.velocity * Math.cos(this.currentAngle)
    };
    
    // Update car position
    car.position.set(position.x, position.y, position.z);
    car.velocity.set(velocity.x, velocity.y, velocity.z);
    
    // Calculate forces for display purposes
    const centripetalForce = (car.mass * this.velocity ** 2) / this.trackRadius;
    const normalForce = car.mass * 9.81 / Math.cos(this.bankAngle);
    const frictionForce = this.calculateRequiredFriction();
    
    // Update physics
    this.classicalEngine.step(deltaTime);
  }
  
  private calculateRequiredFriction(): number {
    const mass = 1500;
    const centripetalForce = (mass * this.velocity ** 2) / this.trackRadius;
    const normalComponent = mass * 9.81 * Math.sin(this.bankAngle);
    const bankingComponent = mass * 9.81 * Math.tan(this.bankAngle);
    
    // Friction needed = centripetal - banking component
    return Math.abs(centripetalForce - bankingComponent);
  }
  
  private calculateOptimalSpeed(): number {
    // v = sqrt(g * r * tan(θ))
    return Math.sqrt(9.81 * this.trackRadius * Math.tan(this.bankAngle));
  }
  
  reset(): void {
    this.classicalEngine.reset();
    this.elapsedTime = 0;
    this.frameCount = 0;
    this.currentAngle = 0;
    this.lapCount = 0;
    this.initialize();
  }
  
  getState(): ExperimentState {
    const car = this.classicalEngine.getBody(this.carId);
    
    return {
      name: this.name,
      parameters: Object.fromEntries(this.parameters),
      measurements: this.getMeasurements(),
      objects: car ? [{
        id: this.carId,
        position: {
          x: car.position.x,
          y: car.position.y,
          z: car.position.z
        },
        velocity: {
          x: car.velocity.x,
          y: car.velocity.y,
          z: car.velocity.z
        }
      }] : [],
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
    
    state.objects.forEach(obj => {
      const body = this.classicalEngine.getBody(obj.id);
      if (body) {
        body.position.set(obj.position.x, obj.position.y, obj.position.z);
        body.velocity.set(obj.velocity.x, obj.velocity.y, obj.velocity.z);
      }
    });
  }
  
  getExplanationPoints(): ExplanationPoint[] {
    const optimalSpeed = this.calculateOptimalSpeed();
    
    return [
      {
        id: 'intro',
        type: 'concept',
        priority: 'high',
        condition: 'elapsedTime < 2',
        message: 'NASCAR tracks are banked to allow cars to take turns at high speeds without relying solely on friction.',
        audioRequired: true,
        pauseSimulation: true
      },
      {
        id: 'optimal-speed',
        type: 'observation',
        priority: 'high',
        condition: `Math.abs(velocity - ${optimalSpeed}) < 2`,
        message: `You're at the optimal speed! At this velocity, the banking angle provides exactly the centripetal force needed.`,
        audioRequired: true,
        pauseSimulation: false
      },
      {
        id: 'too-fast',
        type: 'warning',
        priority: 'medium',
        condition: `velocity > ${optimalSpeed + 10}`,
        message: 'You\'re going too fast! The car needs additional friction force to stay on the track.',
        audioRequired: true,
        pauseSimulation: false
      },
      {
        id: 'first-lap',
        type: 'achievement',
        priority: 'low',
        condition: 'lapCount >= 1',
        message: 'Great! You completed a lap. Try adjusting the bank angle or velocity to see how it affects the required friction.',
        audioRequired: true,
        pauseSimulation: false
      }
    ];
  }
  
  getMeasurements(): Record<string, number> {
    return {
      elapsedTime: this.elapsedTime,
      currentAngle: this.currentAngle,
      lapCount: this.lapCount,
      velocity: this.velocity,
      centripetalForce: (1500 * this.velocity ** 2) / this.trackRadius,
      frictionForce: this.calculateRequiredFriction(),
      optimalSpeed: this.calculateOptimalSpeed(),
      bankAngle_changes: this.parameterHistory?.get('bankAngle')?.length ?? 0
    };
  }
  
  protected onParameterChanged(key: string, value: number): void {
    if (key === 'bankAngle') {
      this.bankAngle = value * Math.PI / 180;
    } else if (key === 'velocity') {
      this.velocity = value;
    } else if (key === 'trackRadius') {
      this.trackRadius = value;
    }
  }
}