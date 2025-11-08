// physics-engine/index.ts
/**
 * Physics Engine for Virtual Lab
 * Standalone module for GPU-accelerated physics simulations
 * with LLM integration points for educational experiments
 */

// Core components
export { PhysicsEngine as Engine } from './core/Engine';
export { SimulationState } from './core/SimulationState';
export { ProgressTracker } from './core/ProgressTracker';
export { LLMController as LLMInterface } from './llm/LLMController';

// Physics engines
export { ClassicalEngine } from './engines/ClassicalEngine';
export { QuantumEngine } from './engines/QuantumEngine';
export { ElectricFieldEngine } from './engines/ElectricFieldEngine';
export { RotationalEngine } from './engines/RotationalEngine';

// Base classes
export { BaseExperiment } from './experiments/BaseExperiment';
export { BaseGame } from './games/BaseGame';

// Experiments
export { YoungDoubleSlit } from './experiments/YoungDoubleSlit';
export { RutherfordGoldFoil } from './experiments/RutherfordGoldFoil';
export { FoucaultPendulum } from './experiments/FoucaultPendulum';
export { MillikanOilDrop } from './experiments/MillikanOilDrop';
export { NASCARBanking } from './experiments/NASCARBanking';

// Games
export { BankedTrackChallenge } from './games/BankedTrackChallenge';
export { AtomicDeflection } from './games/AtomicDeflection';

// State management
export { StateManager } from './state/StateManager';
export { SnapshotManager } from './state/SnapshotManager';
export { HistoryTracker } from './state/HistoryTracker';
export { GameScoreManager } from './state/GameScoreManager';

// LLM tools
export { createLLMTools, LLM_TOOLS_JSON } from './llm/tools';

// Type definitions
export * from './types';

// Quick start function
export async function createPhysicsEngine(canvas: HTMLCanvasElement, config?: any) {
  const { PhysicsEngine } = await import('./core/Engine');
  const engine = new PhysicsEngine(config);
  return engine;
}

// Version info
export const VERSION = '1.0.0';
export const GPU_REQUIRED = false;
export const WEBGPU_PREFERRED = true;