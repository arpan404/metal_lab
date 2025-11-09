export interface LLMTool {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
    handler: (args: any) => Promise<any> | any;
}
export interface LLMExplanation {
    id: string;
    type: 'concept' | 'observation' | 'warning' | 'achievement';
    priority: 'low' | 'medium' | 'high';
    context: ExplanationContext;
    message: string;
    audioRequired: boolean;
    pauseSimulation: boolean;
}
export interface ExplanationContext {
    experimentName: string;
    parameters: Array<[string, number]>;
    measurements: Record<string, number>;
    timestamp: number;
}
export interface LLMCallbacks {
    onExplanation?: (explanation: LLMExplanation) => void;
    onPause?: () => void;
    onResume?: () => void;
    onParameterChange?: (parameter: string, value: number) => void;
    onHighlight?: (element: string, color: string, duration: number) => void;
    onNote?: (text: string, position: string, duration: number) => void;
}
export interface LLMToolResult {
    success: boolean;
    action?: string;
    data?: any;
    error?: string;
}
export interface LLMMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
}
export interface LLMConversation {
    id: string;
    experimentName: string;
    messages: LLMMessage[];
    startTime: number;
    endTime?: number;
}
//# sourceMappingURL=llm.d.ts.map