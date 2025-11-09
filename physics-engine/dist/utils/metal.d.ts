export interface MetalCapabilities {
    metalSupported: boolean;
    gpuFamily?: string;
    maxThreadsPerThreadgroup?: number;
    maxBufferLength?: number;
    supportsNonUniformThreadgroups?: boolean;
}
/**
 * Check if Metal is supported (via WebGPU on Apple devices)
 * Metal is the native GPU API on macOS and iOS
 */
export declare function checkMetalSupport(): Promise<boolean>;
/**
 * Get detailed Metal GPU capabilities
 */
export declare function getMetalCapabilities(): Promise<MetalCapabilities>;
/**
 * Initialize Metal GPU device (via WebGPU)
 * On Apple devices, this will use Metal as the backend
 */
export declare function initializeMetalGPU(): Promise<GPUDevice | null>;
/**
 * Load and compile Metal shader from source
 * Note: In WebGPU, we use WGSL. This utility helps with Metal-optimized compilation
 */
export declare function loadMetalShader(device: GPUDevice, shaderSource: string, label?: string): Promise<GPUShaderModule>;
/**
 * Create Metal compute pipeline with optimizations
 */
export declare function createMetalComputePipeline(device: GPUDevice, shaderModule: GPUShaderModule, entryPoint?: string, label?: string): Promise<GPUComputePipeline>;
/**
 * Get optimal Metal workgroup size based on GPU capabilities
 */
export declare function getMetalWorkgroupSize(device: GPUDevice, totalThreads: number, preferredSize?: number): {
    workgroupSize: number;
    workgroups: number;
};
/**
 * Create Metal buffer with optimal settings
 */
export declare function createMetalBuffer(device: GPUDevice, data: ArrayBuffer | ArrayBufferView, usage?: GPUBufferUsageFlags, label?: string): GPUBuffer;
/**
 * Dispatch Metal compute shader with automatic workgroup calculation
 */
export declare function dispatchMetalCompute(device: GPUDevice, pipeline: GPUComputePipeline, bindGroup: GPUBindGroup, totalThreads: number, preferredWorkgroupSize?: number): void;
/**
 * Check for Metal Performance Shaders (MPS) support
 * This is a placeholder for future integration with native Metal
 */
export declare function checkMPSSupport(): boolean;
/**
 * Get Metal GPU performance hints
 */
export declare function getMetalPerformanceHints(): Promise<{
    isIntegrated: boolean;
    recommendedWorkgroupSize: number;
    supportsTileShading: boolean;
}>;
/**
 * Log Metal GPU information
 */
export declare function logMetalInfo(): Promise<void>;
//# sourceMappingURL=metal.d.ts.map