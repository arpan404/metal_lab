import * as THREE from 'three';
/**
 * Visual measurement tools (rulers, protractors, grids)
 */
export declare class MeasurementTools {
    private scene;
    private tools;
    constructor(scene: THREE.Scene);
    /**
     * Add ruler
     */
    addRuler(id: string, start: THREE.Vector3, end: THREE.Vector3, divisions?: number, color?: number): void;
    /**
     * Add protractor
     */
    addProtractor(id: string, center: THREE.Vector3, radius?: number, startAngle?: number, endAngle?: number, color?: number): void;
    /**
     * Add grid
     */
    addGrid(id: string, size?: number, divisions?: number, color1?: number, color2?: number): void;
    /**
     * Add coordinate axes
     */
    addAxes(id: string, size?: number): void;
    /**
     * Add vector arrow
     */
    addVectorArrow(id: string, origin: THREE.Vector3, direction: THREE.Vector3, length: number, color?: number, label?: string): void;
    /**
     * Update vector arrow
     */
    updateVectorArrow(id: string, origin: THREE.Vector3, direction: THREE.Vector3, length: number): void;
    /**
     * Add bounding box
     */
    addBoundingBox(id: string, object: THREE.Object3D, color?: number): void;
    /**
     * Remove tool
     */
    remove(id: string): void;
    /**
     * Show/hide tool
     */
    setVisible(id: string, visible: boolean): void;
    /**
     * Clear all tools
     */
    clear(): void;
}
//# sourceMappingURL=MeasurementTools.d.ts.map