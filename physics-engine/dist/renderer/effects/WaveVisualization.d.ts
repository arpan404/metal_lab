import * as THREE from 'three';
/**
 * Wave visualization effects for quantum experiments
 */
export declare class WaveVisualization {
    private scene;
    private wavePlanes;
    constructor(scene: THREE.Scene);
    /**
     * Create wave visualization plane
     */
    createWavePlane(id: string, config?: {
        width?: number;
        height?: number;
        resolution?: number;
        position?: THREE.Vector3;
        rotation?: THREE.Euler;
    }): void;
    /**
     * Update wave plane with new data
     */
    updateWavePlane(id: string, waveData: Float32Array, config?: {
        normalize?: boolean;
        colorMap?: 'default' | 'heat' | 'cool' | 'phase';
    }): void;
    /**
     * Get color based on value and color map
     */
    private getColor;
    /**
     * Create 3D wave surface
     */
    create3DWaveSurface(id: string, config?: {
        width?: number;
        depth?: number;
        resolution?: number;
        position?: THREE.Vector3;
    }): void;
    /**
     * Update 3D wave surface
     */
    update3DWaveSurface(id: string, heightData: Float32Array, scale?: number): void;
    /**
     * Add wave interference pattern
     */
    createInterferencePattern(id: string, source1: THREE.Vector3, source2: THREE.Vector3, wavelength: number, config?: {
        width?: number;
        height?: number;
        resolution?: number;
    }): void;
    /**
     * Remove wave plane
     */
    removeWavePlane(id: string): void;
    /**
     * Clear all wave planes
     */
    clearAll(): void;
    /**
     * Set wave plane visibility
     */
    setVisible(id: string, visible: boolean): void;
    /**
     * Animate wave (continuous update)
     */
    animateWave(id: string, time: number, frequency?: number): void;
}
//# sourceMappingURL=WaveVisualization.d.ts.map