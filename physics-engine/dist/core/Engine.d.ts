import { LLMController } from '../llm/LLMController';
import { BaseExperiment } from '../experiments/BaseExperiment';
import type { EngineConfig } from '../types';
export declare class PhysicsEngine {
    private currentExperiment;
    private stateManager;
    private progressTracker;
    private llmController;
    private isRunning;
    private isPaused;
    private speed;
    private animationFrameId;
    private lastFrameTime;
    constructor(config?: EngineConfig);
    /**
     * Load an experiment
     */
    loadExperiment(experiment: BaseExperiment): Promise<void>;
    /**
     * Start simulation loop
     */
    start(): void;
    /**
     * Main simulation loop
     */
    private loop;
    /**
     * Pause simulation (can be called by LLM)
     */
    pause(): void;
    /**
     * Resume simulation
     */
    resume(): void;
    /**
     * Stop simulation completely
     */
    stop(): void;
    /**
     * Set simulation speed (0.1x to 10x)
     */
    setSpeed(speed: number): void;
    /**
     * Update parameter (can be called by user or LLM)
     */
    updateParameter(key: string, value: number): void;
    /**
     * Save current state
     */
    saveState(name?: string): string;
    /**
     * Load saved state
     */
    loadState(snapshotId: string): void;
    /**
     * Reset to initial state
     */
    reset(): void;
    /**
     * Get current progress (0-100)
     */
    getProgress(): number;
    /**
     * Get progress breakdown by objective
     */
    getProgressDetails(): {
        total: number;
        completed: number;
        percentage: number;
        objectives: {
            id: string;
            name: string;
            description: string;
            progress: number;
            completed: boolean;
        }[];
    };
    /**
     * Get LLM controller for tool integration
     */
    getLLMController(): LLMController;
    /**
     * Get current state for serialization
     */
    getState(): {
        experiment: import("../types/Experiments").ExperimentState | undefined;
        progress: number;
        isRunning: boolean;
        isPaused: boolean;
        speed: number;
    };
}
//# sourceMappingURL=Engine.d.ts.map