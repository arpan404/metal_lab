export class LLMController {
    constructor(engine) {
        this.isPausedByLLM = false;
        this.currentExplanation = null;
        this.explanationQueue = [];
        this.activeExplanationPoints = new Set();
        this.engine = engine;
    }
    /**
     * Called when experiment is loaded
     */
    onExperimentLoaded(experiment) {
        this.activeExplanationPoints.clear();
        this.explanationQueue = [];
        this.currentExplanation = null;
    }
    /**
     * Check if any explanation points should trigger
     */
    checkExplanationPoints(experiment) {
        const points = experiment.getExplanationPoints();
        const measurements = experiment.getMeasurements();
        for (const point of points) {
            // Skip if already triggered
            if (this.activeExplanationPoints.has(point.id))
                continue;
            // Check if condition met
            if (this.isConditionMet(point.condition, measurements)) {
                this.triggerExplanationPoint(point, experiment);
                this.activeExplanationPoints.add(point.id);
            }
        }
    }
    isConditionMet(condition, measurements) {
        // Simple condition evaluator
        // Format: "velocity > 10" or "time >= 5"
        try {
            const fn = new Function(...Object.keys(measurements), `return ${condition}`);
            return fn(...Object.values(measurements));
        }
        catch (e) {
            console.error('Invalid condition:', condition, e);
            return false;
        }
    }
    triggerExplanationPoint(point, experiment) {
        // Create explanation request
        const explanation = {
            id: point.id,
            type: point.type,
            priority: point.priority,
            context: {
                experimentName: experiment.getName(),
                parameters: Array.from(experiment['parameters'].entries()),
                measurements: experiment.getMeasurements(),
                timestamp: experiment.getElapsedTime()
            },
            message: point.message,
            audioRequired: point.audioRequired ?? true,
            pauseSimulation: point.pauseSimulation ?? false
        };
        // Add to queue
        this.explanationQueue.push(explanation);
        // If high priority, pause and explain immediately
        if (point.priority === 'high' && point.pauseSimulation) {
            this.pauseForExplanation(explanation);
        }
        // Notify callback
        if (this.onExplanationCallback) {
            this.onExplanationCallback(explanation);
        }
    }
    /**
     * Pause simulation for LLM explanation
     */
    pauseForExplanation(explanation) {
        this.isPausedByLLM = true;
        this.currentExplanation = explanation;
        this.engine.pause();
        if (this.onPauseCallback) {
            this.onPauseCallback();
        }
    }
    /**
     * Resume after explanation
     */
    resumeAfterExplanation() {
        this.isPausedByLLM = false;
        this.currentExplanation = null;
        this.engine.resume();
        if (this.onResumeCallback) {
            this.onResumeCallback();
        }
    }
    /**
     * Check if paused by LLM
     */
    isPaused() {
        return this.isPausedByLLM;
    }
    /**
     * Get current explanation
     */
    getCurrentExplanation() {
        return this.currentExplanation;
    }
    /**
     * Get pending explanations
     */
    getPendingExplanations() {
        return [...this.explanationQueue];
    }
    /**
     * Clear explanation queue
     */
    clearQueue() {
        this.explanationQueue = [];
    }
    /**
     * Set callbacks for LLM events
     */
    setCallbacks(callbacks) {
        this.onExplanationCallback = callbacks.onExplanation;
        this.onPauseCallback = callbacks.onPause;
        this.onResumeCallback = callbacks.onResume;
    }
    /**
     * Get tools for LLM function calling
     */
    getTools() {
        return [
            {
                name: 'pause_simulation',
                description: 'Pause the physics simulation to explain a concept',
                parameters: {
                    type: 'object',
                    properties: {
                        reason: {
                            type: 'string',
                            description: 'Why you are pausing (for logging)'
                        }
                    },
                    required: ['reason']
                },
                handler: (args) => {
                    const explanation = {
                        id: `manual-pause-${Date.now()}`,
                        type: 'concept',
                        priority: 'high',
                        context: this.getCurrentContext(),
                        message: args.reason,
                        audioRequired: true,
                        pauseSimulation: true
                    };
                    this.pauseForExplanation(explanation);
                    return { success: true, paused: true };
                }
            },
            {
                name: 'resume_simulation',
                description: 'Resume the physics simulation after explanation',
                parameters: {
                    type: 'object',
                    properties: {}
                },
                handler: () => {
                    this.resumeAfterExplanation();
                    return { success: true, resumed: true };
                }
            },
            {
                name: 'set_simulation_speed',
                description: 'Change simulation speed (0.1x to 10x)',
                parameters: {
                    type: 'object',
                    properties: {
                        speed: {
                            type: 'number',
                            description: 'Speed multiplier (0.1 = 10x slower, 10 = 10x faster)',
                            minimum: 0.1,
                            maximum: 10
                        }
                    },
                    required: ['speed']
                },
                handler: (args) => {
                    this.engine.setSpeed(args.speed);
                    return { success: true, newSpeed: args.speed };
                }
            },
            {
                name: 'update_parameter',
                description: 'Update an experiment parameter to demonstrate a concept',
                parameters: {
                    type: 'object',
                    properties: {
                        parameter: {
                            type: 'string',
                            description: 'Parameter name (e.g., "velocity", "angle", "wavelength")'
                        },
                        value: {
                            type: 'number',
                            description: 'New value for the parameter'
                        },
                        animate: {
                            type: 'boolean',
                            description: 'Whether to animate the change smoothly',
                            default: true
                        },
                        duration: {
                            type: 'number',
                            description: 'Animation duration in seconds',
                            default: 2
                        }
                    },
                    required: ['parameter', 'value']
                },
                handler: async (args) => {
                    if (args.animate) {
                        // Smooth animation (handled by frontend)
                        return {
                            success: true,
                            action: 'animate',
                            parameter: args.parameter,
                            targetValue: args.value,
                            duration: args.duration ?? 2
                        };
                    }
                    else {
                        // Immediate update
                        this.engine.updateParameter(args.parameter, args.value);
                        return {
                            success: true,
                            action: 'immediate',
                            parameter: args.parameter,
                            value: args.value
                        };
                    }
                }
            },
            {
                name: 'create_note',
                description: 'Create a text note/annotation on the simulation',
                parameters: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            description: 'The note text'
                        },
                        position: {
                            type: 'string',
                            enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
                            description: 'Where to display the note'
                        },
                        duration: {
                            type: 'number',
                            description: 'How long to show note (seconds), 0 = permanent',
                            default: 5
                        }
                    },
                    required: ['text', 'position']
                },
                handler: (args) => {
                    // This will be handled by the UI layer
                    return {
                        success: true,
                        action: 'show_note',
                        ...args
                    };
                }
            },
            {
                name: 'highlight_element',
                description: 'Highlight a specific element in the simulation',
                parameters: {
                    type: 'object',
                    properties: {
                        element: {
                            type: 'string',
                            description: 'Element to highlight (e.g., "projectile", "slit1", "wave")'
                        },
                        color: {
                            type: 'string',
                            description: 'Highlight color (hex code)',
                            default: '#ffff00'
                        },
                        duration: {
                            type: 'number',
                            description: 'Duration in seconds',
                            default: 3
                        }
                    },
                    required: ['element']
                },
                handler: (args) => {
                    return {
                        success: true,
                        action: 'highlight',
                        ...args
                    };
                }
            },
            {
                name: 'get_simulation_state',
                description: 'Get current state of the simulation for analysis',
                parameters: {
                    type: 'object',
                    properties: {}
                },
                handler: () => {
                    return {
                        success: true,
                        state: this.engine.getState()
                    };
                }
            },
            {
                name: 'get_progress',
                description: 'Get student progress on current experiment',
                parameters: {
                    type: 'object',
                    properties: {}
                },
                handler: () => {
                    return {
                        success: true,
                        progress: this.engine.getProgress(),
                        details: this.engine.getProgressDetails()
                    };
                }
            }
        ];
    }
    getCurrentContext() {
        const state = this.engine.getState();
        return {
            experimentName: state.experiment?.name ?? 'unknown',
            parameters: state.experiment?.parameters ?? [],
            measurements: state.experiment?.measurements ?? {},
            timestamp: state.experiment?.elapsedTime ?? 0
        };
    }
    /**
     * Execute an LLM tool
     */
    async executeTool(toolName, args) {
        const tool = this.getTools().find(t => t.name === toolName);
        if (!tool) {
            throw new Error(`Unknown tool: ${toolName}`);
        }
        return await tool.handler(args);
    }
}
