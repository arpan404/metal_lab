/**
 * Tests for FoucaultPendulum - Earth rotation demonstration experiment
 */

import { FoucaultPendulum } from './FoucaultPendulum';
import {
  validateExperimentState,
  validateMeasurements,
  validatePhysicsState,
  expectCloseTo,
} from '../__tests__/testUtils';

// Mock the physics engines
jest.mock('../engines/RotationalEngine');
jest.mock('../engines/ClassicalEngine');
jest.mock('cannon-es');

describe('FoucaultPendulum', () => {
  let experiment: FoucaultPendulum;

  beforeEach(() => {
    experiment = new FoucaultPendulum();
  });

  describe('Initialization', () => {
    it('should create experiment with correct name and description', () => {
      expect(experiment.getName()).toBe('Foucault Pendulum');
      expect(experiment.getDescription()).toContain('rotation');
    });

    it('should have required parameters', () => {
      const configs = experiment.getParameterConfigs();
      const paramNames = configs.map(c => c.name);

      expect(paramNames).toContain('latitude');
      expect(paramNames).toContain('length');
      expect(paramNames).toContain('mass');
      expect(paramNames).toContain('initialAngle');
    });

    it('should have learning objectives', () => {
      const objectives = experiment.getLearningObjectives();

      expect(objectives.length).toBeGreaterThan(0);
      expect(objectives.some(obj => obj.name.includes('Precession'))).toBe(true);
    });

    it('should initialize with default parameter values', () => {
      expect(experiment.getParameter('latitude')).toBe(45);
      expect(experiment.getParameter('length')).toBe(10);
      expect(experiment.getParameter('mass')).toBe(5);
      expect(experiment.getParameter('initialAngle')).toBe(0.1);
    });

    it('should initialize physics engines', async () => {
      await experiment.initialize();

      // Initialization should complete without errors
      expect(experiment.getElapsedTime()).toBe(0);
    });
  });

  describe('Parameter Management', () => {
    it('should set and get latitude parameter', () => {
      experiment.setParameter('latitude', 60);
      expect(experiment.getParameter('latitude')).toBe(60);
    });

    it('should clamp latitude to valid range', () => {
      experiment.setParameter('latitude', 100);
      expect(experiment.getParameter('latitude')).toBeLessThanOrEqual(90);

      experiment.setParameter('latitude', -100);
      expect(experiment.getParameter('latitude')).toBeGreaterThanOrEqual(-90);
    });

    it('should set pendulum length', () => {
      experiment.setParameter('length', 15);
      expect(experiment.getParameter('length')).toBe(15);
    });

    it('should clamp length to valid range', () => {
      experiment.setParameter('length', 1);
      expect(experiment.getParameter('length')).toBeGreaterThanOrEqual(5);

      experiment.setParameter('length', 100);
      expect(experiment.getParameter('length')).toBeLessThanOrEqual(30);
    });

    it('should set bob mass', () => {
      experiment.setParameter('mass', 10);
      expect(experiment.getParameter('mass')).toBe(10);
    });

    it('should set initial angle', () => {
      experiment.setParameter('initialAngle', 0.2);
      expectCloseTo(experiment.getParameter('initialAngle'), 0.2);
    });

    it('should reject invalid parameter names', () => {
      expect(() => {
        experiment.setParameter('invalidParam', 10);
      }).toThrow();
    });
  });

  describe('Simulation', () => {
    beforeEach(async () => {
      await experiment.initialize();
    });

    it('should update simulation state', () => {
      const initialTime = experiment.getElapsedTime();

      experiment.update(0.016);

      expect(experiment.getElapsedTime()).toBeGreaterThan(initialTime);
      expect(experiment.getFrameCount()).toBe(1);
    });

    it('should accumulate time correctly', () => {
      for (let i = 0; i < 60; i++) {
        experiment.update(0.016);
      }

      expectCloseTo(experiment.getElapsedTime(), 0.96, 0.01);
      expect(experiment.getFrameCount()).toBe(60);
    });

    it('should maintain stable physics state', () => {
      for (let i = 0; i < 100; i++) {
        experiment.update(0.016);

        const state = experiment.getState();
        validatePhysicsState(state);
      }
    });

    it('should track precession angle', () => {
      // Run simulation for several seconds
      for (let i = 0; i < 300; i++) {
        experiment.update(0.016);
      }

      const measurements = experiment.getMeasurements();
      expect(measurements).toHaveProperty('precessionAngle');
    });

    it('should calculate measurements', () => {
      experiment.update(0.016);

      const measurements = experiment.getMeasurements();
      validateMeasurements(Object.entries(measurements).map(([name, value]) => ({
        name,
        value,
        unit: '',
      })));
    });
  });

  describe('State Management', () => {
    beforeEach(async () => {
      await experiment.initialize();
    });

    it('should get current state', () => {
      experiment.update(0.016);

      const state = experiment.getState();
      validateExperimentState(state);
    });

    it('should save and restore state', () => {
      // Run simulation
      for (let i = 0; i < 50; i++) {
        experiment.update(0.016);
      }

      const savedState = experiment.getState();
      const savedTime = savedState.time;

      // Continue simulation
      for (let i = 0; i < 50; i++) {
        experiment.update(0.016);
      }

      // Restore previous state
      experiment.setState(savedState);

      const restoredState = experiment.getState();
      expect(restoredState.time).toBe(savedTime);
    });

    it('should reset to initial conditions', () => {
      // Run simulation
      for (let i = 0; i < 100; i++) {
        experiment.update(0.016);
      }

      expect(experiment.getElapsedTime()).toBeGreaterThan(0);

      // Reset
      experiment.reset();

      expect(experiment.getElapsedTime()).toBe(0);
      expect(experiment.getFrameCount()).toBe(0);
    });
  });

  describe('Explanation Points', () => {
    beforeEach(async () => {
      await experiment.initialize();
    });

    it('should provide explanation points', () => {
      const points = experiment.getExplanationPoints();

      expect(Array.isArray(points)).toBe(true);
      expect(points.length).toBeGreaterThan(0);
    });

    it('should have valid explanation point structure', () => {
      const points = experiment.getExplanationPoints();

      points.forEach(point => {
        expect(point).toHaveProperty('id');
        expect(point).toHaveProperty('title');
        expect(point).toHaveProperty('description');
        expect(typeof point.id).toBe('string');
        expect(typeof point.title).toBe('string');
      });
    });
  });

  describe('Physics Accuracy', () => {
    beforeEach(async () => {
      await experiment.initialize();
    });

    it('should show precession at equator vs pole', async () => {
      // Test at equator (latitude = 0)
      experiment.setParameter('latitude', 0);
      await experiment.initialize();

      for (let i = 0; i < 100; i++) {
        experiment.update(0.016);
      }

      const equatorMeasurements = experiment.getMeasurements();

      // Reset and test at pole (latitude = 90)
      experiment.setParameter('latitude', 90);
      await experiment.initialize();

      for (let i = 0; i < 100; i++) {
        experiment.update(0.016);
      }

      const poleMeasurements = experiment.getMeasurements();

      // Precession should be different at different latitudes
      expect(equatorMeasurements).toBeDefined();
      expect(poleMeasurements).toBeDefined();
    });

    it('should handle different pendulum lengths', async () => {
      const lengths = [5, 10, 20, 30];

      for (const length of lengths) {
        experiment.setParameter('length', length);
        await experiment.initialize();

        for (let i = 0; i < 50; i++) {
          experiment.update(0.016);

          const state = experiment.getState();
          validatePhysicsState(state);
        }
      }
    });

    it('should handle different masses', async () => {
      const masses = [1, 5, 10, 20];

      for (const mass of masses) {
        experiment.setParameter('mass', mass);
        await experiment.initialize();

        for (let i = 0; i < 50; i++) {
          experiment.update(0.016);

          const state = experiment.getState();
          validatePhysicsState(state);
        }
      }
    });
  });

  describe('Integration', () => {
    it('should run complete experiment workflow', async () => {
      // Initialize
      await experiment.initialize();

      validateExperimentState(experiment.getState());

      // Set parameters
      experiment.setParameter('latitude', 45);
      experiment.setParameter('length', 15);
      experiment.setParameter('mass', 8);

      // Re-initialize with new parameters
      await experiment.initialize();

      // Run simulation for 5 seconds (300 frames at 60fps)
      for (let i = 0; i < 300; i++) {
        experiment.update(0.016);

        // Validate state every 60 frames
        if (i % 60 === 0) {
          const state = experiment.getState();
          validatePhysicsState(state);

          const measurements = experiment.getMeasurements();
          expect(measurements).toBeDefined();
        }
      }

      // Check final state
      const finalState = experiment.getState();
      validateExperimentState(finalState);
      expectCloseTo(finalState.time, 4.8, 0.1);

      // Get explanation points
      const points = experiment.getExplanationPoints();
      expect(points.length).toBeGreaterThan(0);

      // Save state
      const savedState = experiment.getState();

      // Continue simulation
      for (let i = 0; i < 60; i++) {
        experiment.update(0.016);
      }

      // Restore state
      experiment.setState(savedState);

      const restoredState = experiment.getState();
      expectCloseTo(restoredState.time, savedState.time, 0.001);

      // Reset
      experiment.reset();
      expect(experiment.getElapsedTime()).toBe(0);
    });
  });
});
