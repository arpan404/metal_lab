import type { ExplanationPoint } from '../types/Experiments';
/**
 * Predefined explanation points for each experiment
 * These trigger automatically when conditions are met
 */
export declare const FOUCAULT_EXPLANATION_POINTS: ExplanationPoint[];
export declare const NASCAR_EXPLANATION_POINTS: ExplanationPoint[];
export declare const MILLIKAN_EXPLANATION_POINTS: ExplanationPoint[];
export declare const DOUBLE_SLIT_EXPLANATION_POINTS: ExplanationPoint[];
export declare const RUTHERFORD_EXPLANATION_POINTS: ExplanationPoint[];
/**
 * Get explanation points for a specific experiment
 */
export declare function getExplanationPointsForExperiment(experimentName: string): ExplanationPoint[];
/**
 * Create custom explanation point
 */
export declare function createExplanationPoint(id: string, type: 'concept' | 'observation' | 'warning' | 'achievement', condition: string, message: string, options?: {
    priority?: 'low' | 'medium' | 'high';
    audioRequired?: boolean;
    pauseSimulation?: boolean;
}): ExplanationPoint;
/**
 * Evaluate explanation point condition
 */
export declare function evaluateCondition(condition: string, measurements: Record<string, number>): boolean;
//# sourceMappingURL=ExplanationPoints.d.ts.map