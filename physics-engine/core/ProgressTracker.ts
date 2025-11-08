// physics-engine/core/ProgressTracker.ts
import type { LearningObjective } from '../types';
import type { BaseExperiment } from '../experiments/BaseExperiment';

export class ProgressTracker {
  private objectives: LearningObjective[] = [];
  private completedObjectives: Set<string> = new Set();
  private objectiveProgress: Map<string, number> = new Map();
  
  reset(objectives: LearningObjective[]): void {
    this.objectives = objectives;
    this.completedObjectives.clear();
    this.objectiveProgress.clear();
    
    objectives.forEach(obj => {
      this.objectiveProgress.set(obj.id, 0);
    });
  }
  
  update(experiment: BaseExperiment): void {
    const measurements = experiment.getMeasurements();
    
    this.objectives.forEach(objective => {
      if (this.completedObjectives.has(objective.id)) return;
      
      // Check if objective criteria met
      const progress = this.calculateObjectiveProgress(objective, measurements);
      this.objectiveProgress.set(objective.id, progress);
      
      // Mark as complete if 100%
      if (progress >= 1.0) {
        this.completedObjectives.add(objective.id);
      }
    });
  }
  
  private calculateObjectiveProgress(
    objective: LearningObjective,
    measurements: Record<string, number>
  ): number {
    // Evaluate objective criteria
    // This is a simplified version - can be much more sophisticated
    
    if (objective.criteria.type === 'measurement') {
      const { key, target, tolerance } = objective.criteria;
      const actual = measurements[key];
      
      if (actual === undefined) return 0;
      
      const error = Math.abs(actual - target);
      const progress = Math.max(0, 1 - (error / tolerance));
      
      return progress;
    }
    
    if (objective.criteria.type === 'time_spent') {
      const { duration } = objective.criteria;
      const elapsed = measurements.elapsedTime ?? 0;
      
      return Math.min(1, elapsed / duration);
    }
    
    if (objective.criteria.type === 'parameter_exploration') {
      const { parameter, minChanges } = objective.criteria;
      const changes = measurements[`${parameter}_changes`] ?? 0;
      
      return Math.min(1, changes / minChanges);
    }
    
    return 0;
  }
  
  getProgress(): number {
    if (this.objectives.length === 0) return 0;
    
    const totalProgress = Array.from(this.objectiveProgress.values())
      .reduce((sum, p) => sum + p, 0);
    
    return (totalProgress / this.objectives.length) * 100;
  }
  
  getDetails() {
    return {
      total: this.objectives.length,
      completed: this.completedObjectives.size,
      percentage: this.getProgress(),
      objectives: this.objectives.map(obj => ({
        id: obj.id,
        name: obj.name,
        description: obj.description,
        progress: (this.objectiveProgress.get(obj.id) ?? 0) * 100,
        completed: this.completedObjectives.has(obj.id)
      }))
    };
  }
}