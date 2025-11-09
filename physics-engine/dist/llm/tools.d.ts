/**
 * Generate tool definitions for LLM function calling
 * Compatible with OpenAI, Anthropic, Gemini tool calling formats
 */
export declare function createLLMTools(): ({
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                reason: {
                    type: string;
                    description: string;
                };
                speed?: undefined;
                explanation?: undefined;
                parameter?: undefined;
                value?: undefined;
                animate?: undefined;
                duration?: undefined;
                text?: undefined;
                position?: undefined;
                element?: undefined;
                color?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                reason?: undefined;
                speed?: undefined;
                explanation?: undefined;
                parameter?: undefined;
                value?: undefined;
                animate?: undefined;
                duration?: undefined;
                text?: undefined;
                position?: undefined;
                element?: undefined;
                color?: undefined;
            };
            required?: undefined;
        };
    };
} | {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                speed: {
                    type: string;
                    description: string;
                    minimum: number;
                    maximum: number;
                };
                explanation: {
                    type: string;
                    description: string;
                };
                reason?: undefined;
                parameter?: undefined;
                value?: undefined;
                animate?: undefined;
                duration?: undefined;
                text?: undefined;
                position?: undefined;
                element?: undefined;
                color?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                parameter: {
                    type: string;
                    description: string;
                };
                value: {
                    type: string;
                    description: string;
                };
                animate: {
                    type: string;
                    description: string;
                    default: boolean;
                };
                duration: {
                    type: string;
                    description: string;
                    default: number;
                    minimum: number;
                    maximum: number;
                };
                explanation: {
                    type: string;
                    description: string;
                };
                reason?: undefined;
                speed?: undefined;
                text?: undefined;
                position?: undefined;
                element?: undefined;
                color?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                text: {
                    type: string;
                    description: string;
                };
                position: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                duration: {
                    type: string;
                    description: string;
                    default: number;
                    minimum: number;
                    maximum: number;
                };
                reason?: undefined;
                speed?: undefined;
                explanation?: undefined;
                parameter?: undefined;
                value?: undefined;
                animate?: undefined;
                element?: undefined;
                color?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                element: {
                    type: string;
                    description: string;
                };
                color: {
                    type: string;
                    description: string;
                    default: string;
                };
                duration: {
                    type: string;
                    description: string;
                    default: number;
                    minimum: number;
                    maximum: number;
                };
                reason?: undefined;
                speed?: undefined;
                explanation?: undefined;
                parameter?: undefined;
                value?: undefined;
                animate?: undefined;
                text?: undefined;
                position?: undefined;
            };
            required: string[];
        };
    };
})[];
export declare const LLM_TOOLS_JSON: string;
//# sourceMappingURL=tools.d.ts.map