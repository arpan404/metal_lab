// physics-engine/renderer/scenes/NASCARScene.ts
import * as THREE from 'three';
import { BaseScene } from './BaseScene';
import { ModelLoader } from '../../utils/modelLoader';
/**
 * 3D scene for NASCAR banking experiment
 */
export class NASCARScene extends BaseScene {
    constructor(scene, experiment) {
        super(scene, experiment);
        this.car = null;
        this.track = null;
        this.nascar = experiment;
    }
    async initialize() {
        // Create banked track
        await this.createTrack();
        // Load car model
        await this.loadCar();
        // Create force vectors (hidden initially)
        this.createForceVectors();
        // Create environment
        this.createEnvironment();
    }
    async createTrack() {
        const radius = this.nascar.getParameter('trackRadius');
        const bankAngle = this.nascar.getParameter('bankAngle') * Math.PI / 180;
        const trackWidth = 10;
        // Create banked track using a custom geometry
        const segments = 64;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (2 * Math.PI * i) / segments;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            // Inner edge
            const innerX = (radius - trackWidth / 2) * cos;
            const innerZ = (radius - trackWidth / 2) * sin;
            const innerY = -(trackWidth / 2) * Math.tan(bankAngle);
            // Outer edge
            const outerX = (radius + trackWidth / 2) * cos;
            const outerZ = (radius + trackWidth / 2) * sin;
            const outerY = (trackWidth / 2) * Math.tan(bankAngle);
            // Add vertices
            positions.push(innerX, innerY, innerZ);
            positions.push(outerX, outerY, outerZ);
            // Add normals (perpendicular to banked surface)
            const normalX = -Math.sin(bankAngle) * cos;
            const normalY = Math.cos(bankAngle);
            const normalZ = -Math.sin(bankAngle) * sin;
            normals.push(normalX, normalY, normalZ);
            normals.push(normalX, normalY, normalZ);
            // Add UVs
            uvs.push(i / segments, 0);
            uvs.push(i / segments, 1);
            // Add indices
            if (i < segments) {
                const base = i * 2;
                indices.push(base, base + 1, base + 2);
                indices.push(base + 1, base + 3, base + 2);
            }
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        const material = this.createMaterial('plastic', {
            color: 0x333333,
            roughness: 0.8
        });
        this.track = new THREE.Mesh(geometry, material);
        this.track.receiveShadow = true;
        this.addObject('track', this.track);
    }
    async loadCar() {
        try {
            const loader = ModelLoader.getInstance();
            this.car = await loader.loadGLTF('/physics-engine/models/3d-assets/car.glb');
            // Scale and position car
            this.car.scale.setScalar(0.5);
            this.car.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            this.addObject('car', this.car);
        }
        catch (error) {
            console.warn('Could not load car model, using simple geometry');
            this.createSimpleCar();
        }
    }
    createSimpleCar() {
        const carGroup = new THREE.Group();
        // Body
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 4.5);
        const bodyMaterial = this.createMaterial('plastic', { color: 0xff0000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        carGroup.add(body);
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = this.createMaterial('plastic', { color: 0x111111 });
        const wheelPositions = [
            [-0.8, 0.4, 1.5],
            [0.8, 0.4, 1.5],
            [-0.8, 0.4, -1.5],
            [0.8, 0.4, -1.5]
        ];
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos[0], pos[1], pos[2]);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            carGroup.add(wheel);
        });
        this.car = carGroup;
        this.addObject('car', this.car);
    }
    createForceVectors() {
        // These will be updated in the update() method
        const arrowLength = 5;
        // Centripetal force (red)
        const centripetal = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), arrowLength, 0xff0000);
        centripetal.visible = false;
        this.addObject('force-centripetal', centripetal);
        // Normal force (green)
        const normal = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), arrowLength, 0x00ff00);
        normal.visible = false;
        this.addObject('force-normal', normal);
        // Friction force (blue)
        const friction = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), arrowLength, 0x0000ff);
        friction.visible = false;
        this.addObject('force-friction', friction);
    }
    createEnvironment() {
        // Grandstands (simple boxes)
        const standGeometry = new THREE.BoxGeometry(50, 10, 5);
        const standMaterial = this.createMaterial('plastic', { color: 0x666666 });
        const stand1 = new THREE.Mesh(standGeometry, standMaterial);
        stand1.position.set(0, 5, -250);
        stand1.receiveShadow = true;
        this.addObject('stand1', stand1);
        const stand2 = new THREE.Mesh(standGeometry, standMaterial);
        stand2.position.set(0, 5, 250);
        stand2.receiveShadow = true;
        this.addObject('stand2', stand2);
    }
    update(deltaTime) {
        const state = this.nascar.getState();
        if (this.car && state.objects.length > 0) {
            const carState = state.objects[0];
            // Update car position
            this.car.position.set(carState.position.x, carState.position.y, carState.position.z);
            // Update car rotation
            const angle = Math.atan2(carState.velocity.z, carState.velocity.x);
            this.car.rotation.y = -angle + Math.PI / 2;
            // Tilt car according to bank angle
            const bankAngle = this.nascar.getParameter('bankAngle') * Math.PI / 180;
            this.car.rotation.z = bankAngle;
        }
    }
    /**
     * Toggle force vector visibility
     */
    showForceVectors(show) {
        const centripetal = this.getObject('force-centripetal');
        const normal = this.getObject('force-normal');
        const friction = this.getObject('force-friction');
        if (centripetal)
            centripetal.visible = show;
        if (normal)
            normal.visible = show;
        if (friction)
            friction.visible = show;
    }
    dispose() {
        this.clearObjects();
    }
}
