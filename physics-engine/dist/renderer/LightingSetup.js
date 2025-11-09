// physics-engine/renderer/LightingSetup.ts
import * as THREE from 'three';
/**
 * Preset lighting configurations for different scenes
 */
export class LightingSetup {
    /**
     * Create standard three-point lighting
     */
    static createThreePointLighting(scene) {
        // Key light (main light)
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
        keyLight.position.set(5, 10, 7);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 50;
        scene.add(keyLight);
        // Fill light (softer, opposite side)
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-5, 5, -5);
        scene.add(fillLight);
        // Back light (rim light)
        const backLight = new THREE.DirectionalLight(0xffffff, 0.6);
        backLight.position.set(0, 5, -10);
        scene.add(backLight);
        // Ambient light (base illumination)
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
    }
    /**
     * Create laboratory lighting
     */
    static createLabLighting(scene) {
        // Bright overhead lights
        const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
        topLight.position.set(0, 20, 0);
        topLight.castShadow = true;
        scene.add(topLight);
        // Ambient fill
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);
        // Accent lights
        const accent1 = new THREE.PointLight(0x8888ff, 0.5, 50);
        accent1.position.set(10, 5, 10);
        scene.add(accent1);
        const accent2 = new THREE.PointLight(0xff8888, 0.5, 50);
        accent2.position.set(-10, 5, -10);
        scene.add(accent2);
    }
    /**
     * Create outdoor lighting (sun)
     */
    static createOutdoorLighting(scene) {
        // Sun
        const sun = new THREE.DirectionalLight(0xffffee, 1.2);
        sun.position.set(100, 100, 50);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 4096;
        sun.shadow.mapSize.height = 4096;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 500;
        sun.shadow.camera.left = -50;
        sun.shadow.camera.right = 50;
        sun.shadow.camera.top = 50;
        sun.shadow.camera.bottom = -50;
        scene.add(sun);
        // Sky light (hemisphere)
        const skyLight = new THREE.HemisphereLight(0x87ceeb, 0x545454, 0.6);
        scene.add(skyLight);
    }
    /**
     * Create dramatic lighting (high contrast)
     */
    static createDramaticLighting(scene) {
        // Single strong directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(-5, 10, 5);
        mainLight.castShadow = true;
        scene.add(mainLight);
        // Very dim ambient
        const ambient = new THREE.AmbientLight(0x202020, 0.2);
        scene.add(ambient);
        // Colored rim light
        const rimLight = new THREE.DirectionalLight(0x4444ff, 0.8);
        rimLight.position.set(5, 5, -5);
        scene.add(rimLight);
    }
    /**
     * Create neon/sci-fi lighting
     */
    static createNeonLighting(scene) {
        // Dim ambient
        const ambient = new THREE.AmbientLight(0x111111, 0.3);
        scene.add(ambient);
        // Colored point lights
        const colors = [0xff00ff, 0x00ffff, 0xffff00, 0xff0000, 0x00ff00];
        const positions = [
            [10, 5, 0],
            [-10, 5, 0],
            [0, 5, 10],
            [0, 5, -10],
            [0, 10, 0]
        ];
        colors.forEach((color, i) => {
            const light = new THREE.PointLight(color, 1.0, 30);
            light.position.set(positions[i][0], positions[i][1], positions[i][2]);
            scene.add(light);
        });
    }
    /**
     * Create custom lighting setup
     */
    static createCustomLighting(scene, config) {
        // Ambient
        if (config.ambient) {
            const ambient = new THREE.AmbientLight(config.ambient.color, config.ambient.intensity);
            scene.add(ambient);
        }
        // Directional lights
        if (config.directional) {
            config.directional.forEach(light => {
                const dirLight = new THREE.DirectionalLight(light.color, light.intensity);
                dirLight.position.set(light.position[0], light.position[1], light.position[2]);
                dirLight.castShadow = true;
                scene.add(dirLight);
            });
        }
        // Point lights
        if (config.point) {
            config.point.forEach(light => {
                const pointLight = new THREE.PointLight(light.color, light.intensity, light.distance ?? 100);
                pointLight.position.set(light.position[0], light.position[1], light.position[2]);
                scene.add(pointLight);
            });
        }
        // Spot lights
        if (config.spot) {
            config.spot.forEach(light => {
                const spotLight = new THREE.SpotLight(light.color, light.intensity);
                spotLight.position.set(light.position[0], light.position[1], light.position[2]);
                if (light.target) {
                    spotLight.target.position.set(light.target[0], light.target[1], light.target[2]);
                    scene.add(spotLight.target);
                }
                spotLight.castShadow = true;
                scene.add(spotLight);
            });
        }
    }
    /**
     * Add light helpers (for debugging)
     */
    static addLightHelpers(scene) {
        scene.traverse((object) => {
            if (object instanceof THREE.DirectionalLight) {
                const helper = new THREE.DirectionalLightHelper(object, 5);
                scene.add(helper);
            }
            else if (object instanceof THREE.PointLight) {
                const helper = new THREE.PointLightHelper(object, 1);
                scene.add(helper);
            }
            else if (object instanceof THREE.SpotLight) {
                const helper = new THREE.SpotLightHelper(object);
                scene.add(helper);
            }
        });
    }
}
