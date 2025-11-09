// physics-engine/models/procedural/MillikanChamber.ts
import * as THREE from 'three';

export interface MillikanChamberConfig {
  width: number;
  height: number;
  depth: number;
  wallThickness?: number;
}

export class MillikanChamber {
  private group: THREE.Group;
  private config: Required<MillikanChamberConfig>;

  constructor(config: MillikanChamberConfig) {
    this.group = new THREE.Group();
    this.config = { wallThickness: 0.05, ...config };
    this.buildChamber();
  }

  private buildChamber(): void {
    const { width, height, depth, wallThickness } = this.config;

    // Glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xaaaaff,
      transparent: true,
      opacity: 0.2,
      roughness: 0.1,
      metalness: 0,
      transmission: 0.9,
      thickness: wallThickness,
    });

    // Create walls
    const frontGeometry = new THREE.PlaneGeometry(width, height);
    const front = new THREE.Mesh(frontGeometry, glassMaterial);
    front.position.z = depth / 2;
    this.group.add(front);

    const back = front.clone();
    back.position.z = -depth / 2;
    back.rotation.y = Math.PI;
    this.group.add(back);

    const leftGeometry = new THREE.PlaneGeometry(depth, height);
    const left = new THREE.Mesh(leftGeometry, glassMaterial);
    left.position.x = -width / 2;
    left.rotation.y = Math.PI / 2;
    this.group.add(left);

    const right = left.clone();
    right.position.x = width / 2;
    right.rotation.y = -Math.PI / 2;
    this.group.add(right);

    // Frame
    this.addFrame();
  }

  private addFrame(): void {
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.3,
    });

    const { width, height, depth } = this.config;
    const frameThickness = 0.03;

    // Vertical edges
    const vEdgeGeometry = new THREE.BoxGeometry(frameThickness, height, frameThickness);
    const positions = [
      [-width / 2, 0, depth / 2],
      [width / 2, 0, depth / 2],
      [-width / 2, 0, -depth / 2],
      [width / 2, 0, -depth / 2],
    ];

    positions.forEach(pos => {
      const edge = new THREE.Mesh(vEdgeGeometry, frameMaterial);
      edge.position.set(pos[0], pos[1], pos[2]);
      this.group.add(edge);
    });
  }

  public getObject3D(): THREE.Group {
    return this.group;
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
  }
}


// physics-engine/models/procedural/ParticleEmitter.ts
export class ParticleEmitter {
  private group: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.buildEmitter();
  }

  private buildEmitter(): void {
    const nozzleGeometry = new THREE.ConeGeometry(0.1, 0.3, 16);
    const nozzleMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.2,
    });

    const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
    nozzle.rotation.x = Math.PI;
    this.group.add(nozzle);

    // Add emission indicator
    const glowGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = -0.15;
    this.group.add(glow);
  }

  public getObject3D(): THREE.Group {
    return this.group;
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
  }
}


// physics-engine/models/procedural/MeasurementGrid.ts
export class MeasurementGrid {
  private group: THREE.Group;

  constructor(size: number = 10, divisions: number = 10) {
    this.group = new THREE.Group();
    this.buildGrid(size, divisions);
  }

  private buildGrid(size: number, divisions: number): void {
    const gridHelper = new THREE.GridHelper(size, divisions, 0x888888, 0x444444);
    this.group.add(gridHelper);

    // Add axis labels
    this.addAxisLabels(size);
  }

  private addAxisLabels(size: number): void {
    // Simple axis indicators using lines and cones
    const arrowHelper = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      size / 2,
      0xff0000
    );
    this.group.add(arrowHelper);

    const arrowHelper2 = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 0),
      size / 2,
      0x0000ff
    );
    this.group.add(arrowHelper2);
  }

  public getObject3D(): THREE.Group {
    return this.group;
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        (child as any).geometry.dispose();
        ((child as any).material as THREE.Material).dispose();
      }
    });
  }
}