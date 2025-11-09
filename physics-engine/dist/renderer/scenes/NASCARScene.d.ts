import * as THREE from 'three';
import { BaseScene } from './BaseScene';
import type { NASCARBanking } from '../../experiments/NASCARBanking';
/**
 * 3D scene for NASCAR banking experiment
 */
export declare class NASCARScene extends BaseScene {
    private nascar;
    private car;
    private track;
    constructor(scene: THREE.Scene, experiment: NASCARBanking);
    initialize(): Promise<void>;
    private createTrack;
    private loadCar;
    private createSimpleCar;
    private createForceVectors;
    private createEnvironment;
    update(deltaTime: number): void;
    /**
     * Toggle force vector visibility
     */
    showForceVectors(show: boolean): void;
    dispose(): void;
}
//# sourceMappingURL=NASCARScene.d.ts.map