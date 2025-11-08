// physics-engine/core/LLMInterface.ts
import type { LLMController } from '../llm/LLMController';
import type { PhysicsEngine } from './Engine';

/**
 * Interface between Physics Engine and LLM systems
 * Provides a clean API for LLM to control simulations
 */
export class LLMInterface {
  private engine: PhysicsEngine;
  private llmController: LLMController;
  
  constructor(engine: PhysicsEngine, llmController: LLMController) {
    this.engine = engine;
    this.llmController = llmController;
  }
  
  /**
   * Pause simulation for explanation
   */
  async pause(reason: string): Promise<void> {
    await this.llmController.executeTool('pause_simulation', { reason });
  }
  
  /**
   * Resume simulation
   */
  async resume(): Promise<void> {
    await this.llmController.executeTool('resume_simulation', {});
  }
  
  /**
   * Change simulation speed
   */
  async setSpeed(speed: number, explanation: string): Promise<void> {
    await this.llmController.executeTool('set_simulation_speed', {
      speed,
      explanation
    });
  }
  
  /**
   * Update a parameter
   */
  async updateParameter(
    parameter: string,
    value: number,
    options?: {
      animate?: boolean;
      duration?: number;
      explanation?: string;
    }
  ): Promise<void> {
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
  async createNote(
    text: string,
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center',
    duration: number = 5
  ): Promise<void> {
    await this.llmController.executeTool('create_note', {
      text,
      position,
      duration
    });
  }
  
  /**
   * Highlight an element
   */
  async highlight(
    element: string,
    color: string = '#ffff00',
    duration: number = 3
  ): Promise<void> {
    await this.llmController.executeTool('highlight_element', {
      element,
      color,
      duration
    });
  }
  
  /**
   * Get current simulation state
   */
  async getState(): Promise<any> {
    const result = await this.llmController.executeTool('get_simulation_state', {});
    return result.state;
  }
  
  /**
   * Get student progress
   */
  async getProgress(): Promise<any> {
    const result = await this.llmController.executeTool('get_progress', {});
    return {
      progress: result.progress,
      details: result.details
    };
  }
  
  /**
   * Get available tools
   */
  getAvailableTools(): string[] {
    return this.llmController.getTools().map(tool => tool.name);
  }
}