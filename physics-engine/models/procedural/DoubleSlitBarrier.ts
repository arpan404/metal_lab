// models/procedural/DoubleSlitBarrier.ts
import * as THREE from 'three';

export class ProceduralDoubleSlitBarrier {
  static create(params: {
    barrierWidth: number;
    barrierHeight: number;
    slitWidth: number;
    slitSeparation: number;
  }): THREE.Group {
    const group = new THREE.Group();
    
    const barrierMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.5,
      roughness: 0.7
    });
    
    // Top section
    const topHeight = (params.barrierHeight - 2 * params.slitWidth - params.slitSeparation) / 2;
    if (topHeight > 0) {
      const topSection = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, topHeight, params.barrierWidth),
        barrierMaterial
      );
      topSection.position.y = params.barrierHeight / 2 - topHeight / 2;
      group.add(topSection);
    }
    
    // Middle section (between slits)
    const middleSection = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, params.slitSeparation, params.barrierWidth),
      barrierMaterial
    );
    group.add(middleSection);
    
    // Bottom section
    if (topHeight > 0) {
      const bottomSection = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, topHeight, params.barrierWidth),
        barrierMaterial
      );
      bottomSection.position.y = -params.barrierHeight / 2 + topHeight / 2;
      group.add(bottomSection);
    }
    
    return group;
  }
  
  static createDetectionScreen(width: number, height: number): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x111111,
      side: THREE.DoubleSide
    });
    
    return new THREE.Mesh(geometry, material);
  }
}