import * as CANNON from 'cannon-es';
import type { Vector3D, RigidBodyConfig } from '../types';
export declare class ClassicalEngine {
    private world;
    private bodies;
    private timeStep;
    constructor();
    setGravity(gravity: Vector3D): void;
    addRigidBody(id: string, config: RigidBodyConfig): void;
    removeBody(id: string): void;
    getBody(id: string): CANNON.Body | undefined;
    step(deltaTime: number): void;
    private createShape;
    getAllBodies(): Map<string, CANNON.Body>;
    reset(): void;
}
//# sourceMappingURL=ClassicalEngine.d.ts.map