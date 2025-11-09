import type { LLMController } from '../llm/LLMController';
import type { PhysicsEngine } from './Engine';
/**
 * Interface between Physics Engine and LLM systems
 * Provides a clean API for LLM to control simulations
 */
export declare class LLMInterface {
    private engine;
    private llmController;
    constructor(engine: PhysicsEngine, llmController: LLMController);
    /**
     * Pause simulation for explanation
     */
    pause(reason: string): Promise<void>;
    /**
     * Resume simulation
     */
    resume(): Promise<void>;
    /**
     * Change simulation speed
     */
    setSpeed(speed: number, explanation: string): Promise<void>;
    /**
     * Update a parameter
     */
    updateParameter(parameter: string, value: number, options?: {
        animate?: boolean;
        duration?: number;
        explanation?: string;
    }): Promise<void>;
    /**
     * Create a note on screen
     */
    createNote(text: string, position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center', duration?: number): Promise<void>;
    /**
     * Highlight an element
     */
    highlight(element: string, color?: string, duration?: number): Promise<void>;
    /**
     * Get current simulation state
     */
    getState(): Promise<any>;
    /**
     * Get student progress
     */
    getProgress(): Promise<any>;
    /**
     * Get available tools
     */
    getAvailableTools(): string[];
}
//# sourceMappingURL=LLMInterface.d.ts.map