// physics-engine/renderer/ThreeJSRenderer.ts
import * as THREE from 'three';
/**
 * Three.js renderer setup and management
 */
export class ThreeJSRenderer {
    constructor(canvas, config) {
        /**
         * Handle window resize
         */
        this.onWindowResize = () => {
            const width = this.canvas.clientWidth;
            const height = this.canvas.clientHeight;
            if (this.camera instanceof THREE.PerspectiveCamera) {
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
            }
            else if (this.camera instanceof THREE.OrthographicCamera) {
                const aspect = width / height;
                this.camera.left = -10 * aspect;
                this.camera.right = 10 * aspect;
                this.camera.updateProjectionMatrix();
            }
            this.renderer.setSize(width, height);
        };
        this.canvas = canvas;
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: config?.antialias ?? true,
            alpha: true
        });
        // Configure renderer
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        if (config?.shadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        if (config?.physicallyCorrectLights) {
            if ('physicallyCorrectLights' in this.renderer) {
                this.renderer.physicallyCorrectLights = true;
            }
            else if ('useLegacyLights' in this.renderer) {
                this.renderer.useLegacyLights = false;
            }
        }
        if (config?.toneMapping) {
            this.renderer.toneMapping = this.getToneMapping(config.toneMapping);
            this.renderer.toneMappingExposure = 1.0;
        }
        // Create scene
        this.scene = new THREE.Scene();
        // Create default camera
        this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 20);
        this.camera.lookAt(0, 0, 0);
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize);
    }
    /**
     * Configure scene
     */
    configureScene(config) {
        // Background
        if (config.background) {
            if (typeof config.background === 'string' || typeof config.background === 'number') {
                this.scene.background = new THREE.Color(config.background);
            }
            else {
                this.scene.background = config.background;
            }
        }
        // Fog
        if (config.fog) {
            const fogColor = new THREE.Color(config.fog.color);
            if (config.fog.type === 'linear') {
                this.scene.fog = new THREE.Fog(fogColor, config.fog.near ?? 1, config.fog.far ?? 1000);
            }
            else {
                this.scene.fog = new THREE.FogExp2(fogColor, config.fog.density ?? 0.00025);
            }
        }
        // Lights
        if (config.lights) {
            config.lights.forEach(lightConfig => {
                const light = this.createLight(lightConfig);
                if (light) {
                    this.scene.add(light);
                }
            });
        }
    }
    /**
     * Create light from config
     */
    createLight(config) {
        let light;
        switch (config.type) {
            case 'ambient':
                light = new THREE.AmbientLight(config.color, config.intensity);
                break;
            case 'directional':
                light = new THREE.DirectionalLight(config.color, config.intensity);
                if (config.position) {
                    light.position.set(config.position.x, config.position.y, config.position.z);
                }
                if (config.castShadow) {
                    light.castShadow = true;
                    light.shadow.mapSize.width = 2048;
                    light.shadow.mapSize.height = 2048;
                }
                break;
            case 'point':
                light = new THREE.PointLight(config.color, config.intensity);
                if (config.position) {
                    light.position.set(config.position.x, config.position.y, config.position.z);
                }
                if (config.castShadow) {
                    light.castShadow = true;
                }
                break;
            case 'spot':
                light = new THREE.SpotLight(config.color, config.intensity);
                if (config.position) {
                    light.position.set(config.position.x, config.position.y, config.position.z);
                }
                if (config.castShadow) {
                    light.castShadow = true;
                }
                break;
            case 'hemisphere':
                light = new THREE.HemisphereLight(config.color, config.groundColor ?? 0x444444, config.intensity);
                break;
            default:
                return null;
        }
        return light;
    }
    /**
     * Get tone mapping from string
     */
    getToneMapping(type) {
        if (typeof type === 'number')
            return type;
        switch (type) {
            case 'Linear': return THREE.LinearToneMapping;
            case 'Reinhard': return THREE.ReinhardToneMapping;
            case 'Cineon': return THREE.CineonToneMapping;
            case 'ACESFilmic': return THREE.ACESFilmicToneMapping;
            default: return THREE.NoToneMapping;
        }
    }
    /**
     * Add object to scene
     */
    add(object) {
        this.scene.add(object);
    }
    /**
     * Remove object from scene
     */
    remove(object) {
        this.scene.remove(object);
    }
    /**
     * Clear scene
     */
    clear() {
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
    }
    /**
     * Render frame
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    /**
     * Get renderer
     */
    getRenderer() {
        return this.renderer;
    }
    /**
     * Get scene
     */
    getScene() {
        return this.scene;
    }
    /**
     * Get camera
     */
    getCamera() {
        return this.camera;
    }
    /**
     * Set camera
     */
    setCamera(camera) {
        this.camera = camera;
    }
    /**
     * Dispose renderer
     */
    dispose() {
        window.removeEventListener('resize', this.onWindowResize);
        this.renderer.dispose();
    }
    /**
     * Take screenshot
     */
    screenshot() {
        return this.renderer.domElement.toDataURL('image/png');
    }
    /**
     * Set clear color
     */
    setClearColor(color, alpha = 1) {
        this.renderer.setClearColor(new THREE.Color(color), alpha);
    }
}
