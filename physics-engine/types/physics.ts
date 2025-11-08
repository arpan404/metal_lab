// physics-engine/types/physics.ts
import type { Vector3D } from './index';

export interface Force {
  type: 'gravity' | 'electric' | 'magnetic' | 'spring' | 'drag' | 'custom';
  magnitude: number;
  direction: Vector3D;
  point?: Vector3D;
}

export interface PhysicsObject {
  id: string;
  mass: number;
  position: Vector3D;
  velocity: Vector3D;
  acceleration: Vector3D;
  forces: Force[];
  fixed?: boolean;
}

export interface ElectricField {
  strength: Vector3D;
  potential: number;
  source?: ChargedObject;
}

export interface MagneticField {
  strength: Vector3D;
  flux: number;
  source?: CurrentLoop;
}

export interface ChargedObject {
  charge: number;
  position: Vector3D;
  velocity?: Vector3D;
}

export interface CurrentLoop {
  current: number;
  radius: number;
  position: Vector3D;
  normal: Vector3D;
}

export interface WaveFunction {
  amplitude: Float32Array;
  phase: Float32Array;
  probability?: Float32Array;
  gridSize: { x: number; y: number; z?: number };
}

export interface CollisionData {
  objectA: string;
  objectB: string;
  point: Vector3D;
  normal: Vector3D;
  depth: number;
  impulse: number;
}

export interface Trajectory {
  points: Vector3D[];
  times: number[];
  velocities?: Vector3D[];
}