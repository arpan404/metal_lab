export class BaseExperiment {
    constructor(name, description, parameterConfigs, learningObjectives) {
        this.parameters = new Map();
        this.parameterHistory = new Map();
        // State tracking
        this.startTime = 0;
        this.elapsedTime = 0;
        this.frameCount = 0;
        this.name = name;
        this.description = description;
        this.parameterConfigs = parameterConfigs;
        this.learningObjectives = learningObjectives;
        // Initialize default parameters
        parameterConfigs.forEach(config => {
            this.parameters.set(config.name, config.default);
        });
    }
    // Common methods
    getName() {
        return this.name;
    }
    getDescription() {
        return this.description;
    }
    getParameter(key) {
        return this.parameters.get(key) ?? 0;
    }
    setParameter(key, value) {
        const config = this.parameterConfigs.find(c => c.name === key);
        if (!config) {
            throw new Error(`Unknown parameter: ${key}`);
        }
        // Validate range
        const clampedValue = Math.max(config.min, Math.min(config.max, value));
        this.parameters.set(key, clampedValue);
        // Trigger parameter change hook
        this.onParameterChanged(key, clampedValue);
    }
    onParameterChanged(key, value) {
        // Override in subclasses if needed
    }
    getParameterConfigs() {
        return this.parameterConfigs;
    }
    getLearningObjectives() {
        return this.learningObjectives;
    }
    getElapsedTime() {
        return this.elapsedTime;
    }
    getFrameCount() {
        return this.frameCount;
    }
    /**
     * Serialize state to JSON
     */
    serialize() {
        return JSON.stringify({
            name: this.name,
            parameters: Array.from(this.parameters.entries()),
            elapsedTime: this.elapsedTime,
            frameCount: this.frameCount,
            state: this.getState()
        });
    }
    /**
     * Deserialize state from JSON
     */
    deserialize(json) {
        const data = JSON.parse(json);
        // Restore parameters
        data.parameters.forEach(([key, value]) => {
            this.parameters.set(key, value);
        });
        this.elapsedTime = data.elapsedTime;
        this.frameCount = data.frameCount;
        this.setState(data.state);
    }
}
