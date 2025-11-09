// physics-engine/core/Engine.ts
import { StateManager } from '../state/StateManager';
import { ProgressTracker } from './ProgressTracker';
import { LLMController } from '../llm/LLMController';
import { BaseExperiment } from '../experiments/BaseExperiment';
import type { EngineConfig, SimulationParams } from '../types';

export class PhysicsEngine {
  private currentExperiment: BaseExperiment | null = null;
  private stateManager: StateManager;
  private progressTracker: ProgressTracker;
  private llmController: LLMController;
  
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private speed: number = 1.0;
  
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  
  constructor(config?: EngineConfig) {
    this.stateManager = new StateManager();
    this.progressTracker = new ProgressTracker();
    this.llmController = new LLMController(this);
  }
  
  /**
   * Load an experiment
   */
  async loadExperiment(experiment: BaseExperiment): Promise<void> {
    // Stop current experiment
    this.stop();
    
    // Load new experiment
    this.currentExperiment = experiment;
    await experiment.initialize();
    
    // Reset state
    this.stateManager.reset();
    this.progressTracker.reset(experiment.getLearningObjectives());
    
    // Notify LLM controller
    this.llmController.onExperimentLoaded(experiment);
  }
  
  /**
   * Start simulation loop
   */
  start(): void {
    if (!this.currentExperiment) {
      throw new Error('No experiment loaded');
    }
    
    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.loop();
  }
  
  /**
   * Main simulation loop
   */
  private loop = (): void => {
    if (!this.isRunning || !this.currentExperiment) return;
    
    const now = performance.now();
    const deltaTime = (now - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = now;
    
    // Check if LLM has paused simulation
    if (!this.isPaused && !this.llmController.isPaused()) {
      // Apply speed multiplier
      const adjustedDelta = deltaTime * this.speed;
      
      // Update experiment
      this.currentExperiment.update(adjustedDelta);
      
      // Save state snapshot
      this.stateManager.recordFrame(this.currentExperiment.getState());
      
      // Update progress
      this.progressTracker.update(this.currentExperiment);
      
      // Check for LLM explanation points
      this.llmController.checkExplanationPoints(this.currentExperiment);
    }
    
    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.loop);
  }
  
  /**
   * Pause simulation (can be called by LLM)
   */
  pause(): void {
    this.isPaused = true;
  }
  
  /**
   * Resume simulation
   */
  resume(): void {
    this.isPaused = false;
  }
  
  /**
   * Stop simulation completely
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Set simulation speed (0.1x to 10x)
   */
  setSpeed(speed: number): void {
    this.speed = Math.max(0.1, Math.min(10, speed));
  }
  
  /**
   * Update parameter (can be called by user or LLM)
   */
  updateParameter(key: string, value: number): void {
    if (!this.currentExperiment) return;
    
    this.currentExperiment.setParameter(key, value);
    this.stateManager.recordParameterChange(key, value);
  }
  
  /**
   * Save current state
   */
  saveState(name: string = 'checkpoint'): string {
    if (!this.currentExperiment) {
      throw new Error('No experiment to save');
    }
    
    return this.stateManager.saveSnapshot(
      name,
      this.currentExperiment.getState()
    );
  }
  
  /**
   * Load saved state
   */
  loadState(snapshotId: string): void {
    if (!this.currentExperiment) {
      throw new Error('No experiment loaded');
    }
    
    const snapshot = this.stateManager.loadSnapshot(snapshotId);
    this.currentExperiment.setState(snapshot.state);
  }
  
  /**
   * Reset to initial state
   */
  reset(): void {
    if (!this.currentExperiment) return;
    
    this.currentExperiment.reset();
    this.stateManager.reset();
    this.progressTracker.reset(this.currentExperiment.getLearningObjectives());
  }
  
  /**
   * Get current progress (0-100)
   */
  getProgress(): number {
    return this.progressTracker.getProgress();
  }
  
  /**
   * Get progress breakdown by objective
   */
  getProgressDetails() {
    return this.progressTracker.getDetails();
  }
  
  /**
   * Get LLM controller for tool integration
   */
  getLLMController(): LLMController {
    return this.llmController;
  }
  
  /**
   * Get current state for serialization
   */
  getState() {
    return {
      experiment: this.currentExperiment?.getState(),
      progress: this.progressTracker.getProgress(),
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      speed: this.speed
    };
  }
}