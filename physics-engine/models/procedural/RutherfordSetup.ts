// models/procedural/RutherfordSetup.ts
import * as THREE from 'three';

export class ProceduralRutherfordSetup {
  static createGoldFoil(params: {
    width: number;
    height: number;
    thickness: number;
  }): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(
      params.width,
      params.height,
      params.thickness
    );
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xffd700,  // Gold color
      metalness: 1.0,
      roughness: 0.3,
      opacity: 0.8,
      transparent: true
    });
    
    return new THREE.Mesh(geometry, material);
  }
  
  static createAlphaParticle(size: number = 0.3): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(size, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff4400,
      emissiveIntensity: 0.5
    });
    
    return new THREE.Mesh(geometry, material);
  }
  
  static createDetectorRing(params: {
    radius: number;
    ringWidth: number;
    segments: number;
  }): THREE.Group {
    const group = new THREE.Group();
    
    // Create ring of detectors
    for (let i = 0; i < params.segments; i++) {
      const angle = (i / params.segments) * Math.PI * 2;
      
      const detector = new THREE.Mesh(
        new THREE.BoxGeometry(
          params.ringWidth,
          params.ringWidth * 2,
          params.ringWidth
        ),
        new THREE.MeshStandardMaterial({
          color: 0x4444ff,
          emissive: 0x0000ff,
          emissiveIntensity: 0.2
        })
      );
      
      detector.position.x = Math.cos(angle) * params.radius;
      detector.position.z = Math.sin(angle) * params.radius;
      detector.lookAt(0, 0, 0);
      
      group.add(detector);
    }
    
    return group;
  }
  
  static createRadioactiveSource(): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(1, 1, 2, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.3
    });
    
    const source = new THREE.Mesh(geometry, material);
    
    // Add radiation symbol
    const symbolGeometry = new THREE.CircleGeometry(0.8, 32);
    const symbolMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide
    });
    const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
    symbol.rotation.x = Math.PI / 2;
    symbol.position.y = 1.01;
    
    source.add(symbol);
    
    return source;
  }
}