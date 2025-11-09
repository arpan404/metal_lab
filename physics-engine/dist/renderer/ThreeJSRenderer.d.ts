import * as THREE from 'three';
import type { RendererConfig, SceneConfig } from '../types';
/**
 * Three.js renderer setup and management
 */
export declare class ThreeJSRenderer {
    private renderer;
    private scene;
    private camera;
    private canvas;
    constructor(canvas: HTMLCanvasElement, config?: RendererConfig);
    /**
     * Configure scene
     */
    configureScene(config: SceneConfig): void;
    /**
     * Create light from config
     */
    private createLight;
    /**
     * Get tone mapping from string
     */
    private getToneMapping;
    /**
     * Add object to scene
     */
    add(object: THREE.Object3D): void;
    /**
     * Remove object from scene
     */
    remove(object: THREE.Object3D): void;
    /**
     * Clear scene
     */
    clear(): void;
    /**
     * Render frame
     */
    render(): void;
    /**
     * Get renderer
     */
    getRenderer(): THREE.WebGLRenderer;
    /**
     * Get scene
     */
    getScene(): THREE.Scene;
    /**
     * Get camera
     */
    getCamera(): THREE.Camera;
    /**
     * Set camera
     */
    setCamera(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera): void;
    /**
     * Handle window resize
     */
    private onWindowResize;
    /**
     * Dispose renderer
     */
    dispose(): void;
    /**
     * Take screenshot
     */
    screenshot(): string;
    /**
     * Set clear color
     */
    setClearColor(color: number | string, alpha?: number): void;
}
//# sourceMappingURL=ThreeJSRenderer.d.ts.map