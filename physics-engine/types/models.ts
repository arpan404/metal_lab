// physics-engine/types/models.ts

export interface ModelConfig {
    id: string;
    type: 'gltf' | 'obj' | 'fbx' | 'procedural';
    source?: string;
    scale?: { x: number; y: number; z: number };
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    material?: any;
  }
  
  export interface ProceduralModelConfig {
    type: 'track' | 'chamber' | 'barrier' | 'pendulum' | 'plates';
    parameters: Record<string, any>;
    materials?: Record<string, any>;
  }
  
  export interface LoadedModel {
    id: string;
    object3D: any; // THREE.Object3D
    animations?: any[]; // THREE.AnimationClip[]
    boundingBox?: {
      min: { x: number; y: number; z: number };
      max: { x: number; y: number; z: number };
    };
  }
  
  export interface ModelAsset {
    name: string;
    path: string;
    type: string;
    size?: number;
    license?: string;
    source?: string;
  }