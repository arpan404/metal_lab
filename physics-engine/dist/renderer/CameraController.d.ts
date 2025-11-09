import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
/**
 * Camera controls for orbit, pan, zoom
 */
export declare class CameraController {
    private camera;
    private controls;
    private canvas;
    constructor(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera, canvas: HTMLCanvasElement, config?: any);
    /**
     * Update controls (call in animation loop)
     */
    update(): void;
    /**
     * Set camera position
     */
    setPosition(x: number, y: number, z: number): void;
    /**
     * Set look at target
     */
    setTarget(x: number, y: number, z: number): void;
    /**
     * Reset camera to default position
     */
    reset(): void;
    /**
     * Focus on object
     */
    focusOnObject(object: THREE.Object3D, distance?: number): void;
    /**
     * Enable/disable controls
     */
    setEnabled(enabled: boolean): void;
    /**
     * Enable/disable auto-rotate
     */
    setAutoRotate(enabled: boolean, speed?: number): void;
    /**
     * Set zoom limits
     */
    setZoomLimits(min: number, max: number): void;
    /**
     * Set rotation limits
     */
    setRotationLimits(minPolarAngle: number, maxPolarAngle: number): void;
    /**
     * Get camera distance from target
     */
    getDistance(): number;
    /**
     * Animate camera to position
     */
    animateTo(position: THREE.Vector3, target: THREE.Vector3, duration?: number): Promise<void>;
    /**
     * Get controls
     */
    getControls(): OrbitControls;
    /**
     * Dispose controls
     */
    dispose(): void;
}
//# sourceMappingURL=CameraController.d.ts.map