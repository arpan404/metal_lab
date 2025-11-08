// models/procedural/MillikanChamber.ts
import * as THREE from 'three';

export class ProceduralMillikanChamber {
  static create(params: {
    width: number;
    height: number;
    depth: number;
    plateSpacing: number;
  }): THREE.Group {
    const group = new THREE.Group();
    
    // Glass chamber walls
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.1,
      transmission: 0.9,
      transparent: true,
      opacity: 0.3,
      thickness: 0.5
    });
    
    const chamberGeometry = new THREE.BoxGeometry(
      params.width,
      params.height,
      params.depth
    );
    const chamber = new THREE.Mesh(chamberGeometry, glassMaterial);
    group.add(chamber);
    
    // Top plate (positive)
    const plateMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const plateGeometry = new THREE.BoxGeometry(
      params.width * 0.8,
      0.5,
      params.depth * 0.8
    );
    
    const topPlate = new THREE.Mesh(plateGeometry, plateMaterial);
    topPlate.position.y = params.plateSpacing / 2;
    group.add(topPlate);
    
    // Bottom plate (negative)
    const bottomPlateMaterial = plateMaterial.clone();
    bottomPlateMaterial.color.set(0x4444ff);
    
    const bottomPlate = new THREE.Mesh(plateGeometry, bottomPlateMaterial);
    bottomPlate.position.y = -params.plateSpacing / 2;
    group.add(bottomPlate);
    
    // Electric field visualization (lines)
    const fieldLineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      opacity: 0.3,
      transparent: true
    });
    
    const numFieldLines = 10;
    for (let i = 0; i < numFieldLines; i++) {
      const x = (i / (numFieldLines - 1) - 0.5) * params.width * 0.7;
      
      const points = [
        new THREE.Vector3(x, params.plateSpacing / 2, 0),
        new THREE.Vector3(x, -params.plateSpacing / 2, 0)
      ];
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, fieldLineMaterial);
      group.add(line);
    }
    
    return group;
  }
  
  static createOilDroplet(radius: number = 0.5): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff8800,
      emissiveIntensity: 0.2,
      metalness: 0.3,
      roughness: 0.4
    });
    
    return new THREE.Mesh(geometry, material);
  }
}