import type { ExperimentState, ExplanationPoint } from '../types/Experiments';
import type { ParameterConfig, LearningObjective } from '../types/index';
export declare abstract class BaseExperiment {
    protected name: string;
    protected description: string;
    protected parameters: Map<string, number>;
    protected parameterConfigs: ParameterConfig[];
    protected learningObjectives: LearningObjective[];
    protected parameterHistory: Map<string, number[]>;
    protected startTime: number;
    protected elapsedTime: number;
    protected frameCount: number;
    constructor(name: string, description: string, parameterConfigs: ParameterConfig[], learningObjectives: LearningObjective[]);
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
    getName(): string;
    getDescription(): string;
    getParameter(key: string): number;
    setParameter(key: string, value: number): void;
    protected onParameterChanged(key: string, value: number): void;
    getParameterConfigs(): ParameterConfig[];
    getLearningObjectives(): LearningObjective[];
    getElapsedTime(): number;
    getFrameCount(): number;
    /**
     * Serialize state to JSON
     */
    serialize(): string;
    /**
     * Deserialize state from JSON
     */
    deserialize(json: string): void;
}
//# sourceMappingURL=BaseExperiment.d.ts.map