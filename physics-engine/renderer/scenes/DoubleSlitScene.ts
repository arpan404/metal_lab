// physics-engine/renderer/scenes/DoubleSlitScene.ts
import * as THREE from 'three';
import { BaseScene } from './BaseScene';
import type { YoungDoubleSlit } from '../../experiments/YoungDoubleSlit';

/**
 * 3D scene for Young's double slit experiment
 */

export class DoubleSlitScene extends BaseScene {
  private doubleSlit: YoungDoubleSlit;
  private waveTexture: THREE.DataTexture | null = null;
  private wavePlane: THREE.Mesh | null = null;
  private barrier: THREE.Mesh | null = null;
  private screen: THREE.Mesh | null = null;
  private patternCanvas: HTMLCanvasElement | null = null;
  
  constructor(scene: THREE.Scene, experiment: YoungDoubleSlit) {
    super(scene, experiment);
    this.doubleSlit = experiment;
  }
  
  async initialize(): Promise<void> {
    // Create barrier with slits
    this.createBarrier();
    
    // Create detection screen
    this.createScreen();
    
    // Create wave visualization plane
    this.createWavePlane();
    
    // Create light source
    this.createLightSource();
  }
  
  private createBarrier(): void {
    const barrierGroup = new THREE.Group();
    
    const slitSeparation = this.doubleSlit.getParameter('slitSeparation') * 1000; // Scale to mm
    const slitWidth = this.doubleSlit.getParameter('slitWidth') * 1000;
    
    const barrierWidth = 10;
    const barrierHeight = 10;
    const barrierThickness = 0.2;
    
    // Main barrier
    const geometry = new THREE.BoxGeometry(barrierWidth, barrierHeight, barrierThickness);
    const material = this.createMaterial('metal', { color: 0x111111 });
    const barrier = new THREE.Mesh(geometry, material);
    barrierGroup.add(barrier);
    
    // Highlight slits
    const slitGeometry = new THREE.PlaneGeometry(slitWidth, barrierHeight);
    const slitMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const slit1 = new THREE.Mesh(slitGeometry, slitMaterial);
    slit1.position.y = slitSeparation / 2;
    slit1.position.z = 0.11;
    barrierGroup.add(slit1);
    
    const slit2 = new THREE.Mesh(slitGeometry, slitMaterial);
    slit2.position.y = -slitSeparation / 2;
    slit2.position.z = 0.11;
    barrierGroup.add(slit2);
    
    barrierGroup.position.z = 5;
    this.addObject('barrier', barrierGroup);
  }
  
  private createScreen(): void {
    const screenGeometry = new THREE.PlaneGeometry(10, 10);
    const screenMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    
    this.screen = new THREE.Mesh(screenGeometry, screenMaterial);
    this.screen.position.z = 15;
    
    this.addObject('screen', this.screen);
    
    // Create canvas for pattern visualization
    this.patternCanvas = document.createElement('canvas');
    this.patternCanvas.width = 512;
    this.patternCanvas.height = 512;
  }
  
  private createWavePlane(): void {
    const gridSize = 512;
    
    // Create texture from wave data
    const size = gridSize * gridSize;
    const data = new Uint8Array(4 * size);
    
    this.waveTexture = new THREE.DataTexture(data, gridSize, gridSize);
    this.waveTexture.needsUpdate = true;
    
    // Create plane to display wave
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshBasicMaterial({
      map: this.waveTexture,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    this.wavePlane = new THREE.Mesh(geometry, material);
    this.wavePlane.rotation.x = -Math.PI / 2;
    this.wavePlane.position.y = -2;
    
    this.addObject('wavePlane', this.wavePlane);
  }
  
  private createLightSource(): void {
    // Laser source
    const sourceGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
    const sourceMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const source = new THREE.Mesh(sourceGeometry, sourceMaterial);
    source.position.z = -5;
    source.rotation.x = Math.PI / 2;
    
    this.addObject('source', source);
    
    // Laser beam
    const beamGeometry = new THREE.CylinderGeometry(0.1, 0.1, 10, 16);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.z = 0;
    beam.rotation.x = Math.PI / 2;
    
    this.addObject('beam', beam);
  }
  
  update(deltaTime: number): void {
    // Update wave visualization
    const waveField = this.doubleSlit.getWaveField();
    
    if (this.waveTexture && waveField) {
      const data = this.waveTexture.image.data as Uint8Array;
      
      for (let i = 0; i < waveField.length; i += 4) {
        const amplitude = waveField[i]; // Real part
        
        // Map amplitude to color (blue for negative, red for positive)
        if (amplitude > 0) {
          data[i * 4] = Math.min(255, amplitude * 255);
          data[i * 4 + 1] = 0;
          data[i * 4 + 2] = 0;
        } else {
          data[i * 4] = 0;
          data[i * 4 + 1] = 0;
          data[i * 4 + 2] = Math.min(255, -amplitude * 255);
        }
        data[i * 4 + 3] = 255;
      }
      
      this.waveTexture.needsUpdate = true;
    }
    
    // Update interference pattern on screen
    this.updateInterferencePattern();
  }
  
  private updateInterferencePattern(): void {
    if (!this.patternCanvas || !this.screen) return;
    
    const ctx = this.patternCanvas.getContext('2d');
    if (!ctx) return;
    
    const pattern = this.doubleSlit.getInterferencePattern();
    const width = this.patternCanvas.width;
    const height = this.patternCanvas.height;
    
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    
    // Draw pattern
    for (let y = 0; y < pattern.length; y++) {
      const intensity = pattern[y];
      const brightness = Math.floor(intensity * 255);
      
      ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
      ctx.fillRect(0, (y / pattern.length) * height, width, height / pattern.length);
    }
    
    // Update screen texture
    const texture = new THREE.CanvasTexture(this.patternCanvas);
    if (this.screen.material instanceof THREE.MeshBasicMaterial) {
      this.screen.material.map = texture;
      this.screen.material.needsUpdate = true;
    }
  }
  
  dispose(): void {
    this.clearObjects();
    if (this.waveTexture) {
      this.waveTexture.dispose();
    }
  }
}