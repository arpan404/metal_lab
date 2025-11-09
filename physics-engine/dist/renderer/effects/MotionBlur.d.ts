import * as THREE from 'three';
/**
 * Motion blur effect for fast-moving objects
 */
export declare class MotionBlur {
    private scene;
    private blurObjects;
    constructor(scene: THREE.Scene);
    /**
     * Add motion blur to an object
     */
    addBlur(id: string, object: THREE.Mesh, config?: {
        samples?: number;
        intensity?: number;
    }): void;
    /**
     * Update blur (call in animation loop)
     */
    update(): void;
    /**
     * Set blur intensity
     */
    setIntensity(id: string, intensity: number): void;
    /**
     * Remove blur
     */
    removeBlur(id: string): void;
    /**
     * Clear all blur effects
     */
    clearAll(): void;
    /**
     * Enable/disable blur
     */
    setEnabled(id: string, enabled: boolean): void;
}
//# sourceMappingURL=MotionBlur.d.ts.map