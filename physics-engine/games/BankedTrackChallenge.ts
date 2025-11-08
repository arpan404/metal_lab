// physics-engine/games/BankedTrackChallenge.ts
import { BaseGame } from './BaseGame';
import { NASCARBanking } from '../experiments/NASCARBanking';
import { CircularMotion } from '../physics/mechanics/CircularMotion';
import type { GameConfig, RacingCheckpoint, LapData } from '../types';

/**
 * NASCAR banking challenge game
 * Goal: Complete laps at optimal speed with minimal friction
 */

export class BankedTrackChallenge extends BaseGame {
  private experiment: NASCARBanking;
  private checkpoints: RacingCheckpoint[] = [];
  private currentLap: number = 0;
  private lapData: LapData[] = [];
  private currentLapStartTime: number = 0;
  private currentLapMaxSpeed: number = 0;
  private currentLapSpeedSum: number = 0;
  private currentLapSpeedCount: number = 0;
  
  constructor(config: GameConfig) {
    super(config);
    this.experiment = new NASCARBanking();
  }
  
  async initialize(): Promise<void> {
    await this.experiment.initialize();
    this.setupCheckpoints();
  }
  
  /**
   * Setup checkpoints around track
   */
  private setupCheckpoints(): void {
    const numCheckpoints = 8;
    const radius = this.experiment.getParameter('trackRadius');
    
    for (let i = 0; i < numCheckpoints; i++) {
      const angle = (2 * Math.PI * i) / numCheckpoints;
      
      this.checkpoints.push({
        position: {
          x: radius * Math.cos(angle),
          y: 0,
          z: radius * Math.sin(angle)
        },
        angle,
        passed: false
      });
    }
  }
  
  update(deltaTime: number): void {
    if (!this.state.isPlaying || this.state.isPaused) return;
    
    this.updateElapsedTime();
    this.experiment.update(deltaTime);
    
    // Track speed statistics
    const velocity = this.experiment.getParameter('velocity');
    this.currentLapMaxSpeed = Math.max(this.currentLapMaxSpeed, velocity);
    this.currentLapSpeedSum += velocity;
    this.currentLapSpeedCount++;
    
    // Check checkpoints
    this.checkCheckpoints();
    
    // Check lap completion
    this.checkLapCompletion();
    
    // Check objectives
    this.checkObjectives();
    
    // Check win/lose conditions
    if (this.isGameWon() || this.isTimeUp()) {
      this.end();
    }
  }
  
  /**
   * Check if car passed checkpoints
   */
  private checkCheckpoints(): void {
    const measurements = this.experiment.getMeasurements();
    const currentAngle = measurements.currentAngle;
    
    this.checkpoints.forEach(checkpoint => {
      if (!checkpoint.passed) {
        const angleDiff = Math.abs(currentAngle - checkpoint.angle);
        
        if (angleDiff < 0.1) {
          checkpoint.passed = true;
          checkpoint.timestamp = Date.now();
        }
      }
    });
  }
  
  /**
   * Check if lap is complete
   */
  private checkLapCompletion(): void {
    const allPassed = this.checkpoints.every(cp => cp.passed);
    
    if (allPassed) {
      this.completeLap();
    }
  }
  
  /**
   * Complete current lap
   */
  private completeLap(): void {
    const lapTime = (Date.now() - this.currentLapStartTime) / 1000;
    const averageSpeed = this.currentLapSpeedSum / this.currentLapSpeedCount;
    
    const lapData: LapData = {
      lapNumber: this.currentLap + 1,
      lapTime,
      averageSpeed,
      maxSpeed: this.currentLapMaxSpeed,
      checkpoints: [...this.checkpoints]
    };
    
    this.lapData.push(lapData);
    this.currentLap++;
    
    // Reset for next lap
    this.checkpoints.forEach(cp => {
      cp.passed = false;
      cp.timestamp = undefined;
    });
    
    this.currentLapStartTime = Date.now();
    this.currentLapMaxSpeed = 0;
    this.currentLapSpeedSum = 0;
    this.currentLapSpeedCount = 0;
    
    // Award points for lap completion
    this.addPoints(100);
  }
  
  checkObjectives(): void {
    const measurements = this.experiment.getMeasurements();
    const velocity = measurements.velocity;
    const optimalSpeed = measurements.optimalSpeed;
    const frictionForce = measurements.frictionForce;
    
    // Complete lap objective
    if (this.currentLap >= 1) {
      this.completeObjective('complete-lap', 1.0);
    }
    
    // Optimal speed objective
    const speedError = Math.abs(velocity - optimalSpeed);
    if (speedError < 5) {
      const accuracy = 1.0 - (speedError / 5);
      this.completeObjective('optimal-speed', accuracy);
    }
    
    // Three laps objective
    if (this.currentLap >= 3) {
      this.completeObjective('three-laps', 1.0);
    }
    
    // Minimal friction objective
    if (this.currentLap >= 1 && frictionForce < 100) {
      const accuracy = 1.0 - (frictionForce / 100);
      this.completeObjective('minimal-friction', accuracy);
    }
  }
  
  reset(): void {
    this.experiment.reset();
    this.currentLap = 0;
    this.lapData = [];
    this.currentLapStartTime = Date.now();
    this.currentLapMaxSpeed = 0;
    this.currentLapSpeedSum = 0;
    this.currentLapSpeedCount = 0;
    
    this.checkpoints.forEach(cp => {
      cp.passed = false;
      cp.timestamp = undefined;
    });
    
    this.state = {
      isPlaying: false,
      isPaused: false,
      startTime: 0,
      elapsedTime: 0,
      currentScore: 0,
      objectivesCompleted: 0,
      totalObjectives: this.config.objectives.filter(obj => obj.required).length
    };
    
    this.objectiveStates.clear();
    this.config.objectives.forEach(obj => {
      this.objectiveStates.set(obj.id, {
        objectiveId: obj.id,
        completed: false,
        points: 0,
        accuracy: 0
      });
    });
  }
  
  /**
   * Get experiment for rendering
   */
  getExperiment(): NASCARBanking {
    return this.experiment;
  }
  
  /**
   * Get lap data
   */
  getLapData(): LapData[] {
    return this.lapData;
  }
  
  /**
   * Get current lap number
   */
  getCurrentLap(): number {
    return this.currentLap;
  }
  
  /**
   * Adjust speed
   */
  adjustSpeed(delta: number): void {
    const currentSpeed = this.experiment.getParameter('velocity');
    const newSpeed = Math.max(20, Math.min(80, currentSpeed + delta));
    this.experiment.setParameter('velocity', newSpeed);
  }
  
  /**
   * Adjust bank angle
   */
  adjustBankAngle(delta: number): void {
    const currentAngle = this.experiment.getParameter('bankAngle');
    const newAngle = Math.max(0, Math.min(45, currentAngle + delta));
    this.experiment.setParameter('bankAngle', newAngle);
  }
}