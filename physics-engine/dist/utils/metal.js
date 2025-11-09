// physics-engine/utils/metal.ts
// Metal GPU backend utilities for Apple devices
// Provides Metal shader compilation and GPU acceleration support
/**
 * Check if Metal is supported (via WebGPU on Apple devices)
 * Metal is the native GPU API on macOS and iOS
 */
export async function checkMetalSupport() {
    if (!navigator.gpu) {
        return false;
    }
    try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter)
            return false;
        // Check if the adapter info indicates Metal backend
        // On Safari/WebKit, WebGPU uses Metal as the backend
        const info = adapter.info;
        const isMetal = info.architecture?.toLowerCase().includes('apple') ||
            info.vendor?.toLowerCase().includes('apple') ||
            navigator.userAgent.includes('Mac') ||
            navigator.userAgent.includes('iPhone') ||
            navigator.userAgent.includes('iPad');
        return isMetal;
    }
    catch (e) {
        return false;
    }
}
/**
 * Get detailed Metal GPU capabilities
 */
export async function getMetalCapabilities() {
    const capabilities = {
        metalSupported: false
    };
    if (!navigator.gpu) {
        return capabilities;
    }
    try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
            const info = adapter.info;
            const isMetal = info.architecture?.toLowerCase().includes('apple') ||
                info.vendor?.toLowerCase().includes('apple') ||
                navigator.userAgent.includes('Mac') ||
                navigator.userAgent.includes('iPhone') ||
                navigator.userAgent.includes('iPad');
            capabilities.metalSupported = isMetal;
            if (isMetal) {
                capabilities.gpuFamily = info.device || 'Unknown Apple GPU';
                capabilities.maxThreadsPerThreadgroup = adapter.limits.maxComputeWorkgroupSizeX;
                capabilities.maxBufferLength = adapter.limits.maxBufferSize;
                // Check for Metal 2.0+ features
                capabilities.supportsNonUniformThreadgroups =
                    adapter.features.has('indirect-first-instance');
            }
        }
    }
    catch (e) {
        console.error('Error checking Metal capabilities:', e);
    }
    return capabilities;
}
/**
 * Initialize Metal GPU device (via WebGPU)
 * On Apple devices, this will use Metal as the backend
 */
export async function initializeMetalGPU() {
    if (!navigator.gpu) {
        console.warn('WebGPU (Metal backend) is not supported');
        return null;
    }
    try {
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance' // Use discrete GPU if available
        });
        if (!adapter) {
            console.warn('No GPU adapter found');
            return null;
        }
        const device = await adapter.requestDevice();
        // Handle device loss
        device.lost.then((info) => {
            console.error(`Metal GPU device was lost: ${info.message}`);
            if (info.reason !== 'destroyed') {
                // Attempt to reinitialize
                initializeMetalGPU();
            }
        });
        return device;
    }
    catch (e) {
        console.error('Failed to initialize Metal GPU:', e);
        return null;
    }
}
/**
 * Load and compile Metal shader from source
 * Note: In WebGPU, we use WGSL. This utility helps with Metal-optimized compilation
 */
export async function loadMetalShader(device, shaderSource, label) {
    try {
        const shaderModule = device.createShaderModule({
            code: shaderSource,
            label: label || 'Metal Shader'
        });
        // Check for compilation errors
        const compilationInfo = await shaderModule.getCompilationInfo();
        for (const message of compilationInfo.messages) {
            if (message.type === 'error') {
                console.error(`Shader compilation error: ${message.message}`);
            }
            else if (message.type === 'warning') {
                console.warn(`Shader compilation warning: ${message.message}`);
            }
        }
        return shaderModule;
    }
    catch (e) {
        console.error('Failed to load Metal shader:', e);
        throw e;
    }
}
/**
 * Create Metal compute pipeline with optimizations
 */
export async function createMetalComputePipeline(device, shaderModule, entryPoint = 'main', label) {
    try {
        const pipeline = await device.createComputePipelineAsync({
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint
            },
            label: label || 'Metal Compute Pipeline'
        });
        return pipeline;
    }
    catch (e) {
        console.error('Failed to create Metal compute pipeline:', e);
        throw e;
    }
}
/**
 * Get optimal Metal workgroup size based on GPU capabilities
 */
export function getMetalWorkgroupSize(device, totalThreads, preferredSize = 256) {
    const maxWorkgroupSize = device.limits.maxComputeWorkgroupSizeX;
    // Metal GPUs typically perform best with workgroup sizes of 32, 64, 128, or 256
    const metalOptimalSizes = [256, 128, 64, 32];
    let workgroupSize = preferredSize;
    // Find the largest optimal size that fits
    for (const size of metalOptimalSizes) {
        if (size <= maxWorkgroupSize && size <= preferredSize) {
            workgroupSize = size;
            break;
        }
    }
    // Ensure even division if possible
    while (workgroupSize > 1 && totalThreads % workgroupSize !== 0) {
        workgroupSize = Math.floor(workgroupSize / 2);
    }
    return {
        workgroupSize,
        workgroups: Math.ceil(totalThreads / workgroupSize)
    };
}
/**
 * Create Metal buffer with optimal settings
 */
export function createMetalBuffer(device, data, usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC, label) {
    const arrayBuffer = data instanceof ArrayBuffer ? data : data.buffer;
    const buffer = device.createBuffer({
        size: arrayBuffer.byteLength,
        usage,
        label: label || 'Metal Buffer'
    });
    device.queue.writeBuffer(buffer, 0, arrayBuffer);
    return buffer;
}
/**
 * Dispatch Metal compute shader with automatic workgroup calculation
 */
export function dispatchMetalCompute(device, pipeline, bindGroup, totalThreads, preferredWorkgroupSize = 256) {
    const { workgroupSize, workgroups } = getMetalWorkgroupSize(device, totalThreads, preferredWorkgroupSize);
    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatchWorkgroups(workgroups);
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);
}
/**
 * Check for Metal Performance Shaders (MPS) support
 * This is a placeholder for future integration with native Metal
 */
export function checkMPSSupport() {
    // In a web environment, MPS is not directly accessible
    // This would be used in a native environment
    return false;
}
/**
 * Get Metal GPU performance hints
 */
export async function getMetalPerformanceHints() {
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) {
        return {
            isIntegrated: true,
            recommendedWorkgroupSize: 64,
            supportsTileShading: false
        };
    }
    // Detect if GPU is integrated or discrete
    const isIntegrated = !adapter.info.device?.toLowerCase().includes('pro');
    return {
        isIntegrated,
        recommendedWorkgroupSize: isIntegrated ? 128 : 256,
        supportsTileShading: false // Not exposed in WebGPU
    };
}
/**
 * Log Metal GPU information
 */
export async function logMetalInfo() {
    const capabilities = await getMetalCapabilities();
    console.log('Metal GPU Information:');
    console.log('- Metal Supported:', capabilities.metalSupported);
    console.log('- GPU Family:', capabilities.gpuFamily);
    console.log('- Max Threads Per Threadgroup:', capabilities.maxThreadsPerThreadgroup);
    console.log('- Max Buffer Length:', capabilities.maxBufferLength);
    console.log('- Supports Non-Uniform Threadgroups:', capabilities.supportsNonUniformThreadgroups);
    const perfHints = await getMetalPerformanceHints();
    console.log('- Integrated GPU:', perfHints.isIntegrated);
    console.log('- Recommended Workgroup Size:', perfHints.recommendedWorkgroupSize);
}
