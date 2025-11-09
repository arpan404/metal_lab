export type ShaderType = 'wgsl' | 'metal' | 'glsl';
export interface ShaderSource {
    type: ShaderType;
    source: string;
    entryPoints?: string[];
}
export declare class ShaderLoader {
    private shaderCache;
    private preferredBackend;
    constructor(preferredBackend?: 'webgpu' | 'webgl');
    /**
     * Load shader source from URL or embedded source
     */
    loadShader(name: string, type?: ShaderType): Promise<ShaderSource>;
    /**
     * Load the appropriate shader for the current backend
     */
    loadShaderForBackend(name: string): Promise<ShaderSource>;
    /**
     * Get shader path based on name and type
     */
    private getShaderPath;
    /**
     * Extract entry points from shader source
     */
    private extractEntryPoints;
    /**
     * Check if the WebGPU backend is using Metal (Apple devices)
     */
    private isMetalBackend;
    /**
     * Clear shader cache
     */
    clearCache(): void;
    /**
     * Preload multiple shaders
     */
    preloadShaders(names: string[], type?: ShaderType): Promise<void>;
    /**
     * Get all available shaders
     */
    getAvailableShaders(): string[];
}
export declare const shaderLoader: ShaderLoader;
/**
 * Utility function to load a shader
 */
export declare function loadShader(name: string, type?: ShaderType): Promise<ShaderSource>;
/**
 * Utility function to load shader for current backend
 */
export declare function loadShaderForBackend(name: string): Promise<ShaderSource>;
//# sourceMappingURL=ShaderLoader.d.ts.map