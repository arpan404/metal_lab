// physics-engine/experiments/YoungDoubleSlit.ts
import { BaseExperiment } from './BaseExperiment';
import { QuantumEngine } from '../engines/QuantumEngine';
export class YoungDoubleSlit extends BaseExperiment {
    constructor() {
        const parameters = [
            {
                name: 'wavelength',
                label: 'Wavelength',
                min: 400e-9,
                max: 700e-9,
                default: 650e-9,
                step: 10e-9,
                unit: 'nm',
                description: 'Wavelength of light (400nm = violet, 700nm = red)'
            },
            {
                name: 'slitSeparation',
                label: 'Slit Separation',
                min: 0.00005,
                max: 0.0005,
                default: 0.0001,
                step: 0.00001,
                unit: 'm',
                description: 'Distance between the two slits'
            },
            {
                name: 'slitWidth',
                label: 'Slit Width',
                min: 0.00001,
                max: 0.0001,
                default: 0.00002,
                step: 0.000005,
                unit: 'm',
                description: 'Width of each slit'
            }
        ];
        const objectives = [
            {
                id: 'observe-interference',
                name: 'Observe Interference',
                description: 'See the characteristic interference pattern',
                criteria: {
                    type: 'time_spent',
                    duration: 30
                }
            },
            {
                id: 'vary-wavelength',
                name: 'Vary Wavelength',
                description: 'Change wavelength and observe pattern changes',
                criteria: {
                    type: 'parameter_exploration',
                    parameter: 'wavelength',
                    minChanges: 5
                }
            },
            {
                id: 'understand-wave-particle',
                name: 'Wave-Particle Duality',
                description: 'Understand how light behaves as both wave and particle',
                criteria: {
                    type: 'measurement',
                    key: 'fringesObserved',
                    target: 10,
                    tolerance: 3
                }
            }
        ];
        super('Young\'s Double Slit', 'Demonstrates wave-particle duality through light interference', parameters, objectives);
        this.gridSize = 512;
        this.wavelength = 650e-9; // red light (nanometers)
        this.slitSeparation = 0.0001; // 0.1 mm
        this.slitWidth = 0.00002; // 0.02 mm
        this.quantumEngine = new QuantumEngine();
        this.waveField = new Float32Array(this.gridSize * this.gridSize * 4);
        this.interferencePattern = new Float32Array(this.gridSize);
    }
    async initialize() {
        await this.quantumEngine.initialize();
        this.wavelength = this.getParameter('wavelength');
        this.slitSeparation = this.getParameter('slitSeparation');
        this.slitWidth = this.getParameter('slitWidth');
        // Initialize wave field
        this.initializeWaveField();
        this.startTime = Date.now();
    }
    initializeWaveField() {
        // Create initial plane wave
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const idx = (y * this.gridSize + x) * 4;
                // Initial amplitude (plane wave from left)
                if (x < 10) {
                    this.waveField[idx] = Math.sin(y * 0.1); // amplitude
                    this.waveField[idx + 1] = 0; // phase
                    this.waveField[idx + 2] = 0; // velocity
                    this.waveField[idx + 3] = 0; // damping
                }
                else {
                    this.waveField[idx] = 0;
                    this.waveField[idx + 1] = 0;
                    this.waveField[idx + 2] = 0;
                    this.waveField[idx + 3] = 0;
                }
            }
        }
    }
    async update(deltaTime) {
        this.elapsedTime += deltaTime;
        this.frameCount++;
        // Compute wave evolution using WebGPU
        this.waveField = await this.quantumEngine.computeWaveEvolution(this.waveField, {
            gridSize: this.gridSize,
            wavelength: this.wavelength,
            dt: deltaTime,
            slitSeparation: this.slitSeparation
        });
        // Calculate interference pattern at screen (right edge)
        this.calculateInterferencePattern();
    }
    calculateInterferencePattern() {
        // Extract intensity at the detection screen (right edge)
        const screenX = this.gridSize - 1;
        for (let y = 0; y < this.gridSize; y++) {
            const idx = (y * this.gridSize + screenX) * 4;
            const amplitude = this.waveField[idx];
            // Intensity = |amplitude|²
            this.interferencePattern[y] = amplitude * amplitude;
        }
    }
    countFringes() {
        // Count peaks in interference pattern
        let peakCount = 0;
        const threshold = 0.1; // Minimum intensity for a peak
        for (let i = 1; i < this.gridSize - 1; i++) {
            const current = this.interferencePattern[i];
            const prev = this.interferencePattern[i - 1];
            const next = this.interferencePattern[i + 1];
            if (current > threshold && current > prev && current > next) {
                peakCount++;
            }
        }
        return peakCount;
    }
    calculateFringeSpacing() {
        // Theoretical: y = λL/d
        // where L = distance to screen, d = slit separation
        const L = 1.0; // 1 meter to screen
        return (this.wavelength * L) / this.slitSeparation;
    }
    reset() {
        this.waveField = new Float32Array(this.gridSize * this.gridSize * 4);
        this.interferencePattern = new Float32Array(this.gridSize);
        this.elapsedTime = 0;
        this.frameCount = 0;
        this.initializeWaveField();
    }
    getState() {
        return {
            name: this.name,
            parameters: Object.fromEntries(this.parameters),
            measurements: this.getMeasurements(),
            objects: [],
            elapsedTime: this.elapsedTime,
            frameCount: this.frameCount,
            waveField: Array.from(this.waveField) // For serialization
        };
    }
    setState(state) {
        Object.entries(state.parameters).forEach(([key, value]) => {
            this.parameters.set(key, value);
        });
        this.elapsedTime = state.elapsedTime;
        this.frameCount = state.frameCount;
        if (state.waveField) {
            this.waveField = new Float32Array(state.waveField);
        }
    }
    getExplanationPoints() {
        return [
            {
                id: 'intro',
                type: 'concept',
                priority: 'high',
                condition: 'elapsedTime < 2',
                message: 'Young\'s double slit experiment shows that light behaves as a wave, creating an interference pattern.',
                audioRequired: true,
                pauseSimulation: true
            },
            {
                id: 'pattern-forming',
                type: 'observation',
                priority: 'high',
                condition: 'fringesObserved > 5',
                message: 'See the bright and dark fringes? This pattern proves light travels as a wave through both slits simultaneously!',
                audioRequired: true,
                pauseSimulation: false
            },
            {
                id: 'wavelength-effect',
                type: 'concept',
                priority: 'medium',
                condition: 'wavelength_changes > 2',
                message: 'Notice how different wavelengths create different fringe spacings. Shorter wavelengths (blue) produce tighter patterns.',
                audioRequired: true,
                pauseSimulation: false
            },
            {
                id: 'wave-particle-duality',
                type: 'concept',
                priority: 'high',
                condition: 'elapsedTime > 60',
                message: 'If we send photons one at a time, they still form this pattern over time - suggesting each photon interferes with itself!',
                audioRequired: true,
                pauseSimulation: true
            }
        ];
    }
    getMeasurements() {
        return {
            elapsedTime: this.elapsedTime,
            fringesObserved: this.countFringes(),
            fringeSpacing: this.calculateFringeSpacing(),
            wavelength: this.wavelength,
            slitSeparation: this.slitSeparation,
            wavelength_changes: this.parameterHistory?.get('wavelength')?.length ?? 0
        };
    }
    onParameterChanged(key, value) {
        if (key === 'wavelength') {
            this.wavelength = value;
        }
        else if (key === 'slitSeparation') {
            this.slitSeparation = value;
        }
        else if (key === 'slitWidth') {
            this.slitWidth = value;
        }
    }
    // Public getter for rendering
    getWaveField() {
        return this.waveField;
    }
    getInterferencePattern() {
        return this.interferencePattern;
    }
}
