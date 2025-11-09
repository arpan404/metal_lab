export interface GPUCapabilities {
    webGPUSupported: boolean;
    adapterInfo?: GPUAdapterInfo;
    limits?: GPUSupportedLimits;
    features?: GPUSupportedFeatures;
}
/**
 * Check if WebGPU is supported
 */
export declare function checkWebGPUSupport(): Promise<boolean>;
/**
 * Get detailed GPU capabilities
 */
export declare function getGPUCapabilities(): Promise<GPUCapabilities>;
/**
 * Initialize WebGPU device
 */
export declare function initializeGPU(): Promise<GPUDevice | null>;
/**
 * Create compute pipeline
 */
export declare function createComputePipeline(device: GPUDevice, shaderCode: string, entryPoint?: string): Promise<GPUComputePipeline>;
/**
 * Create storage buffer
 */
export declare function createStorageBuffer(device: GPUDevice, data: ArrayBuffer | TypedArray, usage?: GPUBufferUsageFlags): GPUBuffer;
/**
 * Create uniform buffer
 */
export declare function createUniformBuffer(device: GPUDevice, data: ArrayBuffer | TypedArray): GPUBuffer;
/**
 * Read buffer data back from GPU
 */
export declare function readBuffer(device: GPUDevice, buffer: GPUBuffer, size: number): Promise<ArrayBuffer>;
/**
 * Dispatch compute shader
 */
export declare function dispatchCompute(device: GPUDevice, pipeline: GPUComputePipeline, bindGroup: GPUBindGroup, workgroupsX: number, workgroupsY?: number, workgroupsZ?: number): void;
/**
 * Check for specific GPU features
 */
export declare function hasFeature(feature: GPUFeatureName): Promise<boolean>;
/**
 * Get optimal workgroup size
 */
export declare function getOptimalWorkgroupSize(totalSize: number, preferredSize?: number): {
    workgroupSize: number;
    workgroups: number;
};
type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
export {};
//# sourceMappingURL=gpu.d.ts.map