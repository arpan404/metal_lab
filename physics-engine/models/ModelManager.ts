// physics-engine/models/ModelManager.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// Import procedural models
import {
  BankedTrack,
  ElectricFieldPlates,
  GoldFoilSetup,
  DoubleSlitBarrier,
  PendulumRig,
  MillikanChamber,
  ParticleEmitter,
  MeasurementGrid,
} from './procedural';

export type ModelType = 'car' | 'lab-stand' | 'banked-track' | 'electric-plates' | 
  'gold-foil' | 'double-slit' | 'pendulum' | 'millikan-chamber' | 
  'particle-emitter' | 'measurement-grid';

interface LoadedModel {
  object: THREE.Object3D;
  type: ModelType;
  isGLTF: boolean;
}

export class ModelManager {
  private models: Map<ModelType, LoadedModel> = new Map();
  private gltfLoader: GLTFLoader;
  private loadingManager: THREE.LoadingManager;
  private assetPath: string;

  constructor(assetPath: string = '/assets/models/') {
    this.assetPath = assetPath;
    
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onLoad = () => {
      console.log('All models loaded');
    };
    this.loadingManager.onError = (url) => {
      console.error('Error loading model:', url);
    };

    this.gltfLoader = new GLTFLoader(this.loadingManager);
  }

  /**
   * Load a GLTF model from file
   */
  async loadGLTF(modelType: 'car' | 'lab-stand', url?: string): Promise<THREE.Object3D> {
    const modelUrl = url || `${this.assetPath}${modelType}.glb`;
    
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        modelUrl,
        (gltf: GLTF) => {
          const model = gltf.scene;
          this.models.set(modelType, {
            object: model,
            type: modelType,
            isGLTF: true,
          });
          resolve(model);
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`Loading ${modelType}: ${percent.toFixed(2)}%`);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * Create a procedural model
   */
  createProcedural(
    modelType: Exclude<ModelType, 'car' | 'lab-stand'>,
    config?: any
  ): THREE.Object3D {
    let object: THREE.Object3D;

    switch (modelType) {
      case 'banked-track':
        const track = new BankedTrack(config || {
          radius: 50,
          width: 10,
          bankAngle: 30,
          segments: 64,
        });
        object = track.getObject3D();
        break;

      case 'electric-plates':
        const plates = new ElectricFieldPlates(config || {
          plateWidth: 5,
          plateDepth: 5,
          plateThickness: 0.1,
          separation: 2,
        });
        object = plates.getObject3D();
        break;

      case 'gold-foil':
        const goldFoil = new GoldFoilSetup(config || {
          foilRadius: 1,
          foilThickness: 0.001,
          detectorRadius: 3,
          detectorCount: 9,
          sourceDistance: 2,
        });
        object = goldFoil.getObject3D();
        break;

      case 'double-slit':
        const doubleSlit = new DoubleSlitBarrier(config || {
          barrierWidth: 4,
          barrierHeight: 4,
          barrierThickness: 0.1,
          slitWidth: 0.1,
          slitSeparation: 0.5,
          screenDistance: 5,
        });
        object = doubleSlit.getObject3D();
        break;

      case 'pendulum':
        const pendulum = new PendulumRig(config || {
          length: 5,
          bobRadius: 0.3,
        });
        object = pendulum.getObject3D();
        break;

      case 'millikan-chamber':
        const chamber = new MillikanChamber(config || {
          width: 3,
          height: 3,
          depth: 3,
        });
        object = chamber.getObject3D();
        break;

      case 'particle-emitter':
        const emitter = new ParticleEmitter();
        object = emitter.getObject3D();
        break;

      case 'measurement-grid':
        const grid = new MeasurementGrid(config?.size || 10, config?.divisions || 10);
        object = grid.getObject3D();
        break;

      default:
        throw new Error(`Unknown model type: ${modelType}`);
    }

    this.models.set(modelType, {
      object,
      type: modelType,
      isGLTF: false,
    });

    return object;
  }

  /**
   * Get a loaded or created model
   */
  getModel(modelType: ModelType): THREE.Object3D | undefined {
    return this.models.get(modelType)?.object;
  }

  /**
   * Check if a model is loaded
   */
  hasModel(modelType: ModelType): boolean {
    return this.models.has(modelType);
  }

  /**
   * Clone a model for reuse
   */
  cloneModel(modelType: ModelType): THREE.Object3D | undefined {
    const loadedModel = this.models.get(modelType);
    if (!loadedModel) return undefined;

    return loadedModel.object.clone();
  }

  /**
   * Dispose of a specific model
   */
  disposeModel(modelType: ModelType): void {
    const loadedModel = this.models.get(modelType);
    if (!loadedModel) return;

    loadedModel.object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    this.models.delete(modelType);
  }

  /**
   * Dispose of all models
   */
  disposeAll(): void {
    const modelTypes = Array.from(this.models.keys());
    modelTypes.forEach((type) => {
      this.disposeModel(type);
    });
    this.models.clear();
  }

  /**
   * Preload commonly used models
   */
  async preloadCommon(): Promise<void> {
    const promises: Promise<any>[] = [];

    // Load GLTF models
    promises.push(
      this.loadGLTF('car').catch(err => console.warn('Car model not found:', err)),
      this.loadGLTF('lab-stand').catch(err => console.warn('Lab stand model not found:', err))
    );

    await Promise.all(promises);
  }

  /**
   * Apply standard material properties to loaded models
   */
  applyStandardMaterial(modelType: ModelType, properties: Partial<THREE.MeshStandardMaterialParameters>): void {
    const model = this.getModel(modelType);
    if (!model) return;

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial;
        Object.assign(material, properties);
        material.needsUpdate = true;
      }
    });
  }

  /**
   * Get all loaded model types
   */
  getLoadedModelTypes(): ModelType[] {
    return Array.from(this.models.keys());
  }

  /**
   * Get loading progress
   */
  getLoadingProgress(): number {
    // This would need to be implemented with the loading manager
    return 100; // Placeholder
  }
}

export default ModelManager;