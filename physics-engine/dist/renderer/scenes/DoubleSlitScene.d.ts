import * as THREE from 'three';
import { BaseScene } from './BaseScene';
import type { YoungDoubleSlit } from '../../experiments/YoungDoubleSlit';
/**
 * 3D scene for Young's double slit experiment
 */
export declare class DoubleSlitScene extends BaseScene {
    private doubleSlit;
    private waveTexture;
    private wavePlane;
    private barrier;
    private screen;
    private patternCanvas;
    constructor(scene: THREE.Scene, experiment: YoungDoubleSlit);
    initialize(): Promise<void>;
    private createBarrier;
    private createScreen;
    private createWavePlane;
    private createLightSource;
    update(_deltaTime: number): void;
    private updateInterferencePattern;
    dispose(): void;
}
//# sourceMappingURL=DoubleSlitScene.d.ts.map