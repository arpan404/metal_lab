// physics-engine/types/index.ts
/**
 * Central type definitions for the physics engine
 */

// Re-export all types
export * from './experiments';
export * from './state';
export * from './llm';
export * from './physics';
export * from './games';
export * from './renderer';
export * from './models';

// Core types
export interface EngineConfig {
  canvas?: HTMLCanvasElement;
  useWebGPU?: boolean;
  maxFrameRate?: number;
  gravity?: Vector3D;
  debug?: boolean;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface SimulationParams {
  timeStep: number;
  maxSubSteps: number;
  speed: number;
}

export interface RigidBodyConfig {
  mass: number;
  position: Vector3D;
  velocity?: Vector3D;
  rotation?: Vector3D;
  shape: ShapeConfig;
  material?: MaterialConfig;
}

export interface ShapeConfig {
  type: 'sphere' | 'box' | 'cylinder' | 'plane';
  radius?: number;
  width?: number;
  height?: number;
  depth?: number;
  radiusTop?: number;
  radiusBottom?: number;
  segments?: number;
}

export interface MaterialConfig {
  friction: number;
  restitution: number;
  density?: number;
}

export interface ChargedParticle {
  id?: string;
  position: Vector3D;
  velocity: Vector3D;
  mass: number;
  charge: number;
  radius: number;
}

export interface WaveParameters {
  gridSize: number;
  wavelength: number;
  dt: number;
  slitSeparation: number;
  slitWidth?: number;
  amplitude?: number;
  frequency?: number;
}