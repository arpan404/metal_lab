// physics-engine/physics/electromagnetism/FieldVisualization.ts
import type { Vector3D } from '../../types';
import { ElectricField } from './ElectricField';

/**
 * Generate field lines and visualization data
 */

export class FieldVisualization {
  /**
   * Generate electric field lines from point charge
   */
  static generateFieldLines(
    charge: number,
    position: Vector3D,
    numLines: number = 16,
    maxDistance: number = 10,
    steps: number = 100
  ): Vector3D[][] {
    const lines: Vector3D[][] = [];
    
    for (let i = 0; i < numLines; i++) {
      const angle = (2 * Math.PI * i) / numLines;
      const phi = Math.acos(2 * (i / numLines) - 1);
      
      // Starting point
      const startPoint: Vector3D = {
        x: position.x + 0.1 * Math.sin(phi) * Math.cos(angle),
        y: position.y + 0.1 * Math.sin(phi) * Math.sin(angle),
        z: position.z + 0.1 * Math.cos(phi)
      };
      
      const line = this.traceFieldLine(charge, position, startPoint, maxDistance, steps);
      lines.push(line);
    }
    
    return lines;
  }
  
  /**
   * Trace a single field line
   */
  private static traceFieldLine(
    charge: number,
    chargePosition: Vector3D,
    startPoint: Vector3D,
    maxDistance: number,
    steps: number
  ): Vector3D[] {
    const line: Vector3D[] = [{ ...startPoint }];
    let currentPoint = { ...startPoint };
    const stepSize = maxDistance / steps;
    
    for (let i = 0; i < steps; i++) {
      const field = ElectricField.pointCharge(charge, chargePosition, currentPoint);
      
      // Normalize and scale
      const fieldMag = Math.sqrt(field.x ** 2 + field.y ** 2 + field.z ** 2);
      if (fieldMag < 1e-10) break;
      
      const step: Vector3D = {
        x: (field.x / fieldMag) * stepSize,
        y: (field.y / fieldMag) * stepSize,
        z: (field.z / fieldMag) * stepSize
      };
      
      currentPoint = {
        x: currentPoint.x + step.x,
        y: currentPoint.y + step.y,
        z: currentPoint.z + step.z
      };
      
      line.push({ ...currentPoint });
      
      // Stop if too far
      const distance = Math.sqrt(
        (currentPoint.x - chargePosition.x) ** 2 +
        (currentPoint.y - chargePosition.y) ** 2 +
        (currentPoint.z - chargePosition.z) ** 2
      );
      
      if (distance > maxDistance) break;
    }
    
    return line;
  }
  
  /**
   * Generate field vector grid
   */
  static generateVectorField(
    charges: Array<{ charge: number; position: Vector3D }>,
    bounds: { min: Vector3D; max: Vector3D },
    resolution: number = 20
  ): Array<{ position: Vector3D; field: Vector3D }> {
    const vectors: Array<{ position: Vector3D; field: Vector3D }> = [];
    
    const dx = (bounds.max.x - bounds.min.x) / resolution;
    const dy = (bounds.max.y - bounds.min.y) / resolution;
    const dz = (bounds.max.z - bounds.min.z) / resolution;
    
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        for (let k = 0; k <= resolution; k++) {
          const position: Vector3D = {
            x: bounds.min.x + i * dx,
            y: bounds.min.y + j * dy,
            z: bounds.min.z + k * dz
          };
          
          const field = ElectricField.multipleCharges(charges, position);
          
          vectors.push({ position, field });
        }
      }
    }
    
    return vectors;
  }
  
  /**
   * Generate equipotential surfaces
   */
  static generateEquipotentials(
    charge: number,
    position: Vector3D,
    potentials: number[],
    resolution: number = 50
  ): Map<number, Vector3D[]> {
    const surfaces = new Map<number, Vector3D[]>();
    
    potentials.forEach(V => {
      const points: Vector3D[] = [];
      const r = Math.abs((8.99e9 * charge) / V);
      
      // Generate sphere of radius r
      for (let theta = 0; theta < Math.PI; theta += Math.PI / resolution) {
        for (let phi = 0; phi < 2 * Math.PI; phi += (2 * Math.PI) / resolution) {
          points.push({
            x: position.x + r * Math.sin(theta) * Math.cos(phi),
            y: position.y + r * Math.sin(theta) * Math.sin(phi),
            z: position.z + r * Math.cos(theta)
          });
        }
      }
      
      surfaces.set(V, points);
    });
    
    return surfaces;
  }
}