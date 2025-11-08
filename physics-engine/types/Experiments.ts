// physics-engine/types/experiments.ts

export interface ExperimentState {
    name: string;
    elapsedTime: number;
    frameCount: number;
    parameters: [string, number][];
    measurements: Record<string, number>;
    objects?: ExperimentObject[];
    customData?: any;
  }
  
  export interface ExperimentObject {
    id: string;
    type: string;
    position: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
    velocity?: { x: number; y: number; z: number };
    properties?: Record<string, any>;
  }
  
  export interface ParameterConfig {
    name: string;
    label: string;
    default: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    description?: string;
  }
  
  export interface LearningObjective {
    id: string;
    name: string;
    description: string;
    criteria: ObjectiveCriteria;
    hint?: string;
    points?: number;
  }
  
  export interface ObjectiveCriteria {
    type: 'measurement' | 'time_spent' | 'parameter_exploration' | 'sequence' | 'custom';
    key?: string;
    target?: number;
    tolerance?: number;
    duration?: number;
    parameter?: string;
    minChanges?: number;
    sequence?: string[];
    customCheck?: (state: ExperimentState) => boolean;
  }
  
  export interface ExplanationPoint {
    id: string;
    type: 'concept' | 'milestone' | 'hint' | 'warning';
    condition: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    audioRequired?: boolean;
    pauseSimulation?: boolean;
    highlight?: string[];
  }