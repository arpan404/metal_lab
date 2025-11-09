import * as THREE from 'three';
/**
 * Preset lighting configurations for different scenes
 */
export declare class LightingSetup {
    /**
     * Create standard three-point lighting
     */
    static createThreePointLighting(scene: THREE.Scene): void;
    /**
     * Create laboratory lighting
     */
    static createLabLighting(scene: THREE.Scene): void;
    /**
     * Create outdoor lighting (sun)
     */
    static createOutdoorLighting(scene: THREE.Scene): void;
    /**
     * Create dramatic lighting (high contrast)
     */
    static createDramaticLighting(scene: THREE.Scene): void;
    /**
     * Create neon/sci-fi lighting
     */
    static createNeonLighting(scene: THREE.Scene): void;
    /**
     * Create custom lighting setup
     */
    static createCustomLighting(scene: THREE.Scene, config: {
        ambient?: {
            color: number;
            intensity: number;
        };
        directional?: Array<{
            color: number;
            intensity: number;
            position: number[];
        }>;
        point?: Array<{
            color: number;
            intensity: number;
            position: number[];
            distance?: number;
        }>;
        spot?: Array<{
            color: number;
            intensity: number;
            position: number[];
            target?: number[];
        }>;
    }): void;
    /**
     * Add light helpers (for debugging)
     */
    static addLightHelpers(scene: THREE.Scene): void;
}
//# sourceMappingURL=LightingSetup.d.ts.map