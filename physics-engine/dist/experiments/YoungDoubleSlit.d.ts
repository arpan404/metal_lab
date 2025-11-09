import { BaseExperiment } from './BaseExperiment';
import type { ExperimentState, ExplanationPoint } from '../types/Experiments';
export declare class YoungDoubleSlit extends BaseExperiment {
    private quantumEngine;
    private gridSize;
    private wavelength;
    private slitSeparation;
    private slitWidth;
    private waveField;
    private interferencePattern;
    constructor();
    initialize(): Promise<void>;
    private initializeWaveField;
    update(deltaTime: number): Promise<void>;
    private calculateInterferencePattern;
    private countFringes;
    private calculateFringeSpacing;
    reset(): void;
    getState(): ExperimentState;
    setState(state: ExperimentState): void;
    getExplanationPoints(): ExplanationPoint[];
    getMeasurements(): Record<string, number>;
    protected onParameterChanged(key: string, value: number): void;
    getWaveField(): Float32Array;
    getInterferencePattern(): Float32Array;
}
//# sourceMappingURL=YoungDoubleSlit.d.ts.map