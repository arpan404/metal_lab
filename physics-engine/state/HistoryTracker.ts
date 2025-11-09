// physics-engine/state/HistoryTracker.ts
import type { ParameterChange, StateChange } from '../types';

export class HistoryTracker {
  private parameterHistory: ParameterChange[] = [];
  private stateHistory: StateChange[] = [];
  private maxHistorySize: number = 1000;
  
  recordParameterChange(
    parameter: string,
    oldValue: number,
    newValue: number
  ): void {
    this.parameterHistory.push({
      parameter,
      oldValue,
      newValue,
      timestamp: Date.now()
    });
    
    this.trimHistory();
  }
  
  recordStateChange(
    field: string,
    oldValue: any,
    newValue: any
  ): void {
    this.stateHistory.push({
      field,
      oldValue,
      newValue,
      timestamp: Date.now()
    });
    
    this.trimHistory();
  }
  
  getParameterHistory(parameter?: string): ParameterChange[] {
    if (parameter) {
      return this.parameterHistory.filter(h => h.parameter === parameter);
    }
    return [...this.parameterHistory];
  }
  
  getStateHistory(field?: string): StateChange[] {
    if (field) {
      return this.stateHistory.filter(h => h.field === field);
    }
    return [...this.stateHistory];
  }
  
  getParameterChangeCount(parameter: string): number {
    return this.parameterHistory.filter(h => h.parameter === parameter).length;
  }
  
  getRecentChanges(count: number = 10): {
    parameters: ParameterChange[];
    states: StateChange[];
  } {
    return {
      parameters: this.parameterHistory.slice(-count),
      states: this.stateHistory.slice(-count)
    };
  }
  
  clear(): void {
    this.parameterHistory = [];
    this.stateHistory = [];
  }
  
  private trimHistory(): void {
    if (this.parameterHistory.length > this.maxHistorySize) {
      this.parameterHistory = this.parameterHistory.slice(-this.maxHistorySize);
    }
    
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory = this.stateHistory.slice(-this.maxHistorySize);
    }
  }
  
  export(): string {
    return JSON.stringify({
      parameters: this.parameterHistory,
      states: this.stateHistory
    }, null, 2);
  }
  
  import(json: string): void {
    try {
      const data = JSON.parse(json);
      this.parameterHistory = data.parameters || [];
      this.stateHistory = data.states || [];
    } catch (e) {
      console.error('Failed to import history:', e);
    }
  }
}