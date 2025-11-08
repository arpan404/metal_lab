// physics-engine/renderer/ThreeJSRenderer.ts
import * as THREE from 'three';
import type { RendererConfig, SceneConfig } from '../types';

/**
 * Three.js renderer setup and management
 */

export class ThreeJSRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private canvas: HTMLCanvasElement;
  
  constructor(canvas: HTMLCanvasElement, config?: RendererConfig) {
    this.canvas = canvas;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: config?.antialias ?? true,
      alpha: true
    });
    
    // Configure renderer
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    
    if (config?.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    if (config?.physicallyCorrectLights) {
        if ('physicallyCorrectLights' in this.renderer) {
            (this.renderer as any).physicallyCorrectLights = true;
        }
        else if ('useLegacyLights' in this.renderer) {
            (this.renderer as any).useLegacyLights = false;
        }
    }
    
    if (config?.toneMapping) {
      this.renderer.toneMapping = this.getToneMapping(config.toneMapping);
      this.renderer.toneMappingExposure = 1.0;
    }
    
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create default camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize);
  }
  
  /**
   * Configure scene
   */
  configureScene(config: SceneConfig): void {
    // Background
    if (config.background) {
      if (typeof config.background === 'string' || typeof config.background === 'number') {
        this.scene.background = new THREE.Color(config.background);
      } else {
        this.scene.background = config.background;
      }
    }
    
    // Fog
    if (config.fog) {
      const fogColor = new THREE.Color(config.fog.color);
      
      if (config.fog.type === 'linear') {
        this.scene.fog = new THREE.Fog(
          fogColor,
          config.fog.near ?? 1,
          config.fog.far ?? 1000
        );
      } else {
        this.scene.fog = new THREE.FogExp2(
          fogColor,
          config.fog.density ?? 0.00025
        );
      }
    }
    
    // Lights
    if (config.lights) {
      config.lights.forEach(lightConfig => {
        const light = this.createLight(lightConfig);
        if (light) {
          this.scene.add(light);
        }
      });
    }
  }
  
  /**
   * Create light from config
   */
  private createLight(config: any): THREE.Light | null {
    let light: THREE.Light;
    
    switch (config.type) {
      case 'ambient':
        light = new THREE.AmbientLight(config.color, config.intensity);
        break;
      
      case 'directional':
        light = new THREE.DirectionalLight(config.color, config.intensity);
        if (config.position) {
          light.position.set(config.position.x, config.position.y, config.position.z);
        }
        if (config.castShadow) {
          light.castShadow = true;
          (light as THREE.DirectionalLight).shadow.mapSize.width = 2048;
          (light as THREE.DirectionalLight).shadow.mapSize.height = 2048;
        }
        break;
      
      case 'point':
        light = new THREE.PointLight(config.color, config.intensity);
        if (config.position) {
          light.position.set(config.position.x, config.position.y, config.position.z);
        }
        if (config.castShadow) {
          light.castShadow = true;
        }
        break;
      
      case 'spot':
        light = new THREE.SpotLight(config.color, config.intensity);
        if (config.position) {
          light.position.set(config.position.x, config.position.y, config.position.z);
        }
        if (config.castShadow) {
          light.castShadow = true;
        }
        break;
      
      case 'hemisphere':
        light = new THREE.HemisphereLight(
          config.color,
          config.groundColor ?? 0x444444,
          config.intensity
        );
        break;
      
      default:
        return null;
    }
    
    return light;
  }
  
  /**
   * Get tone mapping from string
   */
  private getToneMapping(type: string | THREE.ToneMapping): THREE.ToneMapping {
    if (typeof type === 'number') return type;
    
    switch (type) {
      case 'Linear': return THREE.LinearToneMapping;
      case 'Reinhard': return THREE.ReinhardToneMapping;
      case 'Cineon': return THREE.CineonToneMapping;
      case 'ACESFilmic': return THREE.ACESFilmicToneMapping;
      default: return THREE.NoToneMapping;
    }
  }
  
  /**
   * Add object to scene
   */
  add(object: THREE.Object3D): void {
    this.scene.add(object);
  }
  
  /**
   * Remove object from scene
   */
  remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }
  
  /**
   * Clear scene
   */
  clear(): void {
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  }
  
  /**
   * Render frame
   */
  render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Get renderer
   */
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
  
  /**
   * Get scene
   */
  getScene(): THREE.Scene {
    return this.scene;
  }
  
  /**
   * Get camera
   */
  getCamera(): THREE.Camera {
    return this.camera;
  }
  
  /**
   * Set camera
   */
  setCamera(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera): void {
    this.camera = camera;
  }
  
  /**
   * Handle window resize
   */
  private onWindowResize = (): void => {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    } else if (this.camera instanceof THREE.OrthographicCamera) {
      const aspect = width / height;
      this.camera.left = -10 * aspect;
      this.camera.right = 10 * aspect;
      this.camera.updateProjectionMatrix();
    }
    
    this.renderer.setSize(width, height);
  }
  
  /**
   * Dispose renderer
   */
  dispose(): void {
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
  }
  
  /**
   * Take screenshot
   */
  screenshot(): string {
    return this.renderer.domElement.toDataURL('image/png');
  }
  
  /**
   * Set clear color
   */
  setClearColor(color: number | string, alpha: number = 1): void {
    this.renderer.setClearColor(new THREE.Color(color), alpha);
  }
}