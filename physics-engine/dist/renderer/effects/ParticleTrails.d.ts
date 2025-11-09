import * as THREE from 'three';
/**
 * Particle trail effects for moving objects
 */
export declare class ParticleTrails {
    private scene;
    private trails;
    constructor(scene: THREE.Scene);
    /**
     * Add trail for an object
     */
    addTrail(id: string, config?: {
        maxLength?: number;
        color?: number;
        opacity?: number;
        width?: number;
    }): void;
    /**
     * Update trail with new position
     */
    updateTrail(id: string, position: THREE.Vector3): void;
    /**
     * Update trail with gradient opacity (fade towards tail)
     */
    updateTrailWithGradient(id: string, position: THREE.Vector3): void;
    /**
     * Clear trail
     */
    clearTrail(id: string): void;
    /**
     * Remove trail
     */
    removeTrail(id: string): void;
    /**
     * Set trail color
     */
    setTrailColor(id: string, color: number): void;
    /**
     * Set trail opacity
     */
    setTrailOpacity(id: string, opacity: number): void;
    /**
     * Clear all trails
     */
    clearAll(): void;
    /**
     * Update all trails (call in animation loop)
     */
    update(): void;
}
//# sourceMappingURL=ParticleTrails.d.ts.map