/**
 * Base class for physics-based games
 */
export class BaseGame {
    constructor(config) {
        this.startTime = 0;
        this.objectiveStates = new Map();
        this.config = config;
        this.state = {
            isPlaying: false,
            isPaused: false,
            startTime: 0,
            elapsedTime: 0,
            currentScore: 0,
            objectivesCompleted: 0,
            totalObjectives: config.objectives.filter(obj => obj.required).length
        };
        // Initialize objective states
        config.objectives.forEach(obj => {
            this.objectiveStates.set(obj.id, {
                objectiveId: obj.id,
                completed: false,
                points: 0,
                accuracy: 0
            });
        });
    }
    /**
     * Start game
     */
    start() {
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.startTime = Date.now();
        this.state.startTime = this.startTime;
    }
    /**
     * Pause game
     */
    pause() {
        this.state.isPaused = true;
    }
    /**
     * Resume game
     */
    resume() {
        this.state.isPaused = false;
    }
    /**
     * End game
     */
    end() {
        this.state.isPlaying = false;
    }
    /**
     * Update elapsed time
     */
    updateElapsedTime() {
        this.state.elapsedTime = (Date.now() - this.startTime) / 1000;
    }
    /**
     * Complete objective
     */
    completeObjective(objectiveId, accuracy = 1.0) {
        const objective = this.config.objectives.find(obj => obj.id === objectiveId);
        if (!objective)
            return;
        const objState = this.objectiveStates.get(objectiveId);
        if (!objState || objState.completed)
            return;
        objState.completed = true;
        objState.accuracy = accuracy;
        objState.points = Math.round(objective.points * accuracy);
        this.state.currentScore += objState.points;
        if (objective.required) {
            this.state.objectivesCompleted++;
        }
        this.objectiveStates.set(objectiveId, objState);
        this.onObjectiveCompleted(objectiveId, objState);
    }
    /**
     * Called when objective is completed
     */
    onObjectiveCompleted(objectiveId, score) {
        // Override in subclass for custom behavior
    }
    /**
     * Add points
     */
    addPoints(points) {
        this.state.currentScore += points;
    }
    /**
     * Apply penalty
     */
    applyPenalty(reason) {
        const penalty = this.config.scoring.penalties?.find(p => p.reason === reason);
        if (penalty) {
            this.state.currentScore = Math.max(0, this.state.currentScore + penalty.points);
        }
    }
    /**
     * Calculate time bonus
     */
    calculateTimeBonus() {
        if (!this.config.scoring.timeBonus)
            return 0;
        const timeLimit = this.config.timeLimit ?? 120;
        const remainingTime = Math.max(0, timeLimit - this.state.elapsedTime);
        return Math.round(remainingTime * 10); // 10 points per second
    }
    /**
     * Calculate accuracy bonus
     */
    calculateAccuracyBonus() {
        if (!this.config.scoring.accuracyBonus)
            return 0;
        let totalAccuracy = 0;
        let count = 0;
        this.objectiveStates.forEach(objState => {
            if (objState.completed) {
                totalAccuracy += objState.accuracy;
                count++;
            }
        });
        if (count === 0)
            return 0;
        const averageAccuracy = totalAccuracy / count;
        return Math.round(averageAccuracy * 1000); // Up to 1000 points
    }
    /**
     * Calculate final score
     */
    calculateFinalScore() {
        const objectiveScores = Array.from(this.objectiveStates.values());
        const timeBonus = this.calculateTimeBonus();
        const accuracyBonus = this.calculateAccuracyBonus();
        // Calculate penalties
        let totalPenalties = 0;
        // Penalties would be tracked during gameplay
        const totalScore = this.state.currentScore + timeBonus + accuracyBonus + totalPenalties;
        return {
            totalScore,
            objectiveScores,
            timeBonus,
            accuracyBonus,
            penalties: totalPenalties,
            completionTime: this.state.elapsedTime
        };
    }
    /**
     * Check if game is won
     */
    isGameWon() {
        return this.state.objectivesCompleted >= this.state.totalObjectives;
    }
    /**
     * Check if time is up
     */
    isTimeUp() {
        if (!this.config.timeLimit)
            return false;
        return this.state.elapsedTime >= this.config.timeLimit;
    }
    /**
     * Get game state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Get config
     */
    getConfig() {
        return this.config;
    }
}
