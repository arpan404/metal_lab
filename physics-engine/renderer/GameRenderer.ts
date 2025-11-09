// physics-engine/renderer/GameRenderer.ts
import * as THREE from 'three';
import { UIOverlay } from './UIOverlay';
import type { GameState, GameScore } from '../types';

/**
 * Specialized renderer for game mode
 */

export class GameRenderer {
  private scene: THREE.Scene;
  private overlay: UIOverlay;
  
  constructor(scene: THREE.Scene, overlay: UIOverlay) {
    this.scene = scene;
    this.overlay = overlay;
  }
  
  /**
   * Setup game UI
   */
  setupGameUI(gameState: GameState): void {
    // Score display
    this.overlay.addText(
      'score',
      `Score: ${gameState.currentScore}`,
      { x: 20, y: 20 },
      { fontSize: '24px', fontWeight: 'bold' }
    );
    
    // Timer
    this.overlay.addText(
      'timer',
      `Time: ${gameState.elapsedTime.toFixed(1)}s`,
      { x: 20, y: 60 },
      { fontSize: '20px' }
    );
    
    // Objectives progress
    this.overlay.addText(
      'objectives',
      `Objectives: ${gameState.objectivesCompleted}/${gameState.totalObjectives}`,
      { x: 20, y: 100 },
      { fontSize: '18px' }
    );
  }
  
  /**
   * Update game UI
   */
  updateGameUI(gameState: GameState): void {
    this.overlay.updateText('score', `Score: ${gameState.currentScore}`);
    this.overlay.updateText('timer', `Time: ${gameState.elapsedTime.toFixed(1)}s`);
    this.overlay.updateText(
      'objectives',
      `Objectives: ${gameState.objectivesCompleted}/${gameState.totalObjectives}`
    );
  }
  
  /**
   * Show game over screen
   */
  showGameOver(finalScore: GameScore): void {
    // Create game over overlay
    const gameOverDiv = document.createElement('div');
    gameOverDiv.style.position = 'absolute';
    gameOverDiv.style.top = '50%';
    gameOverDiv.style.left = '50%';
    gameOverDiv.style.transform = 'translate(-50%, -50%)';
    gameOverDiv.style.padding = '40px';
    gameOverDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    gameOverDiv.style.borderRadius = '10px';
    gameOverDiv.style.textAlign = 'center';
    gameOverDiv.style.color = '#ffffff';
    gameOverDiv.style.fontSize = '24px';
    gameOverDiv.style.zIndex = '10001';
    
    gameOverDiv.innerHTML = `
      <h2 style="margin-bottom: 20px;">Game Over!</h2>
      <p style="font-size: 36px; color: #ffd700; margin: 20px 0;">
        Final Score: ${finalScore.totalScore}
      </p>
      <p style="font-size: 18px; margin: 10px 0;">
        Time: ${finalScore.completionTime.toFixed(1)}s
      </p>
      <p style="font-size: 18px; margin: 10px 0;">
        Time Bonus: ${finalScore.timeBonus}
      </p>
      <p style="font-size: 18px; margin: 10px 0;">
        Accuracy Bonus: ${finalScore.accuracyBonus}
      </p>
    `;
    
    document.body.appendChild(gameOverDiv);
  }
  
  /**
   * Show objective complete animation
   */
  showObjectiveComplete(objectiveName: string, points: number): void {
    this.overlay.showNotification(`✓ ${objectiveName} (+${points} points)`, 2000);
  }
  
  /**
   * Show combo multiplier
   */
  showComboMultiplier(multiplier: number): void {
    if (multiplier > 1) {
      this.overlay.showNotification(`${multiplier}x COMBO!`, 1500);
    }
  }
  
  /**
   * Add target zone indicator
   */
  addTargetZone(
    id: string,
    position: THREE.Vector3,
    radius: number,
    color: number = 0x00ff00
  ): void {
    const geometry = new THREE.RingGeometry(radius * 0.9, radius * 1.1, 32);
    const material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    
    const ring = new THREE.Mesh(geometry, material);
    ring.position.copy(position);
    ring.rotation.x = -Math.PI / 2;
    
    this.scene.add(ring);
  }
  
  /**
   * Add countdown timer visual
   */
  addCountdownTimer(duration: number, position: { x: number; y: number }): void {
    this.overlay.addGauge(
      'countdown',
      'Time Remaining',
      duration,
      duration,
      position
    );
  }
  
  /**
   * Update countdown timer
   */
  updateCountdownTimer(timeRemaining: number, totalTime: number): void {
    this.overlay.updateGauge('countdown', timeRemaining, totalTime);
  }
}