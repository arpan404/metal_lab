// physics-engine/llm/tools.ts
/**
 * Generate tool definitions for LLM function calling
 * Compatible with OpenAI, Anthropic, Gemini tool calling formats
 */
export function createLLMTools() {
    return [
        {
            type: 'function',
            function: {
                name: 'pause_simulation',
                description: 'Pause the physics simulation to provide an explanation to the student. Use this when you need to explain a concept while the simulation is stopped.',
                parameters: {
                    type: 'object',
                    properties: {
                        reason: {
                            type: 'string',
                            description: 'A brief explanation of why you are pausing the simulation'
                        }
                    },
                    required: ['reason']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'resume_simulation',
                description: 'Resume the paused simulation after providing an explanation',
                parameters: {
                    type: 'object',
                    properties: {}
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'set_simulation_speed',
                description: 'Adjust the simulation speed to help the student observe details. Use slower speeds (0.1-0.5x) to show quick phenomena, or faster speeds (2-10x) to speed through slow processes.',
                parameters: {
                    type: 'object',
                    properties: {
                        speed: {
                            type: 'number',
                            description: 'Speed multiplier: 0.1 = 10x slower, 1.0 = normal, 10 = 10x faster',
                            minimum: 0.1,
                            maximum: 10
                        },
                        explanation: {
                            type: 'string',
                            description: 'Brief explanation of why you are changing the speed'
                        }
                    },
                    required: ['speed', 'explanation']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'update_parameter',
                description: 'Change an experiment parameter to demonstrate a concept. You can animate the change smoothly or apply it instantly.',
                parameters: {
                    type: 'object',
                    properties: {
                        parameter: {
                            type: 'string',
                            description: 'Parameter name (e.g., "angle", "velocity", "wavelength", "mass")'
                        },
                        value: {
                            type: 'number',
                            description: 'New value for the parameter'
                        },
                        animate: {
                            type: 'boolean',
                            description: 'Whether to smoothly animate the change (true) or apply instantly (false)',
                            default: true
                        },
                        duration: {
                            type: 'number',
                            description: 'Duration of animation in seconds (if animate=true)',
                            default: 2,
                            minimum: 0.5,
                            maximum: 10
                        },
                        explanation: {
                            type: 'string',
                            description: 'Explanation of what this parameter change demonstrates'
                        }
                    },
                    required: ['parameter', 'value', 'explanation']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'create_note',
                description: 'Display a text note or annotation on the simulation screen to highlight important information',
                parameters: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            description: 'The note text to display'
                        },
                        position: {
                            type: 'string',
                            enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
                            description: 'Where to position the note on screen'
                        },
                        duration: {
                            type: 'number',
                            description: 'How long to show the note (seconds). Use 0 for permanent notes.',
                            default: 5,
                            minimum: 0,
                            maximum: 30
                        }
                    },
                    required: ['text', 'position']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'highlight_element',
                description: 'Visually highlight a specific element in the simulation to draw student attention',
                parameters: {
                    type: 'object',
                    properties: {
                        element: {
                            type: 'string',
                            description: 'Element identifier (e.g., "projectile", "slit1", "wave", "particle")'
                        },
                        color: {
                            type: 'string',
                            description: 'Highlight color as hex code',
                            default: '#ffff00'
                        },
                        duration: {
                            type: 'number',
                            description: 'Duration of highlight in seconds',
                            default: 3,
                            minimum: 1,
                            maximum: 10
                        }
                    },
                    required: ['element']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'get_simulation_state',
                description: 'Get the current state of the simulation including all parameters, measurements, and progress. Use this to analyze student performance.',
                parameters: {
                    type: 'object',
                    properties: {}
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'get_progress',
                description: 'Get detailed information about student progress on the current experiment',
                parameters: {
                    type: 'object',
                    properties: {}
                }
            }
        }
    ];
}
export const LLM_TOOLS_JSON = JSON.stringify(createLLMTools(), null, 2);
