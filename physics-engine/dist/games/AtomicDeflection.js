// physics-engine/games/AtomicDeflection.ts
import { BaseGame } from './BaseGame';
import { RutherfordGoldFoil } from '../experiments/RutherfordGoldFoil';
/**
 * Rutherford scattering game
 * Goal: Guide alpha particles to specific target angles
 */
export class AtomicDeflection extends BaseGame {
    constructor(config) {
        super(config);
        this.currentChallenge = null;
        this.challengeStartTime = 0;
        this.particlesLaunched = 0;
        this.particlesHit = 0;
        this.consecutiveHits = 0;
        this.bestCombo = 0;
        this.experiment = new RutherfordGoldFoil();
        // Setup target zones from config
        this.targetZones = config.targetZones || [
            { angleMin: 0, angleMax: 10, points: 50, hits: 0 },
            { angleMin: 10, angleMax: 30, points: 100, hits: 0 },
            { angleMin: 30, angleMax: 60, points: 200, hits: 0 },
            { angleMin: 60, angleMax: 90, points: 400, hits: 0 },
            { angleMin: 90, angleMax: 180, points: 500, hits: 0 }
        ];
    }
    async initialize() {
        await this.experiment.initialize();
        this.startNewChallenge();
    }
    /**
     * Start a new challenge
     */
    startNewChallenge() {
        // Random target angle
        const targetAngles = [10, 30, 45, 60, 90, 120];
        const randomAngle = targetAngles[Math.floor(Math.random() * targetAngles.length)];
        this.currentChallenge = {
            targetAngle: randomAngle,
            tolerance: 5,
            timeLimit: 30,
            points: this.getPointsForAngle(randomAngle)
        };
        this.challengeStartTime = Date.now();
    }
    /**
     * Get points for hitting angle
     */
    getPointsForAngle(angle) {
        for (const zone of this.targetZones) {
            if (angle >= zone.angleMin && angle <= zone.angleMax) {
                return zone.points;
            }
        }
        return 50;
    }
    update(deltaTime) {
        if (!this.state.isPlaying || this.state.isPaused)
            return;
        this.updateElapsedTime();
        this.experiment.update(deltaTime);
        // Check for particle hits
        this.checkParticleHits();
        // Check challenge timeout
        if (this.currentChallenge) {
            const challengeElapsed = (Date.now() - this.challengeStartTime) / 1000;
            if (challengeElapsed >= this.currentChallenge.timeLimit) {
                this.failChallenge();
            }
        }
        // Check objectives
        this.checkObjectives();
        // Check win/lose conditions
        if (this.isGameWon() || this.isTimeUp()) {
            this.end();
        }
    }
    /**
     * Check if particles hit target zones
     */
    checkParticleHits() {
        const particles = this.experiment.getActiveParticles();
        particles.forEach(particle => {
            if (!particle.detected)
                return;
            const angle = Math.abs(particle.deflectionAngle * 180 / Math.PI);
            // Check if hit current challenge target
            if (this.currentChallenge) {
                const diff = Math.abs(angle - this.currentChallenge.targetAngle);
                if (diff <= this.currentChallenge.tolerance) {
                    this.hitTarget(angle, diff);
                }
                else {
                    this.missTarget();
                }
            }
            // Update zone hits
            this.targetZones.forEach(zone => {
                if (angle >= zone.angleMin && angle <= zone.angleMax) {
                    zone.hits++;
                }
            });
        });
    }
    /**
     * Hit target
     */
    hitTarget(angle, error) {
        if (!this.currentChallenge)
            return;
        // Calculate accuracy
        const accuracy = 1.0 - (error / this.currentChallenge.tolerance);
        // Award points
        const basePoints = this.currentChallenge.points;
        const accuracyBonus = Math.round(basePoints * accuracy * 0.5);
        const points = basePoints + accuracyBonus;
        this.addPoints(points);
        this.particlesHit++;
        this.consecutiveHits++;
        this.bestCombo = Math.max(this.bestCombo, this.consecutiveHits);
        // Combo multiplier
        if (this.consecutiveHits > 1 && this.config.scoring.comboMultiplier) {
            const comboBonus = Math.round(points * (this.consecutiveHits - 1) * 0.2);
            this.addPoints(comboBonus);
        }
        // Start new challenge
        this.startNewChallenge();
    }
    /**
     * Miss target
     */
    missTarget() {
        this.consecutiveHits = 0;
        this.applyPenalty('missed_target');
        // Start new challenge
        this.startNewChallenge();
    }
    /**
     * Fail challenge (time expired)
     */
    failChallenge() {
        this.consecutiveHits = 0;
        this.applyPenalty('time_expired');
        this.startNewChallenge();
    }
    checkObjectives() {
        const measurements = this.experiment.getMeasurements();
        // Hit 10° target
        if (this.particlesLaunched > 0) {
            const hits10 = this.targetZones[0].hits;
            if (hits10 >= 1) {
                this.completeObjective('hit-target-10', 1.0);
            }
        }
        // Hit 45° target
        const hits45 = this.targetZones.find(z => z.angleMin <= 45 && z.angleMax >= 45)?.hits ?? 0;
        if (hits45 >= 1) {
            this.completeObjective('hit-target-45', 1.0);
        }
        // Hit 90° target (rare)
        const hits90 = this.targetZones.find(z => z.angleMin <= 90 && z.angleMax >= 90)?.hits ?? 0;
        if (hits90 >= 1) {
            this.completeObjective('hit-target-90', 1.0);
        }
        // Precision objective
        if (this.particlesHit > 0 && this.consecutiveHits >= 3) {
            this.completeObjective('precision', 1.0);
        }
    }
    reset() {
        this.experiment.reset();
        this.particlesLaunched = 0;
        this.particlesHit = 0;
        this.consecutiveHits = 0;
        this.bestCombo = 0;
        this.targetZones.forEach(zone => {
            zone.hits = 0;
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
        this.startNewChallenge();
    }
    /**
     * Launch particle with specific impact parameter
     */
    launchParticle(impactParameter) {
        // This would trigger the experiment to emit a particle
        // with the specified impact parameter
        this.particlesLaunched++;
    }
    /**
     * Get current challenge
     */
    getCurrentChallenge() {
        return this.currentChallenge;
    }
    /**
     * Get challenge time remaining
     */
    getChallengeTimeRemaining() {
        if (!this.currentChallenge)
            return 0;
        const elapsed = (Date.now() - this.challengeStartTime) / 1000;
        return Math.max(0, this.currentChallenge.timeLimit - elapsed);
    }
    /**
     * Get statistics
     */
    getStatistics() {
        return {
            particlesLaunched: this.particlesLaunched,
            particlesHit: this.particlesHit,
            hitRate: this.particlesLaunched > 0 ? this.particlesHit / this.particlesLaunched : 0,
            consecutiveHits: this.consecutiveHits,
            bestCombo: this.bestCombo,
            targetZones: this.targetZones
        };
    }
    /**
     * Get experiment for rendering
     */
    getExperiment() {
        return this.experiment;
    }
    /**
     * Adjust alpha energy
     */
    adjustEnergy(delta) {
        const currentEnergy = this.experiment.getParameter('alphaEnergy');
        const newEnergy = Math.max(1e6, Math.min(10e6, currentEnergy + delta));
        this.experiment.setParameter('alphaEnergy', newEnergy);
    }
}
