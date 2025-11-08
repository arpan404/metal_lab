// physics-engine/types/state.ts

export interface Snapshot {
    id: string;
    name: string;
    state: ExperimentState;
    timestamp: number;
    metadata?: Record<string, any>;
  }
  
  export interface ParameterChange {
    parameter?: string;
    key?: string;
    oldValue?: number;
    value?: number;
    newValue?: number;
    timestamp: number;
  }
  
  export interface StateChange {
    field: string;
    oldValue: any;
    newValue: any;
    timestamp: number;
  }
  
  export interface SaveData {
    snapshots: Snapshot[];
    parameterHistory: ParameterChange[];
    stateHistory?: StateChange[];
    metadata?: {
      experimentId: string;
      version: string;
      createdAt: number;
      modifiedAt: number;
    };
  }
  
  import type { ExperimentState } from './experiments';