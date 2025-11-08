// physics-engine/renderer/scenes/BaseScene.ts
import * as THREE from 'three';
import type { BaseExperiment } from '../../experiments/BaseExperiment';

/**
 * Abstract base class for experiment scenes
 */

export abstract class BaseScene {
  protected scene: THREE.Scene;
  protected experiment: BaseExperiment;
  protected objects: Map<string, THREE.Object3D> = new Map();
  
  constructor(scene: THREE.Scene, experiment: BaseExperiment) {
    this.scene = scene;
    this.experiment = experiment;
  }
  
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
  protected addObject(id: string, object: THREE.Object3D): void {
    this.scene.add(object);
    this.objects.set(id, object);
  }
  
  /**
   * Remove object from scene
   */
  protected removeObject(id: string): void {
    const object = this.objects.get(id);
    if (object) {
      this.scene.remove(object);
      this.objects.delete(id);
    }
  }
  
  /**
   * Get object by id
   */
  protected getObject(id: string): THREE.Object3D | undefined {
    return this.objects.get(id);
  }
  
  /**
   * Clear all objects
   */
  protected clearObjects(): void {
    this.objects.forEach((object) => {
      this.scene.remove(object);
    });
    this.objects.clear();
  }
  
  /**
   * Create material from preset
   */
  protected createMaterial(preset: string, overrides?: any): THREE.Material {
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
  getScene(): THREE.Scene {
    return this.scene;
  }
}