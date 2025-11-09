// physics-engine/renderer/scenes/MillikanScene.ts
import * as THREE from 'three';
import { BaseScene } from './BaseScene';
/**
 * 3D scene for Millikan oil drop experiment
 */
export class MillikanScene extends BaseScene {
    constructor(scene, experiment) {
        super(scene, experiment);
        this.chamber = null;
        this.plates = null;
        this.droplets = new Map();
        this.fieldLines = null;
        this.millikan = experiment;
    }
    async initialize() {
        // Create chamber
        this.createChamber();
        // Create parallel plates
        this.createPlates();
        // Create field lines
        this.createFieldLines();
        // Create light source
        this.createLightSource();
    }
    createChamber() {
        const width = 5;
        const height = 8;
        const depth = 5;
        // Chamber walls (transparent)
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = this.createMaterial('glass', {
            color: 0xccccff,
            opacity: 0.2
        });
        this.chamber = new THREE.Mesh(geometry, material);
        this.addObject('chamber', this.chamber);
        // Frame
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });
        const frame = new THREE.LineSegments(edges, lineMaterial);
        this.addObject('frame', frame);
    }
    createPlates() {
        const plateWidth = 4;
        const plateHeight = 0.1;
        const plateDepth = 4;
        const separation = this.millikan.getParameter('plateSeparation') * 100; // Scale up for visibility
        this.plates = new THREE.Group();
        // Top plate (positive)
        const topGeometry = new THREE.BoxGeometry(plateWidth, plateHeight, plateDepth);
        const topMaterial = this.createMaterial('metal', { color: 0xff0000 });
        const topPlate = new THREE.Mesh(topGeometry, topMaterial);
        topPlate.position.y = separation / 2;
        this.plates.add(topPlate);
        // Bottom plate (negative)
        const bottomGeometry = new THREE.BoxGeometry(plateWidth, plateHeight, plateDepth);
        const bottomMaterial = this.createMaterial('metal', { color: 0x0000ff });
        const bottomPlate = new THREE.Mesh(bottomGeometry, bottomMaterial);
        bottomPlate.position.y = -separation / 2;
        this.plates.add(bottomPlate);
        this.addObject('plates', this.plates);
    }
    createFieldLines() {
        this.fieldLines = new THREE.Group();
        const lineCount = 10;
        const lineLength = this.millikan.getParameter('plateSeparation') * 100;
        const spacing = 4 / lineCount;
        for (let i = 0; i < lineCount; i++) {
            for (let j = 0; j < lineCount; j++) {
                const x = -2 + i * spacing;
                const z = -2 + j * spacing;
                const points = [
                    new THREE.Vector3(x, lineLength / 2, z),
                    new THREE.Vector3(x, -lineLength / 2, z)
                ];
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({
                    color: 0xffff00,
                    transparent: true,
                    opacity: 0.3
                });
                const line = new THREE.Line(geometry, material);
                this.fieldLines.add(line);
            }
        }
        this.fieldLines.visible = false;
        this.addObject('fieldLines', this.fieldLines);
    }
    createLightSource() {
        // Microscope light
        const lightGeometry = new THREE.ConeGeometry(0.5, 1, 16);
        const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(3, 0, 0);
        light.rotation.z = -Math.PI / 2;
        this.addObject('light', light);
        // Light beam
        const beamGeometry = new THREE.CylinderGeometry(0.05, 1, 5, 16);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0.3
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(0.5, 0, 0);
        beam.rotation.z = Math.PI / 2;
        this.addObject('beam', beam);
    }
    update(deltaTime) {
        const state = this.millikan.getState();
        state.objects.forEach((dropletState) => {
            let droplet = this.droplets.get(dropletState.id);
            if (!droplet) {
                // Create new droplet
                const geometry = new THREE.SphereGeometry(0.05, 16, 16);
                const material = new THREE.MeshStandardMaterial({
                    color: 0x8b7355,
                    transparent: true,
                    opacity: 0.7,
                    metalness: 0.3,
                    roughness: 0.4
                });
                droplet = new THREE.Mesh(geometry, material);
                this.scene.add(droplet);
                this.droplets.set(dropletState.id, droplet);
            }
            // Update position (scale up for visibility)
            droplet.position.set(dropletState.position.x * 100, dropletState.position.y * 100, dropletState.position.z * 100);
        });
        // Remove droplets that are no longer in experiment
        const activeIds = new Set(state.objects.map((obj) => obj.id));
        this.droplets.forEach((droplet, id) => {
            if (!activeIds.has(id)) {
                this.scene.remove(droplet);
                this.droplets.delete(id);
            }
        });
    }
    /**
     * Toggle field line visibility
     */
    showFieldLines(show) {
        if (this.fieldLines) {
            this.fieldLines.visible = show;
        }
    }
    dispose() {
        this.clearObjects();
        this.droplets.forEach(droplet => this.scene.remove(droplet));
        this.droplets.clear();
    }
}
