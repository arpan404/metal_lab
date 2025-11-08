// physics-engine/llm/types.ts

/**
 * Additional LLM-specific types beyond what's in /types/llm.ts
 */

export interface LLMConfig {
    model: string;
    temperature?: number;
    maxTokens?: number;
    streamResponse?: boolean;
  }
  
  export interface LLMResponse {
    content: string;
    toolCalls?: LLMToolCall[];
    stopReason?: string;
    usage?: {
      inputTokens: number;
      outputTokens: number;
    };
  }
  
  export interface LLMToolCall {
    id: string;
    name: string;
    arguments: Record<string, any>;
  }
  
  export interface ExplanationContext {
    experimentName: string;
    experimentType: 'mechanics' | 'electromagnetism' | 'quantum' | 'nuclear';
    currentPhase: 'intro' | 'exploration' | 'analysis' | 'conclusion';
    studentProgress: number; // 0-100
    timeElapsed: number;
    parameters: Record<string, number>;
    measurements: Record<string, number>;
    recentChanges: ParameterChangeEvent[];
  }
  
  export interface ParameterChangeEvent {
    parameter: string;
    oldValue: number;
    newValue: number;
    timestamp: number;
    source: 'user' | 'llm' | 'system';
  }
  
  export interface TeachingStrategy {
    approach: 'socratic' | 'direct' | 'guided-discovery' | 'problem-based';
    interventionLevel: 'minimal' | 'moderate' | 'active';
    explanationDepth: 'conceptual' | 'mathematical' | 'both';
    encourageExploration: boolean;
  }
  
  export interface StudentModel {
    understanding: Record<string, number>; // concept -> confidence (0-1)
    misconceptions: string[];
    explorationStyle: 'systematic' | 'random' | 'goal-oriented';
    engagementLevel: 'low' | 'medium' | 'high';
    preferredLearningMode: 'visual' | 'mathematical' | 'hands-on';
  }
  
  export interface ExplanationTemplate {
    id: string;
    trigger: string;
    template: string;
    variables: string[];
    priority: number;
  }
  
  export interface LLMAnnotation {
    type: 'arrow' | 'circle' | 'label' | 'equation' | 'graph';
    position: { x: number; y: number; z?: number };
    content: string;
    style?: {
      color?: string;
      size?: number;
      duration?: number;
    };
  }
  
  export interface ConversationContext {
    messageHistory: LLMMessage[];
    topicThread: string[];
    unsolvedQuestions: string[];
    clarificationsNeeded: string[];
  }
  
  export interface LLMMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    metadata?: {
      experimentState?: any;
      toolsUsed?: string[];
      annotationsCreated?: number;
    };
  }
  
  export interface ExplanationQuality {
    clarity: number; // 0-1
    relevance: number; // 0-1
    depth: number; // 0-1
    engagement: number; // 0-1
    overall: number; // 0-1
  }
  
  export interface LLMSystemPrompt {
    role: string;
    expertise: string[];
    teachingStyle: string;
    restrictions: string[];
    capabilities: string[];
  }