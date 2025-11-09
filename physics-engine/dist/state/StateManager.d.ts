import type { ExperimentState, Snapshot } from '../types/Experiments';
import type { ParameterChange } from '../types/index';
export declare class StateManager {
    private snapshots;
    private frameHistory;
    private parameterHistory;
    private maxFrameHistory;
    reset(): void;
    recordFrame(state: ExperimentState): void;
    recordParameterChange(key: string, value: number): void;
    saveSnapshot(name: string, state: ExperimentState): string;
    loadSnapshot(id: string): Snapshot;
    getAllSnapshots(): Snapshot[];
    deleteSnapshot(id: string): void;
    getFrameHistory(): ExperimentState[];
    getParameterHistory(): ParameterChange[];
    /**
     * Export full state as JSON
     */
    export(): string;
    /**
     * Import state from JSON
     */
    import(json: string): void;
}
//# sourceMappingURL=StateManager.d.ts.map