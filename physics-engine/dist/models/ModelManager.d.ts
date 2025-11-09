import * as THREE from 'three';
export type ModelType = 'car' | 'lab-stand' | 'banked-track' | 'electric-plates' | 'gold-foil' | 'double-slit' | 'pendulum' | 'millikan-chamber' | 'particle-emitter' | 'measurement-grid';
export declare class ModelManager {
    private models;
    private gltfLoader;
    private loadingManager;
    private assetPath;
    constructor(assetPath?: string);
    /**
     * Load a GLTF model from file
     */
    loadGLTF(modelType: 'car' | 'lab-stand', url?: string): Promise<THREE.Object3D>;
    /**
     * Create a procedural model
     */
    createProcedural(modelType: Exclude<ModelType, 'car' | 'lab-stand'>, config?: any): THREE.Object3D;
    /**
     * Get a loaded or created model
     */
    getModel(modelType: ModelType): THREE.Object3D | undefined;
    /**
     * Check if a model is loaded
     */
    hasModel(modelType: ModelType): boolean;
    /**
     * Clone a model for reuse
     */
    cloneModel(modelType: ModelType): THREE.Object3D | undefined;
    /**
     * Dispose of a specific model
     */
    disposeModel(modelType: ModelType): void;
    /**
     * Dispose of all models
     */
    disposeAll(): void;
    /**
     * Preload commonly used models
     */
    preloadCommon(): Promise<void>;
    /**
     * Apply standard material properties to loaded models
     */
    applyStandardMaterial(modelType: ModelType, properties: Partial<THREE.MeshStandardMaterialParameters>): void;
    /**
     * Get all loaded model types
     */
    getLoadedModelTypes(): ModelType[];
    /**
     * Get loading progress
     */
    getLoadingProgress(): number;
}
export default ModelManager;
//# sourceMappingURL=ModelManager.d.ts.map