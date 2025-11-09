// physics-engine/shaders/ShaderLoader.ts
// Shader loading and management for WebGPU/Metal backend

export type ShaderType = 'wgsl' | 'metal' | 'glsl';

export interface ShaderSource {
  type: ShaderType;
  source: string;
  entryPoints?: string[];
}

export class ShaderLoader {
  private shaderCache: Map<string, string> = new Map();
  private preferredBackend: 'webgpu' | 'webgl' = 'webgpu';

  constructor(preferredBackend: 'webgpu' | 'webgl' = 'webgpu') {
    this.preferredBackend = preferredBackend;
  }

  /**
   * Load shader source from URL or embedded source
   */
  async loadShader(
    name: string,
    type: ShaderType = 'wgsl'
  ): Promise<ShaderSource> {
    const cacheKey = `${name}-${type}`;

    // Check cache first
    if (this.shaderCache.has(cacheKey)) {
      return {
        type,
        source: this.shaderCache.get(cacheKey)!
      };
    }

    try {
      // Construct shader path
      const path = this.getShaderPath(name, type);

      // Fetch shader source
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load shader: ${path}`);
      }

      const source = await response.text();

      // Cache the shader
      this.shaderCache.set(cacheKey, source);

      // Extract entry points
      const entryPoints = this.extractEntryPoints(source, type);

      return {
        type,
        source,
        entryPoints
      };
    } catch (error) {
      console.error(`Error loading shader ${name}:`, error);
      throw error;
    }
  }

  /**
   * Load the appropriate shader for the current backend
   */
  async loadShaderForBackend(name: string): Promise<ShaderSource> {
    if (this.preferredBackend === 'webgpu') {
      // Check if Metal is available (Apple devices)
      const isMetal = await this.isMetalBackend();

      // Use WGSL for WebGPU (which translates to Metal on Apple devices)
      return this.loadShader(name, 'wgsl');
    } else {
      // Use GLSL for WebGL
      return this.loadShader(name, 'glsl');
    }
  }

  /**
   * Get shader path based on name and type
   */
  private getShaderPath(name: string, type: ShaderType): string {
    const typeDir = type === 'wgsl' ? 'wgsl' : type === 'metal' ? 'metal' : 'glsl';
    const extension = type === 'wgsl' ? '.wgsl' : type === 'metal' ? '.metal' : '';

    return `/shaders/${typeDir}/${name}${extension}`;
  }

  /**
   * Extract entry points from shader source
   */
  private extractEntryPoints(source: string, type: ShaderType): string[] {
    const entryPoints: string[] = [];

    if (type === 'wgsl') {
      // Match @compute, @vertex, @fragment decorators
      const computeMatches = source.matchAll(/@compute\s+fn\s+(\w+)/g);
      const vertexMatches = source.matchAll(/@vertex\s+fn\s+(\w+)/g);
      const fragmentMatches = source.matchAll(/@fragment\s+fn\s+(\w+)/g);

      for (const match of computeMatches) {
        entryPoints.push(match[1]);
      }
      for (const match of vertexMatches) {
        entryPoints.push(match[1]);
      }
      for (const match of fragmentMatches) {
        entryPoints.push(match[1]);
      }
    } else if (type === 'metal') {
      // Match kernel, vertex, fragment functions
      const kernelMatches = source.matchAll(/kernel\s+\w+\s+(\w+)/g);
      const vertexMatches = source.matchAll(/vertex\s+\w+\s+(\w+)/g);
      const fragmentMatches = source.matchAll(/fragment\s+\w+\s+(\w+)/g);

      for (const match of kernelMatches) {
        entryPoints.push(match[1]);
      }
      for (const match of vertexMatches) {
        entryPoints.push(match[1]);
      }
      for (const match of fragmentMatches) {
        entryPoints.push(match[1]);
      }
    }

    return entryPoints;
  }

  /**
   * Check if the WebGPU backend is using Metal (Apple devices)
   */
  private async isMetalBackend(): Promise<boolean> {
    if (!navigator.gpu) return false;

    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) return false;

      const info = adapter.info;
      return (
        info.architecture?.toLowerCase().includes('apple') ||
        info.vendor?.toLowerCase().includes('apple') ||
        navigator.userAgent.includes('Mac') ||
        navigator.userAgent.includes('iPhone') ||
        navigator.userAgent.includes('iPad')
      );
    } catch {
      return false;
    }
  }

  /**
   * Clear shader cache
   */
  clearCache(): void {
    this.shaderCache.clear();
  }

  /**
   * Preload multiple shaders
   */
  async preloadShaders(names: string[], type: ShaderType = 'wgsl'): Promise<void> {
    const promises = names.map(name => this.loadShader(name, type));
    await Promise.all(promises);
  }

  /**
   * Get all available shaders
   */
  getAvailableShaders(): string[] {
    return [
      'particle-system',
      'electric-field',
      'schrodinger',
      'wave-propagation',
      'interference-pattern'
    ];
  }
}

// Singleton instance
export const shaderLoader = new ShaderLoader();

/**
 * Utility function to load a shader
 */
export async function loadShader(
  name: string,
  type: ShaderType = 'wgsl'
): Promise<ShaderSource> {
  return shaderLoader.loadShader(name, type);
}

/**
 * Utility function to load shader for current backend
 */
export async function loadShaderForBackend(name: string): Promise<ShaderSource> {
  return shaderLoader.loadShaderForBackend(name);
}
