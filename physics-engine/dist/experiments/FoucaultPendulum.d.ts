import { BaseExperiment } from './BaseExperiment';
import type { ExperimentState, ExplanationPoint } from '../types/Experiments';
export declare class FoucaultPendulum extends BaseExperiment {
    private rotationalEngine;
    private classicalEngine;
    private pendulumBobId;
    private stringLength;
    private bobMass;
    private initialAngle;
    private precessionAngle;
    constructor();
    initialize(): Promise<void>;
    update(deltaTime: number): void;
    reset(): void;
    getState(): ExperimentState;
    setState(state: ExperimentState): void;
    getExplanationPoints(): ExplanationPoint[];
    getMeasurements(): Record<string, number>;
    protected onParameterChanged(key: string, value: number): void;
}
//# sourceMappingURL=FoucaultPendulum.d.ts.map