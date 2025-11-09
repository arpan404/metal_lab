export class ProgressCalculator {
    constructor() {
        this.objectives = new Map();
        this.progress = new Map();
    }
    setObjectives(objectives) {
        this.objectives.clear();
        this.progress.clear();
        objectives.forEach(obj => {
            this.objectives.set(obj.id, obj);
            this.progress.set(obj.id, {
                objectiveId: obj.id,
                progress: 0,
                completed: false,
                timestamp: Date.now(),
                measurements: {}
            });
        });
    }
    updateProgress(measurements) {
        this.objectives.forEach((objective, id) => {
            const currentProgress = this.progress.get(id);
            const newProgress = this.calculateProgress(objective, measurements);
            const wasCompleted = currentProgress.completed;
            const isNowCompleted = newProgress >= 1.0;
            currentProgress.progress = newProgress;
            currentProgress.completed = isNowCompleted;
            currentProgress.measurements = { ...measurements };
            if (!wasCompleted && isNowCompleted) {
                currentProgress.timestamp = Date.now();
            }
            this.progress.set(id, currentProgress);
        });
    }
    calculateProgress(objective, measurements) {
        const { criteria } = objective;
        switch (criteria.type) {
            case 'measurement':
                return this.calculateMeasurementProgress(criteria, measurements);
            case 'time_spent':
                return this.calculateTimeProgress(criteria, measurements);
            case 'parameter_exploration':
                return this.calculateExplorationProgress(criteria, measurements);
            default:
                return 0;
        }
    }
    calculateMeasurementProgress(criteria, measurements) {
        const actual = measurements[criteria.key];
        if (actual === undefined)
            return 0;
        const error = Math.abs(actual - criteria.target);
        if (error <= criteria.tolerance) {
            return 1.0;
        }
        // Gradual progress as we approach target
        const maxError = criteria.tolerance * 5; // 5x tolerance = 0% progress
        const progress = Math.max(0, 1 - (error / maxError));
        return progress;
    }
    calculateTimeProgress(criteria, measurements) {
        const elapsed = measurements.elapsedTime ?? 0;
        return Math.min(1.0, elapsed / criteria.duration);
    }
    calculateExplorationProgress(criteria, measurements) {
        const changesKey = `${criteria.parameter}_changes`;
        const changes = measurements[changesKey] ?? 0;
        return Math.min(1.0, changes / criteria.minChanges);
    }
    getOverallProgress() {
        if (this.objectives.size === 0)
            return 0;
        let totalProgress = 0;
        this.progress.forEach(prog => {
            totalProgress += prog.progress;
        });
        return totalProgress / this.objectives.size;
    }
    getObjectiveProgress(objectiveId) {
        return this.progress.get(objectiveId) ?? null;
    }
    getAllProgress() {
        return Array.from(this.progress.values());
    }
    getCompletedObjectives() {
        const completed = [];
        this.progress.forEach((prog, id) => {
            if (prog.completed) {
                const objective = this.objectives.get(id);
                if (objective) {
                    completed.push(objective);
                }
            }
        });
        return completed;
    }
    getIncompleteObjectives() {
        const incomplete = [];
        this.progress.forEach((prog, id) => {
            if (!prog.completed) {
                const objective = this.objectives.get(id);
                if (objective) {
                    incomplete.push(objective);
                }
            }
        });
        return incomplete;
    }
    getNextObjective() {
        // Return the incomplete objective with highest progress
        let bestObjective = null;
        let bestProgress = -1;
        this.progress.forEach((prog, id) => {
            if (!prog.completed && prog.progress > bestProgress) {
                bestProgress = prog.progress;
                bestObjective = this.objectives.get(id) ?? null;
            }
        });
        return bestObjective;
    }
    reset() {
        this.progress.forEach((prog, id) => {
            prog.progress = 0;
            prog.completed = false;
            prog.measurements = {};
        });
    }
    export() {
        const data = {
            objectives: Array.from(this.objectives.entries()),
            progress: Array.from(this.progress.entries())
        };
        return JSON.stringify(data, null, 2);
    }
    import(json) {
        try {
            const data = JSON.parse(json);
            this.objectives = new Map(data.objectives);
            this.progress = new Map(data.progress);
        }
        catch (error) {
            console.error('Failed to import progress:', error);
        }
    }
}
