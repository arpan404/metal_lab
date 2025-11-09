import * as THREE from 'three';
import { BaseScene } from './BaseScene';
import type { RutherfordGoldFoil } from '../../experiments/RutherfordGoldFoil';
/**
 * 3D scene for Rutherford gold foil experiment
 */
export declare class RutherfordScene extends BaseScene {
    private rutherford;
    private nucleus;
    private foil;
    private particles;
    private trails;
    private detectors;
    constructor(scene: THREE.Scene, experiment: RutherfordGoldFoil);
    initialize(): Promise<void>;
    private createNucleus;
    private createFoil;
    private createSource;
    private createDetectors;
    update(deltaTime: number): void;
    dispose(): void;
}
//# sourceMappingURL=RutherfordScene.d.ts.map