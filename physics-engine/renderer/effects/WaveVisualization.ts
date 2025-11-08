// physics-engine/renderer/effects/WaveVisualization.ts
import * as THREE from 'three';

/**
 * Wave visualization effects for quantum experiments
 */

export class WaveVisualization {
  private scene: THREE.Scene;
  private wavePlanes: Map<string, WavePlane> = new Map();
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  /**
   * Create wave visualization plane
   */
  createWavePlane(
    id: string,
    config: {
      width?: number;
      height?: number;
      resolution?: number;
      position?: THREE.Vector3;
      rotation?: THREE.Euler;
    } = {}
  ): void {
    const width = config.width ?? 10;
    const height = config.height ?? 10;
    const resolution = config.resolution ?? 256;
    
    // Create data texture
    const size = resolution * resolution;
    const data = new Uint8Array(4 * size);
    
    const texture = new THREE.DataTexture(data, resolution, resolution);
    texture.needsUpdate = true;
    
    // Create plane mesh
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    if (config.position) {
      mesh.position.copy(config.position);
    }
    
    if (config.rotation) {
      mesh.rotation.copy(config.rotation);
    }
    
    this.scene.add(mesh);
    
    this.wavePlanes.set(id, {
      mesh,
      texture,
      resolution,
      data,
      colorMap: 'default'
    });
  }
  
  /**
   * Update wave plane with new data
   */
  updateWavePlane(
    id: string,
    waveData: Float32Array,
    config: {
      normalize?: boolean;
      colorMap?: 'default' | 'heat' | 'cool' | 'phase';
    } = {}
  ): void {
    const wavePlane = this.wavePlanes.get(id);
    if (!wavePlane) return;
    
    const normalize = config.normalize ?? true;
    const colorMap = config.colorMap ?? wavePlane.colorMap;
    
    // Find min/max for normalization
    let min = Infinity;
    let max = -Infinity;
    
    if (normalize) {
      for (let i = 0; i < waveData.length; i++) {
        if (waveData[i] < min) min = waveData[i];
        if (waveData[i] > max) max = waveData[i];
      }
    } else {
      min = -1;
      max = 1;
    }
    
    const range = max - min;
    
    // Update texture data
    for (let i = 0; i < waveData.length; i++) {
      const value = (waveData[i] - min) / range;
      const color = this.getColor(value, colorMap);
      
      wavePlane.data[i * 4] = color.r;
      wavePlane.data[i * 4 + 1] = color.g;
      wavePlane.data[i * 4 + 2] = color.b;
      wavePlane.data[i * 4 + 3] = 255;
    }
    
    if (wavePlane.texture) {
      wavePlane.texture.needsUpdate = true;
    }
    wavePlane.colorMap = colorMap;
  }
  
  /**
   * Get color based on value and color map
   */
  private getColor(value: number, colorMap: string): { r: number; g: number; b: number } {
    switch (colorMap) {
      case 'heat':
        // Black -> Red -> Yellow -> White
        if (value < 0.33) {
          return {
            r: Math.floor(value * 3 * 255),
            g: 0,
            b: 0
          };
        } else if (value < 0.66) {
          return {
            r: 255,
            g: Math.floor((value - 0.33) * 3 * 255),
            b: 0
          };
        } else {
          return {
            r: 255,
            g: 255,
            b: Math.floor((value - 0.66) * 3 * 255)
          };
        }
      
      case 'cool':
        // Black -> Blue -> Cyan -> White
        if (value < 0.33) {
          return {
            r: 0,
            g: 0,
            b: Math.floor(value * 3 * 255)
          };
        } else if (value < 0.66) {
          return {
            r: 0,
            g: Math.floor((value - 0.33) * 3 * 255),
            b: 255
          };
        } else {
          return {
            r: Math.floor((value - 0.66) * 3 * 255),
            g: 255,
            b: 255
          };
        }
      
      case 'phase':
        // Blue (negative) -> Black (zero) -> Red (positive)
        if (value < 0.5) {
          return {
            r: 0,
            g: 0,
            b: Math.floor((0.5 - value) * 2 * 255)
          };
        } else {
          return {
            r: Math.floor((value - 0.5) * 2 * 255),
            g: 0,
            b: 0
          };
        }
      
      default:
        // Grayscale
        const gray = Math.floor(value * 255);
        return { r: gray, g: gray, b: gray };
    }
  }
  
  /**
   * Create 3D wave surface
   */
  create3DWaveSurface(
    id: string,
    config: {
      width?: number;
      depth?: number;
      resolution?: number;
      position?: THREE.Vector3;
    } = {}
  ): void {
    const width = config.width ?? 10;
    const depth = config.depth ?? 10;
    const resolution = config.resolution ?? 64;
    
    // Create plane geometry with displacement
    const geometry = new THREE.PlaneGeometry(
      width,
      depth,
      resolution - 1,
      resolution - 1
    );
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x00aaff,
      wireframe: false,
      flatShading: false,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    
    if (config.position) {
      mesh.position.copy(config.position);
    }
    
    this.scene.add(mesh);
    
    this.wavePlanes.set(id, {
      mesh,
      texture: null,
      resolution,
      data: new Uint8Array(0),
      colorMap: 'default'
    });
  }
  
  /**
   * Update 3D wave surface
   */
  update3DWaveSurface(id: string, heightData: Float32Array, scale: number = 1.0): void {
    const wavePlane = this.wavePlanes.get(id);
    if (!wavePlane || !wavePlane.mesh.geometry) return;
    
    const positions = wavePlane.mesh.geometry.attributes.position;
    
    for (let i = 0; i < Math.min(heightData.length, positions.count); i++) {
      positions.setY(i, heightData[i] * scale);
    }
    
    positions.needsUpdate = true;
    wavePlane.mesh.geometry.computeVertexNormals();
  }
  
  /**
   * Add wave interference pattern
   */
  createInterferencePattern(
    id: string,
    source1: THREE.Vector3,
    source2: THREE.Vector3,
    wavelength: number,
    config: {
      width?: number;
      height?: number;
      resolution?: number;
    } = {}
  ): void {
    this.createWavePlane(id, config);
    
    const wavePlane = this.wavePlanes.get(id);
    if (!wavePlane) return;
    
    const resolution = wavePlane.resolution;
    const width = config.width ?? 10;
    const height = config.height ?? 10;
    
    const waveData = new Float32Array(resolution * resolution);
    
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const px = (x / resolution - 0.5) * width;
        const py = (y / resolution - 0.5) * height;
        
        const d1 = Math.sqrt(
          Math.pow(px - source1.x, 2) + Math.pow(py - source1.y, 2)
        );
        const d2 = Math.sqrt(
          Math.pow(px - source2.x, 2) + Math.pow(py - source2.y, 2)
        );
        
        const wave1 = Math.sin((2 * Math.PI * d1) / wavelength);
        const wave2 = Math.sin((2 * Math.PI * d2) / wavelength);
        
        waveData[y * resolution + x] = wave1 + wave2;
      }
    }
    
    this.updateWavePlane(id, waveData, { colorMap: 'phase' });
  }
  
  /**
   * Remove wave plane
   */
  removeWavePlane(id: string): void {
    const wavePlane = this.wavePlanes.get(id);
    if (!wavePlane) return;
    
    this.scene.remove(wavePlane.mesh);
    
    if (wavePlane.texture) {
      wavePlane.texture.dispose();
    }
    
    this.wavePlanes.delete(id);
  }
  
  /**
   * Clear all wave planes
   */
  clearAll(): void {
    this.wavePlanes.forEach((wavePlane) => {
      this.scene.remove(wavePlane.mesh);
      
      if (wavePlane.texture) {
        wavePlane.texture.dispose();
      }
    });
    this.wavePlanes.clear();
  }
  
  /**
   * Set wave plane visibility
   */
  setVisible(id: string, visible: boolean): void {
    const wavePlane = this.wavePlanes.get(id);
    if (!wavePlane) return;
    
    wavePlane.mesh.visible = visible;
  }
  
  /**
   * Animate wave (continuous update)
   */
  animateWave(id: string, time: number, frequency: number = 1.0): void {
    const wavePlane = this.wavePlanes.get(id);
    if (!wavePlane) return;
    
    const resolution = wavePlane.resolution;
    const waveData = new Float32Array(resolution * resolution);
    
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const px = x / resolution;
        const py = y / resolution;
        
        const wave = Math.sin(2 * Math.PI * frequency * (px + py + time));
        waveData[y * resolution + x] = wave;
      }
    }
    
    this.updateWavePlane(id, waveData);
  }
}

interface WavePlane {
  mesh: THREE.Mesh;
  texture: THREE.DataTexture | null;
  resolution: number;
  data: Uint8Array;
  colorMap: string;
}