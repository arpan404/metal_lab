// Mock Three.js for testing
export class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    copy(v) {
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
    constructor(r = 1, g = 1, b = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    setHex(hex) {
        this.r = ((hex >> 16) & 255) / 255;
        this.g = ((hex >> 8) & 255) / 255;
        this.b = (hex & 255) / 255;
        return this;
    }
}
export class Fog {
    constructor(color, near = 1, far = 1000) {
        this.color = new Color(color);
        this.near = near;
        this.far = far;
    }
}
export class FogExp2 {
    constructor(color, density = 0.00025) {
        this.color = new Color(color);
        this.density = density;
    }
}
export class Scene {
    constructor() {
        this.children = [];
        this.background = null;
        this.fog = null;
    }
    add(...objects) {
        this.children.push(...objects);
        return this;
    }
    remove(...objects) {
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
    constructor(fov = 75, aspect = 1, near = 0.1, far = 1000) {
        this.position = new Vector3();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }
    updateProjectionMatrix() { }
    lookAt(x, y, z) { }
}
export class OrthographicCamera {
    constructor(left = -1, right = 1, top = 1, bottom = -1, near = 0.1, far = 1000) {
        this.position = new Vector3();
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.near = near;
        this.far = far;
    }
    updateProjectionMatrix() { }
}
export class WebGLRenderer {
    constructor(params) {
        this.domElement = document.createElement('canvas');
        this.shadowMap = { enabled: false, type: null };
        this.toneMapping = 0;
        this.toneMappingExposure = 1;
        this.physicallyCorrectLights = false;
    }
    setSize(width, height) { }
    setPixelRatio(ratio) { }
    render(scene, camera) { }
    dispose() { }
    getContext() {
        return this.domElement.getContext('webgl2');
    }
}
export class Mesh {
    constructor(geometry, material) {
        this.position = new Vector3();
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = new Vector3(1, 1, 1);
        this.castShadow = false;
        this.receiveShadow = false;
        this.geometry = geometry;
        this.material = material;
    }
}
export class BoxGeometry {
    constructor(width = 1, height = 1, depth = 1) {
        this.width = width;
        this.height = height;
        this.depth = depth;
    }
}
export class SphereGeometry {
    constructor(radius = 1, widthSegments = 32, heightSegments = 32) {
        this.radius = radius;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
    }
}
export class PlaneGeometry {
    constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
        this.width = width;
        this.height = height;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
    }
    setAttribute(name, attribute) { }
}
export class BufferGeometry {
    constructor() {
        this.attributes = {};
    }
    setAttribute(name, attribute) {
        this.attributes[name] = attribute;
    }
    setIndex(index) { }
}
export class BufferAttribute {
    constructor(array, itemSize) {
        this.array = array;
        this.itemSize = itemSize;
    }
}
export class MeshBasicMaterial {
    constructor(params) {
        this.color = new Color();
        this.wireframe = false;
        this.transparent = false;
        this.opacity = 1;
        Object.assign(this, params);
    }
}
export class MeshStandardMaterial extends MeshBasicMaterial {
    constructor() {
        super(...arguments);
        this.metalness = 0.5;
        this.roughness = 0.5;
    }
}
export class ShaderMaterial {
    constructor(params) {
        this.transparent = false;
        this.uniforms = params?.uniforms || {};
        this.vertexShader = params?.vertexShader || '';
        this.fragmentShader = params?.fragmentShader || '';
        Object.assign(this, params);
    }
}
export class PointsMaterial extends MeshBasicMaterial {
    constructor() {
        super(...arguments);
        this.size = 1;
        this.sizeAttenuation = true;
    }
}
export class Points {
    constructor(geometry, material) {
        this.position = new Vector3();
        this.geometry = geometry;
        this.material = material;
    }
}
export class DirectionalLight {
    constructor(color, intensity = 1) {
        this.color = new Color();
        this.intensity = 1;
        this.position = new Vector3();
        this.castShadow = false;
        this.shadow = { camera: {}, mapSize: { x: 1024, y: 1024 } };
        if (color !== undefined)
            this.color = color;
        this.intensity = intensity;
    }
}
export class AmbientLight {
    constructor(color, intensity = 1) {
        this.color = new Color();
        this.intensity = 1;
        if (color !== undefined)
            this.color = color;
        this.intensity = intensity;
    }
}
export class PointLight {
    constructor(color, intensity = 1, distance = 0, decay = 2) {
        this.color = new Color();
        this.intensity = 1;
        this.distance = 0;
        this.decay = 2;
        this.position = new Vector3();
        if (color !== undefined)
            this.color = color;
        this.intensity = intensity;
        this.distance = distance;
        this.decay = decay;
    }
}
export class Texture {
    constructor() {
        this.needsUpdate = false;
    }
}
export class DataTexture extends Texture {
    constructor(data, width, height, format, type) {
        super();
        this.data = data;
        this.width = width;
        this.height = height;
        this.format = format;
        this.type = type;
    }
}
export class TextureLoader {
    load(url, onLoad) {
        const texture = new Texture();
        if (onLoad)
            setTimeout(() => onLoad(texture), 0);
        return texture;
    }
}
export class AxesHelper {
    constructor(size = 1) {
        this.size = size;
    }
}
export class GridHelper {
    constructor(size = 10, divisions = 10) {
        this.size = size;
        this.divisions = divisions;
    }
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
