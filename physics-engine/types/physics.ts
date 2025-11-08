// physics-engine/types/physics.ts

import type { Vector3D } from './index';

// Mechanics types
export interface CircularMotionParams {
  radius: number;
  velocity: number;
  mass: number;
  bankAngle?: number;
  frictionCoefficient?: number;
}

export interface PendulumParams {
  length: number;
  mass: number;
  angle: number;
  angularVelocity: number;
  damping?: number;
}

export interface ForceVector {
  name: string;
  vector: Vector3D;
  magnitude: number;
  color?: string;
}

// Electromagnetism types
export interface ElectricFieldParams {
  strength: Vector3D;
  voltage?: number;
  plateSeparation?: number;
}

export interface MagneticFieldParams {
  strength: Vector3D;
  direction: Vector3D;
}

export interface ChargedParticleParams {
  charge: number;
  mass: number;
  position: Vector3D;
  velocity: Vector3D;
}

// Quantum types
export interface WaveParameters {
  gridSize: number;
  wavelength: number;
  frequency: number;
  amplitude: number;
  dt: number;
  slitSeparation: number;
  slitWidth?: number;
}

export interface WaveFunctionState {
  real: Float32Array;
  imaginary: Float32Array;
  probability: Float32Array;
}

export interface QuantumState {
  waveFunction: WaveFunctionState;
  energy: number;
  momentum: Vector3D;
}

// Nuclear types
export interface ScatteringParams {
  impactParameter: number;
  energy: number;
  charge1: number;
  charge2: number;
  mass: number;
}

export interface ScatteringResult {
  deflectionAngle: number;
  closestApproach: number;
  trajectory: Vector3D[];
}

// Rotational mechanics
export interface RotationalParams {
  angularVelocity: Vector3D;
  angularAcceleration: Vector3D;
  momentOfInertia: number;
  torque: Vector3D;
}

export interface CoriolisParams {
  latitude: number;
  velocity: Vector3D;
  mass: number;
}

// Physical constants
export interface PhysicsConstants {
  g: number; // Gravitational acceleration (m/s²)
  c: number; // Speed of light (m/s)
  h: number; // Planck constant (J·s)
  hbar: number; // Reduced Planck constant
  e: number; // Elementary charge (C)
  k: number; // Coulomb constant (N·m²/C²)
  epsilon0: number; // Vacuum permittivity
  mu0: number; // Vacuum permeability
  me: number; // Electron mass (kg)
  mp: number; // Proton mass (kg)
  mn: number; // Neutron mass (kg)
  earthOmega: number; // Earth's angular velocity (rad/s)
}