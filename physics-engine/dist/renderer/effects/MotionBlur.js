// physics-engine/renderer/effects/MotionBlur.ts
import * as THREE from 'three';
/**
 * Motion blur effect for fast-moving objects
 */
export class MotionBlur {
    constructor(scene) {
        this.blurObjects = new Map();
        this.scene = scene;
    }
    /**
     * Add motion blur to an object
     */
    addBlur(id, object, config = {}) {
        const samples = config.samples ?? 5;
        const intensity = config.intensity ?? 0.3;
        const blurObj = {
            object,
            previousPositions: [],
            maxSamples: samples,
            intensity,
            ghostMeshes: []
        };
        // Create ghost meshes
        for (let i = 0; i < samples; i++) {
            if (object.geometry) {
                const ghostGeometry = object.geometry.clone();
                const ghostMaterial = object.material.clone();
                if (ghostMaterial instanceof THREE.MeshStandardMaterial ||
                    ghostMaterial instanceof THREE.MeshBasicMaterial) {
                    ghostMaterial.transparent = true;
                    ghostMaterial.opacity = intensity * (1 - i / samples);
                }
                const ghostMesh = new THREE.Mesh(ghostGeometry, ghostMaterial);
                ghostMesh.visible = false;
                this.scene.add(ghostMesh);
                blurObj.ghostMeshes.push(ghostMesh);
            }
        }
        this.blurObjects.set(id, blurObj);
    }
    /**
     * Update blur (call in animation loop)
     */
    update() {
        this.blurObjects.forEach((blurObj) => {
            const currentPos = blurObj.object.position.clone();
            const currentRot = blurObj.object.rotation.clone();
            const currentScale = blurObj.object.scale.clone();
            // Add current position to history
            blurObj.previousPositions.push({
                position: currentPos,
                rotation: currentRot,
                scale: currentScale
            });
            // Limit history length
            if (blurObj.previousPositions.length > blurObj.maxSamples) {
                blurObj.previousPositions.shift();
            }
            // Update ghost meshes
            blurObj.ghostMeshes.forEach((ghostMesh, index) => {
                const historyIndex = blurObj.previousPositions.length - 1 - index - 1;
                if (historyIndex >= 0) {
                    const state = blurObj.previousPositions[historyIndex];
                    ghostMesh.position.copy(state.position);
                    ghostMesh.rotation.copy(state.rotation);
                    ghostMesh.scale.copy(state.scale);
                    ghostMesh.visible = true;
                }
                else {
                    ghostMesh.visible = false;
                }
            });
        });
    }
    /**
     * Set blur intensity
     */
    setIntensity(id, intensity) {
        const blurObj = this.blurObjects.get(id);
        if (!blurObj)
            return;
        blurObj.intensity = intensity;
        blurObj.ghostMeshes.forEach((ghostMesh, index) => {
            const material = ghostMesh.material;
            if (material instanceof THREE.MeshStandardMaterial ||
                material instanceof THREE.MeshBasicMaterial) {
                material.opacity = intensity * (1 - index / blurObj.maxSamples);
            }
        });
    }
    /**
     * Remove blur
     */
    removeBlur(id) {
        const blurObj = this.blurObjects.get(id);
        if (!blurObj)
            return;
        blurObj.ghostMeshes.forEach((ghostMesh) => {
            this.scene.remove(ghostMesh);
        });
        this.blurObjects.delete(id);
    }
    /**
     * Clear all blur effects
     */
    clearAll() {
        this.blurObjects.forEach((blurObj) => {
            blurObj.ghostMeshes.forEach((ghostMesh) => {
                this.scene.remove(ghostMesh);
            });
        });
        this.blurObjects.clear();
    }
    /**
     * Enable/disable blur
     */
    setEnabled(id, enabled) {
        const blurObj = this.blurObjects.get(id);
        if (!blurObj)
            return;
        blurObj.ghostMeshes.forEach((ghostMesh) => {
            ghostMesh.visible = enabled;
        });
    }
}
