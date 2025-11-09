// physics-engine/models/procedural/PendulumRig.ts
import * as THREE from 'three';

export interface PendulumRigConfig {
  length: number;
  bobRadius: number;
  wireRadius?: number;
  baseRadius?: number;
  baseHeight?: number;
}

export class PendulumRig {
  private group: THREE.Group;
  private config: Required<PendulumRigConfig>;
  private wire?: THREE.Mesh;
  private bob?: THREE.Mesh;
  private base?: THREE.Mesh;

  constructor(config: PendulumRigConfig) {
    this.group = new THREE.Group();
    this.config = {
      wireRadius: 0.01,
      baseRadius: 1.0,
      baseHeight: 0.2,
      ...config,
    };

    this.buildRig();
  }

  private buildRig(): void {
    // Create base/platform
    const baseGeometry = new THREE.CylinderGeometry(
      this.config.baseRadius,
      this.config.baseRadius,
      this.config.baseHeight,
      32
    );
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.5,
      roughness: 0.5,
    });
    this.base = new THREE.Mesh(baseGeometry, baseMaterial);
    this.base.position.y = -this.config.baseHeight / 2;
    this.group.add(this.base);

    // Create support column
    const columnGeometry = new THREE.CylinderGeometry(0.05, 0.05, this.config.length, 16);
    const columnMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.7,
      roughness: 0.3,
    });
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.y = this.config.length / 2;
    this.group.add(column);

    // Create suspension point
    const pivotGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const pivotMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 0.9,
      roughness: 0.1,
    });
    const pivot = new THREE.Mesh(pivotGeometry, pivotMaterial);
    pivot.position.y = this.config.length;
    this.group.add(pivot);

    // Create wire
    const wireGeometry = new THREE.CylinderGeometry(
      this.config.wireRadius,
      this.config.wireRadius,
      this.config.length,
      8
    );
    const wireMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.2,
    });
    this.wire = new THREE.Mesh(wireGeometry, wireMaterial);
    this.wire.position.y = this.config.length / 2;
    this.group.add(this.wire);

    // Create bob (pendulum mass)
    const bobGeometry = new THREE.SphereGeometry(this.config.bobRadius, 32, 32);
    const bobMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      metalness: 0.6,
      roughness: 0.4,
    });
    this.bob = new THREE.Mesh(bobGeometry, bobMaterial);
    this.bob.position.y = 0;
    this.group.add(this.bob);

    // Add pointer for tracing path
    const pointerGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
    const pointerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const pointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
    pointer.position.y = -this.config.bobRadius;
    pointer.rotation.x = Math.PI;
    this.bob.add(pointer);

    // Add compass rose on base
    this.addCompassRose();
  }

  private addCompassRose(): void {
    const points = [];
    const radius = this.config.baseRadius * 0.8;

    // Draw compass directions
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });

    // North-South line
    points.push(new THREE.Vector3(0, 0.11, -radius));
    points.push(new THREE.Vector3(0, 0.11, radius));
    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.group.add(new THREE.Line(geometry, lineMaterial));

    // East-West line
    points.length = 0;
    points.push(new THREE.Vector3(-radius, 0.11, 0));
    points.push(new THREE.Vector3(radius, 0.11, 0));
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.group.add(new THREE.Line(geometry, lineMaterial));
  }

  public setPendulumAngle(theta: number, phi: number): void {
    if (this.wire && this.bob) {
      // Rotate wire and bob
      this.wire.rotation.x = theta * Math.cos(phi);
      this.wire.rotation.z = theta * Math.sin(phi);

      // Update bob position
      const x = this.config.length * Math.sin(theta) * Math.cos(phi);
      const y = this.config.length * Math.cos(theta);
      const z = this.config.length * Math.sin(theta) * Math.sin(phi);

      this.bob.position.set(x, y, z);
    }
  }

  public getObject3D(): THREE.Group {
    return this.group;
  }

  public getBobPosition(): THREE.Vector3 {
    return this.bob ? this.bob.position.clone() : new THREE.Vector3();
  }

  public dispose(): void {
    this.wire?.geometry.dispose();
    (this.wire?.material as THREE.Material).dispose();
    this.bob?.geometry.dispose();
    (this.bob?.material as THREE.Material).dispose();
    this.base?.geometry.dispose();
    (this.base?.material as THREE.Material).dispose();
  }
}