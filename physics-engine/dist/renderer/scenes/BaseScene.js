// physics-engine/renderer/scenes/BaseScene.ts
import * as THREE from 'three';
/**
 * Abstract base class for experiment scenes
 */
export class BaseScene {
    constructor(scene, experiment) {
        this.objects = new Map();
        this.scene = scene;
        this.experiment = experiment;
    }
    /**
     * Add object to scene
     */
    addObject(id, object) {
        this.scene.add(object);
        this.objects.set(id, object);
    }
    /**
     * Remove object from scene
     */
    removeObject(id) {
        const object = this.objects.get(id);
        if (object) {
            this.scene.remove(object);
            this.objects.delete(id);
        }
    }
    /**
     * Get object by id
     */
    getObject(id) {
        return this.objects.get(id);
    }
    /**
     * Clear all objects
     */
    clearObjects() {
        this.objects.forEach((object) => {
            this.scene.remove(object);
        });
        this.objects.clear();
    }
    /**
     * Create material from preset
     */
    createMaterial(preset, overrides) {
        // This would load from materials.json config
        // Simplified version here
        switch (preset) {
            case 'metal':
                return new THREE.MeshStandardMaterial({
                    color: 0x888888,
                    metalness: 1.0,
                    roughness: 0.3,
                    ...overrides
                });
            case 'plastic':
                return new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    metalness: 0,
                    roughness: 0.5,
                    ...overrides
                });
            case 'glass':
                return new THREE.MeshPhysicalMaterial({
                    color: 0xffffff,
                    metalness: 0,
                    roughness: 0,
                    transparent: true,
                    opacity: 0.5,
                    ...overrides
                });
            default:
                return new THREE.MeshStandardMaterial(overrides);
        }
    }
    /**
     * Get scene
     */
    getScene() {
        return this.scene;
    }
}
