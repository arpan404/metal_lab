// physics-engine/state/SnapshotManager.ts
import type { Snapshot, ExperimentState } from '../types/Experiments';

export class SnapshotManager {
  private snapshots: Map<string, Snapshot> = new Map();
  private maxSnapshots: number = 50;
  
  create(name: string, state: ExperimentState): string {
    const id = `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const snapshot: Snapshot = {
      id,
      name,
      state: JSON.parse(JSON.stringify(state)), // Deep copy
      timestamp: Date.now()
    };
    
    this.snapshots.set(id, snapshot);
    
    // Cleanup old snapshots if limit exceeded
    if (this.snapshots.size > this.maxSnapshots) {
      const oldest = Array.from(this.snapshots.values())
        .sort((a, b) => a.timestamp - b.timestamp)[0];
      this.snapshots.delete(oldest.id);
    }
    
    return id;
  }
  
  load(id: string): Snapshot | null {
    return this.snapshots.get(id) || null;
  }
  
  delete(id: string): boolean {
    return this.snapshots.delete(id);
  }
  
  getAll(): Snapshot[] {
    return Array.from(this.snapshots.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }
  
  findByName(name: string): Snapshot[] {
    return Array.from(this.snapshots.values())
      .filter(s => s.name.toLowerCase().includes(name.toLowerCase()))
      .sort((a, b) => b.timestamp - a.timestamp);
  }
  
  clear(): void {
    this.snapshots.clear();
  }
  
  exportAll(): string {
    const data = Array.from(this.snapshots.values());
    return JSON.stringify(data, null, 2);
  }
  
  importAll(json: string): number {
    try {
      const data = JSON.parse(json) as Snapshot[];
      let imported = 0;
      
      data.forEach(snapshot => {
        this.snapshots.set(snapshot.id, snapshot);
        imported++;
      });
      
      return imported;
    } catch (e) {
      console.error('Failed to import snapshots:', e);
      return 0;
    }
  }
}