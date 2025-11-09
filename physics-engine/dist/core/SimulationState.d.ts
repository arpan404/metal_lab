export declare class SimulationState<T extends Record<string, unknown>> {
    private currentState;
    private previousState;
    update(newState: T): void;
    getCurrent(): T | null;
    getPrevious(): T | null;
    getDelta(): Partial<T>;
    reset(): void;
}
//# sourceMappingURL=SimulationState.d.ts.map