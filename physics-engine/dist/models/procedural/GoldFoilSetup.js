// physics-engine/models/procedural/GoldFoilSetup.ts
import * as THREE from 'three';
export class GoldFoilSetup {
    constructor(config) {
        this.detectors = [];
        this.group = new THREE.Group();
        this.config = {
            showDetectors: true,
            ...config,
        };
        this.buildSetup();
    }
    buildSetup() {
        // Create gold foil (thin disc)
        const foilGeometry = new THREE.CylinderGeometry(this.config.foilRadius, this.config.foilRadius, this.config.foilThickness, 64);
        const foilMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0xFFAA00,
            emissiveIntensity: 0.05,
        });
        this.foilMesh = new THREE.Mesh(foilGeometry, foilMaterial);
        this.foilMesh.rotation.x = Math.PI / 2;
        this.group.add(this.foilMesh);
        // Create particle source
        this.createSource();
        // Create detectors if enabled
        if (this.config.showDetectors) {
            this.createDetectors();
        }
        // Add coordinate axes for reference
        this.addAxes();
    }
    createSource() {
        // Alpha particle source (radioactive material)
        const sourceGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const sourceMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5,
        });
        const source = new THREE.Mesh(sourceGeometry, sourceMaterial);
        source.position.z = -this.config.sourceDistance;
        this.group.add(source);
        // Add shielding visualization
        const shieldGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16);
        const shieldMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.8,
            roughness: 0.3,
        });
        const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        shield.position.z = -this.config.sourceDistance;
        shield.rotation.x = Math.PI / 2;
        this.group.add(shield);
        // Add collimator (narrow beam)
        const collimatorGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16);
        const collimator = new THREE.Mesh(collimatorGeometry, shieldMaterial);
        collimator.position.z = -this.config.sourceDistance + 0.4;
        collimator.rotation.x = Math.PI / 2;
        this.group.add(collimator);
    }
    createDetectors() {
        const { detectorRadius, detectorCount } = this.config;
        const detectorGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.1);
        const detectorMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            metalness: 0.5,
            roughness: 0.5,
            transparent: true,
            opacity: 0.7,
        });
        // Place detectors in a semi-circle around the foil
        for (let i = 0; i < detectorCount; i++) {
            const angle = (i / (detectorCount - 1)) * Math.PI; // 0 to π (180 degrees)
            const x = detectorRadius * Math.cos(angle);
            const z = detectorRadius * Math.sin(angle);
            const detector = new THREE.Mesh(detectorGeometry, detectorMaterial.clone());
            detector.position.set(x, 0, z);
            detector.lookAt(0, 0, 0);
            this.detectors.push(detector);
            this.group.add(detector);
        }
    }
    addAxes() {
        const axesHelper = new THREE.AxesHelper(2);
        axesHelper.position.y = -0.5;
        this.group.add(axesHelper);
    }
    getObject3D() {
        return this.group;
    }
    highlightDetector(index, intensity = 1.0) {
        if (index >= 0 && index < this.detectors.length) {
            const material = this.detectors[index].material;
            material.emissive.setHex(0x00ff00);
            material.emissiveIntensity = intensity;
        }
    }
    resetDetectors() {
        this.detectors.forEach(detector => {
            const material = detector.material;
            material.emissiveIntensity = 0;
        });
    }
    dispose() {
        this.foilMesh?.geometry.dispose();
        (this.foilMesh?.material).dispose();
        this.detectors.forEach(detector => {
            detector.geometry.dispose();
            detector.material.dispose();
        });
    }
}
