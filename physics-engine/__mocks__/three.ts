// Mock Three.js for testing
export class Vector3 {
  x: number;
  y: number;
  z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  copy(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize() {
    const len = this.length();
    if (len > 0) {
      this.x /= len;
      this.y /= len;
      this.z /= len;
    }
    return this;
  }
}

export class Color {
  r: number;
  g: number;
  b: number;

  constructor(r = 1, g = 1, b = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  setHex(hex: number) {
    this.r = ((hex >> 16) & 255) / 255;
    this.g = ((hex >> 8) & 255) / 255;
    this.b = (hex & 255) / 255;
    return this;
  }
}

export class Fog {
  color: Color;
  near: number;
  far: number;

  constructor(color: any, near = 1, far = 1000) {
    this.color = new Color(color);
    this.near = near;
    this.far = far;
  }
}

export class FogExp2 {
  color: Color;
  density: number;

  constructor(color: any, density = 0.00025) {
    this.color = new Color(color);
    this.density = density;
  }
}

export class Scene {
  children: any[] = [];
  background: any = null;
  fog: any = null;

  add(...objects: any[]) {
    this.children.push(...objects);
    return this;
  }

  remove(...objects: any[]) {
    objects.forEach(obj => {
      const index = this.children.indexOf(obj);
      if (index > -1) {
        this.children.splice(index, 1);
      }
    });
    return this;
  }
}

export class PerspectiveCamera {
  fov: number;
  aspect: number;
  near: number;
  far: number;
  position = new Vector3();

  constructor(fov = 75, aspect = 1, near = 0.1, far = 1000) {
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
  }

  updateProjectionMatrix() {}
  lookAt(x: number | Vector3, y?: number, z?: number) {}
}

export class OrthographicCamera {
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
  position = new Vector3();

  constructor(left = -1, right = 1, top = 1, bottom = -1, near = 0.1, far = 1000) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;
  }

  updateProjectionMatrix() {}
}

export class WebGLRenderer {
  domElement: HTMLCanvasElement;
  shadowMap: any;
  toneMapping: any;
  toneMappingExposure: number;
  physicallyCorrectLights: boolean;

  constructor(params?: any) {
    this.domElement = document.createElement('canvas');
    this.shadowMap = { enabled: false, type: null };
    this.toneMapping = 0;
    this.toneMappingExposure = 1;
    this.physicallyCorrectLights = false;
  }

  setSize(width: number, height: number) {}
  setPixelRatio(ratio: number) {}
  render(scene: Scene, camera: any) {}
  dispose() {}
  getContext() {
    return this.domElement.getContext('webgl2');
  }
}

export class Mesh {
  geometry: any;
  material: any;
  position = new Vector3();
  rotation = { x: 0, y: 0, z: 0 };
  scale = new Vector3(1, 1, 1);
  castShadow = false;
  receiveShadow = false;

  constructor(geometry?: any, material?: any) {
    this.geometry = geometry;
    this.material = material;
  }
}

export class BoxGeometry {
  constructor(public width = 1, public height = 1, public depth = 1) {}
}

export class SphereGeometry {
  constructor(public radius = 1, public widthSegments = 32, public heightSegments = 32) {}
}

export class PlaneGeometry {
  constructor(public width = 1, public height = 1, public widthSegments = 1, public heightSegments = 1) {}
  setAttribute(name: string, attribute: any) {}
}

export class BufferGeometry {
  attributes: any = {};
  setAttribute(name: string, attribute: any) {
    this.attributes[name] = attribute;
  }
  setIndex(index: any) {}
}

export class BufferAttribute {
  constructor(public array: ArrayLike<number>, public itemSize: number) {}
}

export class MeshBasicMaterial {
  color = new Color();
  wireframe = false;
  transparent = false;
  opacity = 1;

  constructor(params?: any) {
    Object.assign(this, params);
  }
}

export class MeshStandardMaterial extends MeshBasicMaterial {
  metalness = 0.5;
  roughness = 0.5;
}

export class ShaderMaterial {
  uniforms: any;
  vertexShader: string;
  fragmentShader: string;
  transparent = false;

  constructor(params?: any) {
    this.uniforms = params?.uniforms || {};
    this.vertexShader = params?.vertexShader || '';
    this.fragmentShader = params?.fragmentShader || '';
    Object.assign(this, params);
  }
}

export class PointsMaterial extends MeshBasicMaterial {
  size = 1;
  sizeAttenuation = true;
}

export class Points {
  geometry: any;
  material: any;
  position = new Vector3();

  constructor(geometry?: any, material?: any) {
    this.geometry = geometry;
    this.material = material;
  }
}

export class DirectionalLight {
  color = new Color();
  intensity = 1;
  position = new Vector3();
  castShadow = false;
  shadow: any = { camera: {}, mapSize: { x: 1024, y: 1024 } };

  constructor(color?: any, intensity = 1) {
    if (color !== undefined) this.color = color;
    this.intensity = intensity;
  }
}

export class AmbientLight {
  color = new Color();
  intensity = 1;

  constructor(color?: any, intensity = 1) {
    if (color !== undefined) this.color = color;
    this.intensity = intensity;
  }
}

export class PointLight {
  color = new Color();
  intensity = 1;
  distance = 0;
  decay = 2;
  position = new Vector3();

  constructor(color?: any, intensity = 1, distance = 0, decay = 2) {
    if (color !== undefined) this.color = color;
    this.intensity = intensity;
    this.distance = distance;
    this.decay = decay;
  }
}

export class Texture {
  needsUpdate = false;
}

export class DataTexture extends Texture {
  constructor(
    public data: BufferSource,
    public width: number,
    public height: number,
    public format?: any,
    public type?: any
  ) {
    super();
  }
}

export class TextureLoader {
  load(url: string, onLoad?: (texture: Texture) => void) {
    const texture = new Texture();
    if (onLoad) setTimeout(() => onLoad(texture), 0);
    return texture;
  }
}

export class AxesHelper {
  constructor(public size = 1) {}
}

export class GridHelper {
  constructor(public size = 10, public divisions = 10) {}
}

export const PCFSoftShadowMap = 1;
export const LinearToneMapping = 0;
export const ReinhardToneMapping = 1;
export const CineonToneMapping = 2;
export const ACESFilmicToneMapping = 3;
export const RGBAFormat = 1023;
export const FloatType = 1015;
export const DoubleSide = 2;
export const AdditiveBlending = 2;
export const NormalBlending = 0;

export const Clock = class {
  getDelta() {
    return 0.016;
  }
  getElapsedTime() {
    return 0;
  }
};
