import { BaseExperiment } from './BaseExperiment';
import type { ExperimentState, ExplanationPoint } from '../types/Experiments';
export declare class MillikanOilDrop extends BaseExperiment {
    private electricEngine;
    private droplets;
    private nextDropletId;
    private plateVoltage;
    private plateSeparation;
    private fieldStrength;
    private measuredCharges;
    constructor();
    initialize(): Promise<void>;
    private createDroplet;
    update(deltaTime: number): void;
    measureDropletCharge(dropletId: string): number | null;
    private calculateQuantizationConfidence;
    reset(): void;
    getState(): ExperimentState;
    setState(state: ExperimentState): void;
    getExplanationPoints(): ExplanationPoint[];
    getMeasurements(): Record<string, number>;
    protected onParameterChanged(key: string, value: number): void;
    spawnDroplet(): void;
}
//# sourceMappingURL=MillikanOilDrop.d.ts.map