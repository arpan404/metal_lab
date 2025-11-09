// physics-engine/experiments/RutherfordGoldFoil.ts
import { BaseExperiment } from './BaseExperiment';
export class RutherfordGoldFoil extends BaseExperiment {
    constructor() {
        const parameters = [
            {
                name: 'alphaEnergy',
                label: 'Alpha Energy',
                min: 1e6,
                max: 10e6,
                default: 5.5e6,
                step: 0.5e6,
                unit: 'eV',
                description: 'Kinetic energy of alpha particles'
            },
            {
                name: 'emissionRate',
                label: 'Emission Rate',
                min: 1,
                max: 100,
                default: 10,
                step: 1,
                unit: 'particles/s',
                description: 'Rate of alpha particle emission'
            },
            {
                name: 'foilThickness',
                label: 'Foil Thickness',
                min: 1e-7,
                max: 1e-5,
                default: 1e-6,
                step: 1e-7,
                unit: 'm',
                description: 'Thickness of gold foil'
            }
        ];
        const objectives = [
            {
                id: 'observe-scattering',
                name: 'Observe Scattering',
                description: 'Watch alpha particles deflect off nuclei',
                criteria: {
                    type: 'measurement',
                    key: 'particlesDetected',
                    target: 100,
                    tolerance: 20
                }
            },
            {
                id: 'large-angle-scattering',
                name: 'Large-Angle Scattering',
                description: 'Observe particles deflecting at large angles',
                criteria: {
                    type: 'measurement',
                    key: 'largeAngleCount',
                    target: 5,
                    tolerance: 2
                }
            },
            {
                id: 'understand-nucleus',
                name: 'Understand Nuclear Model',
                description: 'Understand why most particles pass through',
                criteria: {
                    type: 'time_spent',
                    duration: 60
                }
            }
        ];
        super('Rutherford Gold Foil', 'Discover the atomic nucleus through alpha particle scattering', parameters, objectives);
        this.particles = new Map();
        this.nextParticleId = 0;
        this.nucleusCharge = 79; // Gold (Z=79)
        this.alphaCharge = 2; // He²⁺
        this.alphaEnergy = 5.5e6; // 5.5 MeV
        this.detections = new Map(); // angle -> count
        this.particlesEmitted = 0;
        this.particlesDetected = 0;
    }
    async initialize() {
        this.alphaEnergy = this.getParameter('alphaEnergy');
        this.particles.clear();
        this.detections.clear();
        this.particlesEmitted = 0;
        this.particlesDetected = 0;
        // Initialize detection bins (every 10 degrees)
        for (let angle = 0; angle <= 180; angle += 10) {
            this.detections.set(angle, 0);
        }
        this.startTime = Date.now();
    }
    update(deltaTime) {
        this.elapsedTime += deltaTime;
        this.frameCount++;
        // Emit new particles
        const emissionRate = this.getParameter('emissionRate');
        const particlesToEmit = Math.floor(emissionRate * deltaTime);
        for (let i = 0; i < particlesToEmit; i++) {
            this.emitParticle();
        }
        // Update existing particles
        this.particles.forEach((particle, id) => {
            this.updateParticle(particle, deltaTime);
            // Check if particle reached detector
            if (Math.abs(particle.position.z) > 1 && !particle.detected) {
                this.detectParticle(particle);
                particle.detected = true;
                this.particlesDetected++;
            }
            // Remove if too far away
            if (Math.abs(particle.position.z) > 2) {
                this.particles.delete(id);
            }
        });
    }
    emitParticle() {
        // Random impact parameter (distance from nucleus)
        const maxImpact = 1e-10; // 0.1 nm
        const impactParameter = (Math.random() - 0.5) * 2 * maxImpact;
        // Calculate initial velocity from energy
        const alphaMass = 6.64e-27; // kg (He-4)
        const velocity = Math.sqrt(2 * this.alphaEnergy * 1.602e-19 / alphaMass);
        const particle = {
            id: `alpha-${this.nextParticleId++}`,
            position: {
                x: impactParameter,
                y: 0,
                z: -0.5 // Start 0.5m before foil
            },
            velocity: {
                x: 0,
                y: 0,
                z: velocity
            },
            deflectionAngle: 0,
            impactParameter,
            detected: false
        };
        this.particles.set(particle.id, particle);
        this.particlesEmitted++;
    }
    updateParticle(particle, deltaTime) {
        // Rutherford scattering calculation
        const k = 8.99e9; // Coulomb constant
        const q1 = this.alphaCharge * 1.602e-19;
        const q2 = this.nucleusCharge * 1.602e-19;
        // Distance from nucleus (at origin)
        const r = Math.sqrt(particle.position.x ** 2 +
            particle.position.y ** 2 +
            particle.position.z ** 2);
        if (r < 1e-15)
            return; // Too close - avoid singularity
        // Coulomb force
        const forceMagnitude = (k * q1 * q2) / (r * r);
        // Force direction (repulsive)
        const force = {
            x: forceMagnitude * particle.position.x / r,
            y: forceMagnitude * particle.position.y / r,
            z: forceMagnitude * particle.position.z / r
        };
        // Update velocity (F = ma)
        const alphaMass = 6.64e-27;
        particle.velocity.x += (force.x / alphaMass) * deltaTime;
        particle.velocity.y += (force.y / alphaMass) * deltaTime;
        particle.velocity.z += (force.z / alphaMass) * deltaTime;
        // Update position
        particle.position.x += particle.velocity.x * deltaTime;
        particle.position.y += particle.velocity.y * deltaTime;
        particle.position.z += particle.velocity.z * deltaTime;
        // Calculate deflection angle
        const deflection = Math.atan2(Math.sqrt(particle.velocity.x ** 2 + particle.velocity.y ** 2), particle.velocity.z);
        particle.deflectionAngle = deflection * 180 / Math.PI;
    }
    detectParticle(particle) {
        // Bin the detection angle
        const angleBin = Math.round(particle.deflectionAngle / 10) * 10;
        const currentCount = this.detections.get(angleBin) ?? 0;
        this.detections.set(angleBin, currentCount + 1);
    }
    getLargeAngleCount() {
        let count = 0;
        this.detections.forEach((detections, angle) => {
            if (angle > 90) { // Large angle = > 90 degrees
                count += detections;
            }
        });
        return count;
    }
    reset() {
        this.particles.clear();
        this.detections.clear();
        this.particlesEmitted = 0;
        this.particlesDetected = 0;
        this.nextParticleId = 0;
        this.elapsedTime = 0;
        this.frameCount = 0;
        this.initialize();
    }
    getState() {
        return {
            name: this.name,
            parameters: Object.fromEntries(this.parameters),
            measurements: this.getMeasurements(),
            objects: Array.from(this.particles.values()).map(p => ({
                id: p.id,
                position: p.position,
                velocity: p.velocity,
                deflectionAngle: p.deflectionAngle
            })),
            elapsedTime: this.elapsedTime,
            frameCount: this.frameCount
        };
    }
    setState(state) {
        Object.entries(state.parameters).forEach(([key, value]) => {
            this.parameters.set(key, value);
        });
        this.elapsedTime = state.elapsedTime;
        this.frameCount = state.frameCount;
        // Restore particles
        this.particles.clear();
        state.objects.forEach(obj => {
            const particle = {
                id: obj.id,
                position: obj.position,
                velocity: obj.velocity,
                deflectionAngle: obj.deflectionAngle ?? 0,
                impactParameter: 0,
                detected: false
            };
            this.particles.set(obj.id, particle);
        });
    }
    getExplanationPoints() {
        return [
            {
                id: 'intro',
                type: 'concept',
                priority: 'high',
                condition: 'elapsedTime < 2',
                message: 'Rutherford fired alpha particles at gold foil. Most passed straight through, but some deflected at large angles!',
                audioRequired: true,
                pauseSimulation: true
            },
            {
                id: 'first-large-angle',
                type: 'observation',
                priority: 'high',
                condition: 'largeAngleCount > 0',
                message: 'Wow! A particle just deflected at a large angle. This shocked Rutherford - it suggested the atom has a tiny, dense nucleus!',
                audioRequired: true,
                pauseSimulation: false
            },
            {
                id: 'mostly-empty',
                type: 'concept',
                priority: 'medium',
                condition: 'particlesDetected > 50',
                message: 'Notice how most particles pass through undeflected. This proves atoms are mostly empty space!',
                audioRequired: true,
                pauseSimulation: false
            }
        ];
    }
    getMeasurements() {
        return {
            elapsedTime: this.elapsedTime,
            particlesEmitted: this.particlesEmitted,
            particlesDetected: this.particlesDetected,
            largeAngleCount: this.getLargeAngleCount(),
            averageDeflection: this.calculateAverageDeflection(),
            alphaEnergy_changes: this.parameterHistory?.get('alphaEnergy')?.length ?? 0
        };
    }
    calculateAverageDeflection() {
        let totalAngle = 0;
        let totalCount = 0;
        this.detections.forEach((count, angle) => {
            totalAngle += angle * count;
            totalCount += count;
        });
        return totalCount > 0 ? totalAngle / totalCount : 0;
    }
    onParameterChanged(key, value) {
        if (key === 'alphaEnergy') {
            this.alphaEnergy = value;
        }
    }
    // Public getter for rendering
    getDetectionData() {
        return this.detections;
    }
    getActiveParticles() {
        return Array.from(this.particles.values());
    }
}
