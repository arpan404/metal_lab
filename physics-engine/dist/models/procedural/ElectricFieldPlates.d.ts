import * as THREE from 'three';
export interface ElectricFieldPlatesConfig {
    plateWidth: number;
    plateDepth: number;
    plateThickness: number;
    separation: number;
    positiveColor?: number;
    negativeColor?: number;
    showFieldLines?: boolean;
    fieldLineCount?: number;
}
export declare class ElectricFieldPlates {
    private group;
    private config;
    private upperPlate?;
    private lowerPlate?;
    private fieldLines;
    constructor(config: ElectricFieldPlatesConfig);
    private buildPlates;
    private addPlateLabels;
    private addVoltageIndicators;
    private createFieldLines;
    updateFieldLines(time: number): void;
    getObject3D(): THREE.Group;
    update(deltaTime: number): void;
    setVoltage(voltage: number): void;
    getFieldStrength(): number;
    dispose(): void;
}
//# sourceMappingURL=ElectricFieldPlates.d.ts.map