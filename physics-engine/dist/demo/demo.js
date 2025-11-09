/**
 * Virtual Physics Lab - Main Demo Controller (TypeScript)
 * Uses the physics-engine TypeScript modules
 */
import { ThreeJSRenderer } from '../renderer/ThreeJSRenderer';
import { CameraController } from '../renderer/CameraController';
import { FoucaultPendulum } from '../experiments/FoucaultPendulum';
import { YoungDoubleSlit } from '../experiments/YoungDoubleSlit';
import { NASCARBanking } from '../experiments/NASCARBanking';
import { FoucaultScene } from '../renderer/scenes/FoucaultScene';
import { DoubleSlitScene } from '../renderer/scenes/DoubleSlitScene';
import { NASCARScene } from '../renderer/scenes/NASCARScene';
class VirtualPhysicsLab {
    constructor() {
        this.cameraController = null;
        this.currentExperiment = null;
        this.currentScene = null;
        this.currentExperimentName = 'wave-field';
        this.animationId = null;
        this.lastTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTime = 0;
        this.experiments = {
            'wave-field': {
                name: 'Wave Field Visualization',
                description: 'Real quantum wave interference using wave equation solver',
                experimentClass: YoungDoubleSlit, // Will use for wave visualization
                sceneClass: DoubleSlitScene,
                controls: [
                    { name: 'wavelength', label: 'Wavelength', min: 400, max: 700, step: 10, default: 500, unit: 'nm' },
                    { name: 'slitSeparation', label: 'Slit Separation', min: 0.5, max: 3, step: 0.1, default: 1.0, unit: 'mm' },
                ]
            },
            'foucault-pendulum': {
                name: "Foucault Pendulum",
                description: "Demonstrates Earth's rotation through pendulum precession with real physics",
                experimentClass: FoucaultPendulum,
                sceneClass: FoucaultScene,
                controls: [
                    { name: 'latitude', label: 'Latitude', min: -90, max: 90, step: 5, default: 45, unit: '°' },
                    { name: 'length', label: 'Pendulum Length', min: 5, max: 20, step: 1, default: 10, unit: 'm' },
                    { name: 'initialAngle', label: 'Initial Angle', min: 0.05, max: 0.5, step: 0.05, default: 0.1, unit: 'rad' },
                ]
            },
            'double-slit': {
                name: "Young's Double Slit",
                description: "Wave-particle duality and quantum interference with real interference calculations",
                experimentClass: YoungDoubleSlit,
                sceneClass: DoubleSlitScene,
                controls: [
                    { name: 'wavelength', label: 'Wavelength', min: 400, max: 700, step: 10, default: 500, unit: 'nm' },
                    { name: 'slitSeparation', label: 'Slit Separation', min: 0.5, max: 3, step: 0.1, default: 1.0, unit: 'mm' },
                ]
            },
            'nascar-banking': {
                name: 'NASCAR Banking Track',
                description: 'Circular motion physics with banked turns and centripetal force',
                experimentClass: NASCARBanking,
                sceneClass: NASCARScene,
                controls: [
                    { name: 'bankAngle', label: 'Banking Angle', min: 0, max: 45, step: 5, default: 30, unit: '°' },
                    { name: 'velocity', label: 'Car Speed', min: 5, max: 40, step: 1, default: 20, unit: 'm/s' },
                ]
            }
        };
        this.animate = () => {
            if (!this.isRunning)
                return;
            this.animationId = requestAnimationFrame(this.animate);
            const currentTime = performance.now();
            const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap at 100ms
            this.lastTime = currentTime;
            if (!this.isPaused) {
                // Update experiment
                if (this.currentExperiment) {
                    this.currentExperiment.update(deltaTime);
                }
                // Update scene
                if (this.currentScene) {
                    this.currentScene.update(deltaTime);
                }
                // Update camera controller
                if (this.cameraController) {
                    this.cameraController.update();
                }
                // Update stats every frame
                this.frameCount++;
                if (currentTime - this.fpsTime >= 1000) {
                    this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.fpsTime));
                    this.frameCount = 0;
                    this.fpsTime = currentTime;
                }
                this.updateStats();
                this.updateMeasurements();
            }
            // Render
            this.renderer.render();
        };
        this.canvas = document.getElementById('renderCanvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }
        // Initialize renderer
        this.renderer = new ThreeJSRenderer(this.canvas, {
            antialias: true,
            shadows: true,
            physicallyCorrectLights: true
        });
        // Configure scene
        this.renderer.configureScene({
            background: 0x1a1a2e,
            fog: {
                type: 'linear',
                color: 0x1a1a2e,
                near: 10,
                far: 100
            }
        });
        this.setupUI();
        this.loadExperiment(this.currentExperimentName);
    }
    setupUI() {
        // Demo selection
        document.querySelectorAll('.demo-item').forEach(item => {
            item.addEventListener('click', () => {
                const demoName = item.dataset.demo;
                if (demoName && this.experiments[demoName]) {
                    document.querySelectorAll('.demo-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    this.loadExperiment(demoName);
                }
            });
        });
        // Control buttons
        document.getElementById('start-btn')?.addEventListener('click', () => this.start());
        document.getElementById('pause-btn')?.addEventListener('click', () => this.pause());
        document.getElementById('reset-btn')?.addEventListener('click', () => this.reset());
    }
    async loadExperiment(name) {
        // Stop current animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isRunning = false;
        // Dispose current experiment and scene
        if (this.currentScene) {
            this.currentScene.dispose();
            this.currentScene = null;
        }
        if (this.currentExperiment) {
            this.currentExperiment = null;
        }
        // Clear scene
        this.renderer.clear();
        // Create new experiment
        const expConfig = this.experiments[name];
        this.currentExperimentName = name;
        try {
            this.currentExperiment = new expConfig.experimentClass();
            await this.currentExperiment.initialize();
            this.currentScene = new expConfig.sceneClass(this.renderer.getScene(), this.currentExperiment);
            await this.currentScene.initialize();
            // Update UI
            const titleEl = document.getElementById('demo-title');
            const descEl = document.getElementById('demo-description');
            if (titleEl)
                titleEl.textContent = expConfig.name;
            if (descEl)
                descEl.textContent = expConfig.description;
            // Setup controls
            this.setupControls(expConfig.controls);
            // Setup camera controller if not already done
            if (!this.cameraController) {
                this.cameraController = new CameraController(this.renderer.getCamera(), this.canvas);
            }
            // Reset camera position based on experiment
            this.resetCamera();
            // Update UI state
            const startBtn = document.getElementById('start-btn');
            const pauseBtn = document.getElementById('pause-btn');
            if (startBtn)
                startBtn.disabled = false;
            if (pauseBtn)
                pauseBtn.disabled = true;
            console.log(`Loaded experiment: ${name}`);
        }
        catch (error) {
            console.error(`Failed to load experiment ${name}:`, error);
        }
    }
    setupControls(controls) {
        const container = document.getElementById('controls-container');
        if (!container)
            return;
        container.innerHTML = '';
        controls.forEach(ctrl => {
            const div = document.createElement('div');
            div.className = 'control-group';
            const label = document.createElement('label');
            label.innerHTML = `${ctrl.label}: <span class="control-value" id="${ctrl.name}-value">${ctrl.default}${ctrl.unit}</span>`;
            const input = document.createElement('input');
            input.type = 'range';
            input.id = ctrl.name;
            input.min = ctrl.min.toString();
            input.max = ctrl.max.toString();
            input.step = ctrl.step.toString();
            input.value = ctrl.default.toString();
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const valueEl = document.getElementById(`${ctrl.name}-value`);
                if (valueEl) {
                    valueEl.textContent = value + ctrl.unit;
                }
                if (this.currentExperiment) {
                    this.currentExperiment.setParameter(ctrl.name, value);
                }
            });
            div.appendChild(label);
            div.appendChild(input);
            container.appendChild(div);
        });
    }
    resetCamera() {
        const camera = this.renderer.getCamera();
        // Different camera positions for different experiments
        switch (this.currentExperimentName) {
            case 'foucault-pendulum':
                camera.position.set(15, 8, 15);
                camera.lookAt(0, 5, 0);
                break;
            case 'double-slit':
            case 'wave-field':
                camera.position.set(5, 3, 10);
                camera.lookAt(0, 1, 0);
                break;
            case 'nascar-banking':
                camera.position.set(0, 20, 25);
                camera.lookAt(0, 0, 0);
                break;
            default:
                camera.position.set(15, 10, 15);
                camera.lookAt(0, 0, 0);
        }
    }
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.fpsTime = this.lastTime;
        this.frameCount = 0;
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        if (startBtn)
            startBtn.disabled = true;
        if (pauseBtn) {
            pauseBtn.disabled = false;
            pauseBtn.textContent = 'Pause';
        }
        this.animate();
    }
    pause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        }
    }
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.currentExperiment) {
            this.currentExperiment.reset();
        }
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        if (startBtn)
            startBtn.disabled = false;
        if (pauseBtn) {
            pauseBtn.disabled = true;
            pauseBtn.textContent = 'Pause';
        }
        this.frameCount = 0;
        this.updateStats();
        this.updateMeasurements();
    }
    updateStats() {
        const fpsEl = document.getElementById('fps');
        const elapsedEl = document.getElementById('elapsed');
        const framesEl = document.getElementById('frames');
        if (fpsEl)
            fpsEl.textContent = this.fps.toString();
        if (this.currentExperiment && elapsedEl) {
            const measurements = this.currentExperiment.getMeasurements();
            elapsedEl.textContent = (measurements.elapsedTime || 0).toFixed(1) + 's';
        }
        if (framesEl && this.currentExperiment) {
            const state = this.currentExperiment.getState();
            framesEl.textContent = (state.frameCount || 0).toString();
        }
    }
    updateMeasurements() {
        if (!this.currentExperiment)
            return;
        const measurements = this.currentExperiment.getMeasurements();
        const container = document.getElementById('measurements-container');
        if (!container)
            return;
        container.innerHTML = '';
        Object.entries(measurements).forEach(([name, value]) => {
            // Skip internal tracking values
            if (name === 'elapsedTime' || name === 'latitude_changes')
                return;
            const div = document.createElement('div');
            div.className = 'measurement-item';
            const label = document.createElement('div');
            label.className = 'measurement-label';
            label.textContent = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const val = document.createElement('div');
            val.className = 'measurement-value';
            // Format value
            if (typeof value === 'number') {
                val.textContent = value.toFixed(3);
            }
            else {
                val.textContent = value.toString();
            }
            div.appendChild(label);
            div.appendChild(val);
            container.appendChild(div);
        });
    }
}
// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.lab = new VirtualPhysicsLab();
});
