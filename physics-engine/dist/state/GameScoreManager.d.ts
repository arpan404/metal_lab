import type { GameScore, HighScore } from '../types/games';
export declare class GameScoreManager {
    private highScores;
    private maxScoresPerGame;
    recordScore(gameId: string, score: GameScore): boolean;
    getHighScores(gameId: string): HighScore[];
    getPersonalBest(gameId: string): HighScore | null;
    isHighScore(gameId: string, score: number): boolean;
    clearScores(gameId: string): void;
    clearAllScores(): void;
    export(): string;
    import(json: string): void;
    /**
     * Save to localStorage
     */
    saveToStorage(): void;
    /**
     * Load from localStorage
     */
    loadFromStorage(): void;
}
//# sourceMappingURL=GameScoreManager.d.ts.map