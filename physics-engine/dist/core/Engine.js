// physics-engine/core/Engine.ts
import { StateManager } from '../state/StateManager';
import { ProgressTracker } from './ProgressTracker';
import { LLMController } from '../llm/LLMController';
export class PhysicsEngine {
    constructor(config) {
        this.currentExperiment = null;
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 1.0;
        this.animationFrameId = null;
        this.lastFrameTime = 0;
        /**
         * Main simulation loop
         */
        this.loop = () => {
            if (!this.isRunning || !this.currentExperiment)
                return;
            const now = performance.now();
            const deltaTime = (now - this.lastFrameTime) / 1000; // Convert to seconds
            this.lastFrameTime = now;
            // Check if LLM has paused simulation
            if (!this.isPaused && !this.llmController.isPaused()) {
                // Apply speed multiplier
                const adjustedDelta = deltaTime * this.speed;
                // Update experiment
                this.currentExperiment.update(adjustedDelta);
                // Save state snapshot
                this.stateManager.recordFrame(this.currentExperiment.getState());
                // Update progress
                this.progressTracker.update(this.currentExperiment);
                // Check for LLM explanation points
                this.llmController.checkExplanationPoints(this.currentExperiment);
            }
            // Continue loop
            this.animationFrameId = requestAnimationFrame(this.loop);
        };
        this.stateManager = new StateManager();
        this.progressTracker = new ProgressTracker();
        this.llmController = new LLMController(this);
    }
    /**
     * Load an experiment
     */
    async loadExperiment(experiment) {
        // Stop current experiment
        this.stop();
        // Load new experiment
        this.currentExperiment = experiment;
        await experiment.initialize();
        // Reset state
        this.stateManager.reset();
        this.progressTracker.reset(experiment.getLearningObjectives());
        // Notify LLM controller
        this.llmController.onExperimentLoaded(experiment);
    }
    /**
     * Start simulation loop
     */
    start() {
        if (!this.currentExperiment) {
            throw new Error('No experiment loaded');
        }
        this.isRunning = true;
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        this.loop();
    }
    /**
     * Pause simulation (can be called by LLM)
     */
    pause() {
        this.isPaused = true;
    }
    /**
     * Resume simulation
     */
    resume() {
        this.isPaused = false;
    }
    /**
     * Stop simulation completely
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    /**
     * Set simulation speed (0.1x to 10x)
     */
    setSpeed(speed) {
        this.speed = Math.max(0.1, Math.min(10, speed));
    }
    /**
     * Update parameter (can be called by user or LLM)
     */
    updateParameter(key, value) {
        if (!this.currentExperiment)
            return;
        this.currentExperiment.setParameter(key, value);
        this.stateManager.recordParameterChange(key, value);
    }
    /**
     * Save current state
     */
    saveState(name = 'checkpoint') {
        if (!this.currentExperiment) {
            throw new Error('No experiment to save');
        }
        return this.stateManager.saveSnapshot(name, this.currentExperiment.getState());
    }
    /**
     * Load saved state
     */
    loadState(snapshotId) {
        if (!this.currentExperiment) {
            throw new Error('No experiment loaded');
        }
        const snapshot = this.stateManager.loadSnapshot(snapshotId);
        this.currentExperiment.setState(snapshot.state);
    }
    /**
     * Reset to initial state
     */
    reset() {
        if (!this.currentExperiment)
            return;
        this.currentExperiment.reset();
        this.stateManager.reset();
        this.progressTracker.reset(this.currentExperiment.getLearningObjectives());
    }
    /**
     * Get current progress (0-100)
     */
    getProgress() {
        return this.progressTracker.getProgress();
    }
    /**
     * Get progress breakdown by objective
     */
    getProgressDetails() {
        return this.progressTracker.getDetails();
    }
    /**
     * Get LLM controller for tool integration
     */
    getLLMController() {
        return this.llmController;
    }
    /**
     * Get current state for serialization
     */
    getState() {
        return {
            experiment: this.currentExperiment?.getState(),
            progress: this.progressTracker.getProgress(),
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            speed: this.speed
        };
    }
}
