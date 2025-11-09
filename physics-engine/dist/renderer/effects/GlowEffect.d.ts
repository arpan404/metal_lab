import * as THREE from 'three';
/**
 * Glow/bloom effect for highlighted objects
 */
export declare class GlowEffect {
    private scene;
    private glowObjects;
    constructor(scene: THREE.Scene);
    /**
     * Add glow to an object
     */
    addGlow(id: string, object: THREE.Object3D, config?: {
        color?: number;
        intensity?: number;
        size?: number;
    }): void;
    /**
     * Add pulsing glow
     */
    addPulsingGlow(id: string, object: THREE.Object3D, config?: {
        color?: number;
        intensity?: number;
        size?: number;
        pulseSpeed?: number;
    }): void;
    /**
     * Update glow (call in animation loop)
     */
    update(deltaTime: number): void;
    /**
     * Set glow intensity
     */
    setIntensity(id: string, intensity: number): void;
    /**
     * Set glow color
     */
    setColor(id: string, color: number): void;
    /**
     * Remove glow
     */
    removeGlow(id: string): void;
    /**
     * Clear all glows
     */
    clearAll(): void;
    /**
     * Show/hide glow
     */
    setVisible(id: string, visible: boolean): void;
}
//# sourceMappingURL=GlowEffect.d.ts.map