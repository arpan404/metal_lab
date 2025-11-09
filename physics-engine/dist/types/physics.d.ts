import type { Vector3D } from './index';
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
export interface PhysicsConstants {
    g: number;
    c: number;
    h: number;
    hbar: number;
    e: number;
    k: number;
    epsilon0: number;
    mu0: number;
    me: number;
    mp: number;
    mn: number;
    earthOmega: number;
}
//# sourceMappingURL=physics.d.ts.map