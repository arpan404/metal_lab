import * as THREE from 'three';
export interface BankedTrackConfig {
    radius: number;
    width: number;
    bankAngle: number;
    segments: number;
    innerWallHeight?: number;
    outerWallHeight?: number;
    surfaceColor?: number;
    wallColor?: number;
    showGridLines?: boolean;
}
export declare class BankedTrack {
    private group;
    private config;
    private trackMesh?;
    private innerWall?;
    private outerWall?;
    constructor(config: BankedTrackConfig);
    private buildTrack;
    private buildWalls;
    private createWallGeometry;
    private addGridLines;
    private addStartFinishLine;
    getObject3D(): THREE.Group;
    update(deltaTime: number): void;
    dispose(): void;
    getTrackRadius(): number;
    getTrackWidth(): number;
    getBankAngle(): number;
    getPositionAtAngle(angle: number, lateralOffset?: number): THREE.Vector3;
    getNormalAtAngle(angle: number): THREE.Vector3;
}
//# sourceMappingURL=BankedTrack.d.ts.map