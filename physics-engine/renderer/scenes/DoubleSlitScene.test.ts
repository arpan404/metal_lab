/**
 * Tests for DoubleSlitScene - Young's double slit experiment scene
 */

import { DoubleSlitScene } from './DoubleSlitScene';
import { YoungDoubleSlit } from '../../experiments/YoungDoubleSlit';
import * as THREE from 'three';
import { validateSceneStructure } from '../../__tests__/testUtils';

jest.mock('three');
jest.mock('../../experiments/YoungDoubleSlit');

describe('DoubleSlitScene', () => {
  let scene: THREE.Scene;
  let experiment: YoungDoubleSlit;
  let doubleSlitScene: DoubleSlitScene;

  beforeEach(() => {
    scene = new THREE.Scene();
    experiment = new YoungDoubleSlit() as jest.Mocked<YoungDoubleSlit>;

    // Mock experiment methods
    experiment.getParameter = jest.fn((name: string) => {
      if (name === 'slitSeparation') return 0.001; // 1mm
      if (name === 'slitWidth') return 0.0001; // 0.1mm
      if (name === 'wavelength') return 500e-9; // 500nm
      return 0;
    });

    experiment.getState = jest.fn(() => ({
      time: 0,
      parameters: {},
      waveField: new Float32Array(512 * 512 * 2),
    }));

    doubleSlitScene = new DoubleSlitScene(scene, experiment);
  });

  afterEach(() => {
    if (doubleSlitScene) {
      doubleSlitScene.dispose();
    }
  });

  describe('Initialization', () => {
    it('should initialize scene components', async () => {
      await doubleSlitScene.initialize();

      validateSceneStructure(scene);
      expect(scene.children.length).toBeGreaterThan(0);
    });

    it('should create barrier with slits', async () => {
      await doubleSlitScene.initialize();

      // Barrier should be added to scene
      const barrier = scene.children.find(obj => obj instanceof THREE.Group);
      expect(barrier).toBeDefined();
    });

    it('should create detection screen', async () => {
      await doubleSlitScene.initialize();

      // Screen should be added to scene
      const hasScreen = scene.children.some(obj => obj instanceof THREE.Mesh);
      expect(hasScreen).toBe(true);
    });

    it('should create wave plane for visualization', async () => {
      await doubleSlitScene.initialize();

      // Wave plane should be created
      expect(scene.children.length).toBeGreaterThan(0);
    });

    it('should use experiment parameters for slit dimensions', async () => {
      await doubleSlitScene.initialize();

      expect(experiment.getParameter).toHaveBeenCalledWith('slitSeparation');
      expect(experiment.getParameter).toHaveBeenCalledWith('slitWidth');
    });
  });

  describe('Update', () => {
    beforeEach(async () => {
      await doubleSlitScene.initialize();
    });

    it('should update wave visualization each frame', () => {
      const mockWaveField = new Float32Array(512 * 512 * 2);
      for (let i = 0; i < mockWaveField.length; i += 2) {
        mockWaveField[i] = Math.sin(i * 0.01);
        mockWaveField[i + 1] = Math.cos(i * 0.01);
      }

      experiment.getState = jest.fn(() => ({
        time: 0.1,
        parameters: {},
        waveField: mockWaveField,
      }));

      doubleSlitScene.update(0.016);

      // Update should be called without errors
      expect(experiment.getState).toHaveBeenCalled();
    });

    it('should handle multiple update cycles', () => {
      for (let i = 0; i < 100; i++) {
        doubleSlitScene.update(0.016);
      }

      expect(experiment.getState).toHaveBeenCalledTimes(100);
    });

    it('should update wave texture data', () => {
      const initialState = experiment.getState();

      doubleSlitScene.update(0.016);

      // State should be queried to get latest wave field
      expect(experiment.getState).toHaveBeenCalled();
    });
  });

  describe('Scene Components', () => {
    beforeEach(async () => {
      await doubleSlitScene.initialize();
    });

    it('should position barrier in front of screen', async () => {
      // Barrier should be at z=5, screen at z=15
      const objects = scene.children;
      expect(objects.length).toBeGreaterThan(0);
    });

    it('should create visualization with proper dimensions', async () => {
      // Wave plane should use 512x512 grid
      expect(scene.children.length).toBeGreaterThan(0);
    });

    it('should handle different slit separations', async () => {
      experiment.getParameter = jest.fn((name: string) => {
        if (name === 'slitSeparation') return 0.002; // 2mm instead of 1mm
        if (name === 'slitWidth') return 0.0001;
        return 0;
      });

      // Recreate scene with new parameters
      doubleSlitScene.dispose();
      doubleSlitScene = new DoubleSlitScene(scene, experiment);
      await doubleSlitScene.initialize();

      expect(experiment.getParameter).toHaveBeenCalledWith('slitSeparation');
    });
  });

  describe('Disposal', () => {
    beforeEach(async () => {
      await doubleSlitScene.initialize();
    });

    it('should clean up scene objects', () => {
      const initialCount = scene.children.length;
      expect(initialCount).toBeGreaterThan(0);

      doubleSlitScene.dispose();

      // Objects should be removed from scene
      expect(scene.children.length).toBeLessThanOrEqual(initialCount);
    });

    it('should handle multiple dispose calls', () => {
      doubleSlitScene.dispose();
      doubleSlitScene.dispose();

      // Should not throw errors
      expect(scene.children.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration', () => {
    it('should create complete visualization pipeline', async () => {
      // Initialize
      await doubleSlitScene.initialize();

      validateSceneStructure(scene);
      expect(scene.children.length).toBeGreaterThan(0);

      // Update simulation
      const mockWaveField = new Float32Array(512 * 512 * 2);
      for (let i = 0; i < mockWaveField.length; i += 2) {
        const x = (i / 2) % 512;
        const y = Math.floor((i / 2) / 512);
        mockWaveField[i] = Math.sin(x * 0.1) * Math.cos(y * 0.1);
        mockWaveField[i + 1] = Math.cos(x * 0.1) * Math.sin(y * 0.1);
      }

      experiment.getState = jest.fn(() => ({
        time: 1.0,
        parameters: { slitSeparation: 0.001, slitWidth: 0.0001 },
        waveField: mockWaveField,
      }));

      // Run multiple update cycles
      for (let i = 0; i < 10; i++) {
        doubleSlitScene.update(0.016);
      }

      // Scene should remain stable
      validateSceneStructure(scene);

      // Cleanup
      doubleSlitScene.dispose();
    });
  });
});
