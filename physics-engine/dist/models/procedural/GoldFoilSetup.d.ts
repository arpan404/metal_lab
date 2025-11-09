import * as THREE from 'three';
export interface GoldFoilConfig {
    foilRadius: number;
    foilThickness: number;
    detectorRadius: number;
    detectorCount: number;
    sourceDistance: number;
    showDetectors?: boolean;
}
export declare class GoldFoilSetup {
    private group;
    private config;
    private foilMesh?;
    private detectors;
    constructor(config: GoldFoilConfig);
    private buildSetup;
    private createSource;
    private createDetectors;
    private addAxes;
    getObject3D(): THREE.Group;
    highlightDetector(index: number, intensity?: number): void;
    resetDetectors(): void;
    dispose(): void;
}
//# sourceMappingURL=GoldFoilSetup.d.ts.map