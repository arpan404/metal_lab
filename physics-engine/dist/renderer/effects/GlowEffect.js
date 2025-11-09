// physics-engine/renderer/effects/GlowEffect.ts
import * as THREE from 'three';
/**
 * Glow/bloom effect for highlighted objects
 */
export class GlowEffect {
    constructor(scene) {
        this.glowObjects = new Map();
        this.scene = scene;
    }
    /**
     * Add glow to an object
     */
    addGlow(id, object, config = {}) {
        const color = config.color ?? 0x00ffff;
        const intensity = config.intensity ?? 0.5;
        const size = config.size ?? 1.2;
        // Create glow mesh
        let glowMesh = null;
        if (object instanceof THREE.Mesh) {
            const glowGeometry = object.geometry.clone();
            const glowMaterial = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: intensity,
                side: THREE.BackSide
            });
            glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            glowMesh.scale.multiplyScalar(size);
            object.add(glowMesh);
        }
        this.glowObjects.set(id, {
            object,
            glowMesh,
            color,
            intensity,
            baseIntensity: intensity,
            size,
            pulseSpeed: 0,
            pulseTime: 0
        });
    }
    /**
     * Add pulsing glow
     */
    addPulsingGlow(id, object, config = {}) {
        this.addGlow(id, object, config);
        const glowObj = this.glowObjects.get(id);
        if (glowObj) {
            glowObj.pulseSpeed = config.pulseSpeed ?? 2.0;
        }
    }
    /**
     * Update glow (call in animation loop)
     */
    update(deltaTime) {
        this.glowObjects.forEach((glowObj) => {
            if (glowObj.pulseSpeed > 0 && glowObj.glowMesh) {
                glowObj.pulseTime += deltaTime * glowObj.pulseSpeed;
                const pulseFactor = (Math.sin(glowObj.pulseTime) + 1) / 2;
                const currentIntensity = glowObj.baseIntensity * (0.5 + 0.5 * pulseFactor);
                if (glowObj.glowMesh.material instanceof THREE.MeshBasicMaterial) {
                    glowObj.glowMesh.material.opacity = currentIntensity;
                }
            }
        });
    }
    /**
     * Set glow intensity
     */
    setIntensity(id, intensity) {
        const glowObj = this.glowObjects.get(id);
        if (!glowObj || !glowObj.glowMesh)
            return;
        glowObj.intensity = intensity;
        glowObj.baseIntensity = intensity;
        if (glowObj.glowMesh.material instanceof THREE.MeshBasicMaterial) {
            glowObj.glowMesh.material.opacity = intensity;
        }
    }
    /**
     * Set glow color
     */
    setColor(id, color) {
        const glowObj = this.glowObjects.get(id);
        if (!glowObj || !glowObj.glowMesh)
            return;
        glowObj.color = color;
        if (glowObj.glowMesh.material instanceof THREE.MeshBasicMaterial) {
            glowObj.glowMesh.material.color.setHex(color);
        }
    }
    /**
     * Remove glow
     */
    removeGlow(id) {
        const glowObj = this.glowObjects.get(id);
        if (!glowObj)
            return;
        if (glowObj.glowMesh) {
            glowObj.object.remove(glowObj.glowMesh);
        }
        this.glowObjects.delete(id);
    }
    /**
     * Clear all glows
     */
    clearAll() {
        this.glowObjects.forEach((glowObj) => {
            if (glowObj.glowMesh) {
                glowObj.object.remove(glowObj.glowMesh);
            }
        });
        this.glowObjects.clear();
    }
    /**
     * Show/hide glow
     */
    setVisible(id, visible) {
        const glowObj = this.glowObjects.get(id);
        if (!glowObj || !glowObj.glowMesh)
            return;
        glowObj.glowMesh.visible = visible;
    }
}
