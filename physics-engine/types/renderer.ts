// physics-engine/types/renderer.ts
import * as THREE from 'three';

export interface RenderConfig {
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
  antialias?: boolean;
  shadows?: boolean;
  postProcessing?: boolean;
}

export interface CameraConfig {
  type: 'perspective' | 'orthographic';
  position: { x: number; y: number; z: number };
  lookAt: { x: number; y: number; z: number };
  fov?: number;
  near?: number;
  far?: number;
}

export interface LightConfig {
  type: 'ambient' | 'directional' | 'point' | 'spot';
  color: number;
  intensity: number;
  position?: { x: number; y: number; z: number };
  target?: { x: number; y: number; z: number };
  castShadow?: boolean;
}

export interface MaterialConfig {
  type: 'basic' | 'lambert' | 'phong' | 'standard' | 'physical';
  color?: number;
  emissive?: number;
  metalness?: number;
  roughness?: number;
  transparent?: boolean;
  opacity?: number;
}

export interface EffectConfig {
  bloom?: {
    strength: number;
    radius: number;
    threshold: number;
  };
  motionBlur?: {
    samples: number;
    intensity: number;
  };
  glow?: {
    strength: number;
    radius: number;
    color: number;
  };
}

export interface VisualizationMode {
  type: 'normal' | 'wireframe' | 'heatmap' | 'vector_field' | 'streamlines';
  config?: Record<string, any>;
}

export interface Annotation {
  id: string;
  text: string;
  position: { x: number; y: number; z: number };
  style?: {
    color?: string;
    fontSize?: number;
    background?: string;
  };
}