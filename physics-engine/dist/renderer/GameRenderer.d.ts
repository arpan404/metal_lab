import * as THREE from 'three';
import { UIOverlay } from './UIOverlay';
import type { GameState, GameScore } from '../types';
/**
 * Specialized renderer for game mode
 */
export declare class GameRenderer {
    private scene;
    private overlay;
    constructor(scene: THREE.Scene, overlay: UIOverlay);
    /**
     * Setup game UI
     */
    setupGameUI(gameState: GameState): void;
    /**
     * Update game UI
     */
    updateGameUI(gameState: GameState): void;
    /**
     * Show game over screen
     */
    showGameOver(finalScore: GameScore): void;
    /**
     * Show objective complete animation
     */
    showObjectiveComplete(objectiveName: string, points: number): void;
    /**
     * Show combo multiplier
     */
    showComboMultiplier(multiplier: number): void;
    /**
     * Add target zone indicator
     */
    addTargetZone(id: string, position: THREE.Vector3, radius: number, color?: number): void;
    /**
     * Add countdown timer visual
     */
    addCountdownTimer(duration: number, position: {
        x: number;
        y: number;
    }): void;
    /**
     * Update countdown timer
     */
    updateCountdownTimer(timeRemaining: number, totalTime: number): void;
}
//# sourceMappingURL=GameRenderer.d.ts.map