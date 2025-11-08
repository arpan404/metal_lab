// physics-engine/engines/ClassicalEngine.ts
import * as CANNON from 'cannon-es';
import type { Vector3D, RigidBodyConfig } from '../types';

export class ClassicalEngine {
  private world: CANNON.World;
  private bodies: Map<string, CANNON.Body> = new Map();
  private timeStep: number = 1 / 60;
  
  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)
    });
  }
  
  setGravity(gravity: Vector3D): void {
    this.world.gravity.set(gravity.x, gravity.y, gravity.z);
  }
  
  addRigidBody(id: string, config: RigidBodyConfig): void {
    const shape = this.createShape(config.shape);
    const body = new CANNON.Body({
      mass: config.mass,
      position: new CANNON.Vec3(
        config.position.x,
        config.position.y,
        config.position.z
      ),
      shape: shape
    });
    
    if (config.velocity) {
      body.velocity.set(
        config.velocity.x,
        config.velocity.y,
        config.velocity.z
      );
    }
    
    this.world.addBody(body);
    this.bodies.set(id, body);
  }
  
  removeBody(id: string): void {
    const body = this.bodies.get(id);
    if (body) {
      this.world.removeBody(body);
      this.bodies.delete(id);
    }
  }
  
  getBody(id: string): CANNON.Body | undefined {
    return this.bodies.get(id);
  }
  
  step(deltaTime: number): void {
    this.world.step(this.timeStep, deltaTime, 3);
  }
  
  private createShape(shapeConfig: any): CANNON.Shape {
    switch (shapeConfig.type) {
      case 'sphere':
        return new CANNON.Sphere(shapeConfig.radius);
      case 'box':
        return new CANNON.Box(new CANNON.Vec3(
          shapeConfig.width / 2,
          shapeConfig.height / 2,
          shapeConfig.depth / 2
        ));
      case 'cylinder':
        return new CANNON.Cylinder(
          shapeConfig.radiusTop,
          shapeConfig.radiusBottom,
          shapeConfig.height,
          shapeConfig.segments
        );
      default:
        throw new Error(`Unknown shape type: ${shapeConfig.type}`);
    }
  }
  
  getAllBodies(): Map<string, CANNON.Body> {
    return this.bodies;
  }
  
  reset(): void {
    this.bodies.forEach(body => {
      this.world.removeBody(body);
    });
    this.bodies.clear();
  }
}