/**
 * Interface between Physics Engine and LLM systems
 * Provides a clean API for LLM to control simulations
 */
export class LLMInterface {
    constructor(engine, llmController) {
        this.engine = engine;
        this.llmController = llmController;
    }
    /**
     * Pause simulation for explanation
     */
    async pause(reason) {
        await this.llmController.executeTool('pause_simulation', { reason });
    }
    /**
     * Resume simulation
     */
    async resume() {
        await this.llmController.executeTool('resume_simulation', {});
    }
    /**
     * Change simulation speed
     */
    async setSpeed(speed, explanation) {
        await this.llmController.executeTool('set_simulation_speed', {
            speed,
            explanation
        });
    }
    /**
     * Update a parameter
     */
    async updateParameter(parameter, value, options) {
        await this.llmController.executeTool('update_parameter', {
            parameter,
            value,
            animate: options?.animate ?? true,
            duration: options?.duration ?? 2,
            explanation: options?.explanation ?? ''
        });
    }
    /**
     * Create a note on screen
     */
    async createNote(text, position, duration = 5) {
        await this.llmController.executeTool('create_note', {
            text,
            position,
            duration
        });
    }
    /**
     * Highlight an element
     */
    async highlight(element, color = '#ffff00', duration = 3) {
        await this.llmController.executeTool('highlight_element', {
            element,
            color,
            duration
        });
    }
    /**
     * Get current simulation state
     */
    async getState() {
        const result = await this.llmController.executeTool('get_simulation_state', {});
        return result.state;
    }
    /**
     * Get student progress
     */
    async getProgress() {
        const result = await this.llmController.executeTool('get_progress', {});
        return {
            progress: result.progress,
            details: result.details
        };
    }
    /**
     * Get available tools
     */
    getAvailableTools() {
        return this.llmController.getTools().map(tool => tool.name);
    }
}
