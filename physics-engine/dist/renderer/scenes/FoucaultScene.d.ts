import * as THREE from 'three';
import { BaseScene } from './BaseScene';
import type { FoucaultPendulum } from '../../experiments/FoucaultPendulum';
/**
 * 3D scene for Foucault Pendulum experiment
 */
export declare class FoucaultScene extends BaseScene {
    private pendulum;
    private bob;
    private string;
    private trailPoints;
    private trailLine;
    constructor(scene: THREE.Scene, experiment: FoucaultPendulum);
    initialize(): Promise<void>;
    private createPendulumRig;
    private createBob;
    private createString;
    private createTrail;
    private createGround;
    update(deltaTime: number): void;
    dispose(): void;
}
//# sourceMappingURL=FoucaultScene.d.ts.map