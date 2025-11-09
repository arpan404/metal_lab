// physics-engine/renderer/effects/ParticleTrails.ts
import * as THREE from 'three';

/**
 * Particle trail effects for moving objects
 */

export class ParticleTrails {
  private scene: THREE.Scene;
  private trails: Map<string, Trail> = new Map();
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  /**
   * Add trail for an object
   */
  addTrail(
    id: string,
    config: {
      maxLength?: number;
      color?: number;
      opacity?: number;
      width?: number;
    } = {}
  ): void {
    const trail: Trail = {
      points: [],
      maxLength: config.maxLength ?? 100,
      line: null,
      color: config.color ?? 0x00ffff,
      opacity: config.opacity ?? 0.6,
      width: config.width ?? 2
    };
    
    this.trails.set(id, trail);
  }
  
  /**
   * Update trail with new position
   */
  updateTrail(id: string, position: THREE.Vector3): void {
    const trail = this.trails.get(id);
    if (!trail) return;
    
    // Add new point
    trail.points.push(position.clone());
    
    // Remove old points
    if (trail.points.length > trail.maxLength) {
      trail.points.shift();
    }
    
    // Update line geometry
    if (trail.line) {
      this.scene.remove(trail.line);
    }
    
    if (trail.points.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(trail.points);
      const material = new THREE.LineBasicMaterial({
        color: trail.color,
        transparent: true,
        opacity: trail.opacity,
        linewidth: trail.width
      });
      
      trail.line = new THREE.Line(geometry, material);
      this.scene.add(trail.line);
    }
  }
  
  /**
   * Update trail with gradient opacity (fade towards tail)
   */
  updateTrailWithGradient(id: string, position: THREE.Vector3): void {
    const trail = this.trails.get(id);
    if (!trail) return;
    
    trail.points.push(position.clone());
    
    if (trail.points.length > trail.maxLength) {
      trail.points.shift();
    }
    
    if (trail.line) {
      this.scene.remove(trail.line);
    }
    
    if (trail.points.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(trail.points);
      
      // Create color attribute for gradient
      const colors = new Float32Array(trail.points.length * 3);
      const color = new THREE.Color(trail.color);
      
      for (let i = 0; i < trail.points.length; i++) {
        const alpha = i / trail.points.length;
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
      
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: trail.opacity,
        linewidth: trail.width
      });
      
      trail.line = new THREE.Line(geometry, material);
      this.scene.add(trail.line);
    }
  }
  
  /**
   * Clear trail
   */
  clearTrail(id: string): void {
    const trail = this.trails.get(id);
    if (!trail) return;
    
    trail.points = [];
    
    if (trail.line) {
      this.scene.remove(trail.line);
      trail.line = null;
    }
  }
  
  /**
   * Remove trail
   */
  removeTrail(id: string): void {
    const trail = this.trails.get(id);
    if (!trail) return;
    
    if (trail.line) {
      this.scene.remove(trail.line);
    }
    
    this.trails.delete(id);
  }
  
  /**
   * Set trail color
   */
  setTrailColor(id: string, color: number): void {
    const trail = this.trails.get(id);
    if (!trail) return;
    
    trail.color = color;
  }
  
  /**
   * Set trail opacity
   */
  setTrailOpacity(id: string, opacity: number): void {
    const trail = this.trails.get(id);
    if (!trail) return;
    
    trail.opacity = opacity;
    
    if (trail.line && trail.line.material instanceof THREE.LineBasicMaterial) {
      trail.line.material.opacity = opacity;
      trail.line.material.needsUpdate = true;
    }
  }
  
  /**
   * Clear all trails
   */
  clearAll(): void {
    this.trails.forEach((trail) => {
      if (trail.line) {
        this.scene.remove(trail.line);
      }
    });
    this.trails.clear();
  }
  
  /**
   * Update all trails (call in animation loop)
   */
  update(): void {
    // Trails are updated when updateTrail is called
    // This method can be used for animation effects
    
    this.trails.forEach((trail) => {
      if (trail.line && trail.line.material instanceof THREE.LineBasicMaterial) {
        // Could add pulsing or other effects here
      }
    });
  }
}

interface Trail {
  points: THREE.Vector3[];
  maxLength: number;
  line: THREE.Line | null;
  color: number;
  opacity: number;
  width: number;
}