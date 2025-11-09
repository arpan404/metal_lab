import type { LearningObjective } from '../types';
export interface ObjectiveProgress {
    objectiveId: string;
    progress: number;
    completed: boolean;
    timestamp: number;
    measurements: Record<string, number>;
}
export declare class ProgressCalculator {
    private objectives;
    private progress;
    setObjectives(objectives: LearningObjective[]): void;
    updateProgress(measurements: Record<string, number>): void;
    private calculateProgress;
    private calculateMeasurementProgress;
    private calculateTimeProgress;
    private calculateExplorationProgress;
    getOverallProgress(): number;
    getObjectiveProgress(objectiveId: string): ObjectiveProgress | null;
    getAllProgress(): ObjectiveProgress[];
    getCompletedObjectives(): LearningObjective[];
    getIncompleteObjectives(): LearningObjective[];
    getNextObjective(): LearningObjective | null;
    reset(): void;
    export(): string;
    import(json: string): void;
}
//# sourceMappingURL=ProgressCalculator.d.ts.map