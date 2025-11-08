// physics-engine/renderer/effects/MotionBlur.ts
import * as THREE from 'three';

/**
 * Motion blur effect for fast-moving objects
 */

export class MotionBlur {
  private scene: THREE.Scene;
  private blurObjects: Map<string, BlurObject> = new Map();
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  /**
   * Add motion blur to an object
   */
  addBlur(
    id: string,
    object: THREE.Mesh,
    config: {
      samples?: number;
      intensity?: number;
    } = {}
  ): void {
    const samples = config.samples ?? 5;
    const intensity = config.intensity ?? 0.3;
    
    const blurObj: BlurObject = {
      object,
      previousPositions: [],
      maxSamples: samples,
      intensity,
      ghostMeshes: []
    };
    
    // Create ghost meshes
    for (let i = 0; i < samples; i++) {
      if (object.geometry) {
        const ghostGeometry = object.geometry.clone();
        const ghostMaterial = (object.material as THREE.Material).clone();
        
        if (ghostMaterial instanceof THREE.MeshStandardMaterial ||
            ghostMaterial instanceof THREE.MeshBasicMaterial) {
          ghostMaterial.transparent = true;
          ghostMaterial.opacity = intensity * (1 - i / samples);
        }
        
        const ghostMesh = new THREE.Mesh(ghostGeometry, ghostMaterial);
        ghostMesh.visible = false;
        this.scene.add(ghostMesh);
        
        blurObj.ghostMeshes.push(ghostMesh);
      }
    }
    
    this.blurObjects.set(id, blurObj);
  }
  
  /**
   * Update blur (call in animation loop)
   */
  update(): void {
    this.blurObjects.forEach((blurObj) => {
      const currentPos = blurObj.object.position.clone();
      const currentRot = blurObj.object.rotation.clone();
      const currentScale = blurObj.object.scale.clone();
      
      // Add current position to history
      blurObj.previousPositions.push({
        position: currentPos,
        rotation: currentRot,
        scale: currentScale
      });
      
      // Limit history length
      if (blurObj.previousPositions.length > blurObj.maxSamples) {
        blurObj.previousPositions.shift();
      }
      
      // Update ghost meshes
      blurObj.ghostMeshes.forEach((ghostMesh, index) => {
        const historyIndex = blurObj.previousPositions.length - 1 - index - 1;
        
        if (historyIndex >= 0) {
          const state = blurObj.previousPositions[historyIndex];
          
          ghostMesh.position.copy(state.position);
          ghostMesh.rotation.copy(state.rotation);
          ghostMesh.scale.copy(state.scale);
          ghostMesh.visible = true;
        } else {
          ghostMesh.visible = false;
        }
      });
    });
  }
  
  /**
   * Set blur intensity
   */
  setIntensity(id: string, intensity: number): void {
    const blurObj = this.blurObjects.get(id);
    if (!blurObj) return;
    
    blurObj.intensity = intensity;
    
    blurObj.ghostMeshes.forEach((ghostMesh, index) => {
      const material = ghostMesh.material;
      
      if (material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshBasicMaterial) {
        material.opacity = intensity * (1 - index / blurObj.maxSamples);
      }
    });
  }
  
  /**
   * Remove blur
   */
  removeBlur(id: string): void {
    const blurObj = this.blurObjects.get(id);
    if (!blurObj) return;
    
    blurObj.ghostMeshes.forEach((ghostMesh) => {
      this.scene.remove(ghostMesh);
    });
    
    this.blurObjects.delete(id);
  }
  
  /**
   * Clear all blur effects
   */
  clearAll(): void {
    this.blurObjects.forEach((blurObj) => {
      blurObj.ghostMeshes.forEach((ghostMesh) => {
        this.scene.remove(ghostMesh);
      });
    });
    this.blurObjects.clear();
  }
  
  /**
   * Enable/disable blur
   */
  setEnabled(id: string, enabled: boolean): void {
    const blurObj = this.blurObjects.get(id);
    if (!blurObj) return;
    
    blurObj.ghostMeshes.forEach((ghostMesh) => {
      ghostMesh.visible = enabled;
    });
  }
}

interface BlurObject {
  object: THREE.Mesh;
  previousPositions: Array<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
  }>;
  maxSamples: number;
  intensity: number;
  ghostMeshes: THREE.Mesh[];
}