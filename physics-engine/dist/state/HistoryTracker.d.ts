import type { ParameterChange, StateChange } from '../types';
export declare class HistoryTracker {
    private parameterHistory;
    private stateHistory;
    private maxHistorySize;
    recordParameterChange(parameter: string, oldValue: number, newValue: number): void;
    recordStateChange(field: string, oldValue: any, newValue: any): void;
    getParameterHistory(parameter?: string): ParameterChange[];
    getStateHistory(field?: string): StateChange[];
    getParameterChangeCount(parameter: string): number;
    getRecentChanges(count?: number): {
        parameters: ParameterChange[];
        states: StateChange[];
    };
    clear(): void;
    private trimHistory;
    export(): string;
    import(json: string): void;
}
//# sourceMappingURL=HistoryTracker.d.ts.map