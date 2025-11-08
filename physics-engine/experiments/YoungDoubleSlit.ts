// physics-engine/experiments/YoungDoubleSlit.ts
import * as THREE from 'three';
import { WaveEngine, WaveParameters } from '../engines/WaveEngine';
import { QuantumEngine } from '../engines/QuantumEngine';
import { WaveFieldVisualizer } from '../visualizers/WaveFieldVisualizer';
import { SimulationState } from '../core/SimulationState';
import { ProgressTracker } from '../core/ProgressTracker';

export interface DoubleSlitConfig {
  wavelength: number;
  slitSeparation: number;
  slitWidth: number;
  screenDistance: number;
  useQuantum: boolean;
  particleMode: boolean;
}

export class YoungDoubleSlit {
  private scene: THREE.Scene;
  private waveEngine: WaveEngine | null = null;
  private quantumEngine: QuantumEngine | null = null;
  private visualizer: WaveFieldVisualizer | null = null;
  private state: SimulationState;
  private progress: ProgressTracker;
  private config: DoubleSlitConfig;
  private isRunning: boolean = false;
  
  // Experiment-specific metrics
  private totalPhotons: number = 0;
  private detectedPhotons: number = 0;
  private interferencePattern: Float32Array;
  
  constructor(scene: THREE.Scene, config: DoubleSlitConfig) {
    this.scene = scene;
    this.config = config;
    this.state = new SimulationState('young-double-slit');
    this.progress = new ProgressTracker([
      'setup',
      'wave-propagation',
      'interference-formation',
      'pattern-analysis',
      'complete'
    ]);
    this.interferencePattern = new Float32Array(256);
  }
  
  async initialize(): Promise<void> {
    this.progress.markComplete('setup');
    
    if (this.config.useQuantum) {
      // Use WebGPU quantum engine for more accurate simulation
      this.quantumEngine = new QuantumEngine();
      await this.quantumEngine.initialize();
    } else {
      // Use classical wave engine
      const waveParams: WaveParameters = {
        wavelength: this.config.wavelength,
        speed: 3e8, // Speed of light
        medium: 'vacuum',
        gridResolution: 256,
        timeStep: 1e-15
      };
      this.waveEngine = new WaveEngine(waveParams);
      this.waveEngine.setupDoubleSlit(
        this.config.slitSeparation,
        this.config.slitWidth
      );
    }
    
    // Create visualizer
    if (this.waveEngine) {
      this.visualizer = new WaveFieldVisualizer(
        this.scene,
        this.waveEngine,
        {
          colorScheme: 'rainbow',
          show3D: false,
          showIntensity: true,
          gridSize: 256,
          scale: 10
        }
      );
    }
    
    // Add experiment apparatus to scene
    this.createApparatus();
  }
  
  private createApparatus(): void {
    // Create barrier with slits
    const barrierGeometry = new THREE.BoxGeometry(0.1, 5, 1);
    const barrierMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      opacity: 0.8,
      transparent: true
    });
    const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    barrier.position.set(-2, 0, 0);
    this.scene.add(barrier);
    
    // Create slits (gaps in barrier)
    const slitGeometry = new THREE.BoxGeometry(0.11, this.config.slitWidth, 1.1);
    const slitMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      opacity: 1
    });
    
    const slit1 = new THREE.Mesh(slitGeometry, slitMaterial);
    slit1.position.set(-2, this.config.slitSeparation / 2, 0);
    this.scene.add(slit1);
    
    const slit2 = new THREE.Mesh(slitGeometry, slitMaterial);
    slit2.position.set(-2, -this.config.slitSeparation / 2, 0);
    this.scene.add(slit2);
    
    // Create detection screen
    const screenGeometry = new THREE.PlaneGeometry(0.05, 5);
    const screenMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0x111111
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(this.config.screenDistance, 0, 0);
    this.scene.add(screen);
    
    // Add labels
    this.addLabels();
  }
  
  private addLabels(): void {
    // This would add text labels for educational purposes
    // Implementation depends on text rendering library used
  }
  
  start(): void {
    this.isRunning = true;
    this.state.recordEvent({
      type: 'experiment_started',
      timestamp: Date.now(),
      data: { config: this.config }
    });
  }
  
  pause(): void {
    this.isRunning = false;
    this.state.recordEvent({
      type: 'experiment_paused',
      timestamp: Date.now()
    });
  }
  
  async update(deltaTime: number): Promise<void> {
    if (!this.isRunning) return;
    
    if (this.config.particleMode) {
      // Simulate individual photons
      await this.updateParticleMode(deltaTime);
    } else {
      // Simulate continuous wave
      await this.updateWaveMode(deltaTime);
    }
    
    // Update visualization
    if (this.visualizer) {
      this.visualizer.update();
    }
    
    // Update progress
    this.updateProgress();
  }
  
  private async updateWaveMode(deltaTime: number): Promise<void> {
    if (this.waveEngine) {
      this.waveEngine.update(deltaTime);
      
      // Get interference pattern
      const pattern = this.waveEngine.getIntensityPattern();
      this.analyzePattern(pattern);
      
    } else if (this.quantumEngine) {
      // Use WebGPU quantum engine
      const params = {
        gridSize: 256,
        wavelength: this.config.wavelength,
        slitSeparation: this.config.slitSeparation,
        dt: deltaTime
      };
      
      const result = await this.quantumEngine.simulateWavePropagation(params);
      this.analyzePattern(result);
    }
  }
  
  private async updateParticleMode(deltaTime: number): Promise<void> {
    // Emit photons one at a time
    const photonsPerSecond = 1000;
    const photonsThisFrame = Math.floor(photonsPerSecond * deltaTime);
    
    for (let i = 0; i < photonsThisFrame; i++) {
      this.totalPhotons++;
      
      // Random y position through one of the slits
      const slit = Math.random() < 0.5 ? 1 : -1;
      const y = slit * this.config.slitSeparation / 2 + 
                (Math.random() - 0.5) * this.config.slitWidth;
      
      // Calculate where photon hits the screen
      const angle = this.calculateDiffraction(y);
      const screenY = this.config.screenDistance * Math.tan(angle);
      
      // Update interference pattern histogram
      const binIndex = Math.floor((screenY + 2.5) / 5 * 256);
      if (binIndex >= 0 && binIndex < 256) {
        this.interferencePattern[binIndex]++;
        this.detectedPhotons++;
      }
    }
    
    this.progress.updateStep('wave-propagation', 
      this.detectedPhotons / 10000); // Target 10000 photons
  }
  
  private calculateDiffraction(y: number): number {
    // Simplified diffraction calculation
    const k = 2 * Math.PI / this.config.wavelength;
    const pathDiff = Math.abs(y) * Math.sin(Math.atan(y / this.config.screenDistance));
    const phase = k * pathDiff;
    
    // Add some quantum randomness
    return phase + (Math.random() - 0.5) * 0.1;
  }
  
  private analyzePattern(pattern: Float32Array): void {
    // Find peaks and valleys in interference pattern
    let peaks = 0;
    let valleys = 0;
    
    for (let i = 1; i < pattern.length - 1; i++) {
      if (pattern[i] > pattern[i-1] && pattern[i] > pattern[i+1]) {
        peaks++;
      }
      if (pattern[i] < pattern[i-1] && pattern[i] < pattern[i+1]) {
        valleys++;
      }
    }
    
    // Calculate fringe visibility
    const maxIntensity = Math.max(...pattern);
    const minIntensity = Math.min(...pattern);
    const visibility = (maxIntensity - minIntensity) / (maxIntensity + minIntensity);
    
    this.state.recordMeasurement({
      type: 'interference_analysis',
      timestamp: Date.now(),
      value: {
        peaks,
        valleys,
        visibility,
        averageIntensity: pattern.reduce((a, b) => a + b) / pattern.length
      }
    });
    
    this.progress.markComplete('interference-formation');
    
    if (visibility > 0.8) {
      this.progress.markComplete('pattern-analysis');
    }
  }
  
  private updateProgress(): void {
    if (this.progress.getOverallProgress() >= 0.8 && 
        !this.progress.isStepComplete('complete')) {
      this.progress.markComplete('complete');
      this.onExperimentComplete();
    }
  }
  
  private onExperimentComplete(): void {
    this.state.recordEvent({
      type: 'experiment_completed',
      timestamp: Date.now(),
      data: {
        totalPhotons: this.totalPhotons,
        detectedPhotons: this.detectedPhotons,
        pattern: Array.from(this.interferencePattern)
      }
    });
  }
  
  // Methods for LLM integration
  getExperimentState(): any {
    return {
      config: this.config,
      progress: this.progress.getOverallProgress(),
      currentStep: this.progress.getCurrentStep(),
      measurements: this.state.getMeasurements(),
      isRunning: this.isRunning,
      photonStats: {
        total: this.totalPhotons,
        detected: this.detectedPhotons
      }
    };
  }
  
  setParameter(param: string, value: number): void {
    switch (param) {
      case 'wavelength':
        this.config.wavelength = value;
        if (this.waveEngine) {
          // Update wave engine parameters
        }
        break;
      case 'slitSeparation':
        this.config.slitSeparation = value;
        if (this.waveEngine) {
          this.waveEngine.setupDoubleSlit(value, this.config.slitWidth);
        }
        break;
      case 'slitWidth':
        this.config.slitWidth = value;
        if (this.waveEngine) {
          this.waveEngine.setupDoubleSlit(this.config.slitSeparation, value);
        }
        break;
    }
    
    this.state.recordEvent({
      type: 'parameter_changed',
      timestamp: Date.now(),
      data: { param, value }
    });
  }
  
  reset(): void {
    this.isRunning = false;
    this.totalPhotons = 0;
    this.detectedPhotons = 0;
    this.interferencePattern.fill(0);
    
    if (this.waveEngine) {
      this.waveEngine.reset();
    }
    
    this.state.reset();
    this.progress.reset();
    
    this.state.recordEvent({
      type: 'experiment_reset',
      timestamp: Date.now()
    });
  }
  
  dispose(): void {
    if (this.visualizer) {
      this.visualizer.dispose();
    }
    
    this.scene.children
      .filter(child => child.userData.experiment === 'young-double-slit')
      .forEach(child => {
        this.scene.remove(child);
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
  }
}