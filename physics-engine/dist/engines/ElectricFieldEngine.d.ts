import type { Vector3D, ChargedParticle } from '../types';
export declare class ElectricFieldEngine {
    private electricField;
    private particles;
    private readonly k;
    private readonly g;
    setUniformField(field: Vector3D): void;
    addParticle(id: string, particle: ChargedParticle): void;
    removeParticle(id: string): void;
    getParticle(id: string): ChargedParticle | undefined;
    /**
     * Calculate electric force on a particle
     */
    calculateElectricForce(particle: ChargedParticle): Vector3D;
    /**
     * Calculate gravitational force
     */
    calculateGravitationalForce(particle: ChargedParticle): Vector3D;
    /**
     * Calculate net force (electric + gravity + drag)
     */
    calculateNetForce(particle: ChargedParticle, dragCoefficient?: number): Vector3D;
    /**
     * Update particle positions (Millikan oil drop)
     */
    step(deltaTime: number): void;
    /**
     * Calculate required electric field to balance gravity
     */
    calculateBalancingField(particle: ChargedParticle): number;
    getAllParticles(): Map<string, ChargedParticle>;
    reset(): void;
}
//# sourceMappingURL=ElectricFieldEngine.d.ts.map