import * as THREE from 'three';
export interface DoubleSlitConfig {
    barrierWidth: number;
    barrierHeight: number;
    barrierThickness: number;
    slitWidth: number;
    slitSeparation: number;
    screenDistance: number;
}
export declare class DoubleSlitBarrier {
    private group;
    private config;
    private barrier?;
    private screen?;
    constructor(config: DoubleSlitConfig);
    private buildBarrier;
    private buildScreen;
    private addSlitLabels;
    getObject3D(): THREE.Group;
    getScreen(): THREE.Mesh | undefined;
    updateScreenTexture(texture: THREE.Texture): void;
    dispose(): void;
}
//# sourceMappingURL=DoubleSlitBarrier.d.ts.map