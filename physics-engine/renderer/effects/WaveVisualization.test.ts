/**
 * Tests for WaveVisualization - Wave field visualization effects
 */

import { WaveVisualization } from './WaveVisualization';
import * as THREE from 'three';
import { createMockWaveField } from '../../__tests__/testUtils';

jest.mock('three');

describe('WaveVisualization', () => {
  let scene: THREE.Scene;
  let waveVis: WaveVisualization;

  beforeEach(() => {
    scene = new THREE.Scene();
    waveVis = new WaveVisualization(scene);
  });

  describe('Wave Plane Creation', () => {
    it('should create wave plane with default configuration', () => {
      waveVis.createWavePlane('test-plane');

      // Plane should be added to scene
      expect(scene.children.length).toBe(1);
    });

    it('should create wave plane with custom dimensions', () => {
      waveVis.createWavePlane('test-plane', {
        width: 20,
        height: 15,
        resolution: 512,
      });

      expect(scene.children.length).toBe(1);
      const mesh = scene.children[0] as THREE.Mesh;
      expect(mesh).toBeInstanceOf(THREE.Mesh);
    });

    it('should create wave plane at custom position', () => {
      const position = new THREE.Vector3(5, 10, 15);

      waveVis.createWavePlane('test-plane', {
        position,
      });

      const mesh = scene.children[0] as THREE.Mesh;
      expect(mesh.position.x).toBe(5);
      expect(mesh.position.y).toBe(10);
      expect(mesh.position.z).toBe(15);
    });

    it('should create multiple wave planes', () => {
      waveVis.createWavePlane('plane1');
      waveVis.createWavePlane('plane2');
      waveVis.createWavePlane('plane3');

      expect(scene.children.length).toBe(3);
    });

    it('should create transparent wave plane', () => {
      waveVis.createWavePlane('test-plane');

      const mesh = scene.children[0] as THREE.Mesh;
      const material = mesh.material as THREE.MeshBasicMaterial;

      expect(material.transparent).toBe(true);
      expect(material.opacity).toBe(0.8);
    });
  });

  describe('Wave Plane Updates', () => {
    beforeEach(() => {
      waveVis.createWavePlane('test-plane', { resolution: 256 });
    });

    it('should update wave plane with new data', () => {
      const waveData = createMockWaveField(256);

      waveVis.updateWavePlane('test-plane', waveData);

      // Update should complete without errors
      expect(scene.children.length).toBe(1);
    });

    it('should normalize wave data by default', () => {
      const waveData = new Float32Array(256 * 256);
      for (let i = 0; i < waveData.length; i++) {
        waveData[i] = Math.random() * 100 - 50; // Range [-50, 50]
      }

      waveVis.updateWavePlane('test-plane', waveData, {
        normalize: true,
      });

      // Should normalize without errors
      expect(scene.children.length).toBe(1);
    });

    it('should handle different color maps', () => {
      const waveData = createMockWaveField(256);

      waveVis.updateWavePlane('test-plane', waveData, {
        colorMap: 'heat',
      });

      waveVis.updateWavePlane('test-plane', waveData, {
        colorMap: 'cool',
      });

      waveVis.updateWavePlane('test-plane', waveData, {
        colorMap: 'phase',
      });

      // All color maps should work
      expect(scene.children.length).toBe(1);
    });

    it('should handle updates to non-existent plane gracefully', () => {
      const waveData = createMockWaveField(256);

      // Should not throw
      waveVis.updateWavePlane('non-existent', waveData);
    });

    it('should handle rapid updates', () => {
      const waveData = createMockWaveField(256);

      for (let i = 0; i < 100; i++) {
        // Modify data slightly
        for (let j = 0; j < waveData.length; j += 2) {
          waveData[j] = Math.sin(i * 0.1 + j * 0.01);
        }

        waveVis.updateWavePlane('test-plane', waveData);
      }

      expect(scene.children.length).toBe(1);
    });
  });

  describe('Wave Plane Removal', () => {
    it('should remove wave plane', () => {
      waveVis.createWavePlane('test-plane');
      expect(scene.children.length).toBe(1);

      waveVis.removeWavePlane('test-plane');
      expect(scene.children.length).toBe(0);
    });

    it('should handle removal of non-existent plane', () => {
      waveVis.removeWavePlane('non-existent');

      // Should not throw
      expect(scene.children.length).toBe(0);
    });

    it('should remove correct plane when multiple exist', () => {
      waveVis.createWavePlane('plane1');
      waveVis.createWavePlane('plane2');
      waveVis.createWavePlane('plane3');

      waveVis.removeWavePlane('plane2');

      expect(scene.children.length).toBe(2);
    });
  });

  describe('Cleanup', () => {
    it('should dispose all wave planes', () => {
      waveVis.createWavePlane('plane1');
      waveVis.createWavePlane('plane2');
      waveVis.createWavePlane('plane3');

      expect(scene.children.length).toBe(3);

      waveVis.dispose();

      expect(scene.children.length).toBe(0);
    });

    it('should handle dispose when no planes exist', () => {
      waveVis.dispose();

      // Should not throw
      expect(scene.children.length).toBe(0);
    });
  });

  describe('Integration', () => {
    it('should handle complete visualization workflow', () => {
      // Create wave plane
      waveVis.createWavePlane('quantum-field', {
        width: 20,
        height: 20,
        resolution: 512,
        position: new THREE.Vector3(0, 0, 10),
      });

      expect(scene.children.length).toBe(1);

      // Simulate wave evolution
      const resolution = 512;
      const waveData = new Float32Array(resolution * resolution);

      for (let frame = 0; frame < 60; frame++) {
        // Generate interference pattern
        for (let i = 0; i < resolution; i++) {
          for (let j = 0; j < resolution; j++) {
            const x = (i / resolution) * 2 - 1;
            const y = (j / resolution) * 2 - 1;
            const dist1 = Math.sqrt((x - 0.2) ** 2 + y ** 2);
            const dist2 = Math.sqrt((x + 0.2) ** 2 + y ** 2);
            const wave1 = Math.sin(dist1 * 20 - frame * 0.1);
            const wave2 = Math.sin(dist2 * 20 - frame * 0.1);
            waveData[i * resolution + j] = wave1 + wave2;
          }
        }

        // Update visualization
        waveVis.updateWavePlane('quantum-field', waveData, {
          normalize: true,
          colorMap: 'phase',
        });
      }

      // Scene should remain stable
      expect(scene.children.length).toBe(1);

      // Cleanup
      waveVis.dispose();
      expect(scene.children.length).toBe(0);
    });

    it('should handle multiple concurrent wave planes', () => {
      const configs = [
        { id: 'wave1', resolution: 256, colorMap: 'default' as const },
        { id: 'wave2', resolution: 512, colorMap: 'heat' as const },
        { id: 'wave3', resolution: 128, colorMap: 'cool' as const },
      ];

      // Create planes
      configs.forEach(({ id, resolution }) => {
        waveVis.createWavePlane(id, { resolution });
      });

      expect(scene.children.length).toBe(3);

      // Update all planes
      configs.forEach(({ id, resolution, colorMap }) => {
        const waveData = createMockWaveField(resolution);
        waveVis.updateWavePlane(id, waveData, { colorMap });
      });

      // All planes should be updated
      expect(scene.children.length).toBe(3);

      // Remove one plane
      waveVis.removeWavePlane('wave2');
      expect(scene.children.length).toBe(2);

      // Cleanup
      waveVis.dispose();
      expect(scene.children.length).toBe(0);
    });
  });
});
