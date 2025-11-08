// physics-engine/types/experiments.ts

import type { Vector3D } from './index';

export interface ExperimentState {
  name: string;
  parameters: Record<string, number>;
  measurements: Record<string, number>;
  objects: ExperimentObject[];
  elapsedTime: number;
  frameCount: number;
  waveField?: number[]; // For quantum experiments
}

export interface ExperimentObject {
  id: string;
  position: Vector3D;
  velocity: Vector3D;
  rotation?: Vector3D;
  angularVelocity?: Vector3D;
  mass?: number;
  charge?: number;
  deflectionAngle?: number;
}

export interface Snapshot {
  id: string;
  name: string;
  state: ExperimentState;
  timestamp: number;
}

export interface ExplanationPoint {
  id: string;
  type: 'concept' | 'observation' | 'warning' | 'achievement';
  priority: 'low' | 'medium' | 'high';
  condition: string; // JavaScript expression to evaluate
  message: string;
  audioRequired?: boolean;
  pauseSimulation?: boolean;
}

export interface ExperimentMetadata {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  tags: string[];
  prerequisites?: string[];
}

export interface ExperimentConfig {
  metadata: ExperimentMetadata;
  parameters: ParameterConfig[];
  objectives: LearningObjective[];
  explanationPoints: ExplanationPoint[];
}

import type { ParameterConfig, LearningObjective } from './index';