// models/procedural/NASCARTrack.ts
import * as THREE from 'three';

export class ProceduralNASCARTrack {
  static create(params: {
    radius: number;
    bankingAngle: number;  // in degrees
    trackWidth: number;
    segmentCount: number;
  }): THREE.Group {
    const group = new THREE.Group();
    
    // Convert banking angle to radians
    const bankingRad = (params.bankingAngle * Math.PI) / 180;
    
    // Create curved track surface
    const trackGeometry = new THREE.TorusGeometry(
      params.radius,
      params.trackWidth / 2,
      32,
      params.segmentCount
    );
    
    // Apply banking transformation
    const positions = trackGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      // Calculate banking tilt based on radial position
      const angle = Math.atan2(z, x);
      const radialDist = Math.sqrt(x * x + z * z);
      
      // Apply banking rotation
      const newY = y * Math.cos(bankingRad) + 
                   (radialDist - params.radius) * Math.sin(bankingRad);
      
      positions.setY(i, newY);
    }
    
    positions.needsUpdate = true;
    trackGeometry.computeVertexNormals();
    
    // Materials
    const trackMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
    group.add(trackMesh);
    
    // Add lane markings
    const markingsMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff00 
    });
    
    // Center line
    const centerLine = this.createTrackLine(
      params.radius,
      params.segmentCount,
      markingsMaterial
    );
    group.add(centerLine);
    
    // Outer wall
    const wallGeometry = new THREE.CylinderGeometry(
      params.radius + params.trackWidth / 2,
      params.radius + params.trackWidth / 2,
      2,
      params.segmentCount,
      1,
      true
    );
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    group.add(wall);
    
    return group;
  }
  
  private static createTrackLine(
    radius: number,
    segments: number,
    material: THREE.Material
  ): THREE.Line {
    const points: THREE.Vector3[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0.1,
        Math.sin(angle) * radius
      ));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material);
  }
}

// Usage in NASCARScene.ts:
const track = ProceduralNASCARTrack.create({
  radius: 100,
  bankingAngle: 25,
  trackWidth: 20,
  segmentCount: 64
});
scene.add(track);