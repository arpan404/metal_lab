// physics-engine/experiments/FoucaultPendulum.ts
import { BaseExperiment } from './BaseExperiment';
import { RotationalEngine } from '../engines/RotationalEngine';
import { ClassicalEngine } from '../engines/ClassicalEngine';
import type { 
  ExperimentState, 
  ParameterConfig, 
  LearningObjective,
  ExplanationPoint 
} from '../types';

export class FoucaultPendulum extends BaseExperiment {
  private rotationalEngine: RotationalEngine;
  private classicalEngine: ClassicalEngine;
  
  // Pendulum state
  private pendulumAngle: { theta: number; phi: number } = { theta: 0, phi: 0 };
  private pendulumVelocity: { theta: number; phi: number } = { theta: 0, phi: 0 };
  private pendulumLength: number = 10; // meters
  private bobMass: number = 10; // kg
  
  // Tracking
  private oscillations: number = 0;
  private precessionAngle: number = 0;
  private tracePoints: { x: number; y: number; time: number }[] = [];
  
  constructor() {
    const parameters: ParameterConfig[] = [
      {
        name: 'latitude',
        label: 'Latitude',
        default: 48.8,  // Paris latitude
        min: -90,
        max: 90,
        step: 1,
        unit: '°',
        description: 'Geographic latitude'
      },
      {
        name: 'pendulumLength',
        label: 'Pendulum Length',
        default: 10,
        min: 1,
        max: 50,
        step: 1,
        unit: 'm',
        description: 'Length of pendulum cable'
      },
      {
        name: 'initialAngle',
        label: 'Initial Angle',
        default: 5,
        min: 1,
        max: 20,
        step: 0.5,
        unit: '°',
        description: 'Initial displacement angle'
      },
      {
        name: 'damping',
        label: 'Air Resistance',
        default: 0.01,
        min: 0,
        max: 0.1,
        step: 0.001,
        description: 'Damping coefficient'
      }
    ];
    
    const objectives: LearningObjective[] = [
      {
        id: 'observe_oscillation',
        name: 'Observe Oscillation',
        description: 'Watch the pendulum swing back and forth',
        criteria: {
          type: 'measurement',
          key: 'oscillations',
          target: 5,
          tolerance: 1
        },
        hint: 'Let the pendulum complete several swings',
        points: 10
      },
      {
        id: 'detect_precession',
        name: 'Detect Precession',
        description: 'Notice the plane of oscillation rotating',
        criteria: {
          type: 'measurement',
          key: 'precessionAngle',
          target: 15,
          tolerance: 5
        },
        hint: 'Watch how the swing direction changes over time',
        points: 20
      },
      {
        id: 'latitude_effect',
        name: 'Latitude Dependence',
        description: 'See how latitude affects precession rate',
        criteria: {
          type: 'parameter_exploration',
          parameter: 'latitude',
          minChanges: 3
        },
        hint: 'Try different latitudes (equator, poles, mid-latitudes)',
        points: 25
      },
      {
        id: 'earth_rotation',
        name: 'Prove Earth\'s Rotation',
        description: 'Understand how this proves Earth rotates',
        criteria: {
          type: 'time_spent',
          duration: 60000 // 1 minute
        },
        hint: 'The pendulum maintains its swing plane while Earth rotates beneath it',
        points: 30
      }
    ];
    
    super(
      'Foucault Pendulum',
      'Demonstrate Earth\'s rotation using a long pendulum',
      parameters,
      objectives
    );
    
    this.rotationalEngine = new RotationalEngine();
    this.classicalEngine = new ClassicalEngine();
  }
  
  async initialize(): Promise<void> {
    const latitude = this.getParameter('latitude') * Math.PI / 180;
    this.rotationalEngine.setEarthRotation(latitude);
    
    // Set gravity
    this.classicalEngine.setGravity({ x: 0, y: -9.81, z: 0 });
    
    this.reset();
  }
  
  update(deltaTime: number): void {
    this.elapsedTime += deltaTime;
    this.frameCount++;
    
    const latitude = this.getParameter('latitude') * Math.PI / 180;
    const length = this.getParameter('pendulumLength');
    const damping = this.getParameter('damping');
    
    // Update Earth rotation if latitude changed
    if (Math.abs(this.rotationalEngine.getLatitude() - latitude) > 0.01) {
      this.rotationalEngine.setEarthRotation(latitude);
    }
    
    this.pendulumLength = length;
    
    // Calculate pendulum motion with Coriolis effect
    this.updatePendulumMotion(deltaTime, damping);
    
    // Track oscillations and precession
    this.trackMotion();
    
    // Update classical engine for visualization
    this.updateVisualization();
  }
  
  private updatePendulumMotion(deltaTime: number, damping: number): void {
    const g = 9.81;
    const L = this.pendulumLength;
    
    // Get current position in Cartesian coordinates
    const x = L * Math.sin(this.pendulumAngle.theta) * Math.cos(this.pendulumAngle.phi);
    const y = L * Math.sin(this.pendulumAngle.theta) * Math.sin(this.pendulumAngle.phi);
    const z = -L * Math.cos(this.pendulumAngle.theta);
    
    // Calculate velocity in Cartesian
    const vx = L * (
      this.pendulumVelocity.theta * Math.cos(this.pendulumAngle.theta) * Math.cos(this.pendulumAngle.phi) -
      this.pendulumVelocity.phi * Math.sin(this.pendulumAngle.theta) * Math.sin(this.pendulumAngle.phi)
    );
    const vy = L * (
      this.pendulumVelocity.theta * Math.cos(this.pendulumAngle.theta) * Math.sin(this.pendulumAngle.phi) +
      this.pendulumVelocity.phi * Math.sin(this.pendulumAngle.theta) * Math.cos(this.pendulumAngle.phi)
    );
    const vz = L * this.pendulumVelocity.theta * Math.sin(this.pendulumAngle.theta);
    
    // Calculate Coriolis force
    const coriolisForce = this.rotationalEngine.calculateCoriolisForce(
      this.bobMass,
      { x: vx, y: vy, z: vz }
    );
    
    // Pendulum restoring force (small angle approximation)
    const restoring = {
      theta: -(g / L) * Math.sin(this.pendulumAngle.theta),
      phi: 0
    };
    
    // Convert Coriolis to spherical coordinates
    const coriolisTheta = (
      coriolisForce.x * Math.cos(this.pendulumAngle.theta) * Math.cos(this.pendulumAngle.phi) +
      coriolisForce.y * Math.cos(this.pendulumAngle.theta) * Math.sin(this.pendulumAngle.phi) -
      coriolisForce.z * Math.sin(this.pendulumAngle.theta)
    ) / (this.bobMass * L);
    
    const coriolis Phi = (
      -coriolisForce.x * Math.sin(this.pendulumAngle.phi) +
      coriolisForce.y * Math.cos(this.pendulumAngle.phi)
    ) / (this.bobMass * L * Math.sin(this.pendulumAngle.theta + 0.001)); // Avoid division by zero
    
    // Update velocities
    this.pendulumVelocity.theta += (restoring.theta + coriolisTheta - damping * this.pendulumVelocity.theta) * deltaTime;
    this.pendulumVelocity.phi += (restoring.phi + coriolis Phi - damping * this.pendulumVelocity.phi) * deltaTime;
    
    // Update angles
    this.pendulumAngle.theta += this.pendulumVelocity.theta * deltaTime;
    this.pendulumAngle.phi += this.pendulumVelocity.phi * deltaTime;
    
    // Record trace
    if (this.frameCount % 10 === 0) { // Record every 10th frame
      this.tracePoints.push({
        x: x,
        y: y,
        time: this.elapsedTime
      });
      
      // Limit trace length
      if (this.tracePoints.length > 1000) {
        this.tracePoints.shift();
      }
    }
  }
  
  private trackMotion(): void {
    // Count oscillations (crossings through center)
    const currentSign = Math.sign(this.pendulumAngle.theta);
    const previousSign = Math.sign(this.pendulumAngle.theta - this.pendulumVelocity.theta * 0.016);
    
    if (currentSign !== previousSign && previousSign !== 0) {
      this.oscillations += 0.5; // Half oscillation per crossing
    }
    
    // Track precession angle
    this.precessionAngle = this.pendulumAngle.phi * 180 / Math.PI;
  }
  
  private updateVisualization(): void {
    // Update bob position in classical engine
    const x = this.pendulumLength * Math.sin(this.pendulumAngle.theta) * Math.cos(this.pendulumAngle.phi);
    const y = -this.pendulumLength * Math.cos(this.pendulumAngle.theta);
    const z = this.pendulumLength * Math.sin(this.pendulumAngle.theta) * Math.sin(this.pendulumAngle.phi);
    
    const bob = this.classicalEngine.getBody('pendulum_bob');
    if (bob) {
      bob.position.set(x, y, z);
    }
  }
  
  reset(): void {
    this.elapsedTime = 0;
    this.frameCount = 0;
    this.oscillations = 0;
    this.precessionAngle = 0;
    this.tracePoints = [];
    
    // Set initial angle
    const initialAngle = this.getParameter('initialAngle') * Math.PI / 180;
    this.pendulumAngle = { theta: initialAngle, phi: 0 };
    this.pendulumVelocity = { theta: 0, phi: 0 };
    
    // Create pendulum bob in physics engine
    this.classicalEngine.reset();
    this.classicalEngine.addRigidBody('pendulum_bob', {
      mass: this.bobMass,
      position: {
        x: this.pendulumLength * Math.sin(initialAngle),
        y: -this.pendulumLength * Math.cos(initialAngle),
        z: 0
      },
      shape: { type: 'sphere', radius: 0.2 }
    });
    
    this.startTime = Date.now();
  }
  
  getState(): ExperimentState {
    return {
      name: this.name,
      elapsedTime: this.elapsedTime,
      frameCount: this.frameCount,
      parameters: Array.from(this.parameters.entries()),
      measurements: this.getMeasurements(),
      customData: {
        pendulumAngle: { ...this.pendulumAngle },
        pendulumVelocity: { ...this.pendulumVelocity },
        oscillations: this.oscillations,
        precessionAngle: this.precessionAngle,
        tracePoints: this.tracePoints.slice(-100) // Last 100 points
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
      this.pendulumAngle = state.customData.pendulumAngle || { theta: 0, phi: 0 };
      this.pendulumVelocity = state.customData.pendulumVelocity || { theta: 0, phi: 0 };
      this.oscillations = state.customData.oscillations || 0;
      this.precessionAngle = state.customData.precessionAngle || 0;
      this.tracePoints = state.customData.tracePoints || [];
    }
  }
  
  getExplanationPoints(): ExplanationPoint[] {
    return [
      {
        id: 'pendulum_swinging',
        type: 'concept',
        condition: 'oscillations > 1',
        message: 'The pendulum swings back and forth due to gravity. But watch carefully - the swing direction is slowly changing!',
        priority: 'medium',
        audioRequired: true,
        pauseSimulation: false
      },
      {
        id: 'precession_detected',
        type: 'milestone',
        condition: 'Math.abs(precessionAngle) > 5',
        message: 'See that? The plane of oscillation is rotating! This is due to Earth\'s rotation underneath the pendulum.',
        priority: 'high',
        audioRequired: true,
        pauseSimulation: true,
        highlight: ['trace']
      },
      {
        id: 'latitude_explained',
        type: 'concept',
        condition: 'latitude_changes > 0',
        message: 'The precession rate depends on latitude. At the poles it\'s maximum (360°/day), at the equator it\'s zero!',
        priority: 'high',
        audioRequired: true,
        pauseSimulation: false
      }
    ];
  }
  
  getMeasurements(): Record<string, number> {
    const latitude = this.getParameter('latitude');
    const theoreticalPrecessionRate = this.rotationalEngine.getRotationRate() * 180 / Math.PI * 3600; // degrees per hour
    
    return {
      elapsedTime: this.elapsedTime,
      oscillations: Math.floor(this.oscillations),
      precessionAngle: this.precessionAngle,
      precessionRate: this.elapsedTime > 0 ? this.precessionAngle / (this.elapsedTime / 3600) : 0,
      theoreticalPrecessionRate,
      latitude_changes: this.parameters.get('latitude') !== 48.8 ? 1 : 0,
      pendulumEnergy: 0.5 * this.bobMass * 9.81 * this.pendulumLength * 
        (this.pendulumAngle.theta ** 2 + this.pendulumAngle.phi ** 2)
    };
  }
}