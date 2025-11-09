import * as THREE from 'three';
export interface PendulumRigConfig {
    length: number;
    bobRadius: number;
    wireRadius?: number;
    baseRadius?: number;
    baseHeight?: number;
}
export declare class PendulumRig {
    private group;
    private config;
    private wire?;
    private bob?;
    private base?;
    constructor(config: PendulumRigConfig);
    private buildRig;
    private addCompassRose;
    setPendulumAngle(theta: number, phi: number): void;
    getObject3D(): THREE.Group;
    getBobPosition(): THREE.Vector3;
    dispose(): void;
}
//# sourceMappingURL=PendulumRig.d.ts.map