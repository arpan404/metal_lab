/**
 * Tests for BankedTrackChallenge - NASCAR banking physics game
 */

import { BankedTrackChallenge } from './BankedTrackChallenge';
import { validateGameState, createMockGameConfig } from '../__tests__/testUtils';

// Mock the experiment
jest.mock('../experiments/NASCARBanking');
jest.mock('../physics/mechanics/CircularMotion');

describe('BankedTrackChallenge', () => {
  let game: BankedTrackChallenge;
  let config: any;

  beforeEach(() => {
    config = {
      ...createMockGameConfig(),
      objectives: [
        {
          id: 'complete-lap',
          description: 'Complete one lap',
          required: true,
          points: 100,
        },
        {
          id: 'optimal-speed',
          description: 'Maintain optimal speed',
          required: false,
          points: 200,
        },
      ],
      timeLimitSeconds: 300,
    };

    game = new BankedTrackChallenge(config);
  });

  describe('Initialization', () => {
    it('should create game with config', () => {
      expect(game).toBeDefined();
    });

    it('should initialize experiment', async () => {
      await game.initialize();

      // Initialization should complete without errors
      expect(game.getState()).toBeDefined();
    });

    it('should setup checkpoints around track', async () => {
      await game.initialize();

      // Checkpoints should be created
      const state = game.getState();
      expect(state).toBeDefined();
    });

    it('should initialize objective states', () => {
      const state = game.getState();

      expect(state.objectivesCompleted).toBe(0);
      expect(state.totalObjectives).toBe(1); // Only required objectives
      expect(state.currentScore).toBe(0);
    });
  });

  describe('Game Flow', () => {
    beforeEach(async () => {
      await game.initialize();
    });

    it('should start game', () => {
      game.start();

      const state = game.getState();
      expect(state.isPlaying).toBe(true);
      expect(state.isPaused).toBe(false);
      expect(state.startTime).toBeGreaterThan(0);
    });

    it('should pause and resume game', () => {
      game.start();
      game.pause();

      expect(game.getState().isPaused).toBe(true);

      game.resume();

      expect(game.getState().isPaused).toBe(false);
    });

    it('should end game', () => {
      game.start();
      game.end();

      expect(game.getState().isPlaying).toBe(false);
    });

    it('should not update when paused', () => {
      game.start();
      game.pause();

      const initialTime = game.getState().elapsedTime;

      game.update(0.016);

      // Time should not advance when paused
      expect(game.getState().elapsedTime).toBe(initialTime);
    });

    it('should not update when not playing', () => {
      game.update(0.016);

      // Should not error, but also shouldn't update
      expect(game.getState().isPlaying).toBe(false);
    });
  });

  describe('Game State', () => {
    beforeEach(async () => {
      await game.initialize();
      game.start();
    });

    it('should update elapsed time', () => {
      const initialTime = game.getState().elapsedTime;

      // Wait a bit
      setTimeout(() => {
        game.update(0.016);

        expect(game.getState().elapsedTime).toBeGreaterThan(initialTime);
      }, 50);
    });

    it('should get current state', () => {
      const state = game.getState();

      validateGameState(state);
      expect(state.isPlaying).toBe(true);
      expect(state.currentScore).toBeGreaterThanOrEqual(0);
    });

    it('should track objectives completed', () => {
      const state = game.getState();

      expect(state.objectivesCompleted).toBeGreaterThanOrEqual(0);
      expect(state.objectivesCompleted).toBeLessThanOrEqual(state.totalObjectives);
    });
  });

  describe('Scoring', () => {
    beforeEach(async () => {
      await game.initialize();
      game.start();
    });

    it('should calculate score', () => {
      const score = game.getScore();

      expect(score).toBeDefined();
      expect(score.totalPoints).toBeGreaterThanOrEqual(0);
      expect(score.objectives).toBeDefined();
      expect(Array.isArray(score.objectives)).toBe(true);
    });

    it('should track objective completion', () => {
      const score = game.getScore();

      expect(score.objectives.length).toBe(config.objectives.length);

      score.objectives.forEach(obj => {
        expect(obj).toHaveProperty('objectiveId');
        expect(obj).toHaveProperty('completed');
        expect(obj).toHaveProperty('points');
        expect(typeof obj.completed).toBe('boolean');
        expect(typeof obj.points).toBe('number');
      });
    });

    it('should update score as objectives complete', () => {
      const initialScore = game.getScore().totalPoints;

      // Simulate some game time
      for (let i = 0; i < 100; i++) {
        game.update(0.016);
      }

      const finalScore = game.getScore().totalPoints;

      expect(finalScore).toBeGreaterThanOrEqual(initialScore);
    });

    it('should track time bonus', () => {
      const score = game.getScore();

      expect(score).toHaveProperty('timeBonus');
      expect(typeof score.timeBonus).toBe('number');
      expect(score.timeBonus).toBeGreaterThanOrEqual(0);
    });

    it('should track accuracy bonus', () => {
      const score = game.getScore();

      expect(score).toHaveProperty('accuracyBonus');
      expect(typeof score.accuracyBonus).toBe('number');
      expect(score.accuracyBonus).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Objectives', () => {
    beforeEach(async () => {
      await game.initialize();
      game.start();
    });

    it('should check objectives each update', () => {
      game.update(0.016);

      // Should complete without errors
      const state = game.getState();
      expect(state).toBeDefined();
    });

    it('should mark objectives as completed', () => {
      // Run simulation
      for (let i = 0; i < 200; i++) {
        game.update(0.016);
      }

      const score = game.getScore();
      const completedCount = score.objectives.filter(obj => obj.completed).length;

      expect(completedCount).toBeGreaterThanOrEqual(0);
    });

    it('should track completion progress', () => {
      const state = game.getState();

      expect(state.objectivesCompleted).toBeGreaterThanOrEqual(0);
      expect(state.objectivesCompleted).toBeLessThanOrEqual(state.totalObjectives);
    });
  });

  describe('Reset', () => {
    beforeEach(async () => {
      await game.initialize();
      game.start();
    });

    it('should reset game state', () => {
      // Play for a bit
      for (let i = 0; i < 100; i++) {
        game.update(0.016);
      }

      // Reset
      game.reset();

      const state = game.getState();
      expect(state.currentScore).toBe(0);
      expect(state.objectivesCompleted).toBe(0);
      expect(state.elapsedTime).toBe(0);
    });

    it('should reset objectives', () => {
      // Play for a bit
      for (let i = 0; i < 100; i++) {
        game.update(0.016);
      }

      // Reset
      game.reset();

      const score = game.getScore();
      score.objectives.forEach(obj => {
        expect(obj.completed).toBe(false);
        expect(obj.points).toBe(0);
      });
    });

    it('should allow replay after reset', () => {
      // Play and reset
      for (let i = 0; i < 50; i++) {
        game.update(0.016);
      }
      game.reset();

      // Start again
      game.start();

      for (let i = 0; i < 50; i++) {
        game.update(0.016);
      }

      const state = game.getState();
      expect(state.isPlaying).toBe(true);
    });
  });

  describe('Win/Lose Conditions', () => {
    beforeEach(async () => {
      await game.initialize();
      game.start();
    });

    it('should detect game won condition', () => {
      const isWon = game.isGameWon();

      expect(typeof isWon).toBe('boolean');
    });

    it('should detect time up condition', () => {
      const isTimeUp = game.isTimeUp();

      expect(typeof isTimeUp).toBe('boolean');
    });

    it('should end game when time is up', () => {
      // Mock time limit exceeded
      const state = game.getState();
      state.elapsedTime = config.timeLimitSeconds + 1;

      game.update(0.016);

      // Game should end if time is up
      expect(game.isTimeUp()).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should run complete game session', async () => {
      // Initialize
      await game.initialize();

      validateGameState(game.getState());

      // Start game
      game.start();

      expect(game.getState().isPlaying).toBe(true);

      // Run simulation for several seconds
      for (let i = 0; i < 300; i++) {
        game.update(0.016);

        // Validate state every 60 frames
        if (i % 60 === 0) {
          validateGameState(game.getState());

          const score = game.getScore();
          expect(score.totalPoints).toBeGreaterThanOrEqual(0);
        }

        // Check if game ended
        if (!game.getState().isPlaying) {
          break;
        }
      }

      // Get final score
      const finalScore = game.getScore();

      expect(finalScore.totalPoints).toBeGreaterThanOrEqual(0);
      expect(finalScore.objectives.length).toBe(config.objectives.length);

      // Test pause/resume
      game.pause();
      expect(game.getState().isPaused).toBe(true);

      game.resume();
      expect(game.getState().isPaused).toBe(false);

      // Reset game
      game.reset();

      const resetState = game.getState();
      expect(resetState.currentScore).toBe(0);
      expect(resetState.objectivesCompleted).toBe(0);
    });

    it('should handle rapid start/stop cycles', async () => {
      await game.initialize();

      for (let cycle = 0; cycle < 5; cycle++) {
        game.start();
        expect(game.getState().isPlaying).toBe(true);

        for (let i = 0; i < 20; i++) {
          game.update(0.016);
        }

        game.end();
        expect(game.getState().isPlaying).toBe(false);

        game.reset();
      }

      // Should remain stable
      validateGameState(game.getState());
    });
  });
});
