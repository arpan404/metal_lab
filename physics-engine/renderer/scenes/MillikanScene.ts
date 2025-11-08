// physics-engine/renderer/scenes/MillikanScene.ts
import * as THREE from 'three';
import { BaseScene } from './BaseScene';
import type { MillikanOilDrop } from '../../experiments/MillikanOilDrop';

/**
 * 3D scene for Millikan oil drop experiment
 */

export class MillikanScene extends BaseScene {
  private millikan: MillikanOilDrop;
  private chamber: THREE.Mesh | null = null;
  private plates: THREE.Group | null = null;
  private droplets: Map<string, THREE.Mesh> = new Map();
  private fieldLines: THREE.Group | null = null;
  
  constructor(scene: THREE.Scene, experiment: MillikanOilDrop) {
    super(scene, experiment);
    this.millikan = experiment;
  }
  
  async initialize(): Promise<void> {
    // Create chamber
    this.createChamber();
    
    // Create parallel plates
    this.createPlates();
    
    // Create field lines
    this.createFieldLines();
    
    // Create light source
    this.createLightSource();
  }
  
  private createChamber(): void {
    const width = 5;
    const height = 8;
    const depth = 5;
    
    // Chamber walls (transparent)
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = this.createMaterial('glass', {
      color: 0xccccff,
      opacity: 0.2
    });
    
    this.chamber = new THREE.Mesh(geometry, material);
    this.addObject('chamber', this.chamber);
    
    // Frame
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });
    const frame = new THREE.LineSegments(edges, lineMaterial);
    this.addObject('frame', frame);
  }
  
  private createPlates(): void {
    const plateWidth = 4;
    const plateHeight = 0.1;
    const plateDepth = 4;
    const separation = this.millikan.getParameter('plateSeparation') * 100; // Scale up for visibility
    
    this.plates = new THREE.Group();
    
    // Top plate (positive)
    const topGeometry = new THREE.BoxGeometry(plateWidth, plateHeight, plateDepth);
    const topMaterial = this.createMaterial('metal', { color: 0xff0000 });
    const topPlate = new THREE.Mesh(topGeometry, topMaterial);
    topPlate.position.y = separation / 2;
    this.plates.add(topPlate);
    
    // Bottom plate (negative)
    const bottomGeometry = new THREE.BoxGeometry(plateWidth, plateHeight, plateDepth);
    const bottomMaterial = this.createMaterial('metal', { color: 0x0000ff });
    const bottomPlate = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottomPlate.position.y = -separation / 2;
    this.plates.add(bottomPlate);
    
    this.addObject('plates', this.plates);
  }
  
  private createFieldLines(): void {
    this.fieldLines = new THREE.Group();
    
    const lineCount = 10;
    const lineLength = this.millikan.getParameter('plateSeparation') * 100;
    const spacing = 4 / lineCount;
    
    for (let i = 0; i < lineCount; i++) {
      for (let j = 0; j < lineCount; j++) {
        const x = -2 + i * spacing;
        const z = -2 + j * spacing;
        
        const points = [
          new THREE.Vector3(x, lineLength / 2, z),
          new THREE.Vector3(x, -lineLength / 2, z)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.3
        });
        
        const line = new THREE.Line(geometry, material);
        this.fieldLines.add(line);
      }
    }
    
    this.fieldLines.visible = false;
    this.addObject('fieldLines', this.fieldLines);
  }
  
  private createLightSource(): void {
    // Microscope light
    const lightGeometry = new THREE.ConeGeometry(0.5, 1, 16);
    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });
    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    light.position.set(3, 0, 0);
    light.rotation.z = -Math.PI / 2;
    
    this.addObject('light', light);
    
    // Light beam
    const beamGeometry = new THREE.CylinderGeometry(0.05, 1, 5, 16);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffaa,
      transparent: true,
      opacity: 0.3
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.set(0.5, 0, 0);
    beam.rotation.z = Math.PI / 2;
    
    this.addObject('beam', beam);
  }
  
  update(deltaTime: number): void {
    const state = this.millikan.getState();
    
    // Update existing droplets
    interface DropletState {
      id: string;
      position: {
        x: number;
        y: number;
        z: number;
      };
    }

    state.objects.forEach((dropletState: DropletState) => {
      let droplet: THREE.Mesh | undefined = this.droplets.get(dropletState.id);
      
      if (!droplet) {
        // Create new droplet
        const geometry: THREE.SphereGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
          color: 0x8b7355,
          transparent: true,
          opacity: 0.7,
          metalness: 0.3,
          roughness: 0.4
        });
        
        droplet = new THREE.Mesh(geometry, material);
        this.scene.add(droplet);
        this.droplets.set(dropletState.id, droplet);
      }
      
      // Update position (scale up for visibility)
      droplet.position.set(
        dropletState.position.x * 100,
        dropletState.position.y * 100,
        dropletState.position.z * 100
      );
    });
    
    // Remove droplets that are no longer in experiment
    const activeIds: Set<string> = new Set(state.objects.map((obj: DropletState) => obj.id));
    this.droplets.forEach((droplet, id) => {
      if (!activeIds.has(id)) {
        this.scene.remove(droplet);
        this.droplets.delete(id);
      }
    });
  }
  
  /**
   * Toggle field line visibility
   */
  showFieldLines(show: boolean): void {
    if (this.fieldLines) {
      this.fieldLines.visible = show;
    }
  }
  
  dispose(): void {
    this.clearObjects();
    this.droplets.forEach(droplet => this.scene.remove(droplet));
    this.droplets.clear();
  }
}