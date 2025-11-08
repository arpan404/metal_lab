// physics-engine/core/SimulationState.ts
import type { ExperimentState } from '../types/experiments';

export class SimulationState {
  private currentState: ExperimentState | null = null;
  private previousState: ExperimentState | null = null;
  
  update(newState: ExperimentState): void {
    this.previousState = this.currentState;
    this.currentState = { ...newState };
  }
  
  getCurrent(): ExperimentState | null {
    return this.currentState;
  }
  
  getPrevious(): ExperimentState | null {
    return this.previousState;
  }
  
  getDelta(): Partial<ExperimentState> {
    if (!this.currentState || !this.previousState) {
      return {};
    }
    
    const delta: any = {};
    Object.keys(this.currentState).forEach(key => {
      if (this.currentState![key] !== this.previousState![key]) {
        delta[key] = this.currentState![key];
      }
    });
    
    return delta;
  }
  
  reset(): void {
    this.currentState = null;
    this.previousState = null;
  }
}