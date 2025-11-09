import { BaseGame } from './BaseGame';
import { NASCARBanking } from '../experiments/NASCARBanking';
import type { GameConfig, LapData } from '../types';
/**
 * NASCAR banking challenge game
 * Goal: Complete laps at optimal speed with minimal friction
 */
export declare class BankedTrackChallenge extends BaseGame {
    private experiment;
    private checkpoints;
    private currentLap;
    private lapData;
    private currentLapStartTime;
    private currentLapMaxSpeed;
    private currentLapSpeedSum;
    private currentLapSpeedCount;
    constructor(config: GameConfig);
    initialize(): Promise<void>;
    /**
     * Setup checkpoints around track
     */
    private setupCheckpoints;
    update(deltaTime: number): void;
    /**
     * Check if car passed checkpoints
     */
    private checkCheckpoints;
    /**
     * Check if lap is complete
     */
    private checkLapCompletion;
    /**
     * Complete current lap
     */
    private completeLap;
    checkObjectives(): void;
    reset(): void;
    /**
     * Get experiment for rendering
     */
    getExperiment(): NASCARBanking;
    /**
     * Get lap data
     */
    getLapData(): LapData[];
    /**
     * Get current lap number
     */
    getCurrentLap(): number;
    /**
     * Adjust speed
     */
    adjustSpeed(delta: number): void;
    /**
     * Adjust bank angle
     */
    adjustBankAngle(delta: number): void;
}
//# sourceMappingURL=BankedTrackChallenge.d.ts.map