import * as THREE from 'three';
export interface MillikanChamberConfig {
    width: number;
    height: number;
    depth: number;
    wallThickness?: number;
}
export declare class MillikanChamber {
    private group;
    private config;
    constructor(config: MillikanChamberConfig);
    private buildChamber;
    private addFrame;
    getObject3D(): THREE.Group;
    dispose(): void;
}
export declare class ParticleEmitter {
    private group;
    constructor();
    private buildEmitter;
    getObject3D(): THREE.Group;
    dispose(): void;
}
export declare class MeasurementGrid {
    private group;
    constructor(size?: number, divisions?: number);
    private buildGrid;
    private addAxisLabels;
    getObject3D(): THREE.Group;
    dispose(): void;
}
//# sourceMappingURL=MillikanChamber.d.ts.map