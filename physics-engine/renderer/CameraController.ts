// physics-engine/renderer/CameraController.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import type { CameraConfig } from '../types';

/**
 * Camera controls for orbit, pan, zoom
 */

export class CameraController {
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private controls: OrbitControls;
  private canvas: HTMLCanvasElement;
  
  constructor(
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    canvas: HTMLCanvasElement,
    config?: any
  ) {
    this.camera = camera;
    this.canvas = canvas;
    
    // Create orbit controls
    this.controls = new OrbitControls(camera, canvas);
    
    // Configure controls
    this.controls.enableDamping = config?.enableDamping ?? true;
    this.controls.dampingFactor = config?.dampingFactor ?? 0.05;
    this.controls.rotateSpeed = config?.rotateSpeed ?? 1.0;
    this.controls.zoomSpeed = config?.zoomSpeed ?? 1.0;
    this.controls.panSpeed = config?.panSpeed ?? 1.0;
    
    this.controls.minDistance = config?.minDistance ?? 1;
    this.controls.maxDistance = config?.maxDistance ?? 100;
    
    this.controls.enablePan = config?.enablePan ?? true;
    this.controls.enableZoom = config?.enableZoom ?? true;
    this.controls.enableRotate = config?.enableRotate ?? true;
  }
  
  /**
   * Update controls (call in animation loop)
   */
  update(): void {
    this.controls.update();
  }
  
  /**
   * Set camera position
   */
  setPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
  }
  
  /**
   * Set look at target
   */
  setTarget(x: number, y: number, z: number): void {
    this.controls.target.set(x, y, z);
    this.controls.update();
  }
  
  /**
   * Reset camera to default position
   */
  reset(): void {
    this.camera.position.set(0, 10, 20);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }
  
  /**
   * Focus on object
   */
  focusOnObject(object: THREE.Object3D, distance: number = 20): void {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera instanceof THREE.PerspectiveCamera ? this.camera.fov : 45;
    const cameraDistance = Math.abs(maxDim / Math.sin(fov * Math.PI / 360));
    
    this.camera.position.copy(center);
    this.camera.position.z += cameraDistance * 1.5;
    
    this.controls.target.copy(center);
    this.controls.update();
  }
  
  /**
   * Enable/disable controls
   */
  setEnabled(enabled: boolean): void {
    this.controls.enabled = enabled;
  }
  
  /**
   * Enable/disable auto-rotate
   */
  setAutoRotate(enabled: boolean, speed: number = 2.0): void {
    this.controls.autoRotate = enabled;
    this.controls.autoRotateSpeed = speed;
  }
  
  /**
   * Set zoom limits
   */
  setZoomLimits(min: number, max: number): void {
    this.controls.minDistance = min;
    this.controls.maxDistance = max;
  }
  
  /**
   * Set rotation limits
   */
  setRotationLimits(minPolarAngle: number, maxPolarAngle: number): void {
    this.controls.minPolarAngle = minPolarAngle;
    this.controls.maxPolarAngle = maxPolarAngle;
  }
  
  /**
   * Get camera distance from target
   */
  getDistance(): number {
    return this.camera.position.distanceTo(this.controls.target);
  }
  
  /**
   * Animate camera to position
   */
  animateTo(
    position: THREE.Vector3,
    target: THREE.Vector3,
    duration: number = 1000
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPosition = this.camera.position.clone();
      const startTarget = this.controls.target.clone();
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        
        // Ease in-out
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        
        this.camera.position.lerpVectors(startPosition, position, eased);
        this.controls.target.lerpVectors(startTarget, target, eased);
        this.controls.update();
        
        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * Get controls
   */
  getControls(): OrbitControls {
    return this.controls;
  }
  
  /**
   * Dispose controls
   */
  dispose(): void {
    this.controls.dispose();
  }
}