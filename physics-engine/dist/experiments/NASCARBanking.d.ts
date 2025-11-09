import { BaseExperiment } from './BaseExperiment';
import type { ExperimentState, ExplanationPoint } from '../types/Experiments';
export declare class NASCARBanking extends BaseExperiment {
    private classicalEngine;
    private carId;
    private trackRadius;
    private bankAngle;
    private velocity;
    private currentAngle;
    private lapCount;
    constructor();
    initialize(): Promise<void>;
    update(deltaTime: number): void;
    private calculateRequiredFriction;
    private calculateOptimalSpeed;
    reset(): void;
    getState(): ExperimentState;
    setState(state: ExperimentState): void;
    getExplanationPoints(): ExplanationPoint[];
    getMeasurements(): Record<string, number>;
    protected onParameterChanged(key: string, value: number): void;
}
//# sourceMappingURL=NASCARBanking.d.ts.map