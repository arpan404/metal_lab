// models/procedural/FoucaultPendulum.ts
import * as THREE from 'three';

export class ProceduralFoucaultPendulum {
  static createPendulum(params: {
    length: number;
    bobRadius: number;
    wireThickness: number;
  }): THREE.Group {
    const group = new THREE.Group();
    
    // Wire/string
    const wireGeometry = new THREE.CylinderGeometry(
      params.wireThickness,
      params.wireThickness,
      params.length,
      8
    );
    const wireMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.2
    });
    const wire = new THREE.Mesh(wireGeometry, wireMaterial);
    wire.position.y = params.length / 2;
    group.add(wire);
    
    // Pendulum bob
    const bobGeometry = new THREE.SphereGeometry(params.bobRadius, 32, 32);
    const bobMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc8800,
      metalness: 0.9,
      roughness: 0.1
    });
    const bob = new THREE.Mesh(bobGeometry, bobMaterial);
    bob.position.y = params.length;
    group.add(bob);
    
    // Pivot point (at origin)
    const pivotGeometry = new THREE.SphereGeometry(
      params.wireThickness * 2,
      16,
      16
    );
    const pivot = new THREE.Mesh(pivotGeometry, wireMaterial);
    group.add(pivot);
    
    return group;
  }
  
  static createEarthGrid(radius: number): THREE.Group {
    const group = new THREE.Group();
    
    // Grid material
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      opacity: 0.3,
      transparent: true
    });
    
    // Latitude lines
    const latitudes = 12;
    for (let i = 0; i <= latitudes; i++) {
      const phi = (i / latitudes) * Math.PI;
      const points: THREE.Vector3[] = [];
      
      const segments = 64;
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        
        points.push(new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        ));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, gridMaterial);
      group.add(line);
    }
    
    // Longitude lines
    const longitudes = 24;
    for (let i = 0; i < longitudes; i++) {
      const theta = (i / longitudes) * Math.PI * 2;
      const points: THREE.Vector3[] = [];
      
      const segments = 64;
      for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * Math.PI;
        
        points.push(new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        ));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, gridMaterial);
      group.add(line);
    }
    
    return group;
  }
}