// physics-engine/types/state.ts

import type { ExperimentState } from './experiments';

export interface StateSnapshot {
  id: string;
  name: string;
  state: ExperimentState;
  timestamp: number;
  description?: string;
}

export interface StateHistory {
  frames: ExperimentState[];
  snapshots: StateSnapshot[];
  parameterChanges: ParameterChangeRecord[];
}

export interface ParameterChangeRecord {
  parameter: string;
  oldValue: number;
  newValue: number;
  timestamp: number;
  reason?: string;
}

export interface ProgressData {
  objectiveId: string;
  progress: number; // 0-1
  completed: boolean;
  timestamp: number;
}

export interface SessionData {
  sessionId: string;
  experimentName: string;
  startTime: number;
  endTime?: number;
  totalTime: number;
  progress: ProgressData[];
  snapshots: StateSnapshot[];
  parameterChanges: ParameterChangeRecord[];
}