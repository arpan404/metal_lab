import { BaseExperiment } from './BaseExperiment';
import type { Vector3D } from '../types';
import type { ExperimentState, ExplanationPoint } from '../types/Experiments';
interface AlphaParticle {
    id: string;
    position: Vector3D;
    velocity: Vector3D;
    deflectionAngle: number;
    impactParameter: number;
    detected: boolean;
}
export declare class RutherfordGoldFoil extends BaseExperiment {
    private particles;
    private nextParticleId;
    private nucleusCharge;
    private alphaCharge;
    private alphaEnergy;
    private detections;
    private particlesEmitted;
    private particlesDetected;
    constructor();
    initialize(): Promise<void>;
    update(deltaTime: number): void;
    private emitParticle;
    private updateParticle;
    private detectParticle;
    private getLargeAngleCount;
    reset(): void;
    getState(): ExperimentState;
    setState(state: ExperimentState): void;
    getExplanationPoints(): ExplanationPoint[];
    getMeasurements(): Record<string, number>;
    private calculateAverageDeflection;
    protected onParameterChanged(key: string, value: number): void;
    getDetectionData(): Map<number, number>;
    getActiveParticles(): AlphaParticle[];
}
export {};
//# sourceMappingURL=RutherfordGoldFoil.d.ts.map