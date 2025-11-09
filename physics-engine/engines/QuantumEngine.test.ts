/**
 * Tests for QuantumEngine - WebGPU-based quantum simulation engine
 */

import { QuantumEngine } from './QuantumEngine';
import { createMockGPUDevice, createMockWaveField } from '../__tests__/testUtils';

describe('QuantumEngine', () => {
  let engine: QuantumEngine;

  beforeEach(() => {
    engine = new QuantumEngine();
  });

  describe('Initialization', () => {
    it('should create engine instance', () => {
      expect(engine).toBeDefined();
    });

    it('should initialize with WebGPU', async () => {
      await engine.initialize();

      // Should initialize without errors
      expect(engine).toBeDefined();
    });

    it('should throw error if WebGPU not supported', async () => {
      // Temporarily remove WebGPU support
      const originalGpu = navigator.gpu;
      (navigator as any).gpu = undefined;

      await expect(engine.initialize()).rejects.toThrow('WebGPU not supported');

      // Restore
      (navigator as any).gpu = originalGpu;
    });

    it('should load compute shaders', async () => {
      // Mock fetch for shader loading
      global.fetch = jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue('mock shader code'),
      });

      await engine.initialize();

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Wave Evolution Computation', () => {
    beforeEach(async () => {
      // Mock fetch for shader loading
      global.fetch = jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue('mock shader code'),
      });

      await engine.initialize();
    });

    it('should compute wave evolution', async () => {
      const gridSize = 256;
      const waveData = createMockWaveField(gridSize);

      const params = {
        gridSize,
        deltaTime: 0.016,
        wavelength: 500e-9,
        slitSeparation: 1e-3,
        slitWidth: 1e-4,
      };

      const result = await engine.computeWaveEvolution(waveData, params);

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(waveData.length);
    });

    it('should handle different grid sizes', async () => {
      const sizes = [128, 256, 512];

      for (const size of sizes) {
        const waveData = createMockWaveField(size);

        const params = {
          gridSize: size,
          deltaTime: 0.016,
          wavelength: 500e-9,
          slitSeparation: 1e-3,
          slitWidth: 1e-4,
        };

        const result = await engine.computeWaveEvolution(waveData, params);

        expect(result.length).toBe(waveData.length);
      }
    });

    it('should preserve wave data structure', async () => {
      const gridSize = 256;
      const waveData = createMockWaveField(gridSize);

      const params = {
        gridSize,
        deltaTime: 0.016,
        wavelength: 500e-9,
        slitSeparation: 1e-3,
        slitWidth: 1e-4,
      };

      const result = await engine.computeWaveEvolution(waveData, params);

      // Result should have same structure (real, imag pairs)
      expect(result.length % 2).toBe(0);
    });

    it('should throw error if not initialized', async () => {
      const uninitializedEngine = new QuantumEngine();
      const waveData = createMockWaveField(256);

      const params = {
        gridSize: 256,
        deltaTime: 0.016,
        wavelength: 500e-9,
        slitSeparation: 1e-3,
        slitWidth: 1e-4,
      };

      await expect(
        uninitializedEngine.computeWaveEvolution(waveData, params)
      ).rejects.toThrow('Engine not initialized');
    });
  });

  describe('Parameter Handling', () => {
    beforeEach(async () => {
      global.fetch = jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue('mock shader code'),
      });

      await engine.initialize();
    });

    it('should handle different wavelengths', async () => {
      const wavelengths = [400e-9, 500e-9, 600e-9, 700e-9];

      for (const wavelength of wavelengths) {
        const waveData = createMockWaveField(256);

        const params = {
          gridSize: 256,
          deltaTime: 0.016,
          wavelength,
          slitSeparation: 1e-3,
          slitWidth: 1e-4,
        };

        const result = await engine.computeWaveEvolution(waveData, params);

        expect(result).toBeDefined();
        expect(result.length).toBe(waveData.length);
      }
    });

    it('should handle different time steps', async () => {
      const timeSteps = [0.001, 0.016, 0.033, 0.1];

      for (const deltaTime of timeSteps) {
        const waveData = createMockWaveField(256);

        const params = {
          gridSize: 256,
          deltaTime,
          wavelength: 500e-9,
          slitSeparation: 1e-3,
          slitWidth: 1e-4,
        };

        const result = await engine.computeWaveEvolution(waveData, params);

        expect(result).toBeDefined();
      }
    });
  });

  describe('Interference Pattern Calculation', () => {
    beforeEach(async () => {
      global.fetch = jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue('mock shader code'),
      });

      await engine.initialize();
    });

    it('should compute interference pattern', async () => {
      const params = {
        wavelength: 500e-9,
        slitSeparation: 1e-3,
        slitWidth: 1e-4,
        screenDistance: 1.0,
        gridSize: 256,
      };

      const pattern = await engine.computeInterferencePattern(params);

      expect(pattern).toBeInstanceOf(Float32Array);
      expect(pattern.length).toBeGreaterThan(0);
    });

    it('should produce different patterns for different separations', async () => {
      const baseParams = {
        wavelength: 500e-9,
        slitWidth: 1e-4,
        screenDistance: 1.0,
        gridSize: 256,
      };

      const pattern1 = await engine.computeInterferencePattern({
        ...baseParams,
        slitSeparation: 0.5e-3,
      });

      const pattern2 = await engine.computeInterferencePattern({
        ...baseParams,
        slitSeparation: 2e-3,
      });

      // Patterns should be different
      let different = false;
      for (let i = 0; i < Math.min(pattern1.length, pattern2.length); i++) {
        if (Math.abs(pattern1[i] - pattern2[i]) > 0.01) {
          different = true;
          break;
        }
      }

      expect(different).toBe(true);
    });
  });

  describe('Buffer Management', () => {
    beforeEach(async () => {
      global.fetch = jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue('mock shader code'),
      });

      await engine.initialize();
    });

    it('should create and manage GPU buffers', async () => {
      const waveData = createMockWaveField(256);

      const params = {
        gridSize: 256,
        deltaTime: 0.016,
        wavelength: 500e-9,
        slitSeparation: 1e-3,
        slitWidth: 1e-4,
      };

      // Multiple computations should reuse buffers
      await engine.computeWaveEvolution(waveData, params);
      await engine.computeWaveEvolution(waveData, params);
      await engine.computeWaveEvolution(waveData, params);

      // Should complete without errors
      expect(true).toBe(true);
    });

    it('should clean up buffers on dispose', async () => {
      const waveData = createMockWaveField(256);

      const params = {
        gridSize: 256,
        deltaTime: 0.016,
        wavelength: 500e-9,
        slitSeparation: 1e-3,
        slitWidth: 1e-4,
      };

      await engine.computeWaveEvolution(waveData, params);

      engine.dispose();

      // After disposal, new computation should fail
      await expect(
        engine.computeWaveEvolution(waveData, params)
      ).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      global.fetch = jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue('mock shader code'),
      });

      await engine.initialize();
    });

    it('should handle rapid sequential computations', async () => {
      const waveData = createMockWaveField(256);

      const params = {
        gridSize: 256,
        deltaTime: 0.016,
        wavelength: 500e-9,
        slitSeparation: 1e-3,
        slitWidth: 1e-4,
      };

      // Perform 10 rapid computations
      for (let i = 0; i < 10; i++) {
        const result = await engine.computeWaveEvolution(waveData, params);
        expect(result).toBeDefined();
      }
    });

    it('should handle large grid sizes', async () => {
      const gridSize = 512;
      const waveData = createMockWaveField(gridSize);

      const params = {
        gridSize,
        deltaTime: 0.016,
        wavelength: 500e-9,
        slitSeparation: 1e-3,
        slitWidth: 1e-4,
      };

      const result = await engine.computeWaveEvolution(waveData, params);

      expect(result.length).toBe(gridSize * gridSize * 2);
    });
  });

  describe('Integration', () => {
    it('should run complete quantum simulation workflow', async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue('mock shader code'),
      });

      // Initialize engine
      await engine.initialize();

      // Create initial wave field
      const gridSize = 256;
      let waveData = createMockWaveField(gridSize);

      const params = {
        gridSize,
        deltaTime: 0.016,
        wavelength: 500e-9,
        slitSeparation: 1e-3,
        slitWidth: 1e-4,
      };

      // Simulate wave evolution over time
      for (let step = 0; step < 10; step++) {
        waveData = await engine.computeWaveEvolution(waveData, params);

        // Verify data integrity
        expect(waveData.length).toBe(gridSize * gridSize * 2);

        // Check for NaN or Infinity
        for (let i = 0; i < waveData.length; i++) {
          expect(isNaN(waveData[i])).toBe(false);
          expect(isFinite(waveData[i])).toBe(true);
        }
      }

      // Compute interference pattern
      const pattern = await engine.computeInterferencePattern(params);

      expect(pattern).toBeDefined();
      expect(pattern.length).toBeGreaterThan(0);

      // Cleanup
      engine.dispose();
    });
  });
});
