import type { Vector3D } from '../../types';
/**
 * Generate field lines and visualization data
 */
export declare class FieldVisualization {
    /**
     * Generate electric field lines from point charge
     */
    static generateFieldLines(charge: number, position: Vector3D, numLines?: number, maxDistance?: number, steps?: number): Vector3D[][];
    /**
     * Trace a single field line
     */
    private static traceFieldLine;
    /**
     * Generate field vector grid
     */
    static generateVectorField(charges: Array<{
        charge: number;
        position: Vector3D;
    }>, bounds: {
        min: Vector3D;
        max: Vector3D;
    }, resolution?: number): Array<{
        position: Vector3D;
        field: Vector3D;
    }>;
    /**
     * Generate equipotential surfaces
     */
    static generateEquipotentials(charge: number, position: Vector3D, potentials: number[], resolution?: number): Map<number, Vector3D[]>;
}
//# sourceMappingURL=FieldVisualization.d.ts.map