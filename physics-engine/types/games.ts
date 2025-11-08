// physics-engine/types/games.ts

export interface GameConfig {
    id: string;
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit?: number; // seconds
    objectives: GameObjective[];
    scoring: ScoringConfig;
  }
  
  export interface GameObjective {
    id: string;
    description: string;
    targetValue: number;
    tolerance?: number;
    points: number;
    required: boolean;
  }
  
  export interface ScoringConfig {
    basePoints: number;
    timeBonus: boolean;
    accuracyBonus: boolean;
    comboMultiplier?: number;
    penalties?: PenaltyConfig[];
  }
  
  export interface PenaltyConfig {
    reason: string;
    points: number;
  }
  
  export interface GameScore {
    totalScore: number;
    objectiveScores: ObjectiveScore[];
    timeBonus: number;
    accuracyBonus: number;
    penalties: number;
    completionTime: number;
  }
  
  export interface ObjectiveScore {
    objectiveId: string;
    completed: boolean;
    points: number;
    accuracy: number;
  }
  
  export interface HighScore {
    score: number;
    details: GameScore;
    timestamp: number;
    playerName: string;
  }
  
  export interface GameState {
    isPlaying: boolean;
    isPaused: boolean;
    startTime: number;
    elapsedTime: number;
    currentScore: number;
    objectivesCompleted: number;
    totalObjectives: number;
  }
  
  // NASCAR Banking Game specific
  export interface RacingCheckpoint {
    position: Vector3D;
    angle: number;
    passed: boolean;
    timestamp?: number;
  }
  
  export interface LapData {
    lapNumber: number;
    lapTime: number;
    averageSpeed: number;
    maxSpeed: number;
    checkpoints: RacingCheckpoint[];
  }
  
  // Rutherford Game specific
  export interface TargetZone {
    angleMin: number;
    angleMax: number;
    points: number;
    hits: number;
  }
  
  export interface DeflectionChallenge {
    targetAngle: number;
    tolerance: number;
    timeLimit: number;
    points: number;
  }
  
  import type { Vector3D } from './index';