export declare class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    length(): number;
    normalize(): this;
}
export declare class Color {
    r: number;
    g: number;
    b: number;
    constructor(r?: number, g?: number, b?: number);
    setHex(hex: number): this;
}
export declare class Fog {
    color: Color;
    near: number;
    far: number;
    constructor(color: any, near?: number, far?: number);
}
export declare class FogExp2 {
    color: Color;
    density: number;
    constructor(color: any, density?: number);
}
export declare class Scene {
    children: any[];
    background: any;
    fog: any;
    add(...objects: any[]): this;
    remove(...objects: any[]): this;
}
export declare class PerspectiveCamera {
    fov: number;
    aspect: number;
    near: number;
    far: number;
    position: Vector3;
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    updateProjectionMatrix(): void;
    lookAt(x: number | Vector3, y?: number, z?: number): void;
}
export declare class OrthographicCamera {
    left: number;
    right: number;
    top: number;
    bottom: number;
    near: number;
    far: number;
    position: Vector3;
    constructor(left?: number, right?: number, top?: number, bottom?: number, near?: number, far?: number);
    updateProjectionMatrix(): void;
}
export declare class WebGLRenderer {
    domElement: HTMLCanvasElement;
    shadowMap: any;
    toneMapping: any;
    toneMappingExposure: number;
    physicallyCorrectLights: boolean;
    constructor(params?: any);
    setSize(width: number, height: number): void;
    setPixelRatio(ratio: number): void;
    render(scene: Scene, camera: any): void;
    dispose(): void;
    getContext(): WebGL2RenderingContext | null;
}
export declare class Mesh {
    geometry: any;
    material: any;
    position: Vector3;
    rotation: {
        x: number;
        y: number;
        z: number;
    };
    scale: Vector3;
    castShadow: boolean;
    receiveShadow: boolean;
    constructor(geometry?: any, material?: any);
}
export declare class BoxGeometry {
    width: number;
    height: number;
    depth: number;
    constructor(width?: number, height?: number, depth?: number);
}
export declare class SphereGeometry {
    radius: number;
    widthSegments: number;
    heightSegments: number;
    constructor(radius?: number, widthSegments?: number, heightSegments?: number);
}
export declare class PlaneGeometry {
    width: number;
    height: number;
    widthSegments: number;
    heightSegments: number;
    constructor(width?: number, height?: number, widthSegments?: number, heightSegments?: number);
    setAttribute(name: string, attribute: any): void;
}
export declare class BufferGeometry {
    attributes: any;
    setAttribute(name: string, attribute: any): void;
    setIndex(index: any): void;
}
export declare class BufferAttribute {
    array: ArrayLike<number>;
    itemSize: number;
    constructor(array: ArrayLike<number>, itemSize: number);
}
export declare class MeshBasicMaterial {
    color: Color;
    wireframe: boolean;
    transparent: boolean;
    opacity: number;
    constructor(params?: any);
}
export declare class MeshStandardMaterial extends MeshBasicMaterial {
    metalness: number;
    roughness: number;
}
export declare class ShaderMaterial {
    uniforms: any;
    vertexShader: string;
    fragmentShader: string;
    transparent: boolean;
    constructor(params?: any);
}
export declare class PointsMaterial extends MeshBasicMaterial {
    size: number;
    sizeAttenuation: boolean;
}
export declare class Points {
    geometry: any;
    material: any;
    position: Vector3;
    constructor(geometry?: any, material?: any);
}
export declare class DirectionalLight {
    color: Color;
    intensity: number;
    position: Vector3;
    castShadow: boolean;
    shadow: any;
    constructor(color?: any, intensity?: number);
}
export declare class AmbientLight {
    color: Color;
    intensity: number;
    constructor(color?: any, intensity?: number);
}
export declare class PointLight {
    color: Color;
    intensity: number;
    distance: number;
    decay: number;
    position: Vector3;
    constructor(color?: any, intensity?: number, distance?: number, decay?: number);
}
export declare class Texture {
    needsUpdate: boolean;
}
export declare class DataTexture extends Texture {
    data: BufferSource;
    width: number;
    height: number;
    format?: any | undefined;
    type?: any | undefined;
    constructor(data: BufferSource, width: number, height: number, format?: any | undefined, type?: any | undefined);
}
export declare class TextureLoader {
    load(url: string, onLoad?: (texture: Texture) => void): Texture;
}
export declare class AxesHelper {
    size: number;
    constructor(size?: number);
}
export declare class GridHelper {
    size: number;
    divisions: number;
    constructor(size?: number, divisions?: number);
}
export declare const PCFSoftShadowMap = 1;
export declare const LinearToneMapping = 0;
export declare const ReinhardToneMapping = 1;
export declare const CineonToneMapping = 2;
export declare const ACESFilmicToneMapping = 3;
export declare const RGBAFormat = 1023;
export declare const FloatType = 1015;
export declare const DoubleSide = 2;
export declare const AdditiveBlending = 2;
export declare const NormalBlending = 0;
export declare const Clock: {
    new (): {
        getDelta(): number;
        getElapsedTime(): number;
    };
};
//# sourceMappingURL=three.d.ts.map