// physics-engine/types/llm.ts

export interface LLMTool {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
    handler: (args: any) => any | Promise<any>;
  }
  
  export interface LLMExplanation {
    id: string;
    type: 'concept' | 'milestone' | 'hint' | 'warning';
    priority: 'low' | 'medium' | 'high';
    context: {
      experimentName: string;
      parameters: [string, number][];
      measurements: Record<string, number>;
      timestamp: number;
    };
    message: string;
    audioRequired: boolean;
    pauseSimulation: boolean;
  }
  
  export interface LLMContext {
    experiment: string;
    state: any;
    progress: number;
    objectives: any[];
    history: any[];
  }
  
  export interface LLMResponse {
    message: string;
    tools?: LLMToolCall[];
    explanations?: LLMExplanation[];
  }
  
  export interface LLMToolCall {
    tool: string;
    arguments: Record<string, any>;
  }