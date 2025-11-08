// physics-engine/types/renderer.ts

import type * as THREE from 'three';
import type { Vector3D } from './index';

export interface RendererConfig {
  canvas?: HTMLCanvasElement;
  antialias?: boolean;
  shadows?: boolean;
  physicallyCorrectLights?: boolean;
  toneMapping?: THREE.ToneMapping;
}

export interface CameraConfig {
  type: 'perspective' | 'orthographic';
  fov?: number;
  near?: number;
  far?: number;
  position?: Vector3D;
  lookAt?: Vector3D;
}

export interface LightConfig {
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
  color: number | string;
  intensity: number;
  position?: Vector3D;
  castShadow?: boolean;
}

export interface SceneConfig {
  background?: number | string | THREE.Texture;
  fog?: {
    type: 'linear' | 'exponential';
    color: number | string;
    near?: number;
    far?: number;
    density?: number;
  };
  lights?: LightConfig[];
}

export interface MaterialPreset {
  name: string;
  type: 'standard' | 'physical' | 'basic' | 'lambert' | 'phong';
  color: number | string;
  metalness?: number;
  roughness?: number;
  emissive?: number | string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}

export interface RenderObject {
  id: string;
  mesh: THREE.Mesh | THREE.Group;
  position: Vector3D;
  rotation?: Vector3D;
  scale?: Vector3D;
  visible: boolean;
}

export interface VisualEffect {
  type: 'glow' | 'trail' | 'motion-blur' | 'wave';
  target: string; // Object ID
  enabled: boolean;
  parameters: Record<string, any>;
}

export interface UIElement {
  id: string;
  type: 'text' | 'gauge' | 'graph' | 'button' | 'slider';
  position: { x: number; y: number };
  content: any;
  style?: Record<string, any>;
}

export interface MeasurementTool {
  type: 'ruler' | 'protractor' | 'grid' | 'vector';
  position: Vector3D;
  scale: number;
  visible: boolean;
}