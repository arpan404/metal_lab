// physics-engine/models/procedural/ElectricFieldPlates.ts
import * as THREE from 'three';

export interface ElectricFieldPlatesConfig {
  plateWidth: number;
  plateDepth: number;
  plateThickness: number;
  separation: number;
  positiveColor?: number;
  negativeColor?: number;
  showFieldLines?: boolean;
  fieldLineCount?: number;
}

export class ElectricFieldPlates {
  private group: THREE.Group;
  private config: Required<ElectricFieldPlatesConfig>;
  private upperPlate?: THREE.Mesh;
  private lowerPlate?: THREE.Mesh;
  private fieldLines: THREE.Line[] = [];

  constructor(config: ElectricFieldPlatesConfig) {
    this.group = new THREE.Group();
    
    this.config = {
      positiveColor: 0xff4444,
      negativeColor: 0x4444ff,
      showFieldLines: true,
      fieldLineCount: 16,
      ...config,
    };

    this.buildPlates();
    if (this.config.showFieldLines) {
      this.createFieldLines();
    }
  }

  private buildPlates(): void {
    const { plateWidth, plateDepth, plateThickness, separation, positiveColor, negativeColor } = this.config;

    // Create geometry for plates
    const geometry = new THREE.BoxGeometry(plateWidth, plateThickness, plateDepth);

    // Upper plate (positive)
    const upperMaterial = new THREE.MeshStandardMaterial({
      color: positiveColor,
      metalness: 0.8,
      roughness: 0.2,
      emissive: positiveColor,
      emissiveIntensity: 0.1,
    });

    this.upperPlate = new THREE.Mesh(geometry, upperMaterial);
    this.upperPlate.position.y = separation / 2;
    this.group.add(this.upperPlate);

    // Lower plate (negative)
    const lowerMaterial = new THREE.MeshStandardMaterial({
      color: negativeColor,
      metalness: 0.8,
      roughness: 0.2,
      emissive: negativeColor,
      emissiveIntensity: 0.1,
    });

    this.lowerPlate = new THREE.Mesh(geometry, lowerMaterial);
    this.lowerPlate.position.y = -separation / 2;
    this.group.add(this.lowerPlate);

    // Add plate labels
    this.addPlateLabels();

    // Add voltage indicators
    this.addVoltageIndicators();
  }

  private addPlateLabels(): void {
    // Create simple geometry-based labels (+ and -)
    const { plateWidth, separation } = this.config;

    // Plus sign for upper plate
    const plusGeometry = new THREE.BufferGeometry();
    const plusVertices = new Float32Array([
      -0.3, 0, 0, 0.3, 0, 0,  // horizontal
      0, -0.3, 0, 0, 0.3, 0,  // vertical
    ]);
    plusGeometry.setAttribute('position', new THREE.BufferAttribute(plusVertices, 3));
    
    const labelMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
    const plusSign = new THREE.LineSegments(plusGeometry, labelMaterial);
    plusSign.position.set(plateWidth / 2 + 0.5, separation / 2, 0);
    this.group.add(plusSign);

    // Minus sign for lower plate
    const minusGeometry = new THREE.BufferGeometry();
    const minusVertices = new Float32Array([
      -0.3, 0, 0, 0.3, 0, 0,  // horizontal line
    ]);
    minusGeometry.setAttribute('position', new THREE.BufferAttribute(minusVertices, 3));
    
    const minusSign = new THREE.LineSegments(minusGeometry, labelMaterial);
    minusSign.position.set(plateWidth / 2 + 0.5, -separation / 2, 0);
    this.group.add(minusSign);
  }

  private addVoltageIndicators(): void {
    const { plateWidth, plateDepth, separation } = this.config;

    // Create mounting posts/insulators
    const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, separation, 8);
    const postMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.3,
      roughness: 0.7,
    });

    const positions = [
      [-plateWidth / 2 + 0.2, 0, -plateDepth / 2 + 0.2],
      [plateWidth / 2 - 0.2, 0, -plateDepth / 2 + 0.2],
      [-plateWidth / 2 + 0.2, 0, plateDepth / 2 - 0.2],
      [plateWidth / 2 - 0.2, 0, plateDepth / 2 - 0.2],
    ];

    positions.forEach(pos => {
      const post = new THREE.Mesh(postGeometry, postMaterial);
      post.position.set(pos[0], pos[1], pos[2]);
      this.group.add(post);
    });
  }

  private createFieldLines(): void {
    const { plateWidth, plateDepth, separation, fieldLineCount } = this.config;
    const gridSize = Math.ceil(Math.sqrt(fieldLineCount));

    const lineMaterial = new THREE.LineDashedMaterial({
      color: 0x00ff00,
      dashSize: 0.1,
      gapSize: 0.05,
      opacity: 0.6,
      transparent: true,
    });

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = (i / (gridSize - 1) - 0.5) * (plateWidth - 0.5);
        const z = (j / (gridSize - 1) - 0.5) * (plateDepth - 0.5);

        const points = [
          new THREE.Vector3(x, separation / 2 - 0.1, z),
          new THREE.Vector3(x, -separation / 2 + 0.1, z),
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        line.computeLineDistances();
        
        this.fieldLines.push(line);
        this.group.add(line);
      }
    }
  }

  public updateFieldLines(time: number): void {
    // Animate field lines
    this.fieldLines.forEach((line, index) => {
      const material = line.material as THREE.LineDashedMaterial;
      material.dashSize = 0.1 + 0.05 * Math.sin(time * 2 + index * 0.1);
    });
  }

  public getObject3D(): THREE.Group {
    return this.group;
  }

  public update(deltaTime: number): void {
    // Could add animation like electric arcs, etc.
  }

  public setVoltage(voltage: number): void {
    // Adjust visual indicators based on voltage
    if (this.upperPlate) {
      const material = this.upperPlate.material as THREE.MeshStandardMaterial;
      const intensity = Math.min(Math.abs(voltage) / 1000, 0.5);
      material.emissiveIntensity = intensity;
    }

    if (this.lowerPlate) {
      const material = this.lowerPlate.material as THREE.MeshStandardMaterial;
      const intensity = Math.min(Math.abs(voltage) / 1000, 0.5);
      material.emissiveIntensity = intensity;
    }
  }

  public getFieldStrength(): number {
    // E = V/d
    const { separation } = this.config;
    return 1.0 / separation; // Normalized
  }

  public dispose(): void {
    this.upperPlate?.geometry.dispose();
    (this.upperPlate?.material as THREE.Material).dispose();
    this.lowerPlate?.geometry.dispose();
    (this.lowerPlate?.material as THREE.Material).dispose();
    
    this.fieldLines.forEach(line => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    });
  }
}