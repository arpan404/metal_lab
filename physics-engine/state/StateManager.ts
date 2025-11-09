// physics-engine/state/StateManager.ts
import type { ExperimentState, Snapshot } from '../types/Experiments';
import type { ParameterChange } from '../types/index';

export class StateManager {
  private snapshots: Map<string, Snapshot> = new Map();
  private frameHistory: ExperimentState[] = [];
  private parameterHistory: ParameterChange[] = [];
  
  private maxFrameHistory: number = 1000; // Keep last 1000 frames
  
  reset(): void {
    this.frameHistory = [];
    this.parameterHistory = [];
  }
  
  recordFrame(state: ExperimentState): void {
    this.frameHistory.push(state);
    
    // Limit history size
    if (this.frameHistory.length > this.maxFrameHistory) {
      this.frameHistory.shift();
    }
  }
  
  recordParameterChange(key: string, value: number): void {
    this.parameterHistory.push({
      key,
      value,
      timestamp: Date.now()
    });
  }
  
  saveSnapshot(name: string, state: ExperimentState): string {
    const id = `snapshot-${Date.now()}`;
    
    this.snapshots.set(id, {
      id,
      name,
      state,
      timestamp: Date.now()
    });
    
    return id;
  }
  
  loadSnapshot(id: string): Snapshot {
    const snapshot = this.snapshots.get(id);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${id}`);
    }
    return snapshot;
  }
  
  getAllSnapshots(): Snapshot[] {
    return Array.from(this.snapshots.values());
  }
  
  deleteSnapshot(id: string): void {
    this.snapshots.delete(id);
  }
  
  getFrameHistory(): ExperimentState[] {
    return [...this.frameHistory];
  }
  
  getParameterHistory(): ParameterChange[] {
    return [...this.parameterHistory];
  }
  
  /**
   * Export full state as JSON
   */
  export(): string {
    return JSON.stringify({
      snapshots: Array.from(this.snapshots.entries()),
      parameterHistory: this.parameterHistory,
      // Don't export frame history (too large)
    });
  }
  
  /**
   * Import state from JSON
   */
  import(json: string): void {
    const data = JSON.parse(json);
    
    this.snapshots = new Map(data.snapshots);
    this.parameterHistory = data.parameterHistory;
  }
}