import type { LearningObjective } from '../types';
import type { BaseExperiment } from '../experiments/BaseExperiment';
export declare class ProgressTracker {
    private objectives;
    private completedObjectives;
    private objectiveProgress;
    reset(objectives: LearningObjective[]): void;
    update(experiment: BaseExperiment): void;
    private calculateObjectiveProgress;
    getProgress(): number;
    getDetails(): {
        total: number;
        completed: number;
        percentage: number;
        objectives: {
            id: string;
            name: string;
            description: string;
            progress: number;
            completed: boolean;
        }[];
    };
}
//# sourceMappingURL=ProgressTracker.d.ts.map