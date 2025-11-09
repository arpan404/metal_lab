// physics-engine/experiments/FoucaultPendulum.ts
import { BaseExperiment } from './BaseExperiment';
import { RotationalEngine } from '../engines/RotationalEngine';
import { ClassicalEngine } from '../engines/ClassicalEngine';
import * as CANNON from 'cannon-es';
export class FoucaultPendulum extends BaseExperiment {
    constructor() {
        const parameters = [
            {
                name: 'latitude',
                label: 'Latitude',
                min: -90,
                max: 90,
                default: 45,
                step: 1,
                unit: '°',
                description: 'Geographic latitude (affects precession rate)'
            },
            {
                name: 'length',
                label: 'Pendulum Length',
                min: 5,
                max: 30,
                default: 10,
                step: 0.5,
                unit: 'm',
                description: 'Length of pendulum string'
            },
            {
                name: 'mass',
                label: 'Bob Mass',
                min: 1,
                max: 20,
                default: 5,
                step: 0.5,
                unit: 'kg',
                description: 'Mass of pendulum bob'
            },
            {
                name: 'initialAngle',
                label: 'Initial Displacement',
                min: 0.05,
                max: 0.3,
                default: 0.1,
                step: 0.01,
                unit: 'rad',
                description: 'Initial angular displacement'
            }
        ];
        const objectives = [
            {
                id: 'observe-precession',
                name: 'Observe Precession',
                description: 'Watch the pendulum plane rotate over time',
                criteria: {
                    type: 'time_spent',
                    duration: 60
                }
            },
            {
                id: 'measure-period',
                name: 'Measure Precession Period',
                description: 'Calculate the precession period at different latitudes',
                criteria: {
                    type: 'parameter_exploration',
                    parameter: 'latitude',
                    minChanges: 3
                }
            },
            {
                id: 'understand-coriolis',
                name: 'Understand Coriolis Effect',
                description: 'Explain why the pendulum precesses',
                criteria: {
                    type: 'measurement',
                    key: 'precessionAngle',
                    target: Math.PI / 2,
                    tolerance: 0.3
                }
            }
        ];
        super('Foucault Pendulum', 'Demonstrates Earth\'s rotation through pendulum precession', parameters, objectives);
        this.pendulumBobId = 'bob';
        this.stringLength = 10; // meters
        this.bobMass = 5; // kg
        this.initialAngle = 0.1; // radians
        this.precessionAngle = 0; // Track precession
        this.rotationalEngine = new RotationalEngine();
        this.classicalEngine = new ClassicalEngine();
    }
    async initialize() {
        // Set Earth's rotation based on latitude
        const latitudeRad = this.getParameter('latitude') * Math.PI / 180;
        this.rotationalEngine.setEarthRotation(latitudeRad);
        // Create pendulum bob
        this.stringLength = this.getParameter('length');
        this.bobMass = this.getParameter('mass');
        this.initialAngle = this.getParameter('initialAngle');
        const initialPosition = {
            x: this.stringLength * Math.sin(this.initialAngle),
            y: 0,
            z: 0
        };
        this.classicalEngine.addRigidBody(this.pendulumBobId, {
            mass: this.bobMass,
            position: initialPosition,
            velocity: { x: 0, y: 0, z: 0 },
            shape: {
                type: 'sphere',
                radius: 0.2
            }
        });
        this.startTime = Date.now();
    }
    update(deltaTime) {
        this.elapsedTime += deltaTime;
        this.frameCount++;
        const bob = this.classicalEngine.getBody(this.pendulumBobId);
        if (!bob)
            return;
        // Get current position and velocity
        const position = {
            x: bob.position.x,
            y: bob.position.y,
            z: bob.position.z
        };
        const velocity = {
            x: bob.velocity.x,
            y: bob.velocity.y,
            z: bob.velocity.z
        };
        // Calculate forces
        // 1. Gravity
        const gravity = {
            x: 0,
            y: -9.81 * this.bobMass,
            z: 0
        };
        // 2. String tension (restoring force)
        const stringVector = {
            x: -position.x,
            y: this.stringLength - position.y,
            z: -position.z
        };
        const stringLength = Math.sqrt(stringVector.x ** 2 + stringVector.y ** 2 + stringVector.z ** 2);
        const tensionMagnitude = (this.bobMass * 9.81 * this.stringLength) / stringLength;
        const tension = {
            x: (stringVector.x / stringLength) * tensionMagnitude,
            y: (stringVector.y / stringLength) * tensionMagnitude,
            z: (stringVector.z / stringLength) * tensionMagnitude
        };
        // 3. Coriolis force (this causes precession!)
        const coriolis = this.rotationalEngine.calculateCoriolisForce(this.bobMass, velocity);
        // 4. Centrifugal force (small effect)
        const centrifugal = this.rotationalEngine.calculateCentrifugalForce(this.bobMass, position);
        // Total force
        const totalForce = {
            x: gravity.x + tension.x + coriolis.x + centrifugal.x,
            y: gravity.y + tension.y + coriolis.y + centrifugal.y,
            z: gravity.z + tension.z + coriolis.z + centrifugal.z
        };
        // Apply force
        bob.applyForce(new CANNON.Vec3(totalForce.x, totalForce.y, totalForce.z), new CANNON.Vec3(0, 0, 0));
        // Update classical engine
        this.classicalEngine.step(deltaTime);
        // Calculate precession angle
        this.precessionAngle = Math.atan2(position.z, position.x);
    }
    reset() {
        this.classicalEngine.reset();
        this.elapsedTime = 0;
        this.frameCount = 0;
        this.precessionAngle = 0;
        this.initialize();
    }
    getState() {
        const bob = this.classicalEngine.getBody(this.pendulumBobId);
        return {
            name: this.name,
            parameters: Object.fromEntries(this.parameters),
            measurements: this.getMeasurements(),
            objects: bob ? [{
                    id: this.pendulumBobId,
                    position: {
                        x: bob.position.x,
                        y: bob.position.y,
                        z: bob.position.z
                    },
                    velocity: {
                        x: bob.velocity.x,
                        y: bob.velocity.y,
                        z: bob.velocity.z
                    }
                }] : [],
            elapsedTime: this.elapsedTime,
            frameCount: this.frameCount
        };
    }
    setState(state) {
        // Restore parameters
        Object.entries(state.parameters).forEach(([key, value]) => {
            this.parameters.set(key, value);
        });
        this.elapsedTime = state.elapsedTime;
        this.frameCount = state.frameCount;
        // Restore objects
        state.objects.forEach(obj => {
            const body = this.classicalEngine.getBody(obj.id);
            if (body) {
                body.position.set(obj.position.x, obj.position.y, obj.position.z);
                body.velocity.set(obj.velocity.x, obj.velocity.y, obj.velocity.z);
            }
        });
    }
    getExplanationPoints() {
        return [
            {
                id: 'start-explanation',
                type: 'concept',
                priority: 'high',
                condition: 'elapsedTime < 2',
                message: 'Welcome to the Foucault Pendulum! This experiment demonstrates Earth\'s rotation.',
                audioRequired: true,
                pauseSimulation: true
            },
            {
                id: 'first-precession',
                type: 'observation',
                priority: 'high',
                condition: 'Math.abs(precessionAngle) > 0.05',
                message: 'Notice how the pendulum\'s swing plane is rotating! This is caused by the Coriolis effect.',
                audioRequired: true,
                pauseSimulation: false
            },
            {
                id: 'latitude-effect',
                type: 'concept',
                priority: 'medium',
                condition: 'latitude_changes > 1',
                message: 'At the poles, the pendulum completes one precession in 24 hours. At the equator, it doesn\'t precess at all!',
                audioRequired: true,
                pauseSimulation: false
            }
        ];
    }
    getMeasurements() {
        const bob = this.classicalEngine.getBody(this.pendulumBobId);
        if (!bob) {
            return {
                elapsedTime: this.elapsedTime,
                precessionAngle: this.precessionAngle,
                latitude_changes: 0
            };
        }
        const speed = Math.sqrt(bob.velocity.x ** 2 + bob.velocity.y ** 2 + bob.velocity.z ** 2);
        const angle = Math.sqrt(bob.position.x ** 2 + bob.position.z ** 2) / this.stringLength;
        return {
            elapsedTime: this.elapsedTime,
            precessionAngle: this.precessionAngle,
            precessionRate: this.rotationalEngine.getRotationRate(),
            precessionPeriod: this.rotationalEngine.getPrecessionPeriod(),
            bobSpeed: speed,
            bobAngle: angle,
            latitude_changes: this.parameterHistory?.get('latitude')?.length ?? 0
        };
    }
    onParameterChanged(key, value) {
        if (key === 'latitude') {
            const latitudeRad = value * Math.PI / 180;
            this.rotationalEngine.setEarthRotation(latitudeRad);
        }
        else if (key === 'length') {
            this.stringLength = value;
        }
        else if (key === 'mass') {
            this.bobMass = value;
        }
        else if (key === 'initialAngle') {
            this.initialAngle = value;
        }
    }
}
