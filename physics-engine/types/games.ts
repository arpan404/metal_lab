// physics-engine/types/games.ts

export interface GameConfig {
    id: string;
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    timeLimit?: number;
    scoreTarget?: number;
    lives?: number;
  }
  
  export interface GameState {
    score: number;
    lives: number;
    timeElapsed: number;
    level: number;
    isPlaying: boolean;
    isPaused: boolean;
    isGameOver: boolean;
    achievements: string[];
  }
  
  export interface GameScore {
    totalScore: number;
    accuracy: number;
    timeBonus: number;
    streakBonus: number;
    achievements: Achievement[];
    stars: number; // 1-3 star rating
    breakdown?: ScoreBreakdown;
  }
  
  export interface ScoreBreakdown {
    base: number;
    accuracy: number;
    time: number;
    streak: number;
    bonus: number;
  }
  
  export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon?: string;
    points: number;
    unlockedAt?: number;
  }
  
  export interface HighScore {
    score: number;
    playerName: string;
    timestamp: number;
    details: GameScore;
  }
  
  export interface GameChallenge {
    id: string;
    name: string;
    description: string;
    objective: string;
    constraints: GameConstraint[];
    reward: number;
  }
  
  export interface GameConstraint {
    type: 'time' | 'parameter' | 'accuracy' | 'sequence';
    value: any;
    comparison: 'eq' | 'lt' | 'gt' | 'lte' | 'gte' | 'between';
  }
  
  export interface PowerUp {
    id: string;
    type: 'slow_time' | 'hint' | 'precision' | 'multiplier';
    duration?: number;
    multiplier?: number;
    active: boolean;
  }