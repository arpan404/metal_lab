import type { GameConfig, GameState, GameScore, ObjectiveScore } from '../types';
/**
 * Base class for physics-based games
 */
export declare abstract class BaseGame {
    protected config: GameConfig;
    protected state: GameState;
    protected startTime: number;
    protected objectiveStates: Map<string, ObjectiveScore>;
    constructor(config: GameConfig);
    /**
     * Initialize game
     */
    abstract initialize(): Promise<void>;
    /**
     * Update game state
     */
    abstract update(deltaTime: number): void;
    /**
     * Reset game
     */
    abstract reset(): void;
    /**
     * Check objectives
     */
    abstract checkObjectives(): void;
    /**
     * Start game
     */
    start(): void;
    /**
     * Pause game
     */
    pause(): void;
    /**
     * Resume game
     */
    resume(): void;
    /**
     * End game
     */
    end(): void;
    /**
     * Update elapsed time
     */
    protected updateElapsedTime(): void;
    /**
     * Complete objective
     */
    protected completeObjective(objectiveId: string, accuracy?: number): void;
    /**
     * Called when objective is completed
     */
    protected onObjectiveCompleted(objectiveId: string, score: ObjectiveScore): void;
    /**
     * Add points
     */
    protected addPoints(points: number): void;
    /**
     * Apply penalty
     */
    protected applyPenalty(reason: string): void;
    /**
     * Calculate time bonus
     */
    protected calculateTimeBonus(): number;
    /**
     * Calculate accuracy bonus
     */
    protected calculateAccuracyBonus(): number;
    /**
     * Calculate final score
     */
    calculateFinalScore(): GameScore;
    /**
     * Check if game is won
     */
    isGameWon(): boolean;
    /**
     * Check if time is up
     */
    isTimeUp(): boolean;
    /**
     * Get game state
     */
    getState(): GameState;
    /**
     * Get config
     */
    getConfig(): GameConfig;
}
//# sourceMappingURL=BaseGame.d.ts.map