//export * from './experiments';
export * from './state';
export * from './llm';
export * from './physics';
export * from './games';
export * from './renderer';
export * from './models';

// Core engine types
export interface EngineConfig {
  enableWebGPU?: boolean;
  enableAudio?: boolean;
  maxFrameHistory?: number;
  targetFPS?: number;
}

export interface SimulationParams {
  timeStep: number;
  speed: number;
  maxIterations?: number;
}

// Vector types
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

// Parameter configuration
export interface ParameterConfig {
  name: string;
  label: string;
  min: number;
  max: number;
  default: number;
  step: number;
  unit: string;
  description: string;
}

// Learning objectives
export interface LearningObjective {
  id: string;
  name: string;
  description: string;
  criteria: ObjectiveCriteria;
}

export type ObjectiveCriteria =
  | {
      type: 'measurement';
      key: string;
      target: number;
      tolerance: number;
    }
  | {
      type: 'time_spent';
      duration: number;
    }
  | {
      type: 'parameter_exploration';
      parameter: string;
      minChanges: number;
    };

// Rigid body configuration for Cannon.js
export interface RigidBodyConfig {
  mass: number;
  position: Vector3D;
  velocity?: Vector3D;
  angularVelocity?: Vector3D;
  shape: ShapeConfig;
}

export type ShapeConfig =
  | {
      type: 'sphere';
      radius: number;
    }
  | {
      type: 'box';
      width: number;
      height: number;
      depth: number;
    }
  | {
      type: 'cylinder';
      radiusTop: number;
      radiusBottom: number;
      height: number;
      segments: number;
    };

// Charged particle for electric field simulations
export interface ChargedParticle {
  position: Vector3D;
  velocity: Vector3D;
  mass: number;
  charge: number;
  radius: number;
}

// Parameter change tracking
export interface ParameterChange {
  key?: string;
  parameter?: string;
  value?: number;
  oldValue?: number;
  newValue?: number;
  timestamp: number;
}

// State change tracking
export interface StateChange {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}