// physics-engine/utils/modelLoader.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
export class ModelLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.gltfLoader = new GLTFLoader();
    }
    static getInstance() {
        if (!ModelLoader.instance) {
            ModelLoader.instance = new ModelLoader();
        }
        return ModelLoader.instance;
    }
    /**
     * Load GLTF/GLB model
     */
    async loadGLTF(path) {
        // Check cache first
        if (this.cache.has(path)) {
            return this.cache.get(path).clone();
        }
        // Check if already loading
        if (this.loadingPromises.has(path)) {
            const model = await this.loadingPromises.get(path);
            return model.clone();
        }
        // Load the model
        const loadPromise = new Promise((resolve, reject) => {
            this.gltfLoader.load(path, (gltf) => {
                const model = gltf.scene;
                this.cache.set(path, model);
                this.loadingPromises.delete(path);
                resolve(model);
            }, undefined, (error) => {
                this.loadingPromises.delete(path);
                reject(error);
            });
        });
        this.loadingPromises.set(path, loadPromise);
        return loadPromise;
    }
    /**
     * Load multiple models
     */
    async loadMultiple(paths) {
        return Promise.all(paths.map(path => this.loadGLTF(path)));
    }
    /**
     * Preload models
     */
    async preload(paths) {
        await this.loadMultiple(paths);
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Get cached model
     */
    getCached(path) {
        return this.cache.get(path)?.clone();
    }
    /**
     * Check if model is cached
     */
    isCached(path) {
        return this.cache.has(path);
    }
}
/**
 * Apply transforms to model
 */
export function applyTransforms(model, options) {
    if (options.position) {
        model.position.copy(options.position);
    }
    if (options.rotation) {
        model.rotation.copy(options.rotation);
    }
    if (options.scale) {
        if (typeof options.scale === 'number') {
            model.scale.setScalar(options.scale);
        }
        else {
            model.scale.copy(options.scale);
        }
    }
}
/**
 * Enable shadows for model
 */
export function enableShadows(model, cast = true, receive = true) {
    model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.castShadow = cast;
            child.receiveShadow = receive;
        }
    });
}
/**
 * Get model bounding box
 */
export function getModelBounds(model) {
    const box = new THREE.Box3();
    box.setFromObject(model);
    return box;
}
/**
 * Center model at origin
 */
export function centerModel(model) {
    const box = getModelBounds(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
}
