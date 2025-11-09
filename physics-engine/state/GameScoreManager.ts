// physics-engine/state/GameScoreManager.ts
import type { GameScore, HighScore } from '../types/games';

export class GameScoreManager {
  private highScores: Map<string, HighScore[]> = new Map();
  private maxScoresPerGame: number = 10;
  
  recordScore(gameId: string, score: GameScore): boolean {
    const scores = this.highScores.get(gameId) || [];
    
    // Create high score entry
    const highScore: HighScore = {
      score: score.totalScore,
      details: score,
      timestamp: Date.now(),
      playerName: 'Player'
    };
    
    // Add to list
    scores.push(highScore);
    
    // Sort by score (descending)
    scores.sort((a, b) => b.score - a.score);
    
    // Keep only top N
    const trimmed = scores.slice(0, this.maxScoresPerGame);
    this.highScores.set(gameId, trimmed);
    
    // Check if this made the leaderboard
    return trimmed.includes(highScore);
  }
  
  getHighScores(gameId: string): HighScore[] {
    return this.highScores.get(gameId) || [];
  }
  
  getPersonalBest(gameId: string): HighScore | null {
    const scores = this.highScores.get(gameId) || [];
    return scores[0] || null;
  }
  
  isHighScore(gameId: string, score: number): boolean {
    const scores = this.highScores.get(gameId) || [];
    
    if (scores.length < this.maxScoresPerGame) {
      return true;
    }
    
    return score > scores[scores.length - 1].score;
  }
  
  clearScores(gameId: string): void {
    this.highScores.delete(gameId);
  }
  
  clearAllScores(): void {
    this.highScores.clear();
  }
  
  export(): string {
    const data: any = {};
    this.highScores.forEach((scores, gameId) => {
      data[gameId] = scores;
    });
    return JSON.stringify(data, null, 2);
  }
  
  import(json: string): void {
    try {
      const data = JSON.parse(json);
      Object.keys(data).forEach(gameId => {
        this.highScores.set(gameId, data[gameId]);
      });
    } catch (e) {
      console.error('Failed to import scores:', e);
    }
  }
  
  /**
   * Save to localStorage
   */
  saveToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('physics-engine-scores', this.export());
    }
  }
  
  /**
   * Load from localStorage
   */
  loadFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem('physics-engine-scores');
      if (data) {
        this.import(data);
      }
    }
  }
}