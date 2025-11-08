// physics-engine/experiments/BaseExperiment.ts
import type { 
    ExperimentState,
    ExplanationPoint 
  } from '../types/experiments';
import type { ParameterConfig, LearningObjective } from '../types/index';
  
  export abstract class BaseExperiment {
    protected name: string;
    protected description: string;
    protected parameters: Map<string, number> = new Map();
    protected parameterConfigs: ParameterConfig[];
    protected learningObjectives: LearningObjective[];
    
    // State tracking
    protected startTime: number = 0;
    protected elapsedTime: number = 0;
    protected frameCount: number = 0;
    
    constructor(
      name: string,
      description: string,
      parameterConfigs: ParameterConfig[],
      learningObjectives: LearningObjective[]
    ) {
      this.name = name;
      this.description = description;
      this.parameterConfigs = parameterConfigs;
      this.learningObjectives = learningObjectives;
      
      // Initialize default parameters
      parameterConfigs.forEach(config => {
        this.parameters.set(config.name, config.default);
      });
    }
    
    /**
     * Initialize experiment (load resources, setup GPU, etc.)
     */
    abstract initialize(): Promise<void>;
    
    /**
     * Update simulation by deltaTime
     */
    abstract update(deltaTime: number): void;
    
    /**
     * Reset to initial conditions
     */
    abstract reset(): void;
    
    /**
     * Get current state (for saving/loading)
     */
    abstract getState(): ExperimentState;
    
    /**
     * Set state (for loading saved states)
     */
    abstract setState(state: ExperimentState): void;
    
    /**
     * Get points where LLM can provide explanations
     */
    abstract getExplanationPoints(): ExplanationPoint[];
    
    /**
     * Get measurement data (for progress tracking)
     */
    abstract getMeasurements(): Record<string, number>;
    
    // Common methods
    
    getName(): string {
      return this.name;
    }
    
    getDescription(): string {
      return this.description;
    }
    
    getParameter(key: string): number {
      return this.parameters.get(key) ?? 0;
    }
    
    setParameter(key: string, value: number): void {
      const config = this.parameterConfigs.find(c => c.name === key);
      if (!config) {
        throw new Error(`Unknown parameter: ${key}`);
      }
      
      // Validate range
      const clampedValue = Math.max(config.min, Math.min(config.max, value));
      this.parameters.set(key, clampedValue);
      
      // Trigger parameter change hook
      this.onParameterChanged(key, clampedValue);
    }
    
    protected onParameterChanged(key: string, value: number): void {
      // Override in subclasses if needed
    }
    
    getParameterConfigs(): ParameterConfig[] {
      return this.parameterConfigs;
    }
    
    getLearningObjectives(): LearningObjective[] {
      return this.learningObjectives;
    }
    
    getElapsedTime(): number {
      return this.elapsedTime;
    }
    
    getFrameCount(): number {
      return this.frameCount;
    }
    
    /**
     * Serialize state to JSON
     */
    serialize(): string {
      return JSON.stringify({
        name: this.name,
        parameters: Array.from(this.parameters.entries()),
        elapsedTime: this.elapsedTime,
        frameCount: this.frameCount,
        state: this.getState()
      });
    }
    
    /**
     * Deserialize state from JSON
     */
    deserialize(json: string): void {
      const data = JSON.parse(json);
      
      // Restore parameters
      data.parameters.forEach(([key, value]: [string, number]) => {
        this.parameters.set(key, value);
      });
      
      this.elapsedTime = data.elapsedTime;
      this.frameCount = data.frameCount;
      this.setState(data.state);
    }
  }