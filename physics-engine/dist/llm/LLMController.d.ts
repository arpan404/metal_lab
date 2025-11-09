import type { BaseExperiment } from '../experiments/BaseExperiment';
import type { PhysicsEngine } from '../core/Engine';
import type { LLMTool, LLMExplanation } from './types';
export declare class LLMController {
    private engine;
    private isPausedByLLM;
    private currentExplanation;
    private explanationQueue;
    private activeExplanationPoints;
    private onExplanationCallback?;
    private onPauseCallback?;
    private onResumeCallback?;
    constructor(engine: PhysicsEngine);
    /**
     * Called when experiment is loaded
     */
    onExperimentLoaded(experiment: BaseExperiment): void;
    /**
     * Check if any explanation points should trigger
     */
    checkExplanationPoints(experiment: BaseExperiment): void;
    private isConditionMet;
    private triggerExplanationPoint;
    /**
     * Pause simulation for LLM explanation
     */
    pauseForExplanation(explanation: LLMExplanation): void;
    /**
     * Resume after explanation
     */
    resumeAfterExplanation(): void;
    /**
     * Check if paused by LLM
     */
    isPaused(): boolean;
    /**
     * Get current explanation
     */
    getCurrentExplanation(): LLMExplanation | null;
    /**
     * Get pending explanations
     */
    getPendingExplanations(): LLMExplanation[];
    /**
     * Clear explanation queue
     */
    clearQueue(): void;
    /**
     * Set callbacks for LLM events
     */
    setCallbacks(callbacks: {
        onExplanation?: (explanation: LLMExplanation) => void;
        onPause?: () => void;
        onResume?: () => void;
    }): void;
    /**
     * Get tools for LLM function calling
     */
    getTools(): LLMTool[];
    private getCurrentContext;
    /**
     * Execute an LLM tool
     */
    executeTool(toolName: string, args: any): Promise<any>;
}
//# sourceMappingURL=LLMController.d.ts.map