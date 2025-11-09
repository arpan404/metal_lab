// physics-engine/renderer/effects/VectorField.ts
import * as THREE from 'three';

/**
 * Vector field visualization (for forces, fields, etc.)
 */

export class VectorField {
  private scene: THREE.Scene;
  private fields: Map<string, VectorFieldData> = new Map();
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  /**
   * Create vector field visualization
   */
  createField(
    id: string,
    config: {
      bounds?: { min: THREE.Vector3; max: THREE.Vector3 };
      resolution?: number;
      arrowLength?: number;
      arrowColor?: number;
    } = {}
  ): void {
    const bounds = config.bounds ?? {
      min: new THREE.Vector3(-10, -10, -10),
      max: new THREE.Vector3(10, 10, 10)
    };
    const resolution = config.resolution ?? 10;
    const arrowLength = config.arrowLength ?? 1.0;
    const arrowColor = config.arrowColor ?? 0x00ff00;
    
    const group = new THREE.Group();
    const arrows: THREE.ArrowHelper[] = [];
    
    const dx = (bounds.max.x - bounds.min.x) / resolution;
    const dy = (bounds.max.y - bounds.min.y) / resolution;
    const dz = (bounds.max.z - bounds.min.z) / resolution;
    
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        for (let k = 0; k <= resolution; k++) {
          const x = bounds.min.x + i * dx;
          const y = bounds.min.y + j * dy;
          const z = bounds.min.z + k * dz;
          
          const origin = new THREE.Vector3(x, y, z);
          const direction = new THREE.Vector3(0, 1, 0); // Default upward
          
          const arrow = new THREE.ArrowHelper(
            direction,
            origin,
            arrowLength,
            arrowColor,
            arrowLength * 0.2,
            arrowLength * 0.1
          );
          
          group.add(arrow);
          arrows.push(arrow);
        }
      }
    }
    
    this.scene.add(group);
    
    this.fields.set(id, {
      group,
      arrows,
      bounds,
      resolution,
      arrowLength,
      arrowColor
    });
  }
  
  /**
   * Update vector field with function
   */
  updateField(
    id: string,
    vectorFunction: (position: THREE.Vector3) => THREE.Vector3
  ): void {
    const field = this.fields.get(id);
    if (!field) return;
    
    const dx = (field.bounds.max.x - field.bounds.min.x) / field.resolution;
    const dy = (field.bounds.max.y - field.bounds.min.y) / field.resolution;
    const dz = (field.bounds.max.z - field.bounds.min.z) / field.resolution;
    
    let arrowIndex = 0;
    
    for (let i = 0; i <= field.resolution; i++) {
      for (let j = 0; j <= field.resolution; j++) {
        for (let k = 0; k <= field.resolution; k++) {
          const x = field.bounds.min.x + i * dx;
          const y = field.bounds.min.y + j * dy;
          const z = field.bounds.min.z + k * dz;
          
          const position = new THREE.Vector3(x, y, z);
          const vector = vectorFunction(position);
          
          if (arrowIndex < field.arrows.length) {
            const arrow = field.arrows[arrowIndex];
            const magnitude = vector.length();
            
            if (magnitude > 0) {
              arrow.setDirection(vector.clone().normalize());
              arrow.setLength(
                Math.min(magnitude * field.arrowLength, field.arrowLength * 2),
                field.arrowLength * 0.2,
                field.arrowLength * 0.1
              );
              arrow.visible = true;
            } else {
              arrow.visible = false;
            }
          }
          
          arrowIndex++;
        }
      }
    }
  }
  
  /**
   * Update field with data array
   */
  updateFieldFromData(
    id: string,
    vectors: Array<{ position: THREE.Vector3; vector: THREE.Vector3 }>
  ): void {
    const field = this.fields.get(id);
    if (!field) return;
    
    vectors.forEach((data, index) => {
      if (index < field.arrows.length) {
        const arrow = field.arrows[index];
        const magnitude = data.vector.length();
        
        arrow.position.copy(data.position);
        
        if (magnitude > 0) {
          arrow.setDirection(data.vector.clone().normalize());
          arrow.setLength(
            Math.min(magnitude * field.arrowLength, field.arrowLength * 2),
            field.arrowLength * 0.2,
            field.arrowLength * 0.1
          );
          arrow.visible = true;
        } else {
          arrow.visible = false;
        }
      }
    });
  }
  
  /**
   * Set arrow color based on magnitude
   */
  setColorByMagnitude(id: string): void {
    const field = this.fields.get(id);
    if (!field) return;
    
    // Find max magnitude
    let maxMagnitude = 0;
    field.arrows.forEach(arrow => {
      const length = arrow.line.scale.z;
      if (length > maxMagnitude) maxMagnitude = length;
    });
    
    // Color arrows based on magnitude
    field.arrows.forEach(arrow => {
      const length = arrow.line.scale.z;
      const normalized = length / maxMagnitude;
      
      // Blue (low) to Red (high)
      const color = new THREE.Color();
      color.setHSL(0.66 * (1 - normalized), 1, 0.5);
      
      arrow.setColor(color);
    });
  }
  
  /**
   * Remove field
   */
  removeField(id: string): void {
    const field = this.fields.get(id);
    if (!field) return;
    
    this.scene.remove(field.group);
    this.fields.delete(id);
  }
  
  /**
   * Clear all fields
   */
  clearAll(): void {
    this.fields.forEach(field => {
      this.scene.remove(field.group);
    });
    this.fields.clear();
  }
  
  /**
   * Set field visibility
   */
  setVisible(id: string, visible: boolean): void {
    const field = this.fields.get(id);
    if (!field) return;
    
    field.group.visible = visible;
  }
  
  /**
   * Set arrow scale
   */
  setArrowScale(id: string, scale: number): void {
    const field = this.fields.get(id);
    if (!field) return;
    
    field.arrowLength = scale;
  }
}

interface VectorFieldData {
  group: THREE.Group;
  arrows: THREE.ArrowHelper[];
  bounds: { min: THREE.Vector3; max: THREE.Vector3 };
  resolution: number;
  arrowLength: number;
  arrowColor: number;
}