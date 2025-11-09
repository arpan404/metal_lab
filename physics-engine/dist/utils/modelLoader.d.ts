import * as THREE from 'three';
export declare class ModelLoader {
    private static instance;
    private gltfLoader;
    private cache;
    private loadingPromises;
    private constructor();
    static getInstance(): ModelLoader;
    /**
     * Load GLTF/GLB model
     */
    loadGLTF(path: string): Promise<THREE.Group>;
    /**
     * Load multiple models
     */
    loadMultiple(paths: string[]): Promise<THREE.Group[]>;
    /**
     * Preload models
     */
    preload(paths: string[]): Promise<void>;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Get cached model
     */
    getCached(path: string): THREE.Group | undefined;
    /**
     * Check if model is cached
     */
    isCached(path: string): boolean;
}
/**
 * Apply transforms to model
 */
export declare function applyTransforms(model: THREE.Group, options: {
    position?: THREE.Vector3;
    rotation?: THREE.Euler;
    scale?: number | THREE.Vector3;
}): void;
/**
 * Enable shadows for model
 */
export declare function enableShadows(model: THREE.Group, cast?: boolean, receive?: boolean): void;
/**
 * Get model bounding box
 */
export declare function getModelBounds(model: THREE.Group): THREE.Box3;
/**
 * Center model at origin
 */
export declare function centerModel(model: THREE.Group): void;
//# sourceMappingURL=modelLoader.d.ts.map