// Core
export { PhysicsEngine } from './core/Engine';
export { SimulationState } from './core/SimulationState';
export { ProgressTracker } from './core/ProgressTracker';

// Engines
export { ClassicalEngine } from './engines/ClassicalEngine';
export { QuantumEngine } from './engines/QuantumEngine';
export { ElectricFieldEngine } from './engines/ElectricFieldEngine';
export { RotationalEngine } from './engines/RotationalEngine';

// Experiments
export { BaseExperiment } from './experiments/BaseExperiment';
export { FoucaultPendulum } from './experiments/FoucaultPendulum';
export { NASCARBanking } from './experiments/NASCARBanking';
export { MillikanOilDrop } from './experiments/MillikanOilDrop';
export { YoungDoubleSlit } from './experiments/YoungDoubleSlit';
export { RutherfordGoldFoil } from './experiments/RutherfordGoldFoil';

// Games
export { BaseGame } from './games/BaseGame';
export { BankedTrackChallenge } from './games/BankedTrackChallenge';
export { AtomicDeflection } from './games/AtomicDeflection';

// State Management
export { StateManager } from './state/StateManager';
export { SnapshotManager } from './state/SnapshotManager';
export { HistoryTracker } from './state/HistoryTracker';
export { GameScoreManager } from './state/GameScoreManager';

// LLM
export { LLMController } from './llm/LLMController';
export { createLLMTools } from './llm/tools';

// Renderer
export { ThreeJSRenderer } from './renderer/ThreeJSRenderer';
export { CameraController } from './renderer/CameraController';

// Models
//export { ModelManager } from './models/ModelManager';
//export * from './models/procedural';

// Physics
export * from './physics/mechanics/CircularMotion';
export * from './physics/mechanics/Pendulum';
export * from './physics/electromagnetism/ElectricField';
export * from './physics/quantum/WaveFunction';
export * from './physics/nuclear/RutherfordScattering';

// Utils
export * from './utils/math';
export * from './utils/colors';
export * from './utils/formatters';
export * from './utils/modelLoader';

// Types
export * from './types';