// physics-engine/games/BaseGame.ts
import type {
    GameConfig,
    GameObjective,
    GameState,
    GameScore,
    ObjectiveScore
  } from '../types';
  
  /**
   * Base class for physics-based games
   */
  
  export abstract class BaseGame {
    protected config: GameConfig;
    protected state: GameState;
    protected startTime: number = 0;
    protected objectiveStates: Map<string, ObjectiveScore> = new Map();
    
    constructor(config: GameConfig) {
      this.config = config;
      
      this.state = {
        isPlaying: false,
        isPaused: false,
        startTime: 0,
        elapsedTime: 0,
        currentScore: 0,
        objectivesCompleted: 0,
        totalObjectives: config.objectives.filter(obj => obj.required).length
      };
      
      // Initialize objective states
      config.objectives.forEach(obj => {
        this.objectiveStates.set(obj.id, {
          objectiveId: obj.id,
          completed: false,
          points: 0,
          accuracy: 0
        });
      });
    }
    
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
    start(): void {
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.startTime = Date.now();
      this.state.startTime = this.startTime;
    }
    
    /**
     * Pause game
     */
    pause(): void {
      this.state.isPaused = true;
    }
    
    /**
     * Resume game
     */
    resume(): void {
      this.state.isPaused = false;
    }
    
    /**
     * End game
     */
    end(): void {
      this.state.isPlaying = false;
    }
    
    /**
     * Update elapsed time
     */
    protected updateElapsedTime(): void {
      this.state.elapsedTime = (Date.now() - this.startTime) / 1000;
    }
    
    /**
     * Complete objective
     */
    protected completeObjective(objectiveId: string, accuracy: number = 1.0): void {
      const objective = this.config.objectives.find(obj => obj.id === objectiveId);
      if (!objective) return;
      
      const objState = this.objectiveStates.get(objectiveId);
      if (!objState || objState.completed) return;
      
      objState.completed = true;
      objState.accuracy = accuracy;
      objState.points = Math.round(objective.points * accuracy);
      
      this.state.currentScore += objState.points;
      
      if (objective.required) {
        this.state.objectivesCompleted++;
      }
      
      this.objectiveStates.set(objectiveId, objState);
      
      this.onObjectiveCompleted(objectiveId, objState);
    }
    
    /**
     * Called when objective is completed
     */
    protected onObjectiveCompleted(objectiveId: string, score: ObjectiveScore): void {
      // Override in subclass for custom behavior
    }
    
    /**
     * Add points
     */
    protected addPoints(points: number): void {
      this.state.currentScore += points;
    }
    
    /**
     * Apply penalty
     */
    protected applyPenalty(reason: string): void {
      const penalty = this.config.scoring.penalties?.find(p => p.reason === reason);
      if (penalty) {
        this.state.currentScore = Math.max(0, this.state.currentScore + penalty.points);
      }
    }
    
    /**
     * Calculate time bonus
     */
    protected calculateTimeBonus(): number {
      if (!this.config.scoring.timeBonus) return 0;
      
      const timeLimit = this.config.timeLimit ?? 120;
      const remainingTime = Math.max(0, timeLimit - this.state.elapsedTime);
      
      return Math.round(remainingTime * 10); // 10 points per second
    }
    
    /**
     * Calculate accuracy bonus
     */
    protected calculateAccuracyBonus(): number {
      if (!this.config.scoring.accuracyBonus) return 0;
      
      let totalAccuracy = 0;
      let count = 0;
      
      this.objectiveStates.forEach(objState => {
        if (objState.completed) {
          totalAccuracy += objState.accuracy;
          count++;
        }
      });
      
      if (count === 0) return 0;
      
      const averageAccuracy = totalAccuracy / count;
      return Math.round(averageAccuracy * 1000); // Up to 1000 points
    }
    
    /**
     * Calculate final score
     */
    calculateFinalScore(): GameScore {
      const objectiveScores = Array.from(this.objectiveStates.values());
      const timeBonus = this.calculateTimeBonus();
      const accuracyBonus = this.calculateAccuracyBonus();
      
      // Calculate penalties
      let totalPenalties = 0;
      // Penalties would be tracked during gameplay
      
      const totalScore = this.state.currentScore + timeBonus + accuracyBonus + totalPenalties;
      
      return {
        totalScore,
        objectiveScores,
        timeBonus,
        accuracyBonus,
        penalties: totalPenalties,
        completionTime: this.state.elapsedTime
      };
    }
    
    /**
     * Check if game is won
     */
    isGameWon(): boolean {
      return this.state.objectivesCompleted >= this.state.totalObjectives;
    }
    
    /**
     * Check if time is up
     */
    isTimeUp(): boolean {
      if (!this.config.timeLimit) return false;
      return this.state.elapsedTime >= this.config.timeLimit;
    }
    
    /**
     * Get game state
     */
    getState(): GameState {
      return { ...this.state };
    }
    
    /**
     * Get config
     */
    getConfig(): GameConfig {
      return this.config;
    }
  }