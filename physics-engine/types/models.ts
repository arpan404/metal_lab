// physics-engine/types/models.ts

import type * as THREE from 'three';
import type { Vector3D } from './index';

export interface ModelAsset {
  id: string;
  name: string;
  path: string;
  type: 'gltf' | 'glb' | 'obj' | 'fbx';
  scale?: number;
  rotation?: Vector3D;
  license?: string;
  attribution?: string;
}

export interface ProceduralModelConfig {
  type: string;
  parameters: Record<string, any>;
}

export interface BankedTrackConfig extends ProceduralModelConfig {
  type: 'banked-track';
  parameters: {
    radius: number;
    bankAngle: number;
    width: number;
    segments: number;
    color: number | string;
  };
}

export interface DoubleSlitBarrierConfig extends ProceduralModelConfig {
  type: 'double-slit';
  parameters: {
    width: number;
    height: number;
    thickness: number;
    slitWidth: number;
    slitSeparation: number;
    color: number | string;
  };
}

export interface GoldFoilSetupConfig extends ProceduralModelConfig {
  type: 'gold-foil';
  parameters: {
    foilRadius: number;
    foilThickness: number;
    detectorRadius: number;
    detectorCount: number;
    sourcePosition: Vector3D;
  };
}

export interface MillikanChamberConfig extends ProceduralModelConfig {
  type: 'millikan-chamber';
  parameters: {
    width: number;
    height: number;
    depth: number;
    plateSeparation: number;
    plateThickness: number;
  };
}

export interface PendulumRigConfig extends ProceduralModelConfig {
  type: 'pendulum-rig';
  parameters: {
    height: number;
    stringLength: number;
    bobRadius: number;
    standWidth: number;
  };
}

export interface ElectricFieldPlatesConfig extends ProceduralModelConfig {
  type: 'electric-plates';
  parameters: {
    plateWidth: number;
    plateHeight: number;
    plateThickness: number;
    separation: number;
  };
}

export interface ParticleEmitterConfig extends ProceduralModelConfig {
  type: 'particle-emitter';
  parameters: {
    position: Vector3D;
    direction: Vector3D;
    particleSize: number;
    emissionRate: number;
    particleColor: number | string;
  };
}

export interface MeasurementGridConfig extends ProceduralModelConfig {
  type: 'measurement-grid';
  parameters: {
    size: number;
    divisions: number;
    color: number | string;
    opacity: number;
  };
}

export interface ModelLoadOptions {
  scale?: number;
  position?: Vector3D;
  rotation?: Vector3D;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export interface ModelCache {
  [key: string]: THREE.Group | THREE.Mesh;
}