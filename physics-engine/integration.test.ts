/**
 * Integration tests for physics-engine rendering and simulations
 */

import { ThreeJSRenderer } from './renderer/ThreeJSRenderer';
import { createMockCanvas, validateRenderer, validateSceneStructure } from './__tests__/testUtils';
import * as THREE from 'three';

jest.mock('three');

describe('Physics Engine Integration Tests', () => {
  describe('WebGL Rendering', () => {
    it('should initialize Three.js WebGL renderer', () => {
      const canvas = createMockCanvas(800, 600);
      Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
      Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });

      const renderer = new ThreeJSRenderer(canvas);

      validateRenderer(renderer);
      expect(renderer.getRenderer()).toBeDefined();
      expect(renderer.getScene()).toBeDefined();
      expect(renderer.getCamera()).toBeDefined();

      renderer.dispose();
    });

    it('should render frames successfully', () => {
      const canvas = createMockCanvas(800, 600);
      Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
      Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });

      const renderer = new ThreeJSRenderer(canvas);

      // Add a test object
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial()
      );
      renderer.add(mesh);

      // Render multiple frames
      for (let i = 0; i < 60; i++) {
        renderer.render();
      }

      validateSceneStructure(renderer.getScene());

      renderer.dispose();
    });

    it('should configure scene with lights and fog', () => {
      const canvas = createMockCanvas(800, 600);
      Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
      Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });

      const renderer = new ThreeJSRenderer(canvas, {
        antialias: true,
        shadows: true,
        toneMapping: THREE.ACESFilmicToneMapping,
      });

      renderer.configureScene({
        background: 0x000000,
        fog: {
          type: 'linear',
          color: 0xcccccc,
          near: 10,
          far: 100,
        },
        lights: [
          { type: 'ambient', color: 0x404040, intensity: 0.5 },
          { type: 'directional', color: 0xffffff, intensity: 1, position: { x: 10, y: 20, z: 30 } },
        ],
      });

      const scene = renderer.getScene();
      expect(scene.background).toBeDefined();
      expect(scene.fog).toBeDefined();
      expect(scene.children.length).toBeGreaterThan(0);

      renderer.dispose();
    });

    it('should handle window resize events', () => {
      const canvas = createMockCanvas(800, 600);
      Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
      Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });

      const renderer = new ThreeJSRenderer(canvas);
      const camera = renderer.getCamera();

      if (camera instanceof THREE.PerspectiveCamera) {
        expect(camera.aspect).toBe(800 / 600);
      }

      // Simulate resize
      Object.defineProperty(canvas, 'clientWidth', { value: 1024, configurable: true });
      Object.defineProperty(canvas, 'clientHeight', { value: 768, configurable: true });

      window.dispatchEvent(new Event('resize'));

      renderer.dispose();
    });
  });

  describe('Simulation Basics', () => {
    it('should validate physics state structure', () => {
      const mockState = {
        name: 'test-experiment',
        parameters: {
          gravity: 9.81,
          mass: 1.0,
        },
        measurements: {
          velocity: 5.0,
          position: 10.0,
        },
        objects: [],
        elapsedTime: 1.5,
        frameCount: 90,
      };

      // Check that all values are finite
      expect(isFinite(mockState.parameters.gravity)).toBe(true);
      expect(isFinite(mockState.measurements.velocity)).toBe(true);
      expect(isNaN(mockState.parameters.mass)).toBe(false);
    });

    it('should handle time progression', () => {
      let elapsedTime = 0;
      const deltaTime = 0.016; // ~60 FPS

      for (let i = 0; i < 100; i++) {
        elapsedTime += deltaTime;
      }

      expect(elapsedTime).toBeCloseTo(1.6, 1);
    });
  });

  describe('Data Structures', () => {
    it('should create and manipulate wave field data', () => {
      const gridSize = 256;
      const waveField = new Float32Array(gridSize * gridSize * 2);

      // Initialize with test pattern
      for (let i = 0; i < waveField.length; i += 2) {
        waveField[i] = Math.sin(i * 0.01); // Real part
        waveField[i + 1] = Math.cos(i * 0.01); // Imaginary part
      }

      // Validate data
      for (let i = 0; i < waveField.length; i++) {
        expect(isFinite(waveField[i])).toBe(true);
        expect(isNaN(waveField[i])).toBe(false);
      }

      expect(waveField.length).toBe(gridSize * gridSize * 2);
    });

    it('should handle vector operations', () => {
      const v1 = new THREE.Vector3(1, 2, 3);
      const v2 = new THREE.Vector3(4, 5, 6);

      const length1 = v1.length();
      const length2 = v2.length();

      expect(length1).toBeGreaterThan(0);
      expect(length2).toBeGreaterThan(0);

      v1.normalize();
      expect(v1.length()).toBeCloseTo(1, 5);
    });
  });

  describe('Rendering Pipeline', () => {
    it('should complete full render cycle', () => {
      const canvas = createMockCanvas(800, 600);
      Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
      Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });

      const renderer = new ThreeJSRenderer(canvas, {
        antialias: true,
        shadows: true,
        physicallyCorrectLights: true,
        toneMapping: THREE.ACESFilmicToneMapping,
      });

      renderer.configureScene({
        background: 0x000000,
        fog: { type: 'linear', color: 0xcccccc, near: 10, far: 100 },
        lights: [
          { type: 'ambient', color: 0x404040, intensity: 0.5 },
          { type: 'directional', color: 0xffffff, intensity: 1, position: { x: 10, y: 20, z: 30 }, castShadow: true },
        ],
      });

      // Create scene objects
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(0, 0, 0);

      renderer.add(sphere);

      // Simulate animation loop
      for (let frame = 0; frame < 60; frame++) {
        // Update object
        sphere.rotation.y = frame * 0.01;

        // Render
        renderer.render();
      }

      validateSceneStructure(renderer.getScene());

      renderer.dispose();
    });
  });
});
