// physics-engine/models/procedural/DoubleSlitBarrier.ts
import * as THREE from 'three';

export interface DoubleSlitConfig {
  barrierWidth: number;
  barrierHeight: number;
  barrierThickness: number;
  slitWidth: number;
  slitSeparation: number;
  screenDistance: number;
}

export class DoubleSlitBarrier {
  private group: THREE.Group;
  private config: DoubleSlitConfig;
  private barrier?: THREE.Mesh;
  private screen?: THREE.Mesh;

  constructor(config: DoubleSlitConfig) {
    this.group = new THREE.Group();
    this.config = config;
    this.buildBarrier();
    this.buildScreen();
  }

  private buildBarrier(): void {
    const { barrierWidth, barrierHeight, barrierThickness, slitWidth, slitSeparation } = this.config;

    // Create barrier using CSG-like approach (subtract slits from solid)
    const shape = new THREE.Shape();
    
    // Outer rectangle
    shape.moveTo(-barrierWidth / 2, -barrierHeight / 2);
    shape.lineTo(barrierWidth / 2, -barrierHeight / 2);
    shape.lineTo(barrierWidth / 2, barrierHeight / 2);
    shape.lineTo(-barrierWidth / 2, barrierHeight / 2);
    shape.lineTo(-barrierWidth / 2, -barrierHeight / 2);

    // Create holes for slits
    const slit1Y = slitSeparation / 2;
    const slit2Y = -slitSeparation / 2;

    // Slit 1
    const hole1 = new THREE.Path();
    hole1.moveTo(-slitWidth / 2, slit1Y - slitWidth / 10);
    hole1.lineTo(slitWidth / 2, slit1Y - slitWidth / 10);
    hole1.lineTo(slitWidth / 2, slit1Y + slitWidth / 10);
    hole1.lineTo(-slitWidth / 2, slit1Y + slitWidth / 10);
    hole1.lineTo(-slitWidth / 2, slit1Y - slitWidth / 10);
    shape.holes.push(hole1);

    // Slit 2
    const hole2 = new THREE.Path();
    hole2.moveTo(-slitWidth / 2, slit2Y - slitWidth / 10);
    hole2.lineTo(slitWidth / 2, slit2Y - slitWidth / 10);
    hole2.lineTo(slitWidth / 2, slit2Y + slitWidth / 10);
    hole2.lineTo(-slitWidth / 2, slit2Y + slitWidth / 10);
    hole2.lineTo(-slitWidth / 2, slit2Y - slitWidth / 10);
    shape.holes.push(hole2);

    const extrudeSettings = {
      depth: barrierThickness,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.8,
      roughness: 0.2,
    });

    this.barrier = new THREE.Mesh(geometry, material);
    this.barrier.position.z = -barrierThickness / 2;
    this.group.add(this.barrier);

    // Add slit labels
    this.addSlitLabels();
  }

  private buildScreen(): void {
    const { barrierWidth, barrierHeight, screenDistance } = this.config;

    const screenGeometry = new THREE.PlaneGeometry(barrierWidth, barrierHeight);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      roughness: 0.9,
    });

    this.screen = new THREE.Mesh(screenGeometry, screenMaterial);
    this.screen.position.z = screenDistance;
    this.group.add(this.screen);

    // Add grid to screen for reference
    const gridHelper = new THREE.GridHelper(barrierWidth, 20, 0x888888, 0x444444);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = screenDistance + 0.01;
    this.group.add(gridHelper);
  }

  private addSlitLabels(): void {
    // Simple text indicators
    const { slitSeparation } = this.config;
    
    // Create small spheres to mark slits
    const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    const marker1 = new THREE.Mesh(markerGeometry, markerMaterial);
    marker1.position.set(-0.5, slitSeparation / 2, 0);
    this.group.add(marker1);

    const marker2 = new THREE.Mesh(markerGeometry, markerMaterial);
    marker2.position.set(-0.5, -slitSeparation / 2, 0);
    this.group.add(marker2);
  }

  public getObject3D(): THREE.Group {
    return this.group;
  }

  public getScreen(): THREE.Mesh | undefined {
    return this.screen;
  }

  public updateScreenTexture(texture: THREE.Texture): void {
    if (this.screen) {
      (this.screen.material as THREE.MeshStandardMaterial).map = texture;
      (this.screen.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
  }

  public dispose(): void {
    this.barrier?.geometry.dispose();
    (this.barrier?.material as THREE.Material).dispose();
    this.screen?.geometry.dispose();
    (this.screen?.material as THREE.Material).dispose();
  }
}