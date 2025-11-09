import * as THREE from 'three';
/**
 * Vector field visualization (for forces, fields, etc.)
 */
export declare class VectorField {
    private scene;
    private fields;
    constructor(scene: THREE.Scene);
    /**
     * Create vector field visualization
     */
    createField(id: string, config?: {
        bounds?: {
            min: THREE.Vector3;
            max: THREE.Vector3;
        };
        resolution?: number;
        arrowLength?: number;
        arrowColor?: number;
    }): void;
    /**
     * Update vector field with function
     */
    updateField(id: string, vectorFunction: (position: THREE.Vector3) => THREE.Vector3): void;
    /**
     * Update field with data array
     */
    updateFieldFromData(id: string, vectors: Array<{
        position: THREE.Vector3;
        vector: THREE.Vector3;
    }>): void;
    /**
     * Set arrow color based on magnitude
     */
    setColorByMagnitude(id: string): void;
    /**
     * Remove field
     */
    removeField(id: string): void;
    /**
     * Clear all fields
     */
    clearAll(): void;
    /**
     * Set field visibility
     */
    setVisible(id: string, visible: boolean): void;
    /**
     * Set arrow scale
     */
    setArrowScale(id: string, scale: number): void;
}
//# sourceMappingURL=VectorField.d.ts.map