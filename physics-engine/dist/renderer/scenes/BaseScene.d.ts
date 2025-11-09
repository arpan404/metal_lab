import * as THREE from 'three';
import type { BaseExperiment } from '../../experiments/BaseExperiment';
/**
 * Abstract base class for experiment scenes
 */
export declare abstract class BaseScene {
    protected scene: THREE.Scene;
    protected experiment: BaseExperiment;
    protected objects: Map<string, THREE.Object3D>;
    constructor(scene: THREE.Scene, experiment: BaseExperiment);
    /**
     * Initialize scene (create 3D objects)
     */
    abstract initialize(): Promise<void>;
    /**
     * Update scene (sync with experiment state)
     */
    abstract update(deltaTime: number): void;
    /**
     * Cleanup scene
     */
    abstract dispose(): void;
    /**
     * Add object to scene
     */
    protected addObject(id: string, object: THREE.Object3D): void;
    /**
     * Remove object from scene
     */
    protected removeObject(id: string): void;
    /**
     * Get object by id
     */
    protected getObject(id: string): THREE.Object3D | undefined;
    /**
     * Clear all objects
     */
    protected clearObjects(): void;
    /**
     * Create material from preset
     */
    protected createMaterial(preset: string, overrides?: any): THREE.Material;
    /**
     * Get scene
     */
    getScene(): THREE.Scene;
}
//# sourceMappingURL=BaseScene.d.ts.map