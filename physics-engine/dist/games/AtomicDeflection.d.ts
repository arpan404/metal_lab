import { BaseGame } from './BaseGame';
import { RutherfordGoldFoil } from '../experiments/RutherfordGoldFoil';
import type { GameConfig, TargetZone, DeflectionChallenge } from '../types';
/**
 * Rutherford scattering game
 * Goal: Guide alpha particles to specific target angles
 */
export declare class AtomicDeflection extends BaseGame {
    private experiment;
    private targetZones;
    private currentChallenge;
    private challengeStartTime;
    private particlesLaunched;
    private particlesHit;
    private consecutiveHits;
    private bestCombo;
    constructor(config: GameConfig);
    initialize(): Promise<void>;
    /**
     * Start a new challenge
     */
    private startNewChallenge;
    /**
     * Get points for hitting angle
     */
    private getPointsForAngle;
    update(deltaTime: number): void;
    /**
     * Check if particles hit target zones
     */
    private checkParticleHits;
    /**
     * Hit target
     */
    private hitTarget;
    /**
     * Miss target
     */
    private missTarget;
    /**
     * Fail challenge (time expired)
     */
    private failChallenge;
    checkObjectives(): void;
    reset(): void;
    /**
     * Launch particle with specific impact parameter
     */
    launchParticle(impactParameter: number): void;
    /**
     * Get current challenge
     */
    getCurrentChallenge(): DeflectionChallenge | null;
    /**
     * Get challenge time remaining
     */
    getChallengeTimeRemaining(): number;
    /**
     * Get statistics
     */
    getStatistics(): {
        particlesLaunched: number;
        particlesHit: number;
        hitRate: number;
        consecutiveHits: number;
        bestCombo: number;
        targetZones: TargetZone[];
    };
    /**
     * Get experiment for rendering
     */
    getExperiment(): RutherfordGoldFoil;
    /**
     * Adjust alpha energy
     */
    adjustEnergy(delta: number): void;
}
//# sourceMappingURL=AtomicDeflection.d.ts.map