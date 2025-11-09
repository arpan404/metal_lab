/**
 * Tests for ThreeJSRenderer - Main WebGL renderer
 */

import { ThreeJSRenderer } from './ThreeJSRenderer';
import { createMockCanvas, validateRenderer } from '../__tests__/testUtils';
import * as THREE from 'three';

jest.mock('three');

describe('ThreeJSRenderer', () => {
  let canvas: HTMLCanvasElement;
  let renderer: ThreeJSRenderer;

  beforeEach(() => {
    canvas = createMockCanvas(800, 600);
    Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });
  });

  afterEach(() => {
    if (renderer) {
      renderer.dispose();
    }
  });

  describe('Initialization', () => {
    it('should create renderer with default configuration', () => {
      renderer = new ThreeJSRenderer(canvas);

      validateRenderer(renderer);
      expect(renderer.getRenderer()).toBeDefined();
      expect(renderer.getScene()).toBeDefined();
      expect(renderer.getCamera()).toBeDefined();
    });

    it('should create renderer with custom configuration', () => {
      const config = {
        antialias: true,
        shadows: true,
        physicallyCorrectLights: true,
        toneMapping: 'ACESFilmic' as const,
      };

      renderer = new ThreeJSRenderer(canvas, config);

      const webglRenderer = renderer.getRenderer();
      expect(webglRenderer.shadowMap.enabled).toBe(true);
      expect(webglRenderer.shadowMap.type).toBe(THREE.PCFSoftShadowMap);
    });

    it('should set up default perspective camera', () => {
      renderer = new ThreeJSRenderer(canvas);

      const camera = renderer.getCamera();
      expect(camera).toBeInstanceOf(THREE.PerspectiveCamera);

      if (camera instanceof THREE.PerspectiveCamera) {
        expect(camera.fov).toBe(75);
        expect(camera.aspect).toBe(800 / 600);
        expect(camera.near).toBe(0.1);
        expect(camera.far).toBe(1000);
      }
    });

    it('should handle window resize events', () => {
      renderer = new ThreeJSRenderer(canvas);
      const camera = renderer.getCamera();

      // Simulate window resize
      Object.defineProperty(canvas, 'clientWidth', { value: 1024, configurable: true });
      Object.defineProperty(canvas, 'clientHeight', { value: 768, configurable: true });

      window.dispatchEvent(new Event('resize'));

      // Camera aspect should update
      if (camera instanceof THREE.PerspectiveCamera) {
        expect(camera.aspect).toBe(1024 / 768);
      }
    });
  });

  describe('Scene Configuration', () => {
    beforeEach(() => {
      renderer = new ThreeJSRenderer(canvas);
    });

    it('should configure scene background color', () => {
      renderer.configureScene({
        background: 0x000000,
      });

      const scene = renderer.getScene();
      expect(scene.background).toBeDefined();
    });

    it('should configure linear fog', () => {
      renderer.configureScene({
        fog: {
          type: 'linear',
          color: 0xcccccc,
          near: 10,
          far: 100,
        },
      });

      const scene = renderer.getScene();
      expect(scene.fog).toBeDefined();
    });

    it('should configure exponential fog', () => {
      renderer.configureScene({
        fog: {
          type: 'exponential',
          color: 0xcccccc,
          density: 0.001,
        },
      });

      const scene = renderer.getScene();
      expect(scene.fog).toBeDefined();
    });

    it('should add ambient light', () => {
      renderer.configureScene({
        lights: [
          {
            type: 'ambient',
            color: 0xffffff,
            intensity: 0.5,
          },
        ],
      });

      const scene = renderer.getScene();
      expect(scene.children.length).toBeGreaterThan(0);
    });

    it('should add directional light with shadows', () => {
      renderer.configureScene({
        lights: [
          {
            type: 'directional',
            color: 0xffffff,
            intensity: 1,
            position: { x: 10, y: 20, z: 30 },
            castShadow: true,
          },
        ],
      });

      const scene = renderer.getScene();
      expect(scene.children.length).toBeGreaterThan(0);
    });

    it('should add point light', () => {
      renderer.configureScene({
        lights: [
          {
            type: 'point',
            color: 0xff0000,
            intensity: 1,
            position: { x: 0, y: 10, z: 0 },
          },
        ],
      });

      const scene = renderer.getScene();
      expect(scene.children.length).toBeGreaterThan(0);
    });

    it('should add spot light', () => {
      renderer.configureScene({
        lights: [
          {
            type: 'spot',
            color: 0x00ff00,
            intensity: 1,
            position: { x: 0, y: 10, z: 0 },
            castShadow: true,
          },
        ],
      });

      const scene = renderer.getScene();
      expect(scene.children.length).toBeGreaterThan(0);
    });

    it('should add hemisphere light', () => {
      renderer.configureScene({
        lights: [
          {
            type: 'hemisphere',
            color: 0xffffff,
            groundColor: 0x444444,
            intensity: 0.6,
          },
        ],
      });

      const scene = renderer.getScene();
      expect(scene.children.length).toBeGreaterThan(0);
    });

    it('should handle multiple lights', () => {
      renderer.configureScene({
        lights: [
          { type: 'ambient', color: 0xffffff, intensity: 0.5 },
          { type: 'directional', color: 0xffffff, intensity: 1, position: { x: 10, y: 20, z: 30 } },
          { type: 'point', color: 0xff0000, intensity: 1, position: { x: 0, y: 10, z: 0 } },
        ],
      });

      const scene = renderer.getScene();
      expect(scene.children.length).toBe(3);
    });
  });

  describe('Scene Management', () => {
    beforeEach(() => {
      renderer = new ThreeJSRenderer(canvas);
    });

    it('should add object to scene', () => {
      const mesh = new THREE.Mesh();
      renderer.add(mesh);

      const scene = renderer.getScene();
      expect(scene.children).toContain(mesh);
    });

    it('should remove object from scene', () => {
      const mesh = new THREE.Mesh();
      renderer.add(mesh);
      renderer.remove(mesh);

      const scene = renderer.getScene();
      expect(scene.children).not.toContain(mesh);
    });

    it('should clear all objects from scene', () => {
      renderer.add(new THREE.Mesh());
      renderer.add(new THREE.Mesh());
      renderer.add(new THREE.Mesh());

      expect(renderer.getScene().children.length).toBe(3);

      renderer.clear();

      expect(renderer.getScene().children.length).toBe(0);
    });
  });

  describe('Camera Management', () => {
    beforeEach(() => {
      renderer = new ThreeJSRenderer(canvas);
    });

    it('should allow setting custom camera', () => {
      const newCamera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
      renderer.setCamera(newCamera);

      expect(renderer.getCamera()).toBe(newCamera);
      expect(renderer.getCamera()).toBeInstanceOf(THREE.OrthographicCamera);
    });

    it('should handle orthographic camera resize', () => {
      const orthoCamera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
      renderer.setCamera(orthoCamera);

      // Simulate window resize
      Object.defineProperty(canvas, 'clientWidth', { value: 1600, configurable: true });
      Object.defineProperty(canvas, 'clientHeight', { value: 900, configurable: true });

      window.dispatchEvent(new Event('resize'));

      // Orthographic camera should update its bounds
      const aspect = 1600 / 900;
      expect(orthoCamera.left).toBe(-10 * aspect);
      expect(orthoCamera.right).toBe(10 * aspect);
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      renderer = new ThreeJSRenderer(canvas);
    });

    it('should render scene', () => {
      const webglRenderer = renderer.getRenderer();
      const renderSpy = jest.spyOn(webglRenderer, 'render');

      renderer.render();

      expect(renderSpy).toHaveBeenCalledWith(renderer.getScene(), renderer.getCamera());
    });

    it('should render multiple frames', () => {
      const webglRenderer = renderer.getRenderer();
      const renderSpy = jest.spyOn(webglRenderer, 'render');

      renderer.render();
      renderer.render();
      renderer.render();

      expect(renderSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Tone Mapping', () => {
    it('should set Linear tone mapping', () => {
      renderer = new ThreeJSRenderer(canvas, {
        toneMapping: 'Linear',
      });

      expect(renderer.getRenderer().toneMapping).toBe(THREE.LinearToneMapping);
    });

    it('should set Reinhard tone mapping', () => {
      renderer = new ThreeJSRenderer(canvas, {
        toneMapping: 'Reinhard',
      });

      expect(renderer.getRenderer().toneMapping).toBe(THREE.ReinhardToneMapping);
    });

    it('should set Cineon tone mapping', () => {
      renderer = new ThreeJSRenderer(canvas, {
        toneMapping: 'Cineon',
      });

      expect(renderer.getRenderer().toneMapping).toBe(THREE.CineonToneMapping);
    });

    it('should set ACESFilmic tone mapping', () => {
      renderer = new ThreeJSRenderer(canvas, {
        toneMapping: 'ACESFilmic',
      });

      expect(renderer.getRenderer().toneMapping).toBe(THREE.ACESFilmicToneMapping);
    });
  });

  describe('Utilities', () => {
    beforeEach(() => {
      renderer = new ThreeJSRenderer(canvas);
    });

    it('should take screenshot', () => {
      const dataUrl = renderer.screenshot();
      expect(typeof dataUrl).toBe('string');
    });

    it('should set clear color', () => {
      const setClearColorSpy = jest.spyOn(renderer.getRenderer(), 'setClearColor');

      renderer.setClearColor(0xff0000, 0.5);

      expect(setClearColorSpy).toHaveBeenCalled();
    });

    it('should dispose renderer and clean up', () => {
      const disposeSpy = jest.spyOn(renderer.getRenderer(), 'dispose');

      renderer.dispose();

      expect(disposeSpy).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should create complete rendering pipeline', () => {
      renderer = new ThreeJSRenderer(canvas, {
        antialias: true,
        shadows: true,
        physicallyCorrectLights: true,
        toneMapping: 'ACESFilmic',
      });

      // Configure scene
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
          { type: 'directional', color: 0xffffff, intensity: 1, position: { x: 10, y: 20, z: 30 }, castShadow: true },
        ],
      });

      // Add objects
      const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial());
      const mesh2 = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshStandardMaterial());

      renderer.add(mesh1);
      renderer.add(mesh2);

      // Verify scene structure
      const scene = renderer.getScene();
      expect(scene.background).toBeDefined();
      expect(scene.fog).toBeDefined();
      expect(scene.children.length).toBeGreaterThanOrEqual(4); // 2 lights + 2 meshes

      // Render
      renderer.render();

      // Should be able to take screenshot
      const screenshot = renderer.screenshot();
      expect(screenshot).toBeDefined();
    });
  });
});
