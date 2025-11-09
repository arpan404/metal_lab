import * as THREE from 'three';
import { BaseScene } from './BaseScene';
import type { MillikanOilDrop } from '../../experiments/MillikanOilDrop';
/**
 * 3D scene for Millikan oil drop experiment
 */
export declare class MillikanScene extends BaseScene {
    private millikan;
    private chamber;
    private plates;
    private droplets;
    private fieldLines;
    constructor(scene: THREE.Scene, experiment: MillikanOilDrop);
    initialize(): Promise<void>;
    private createChamber;
    private createPlates;
    private createFieldLines;
    private createLightSource;
    update(deltaTime: number): void;
    /**
     * Toggle field line visibility
     */
    showFieldLines(show: boolean): void;
    dispose(): void;
}
//# sourceMappingURL=MillikanScene.d.ts.map