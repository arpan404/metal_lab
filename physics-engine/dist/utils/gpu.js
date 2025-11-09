// physics-engine/utils/gpu.ts
/**
 * Check if WebGPU is supported
 */
export async function checkWebGPUSupport() {
    if (!navigator.gpu) {
        return false;
    }
    try {
        const adapter = await navigator.gpu.requestAdapter();
        return adapter !== null;
    }
    catch (e) {
        return false;
    }
}
/**
 * Get detailed GPU capabilities
 */
export async function getGPUCapabilities() {
    const capabilities = {
        webGPUSupported: false
    };
    if (!navigator.gpu) {
        return capabilities;
    }
    try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
            capabilities.webGPUSupported = true;
            capabilities.adapterInfo = adapter.info;
            capabilities.limits = adapter.limits;
            capabilities.features = adapter.features;
        }
    }
    catch (e) {
        console.error('Error checking GPU capabilities:', e);
    }
    return capabilities;
}
/**
 * Initialize WebGPU device
 */
export async function initializeGPU() {
    if (!navigator.gpu) {
        console.warn('WebGPU is not supported in this browser');
        return null;
    }
    try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            console.warn('No GPU adapter found');
            return null;
        }
        const device = await adapter.requestDevice();
        // Handle device loss
        device.lost.then((info) => {
            console.error(`WebGPU device was lost: ${info.message}`);
            if (info.reason !== 'destroyed') {
                // Attempt to reinitialize
                initializeGPU();
            }
        });
        return device;
    }
    catch (e) {
        console.error('Failed to initialize WebGPU:', e);
        return null;
    }
}
/**
 * Create compute pipeline
 */
export async function createComputePipeline(device, shaderCode, entryPoint = 'main') {
    const shaderModule = device.createShaderModule({
        code: shaderCode
    });
    return device.createComputePipeline({
        layout: 'auto',
        compute: {
            module: shaderModule,
            entryPoint
        }
    });
}
/**
 * Create storage buffer
 */
export function createStorageBuffer(device, data, usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC) {
    const buffer = device.createBuffer({
        size: data.byteLength,
        usage
    });
    device.queue.writeBuffer(buffer, 0, data);
    return buffer;
}
/**
 * Create uniform buffer
 */
export function createUniformBuffer(device, data) {
    const buffer = device.createBuffer({
        size: data.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(buffer, 0, data);
    return buffer;
}
/**
 * Read buffer data back from GPU
 */
export async function readBuffer(device, buffer, size) {
    const readBuffer = device.createBuffer({
        size,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });
    const commandEncoder = device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(buffer, 0, readBuffer, 0, size);
    device.queue.submit([commandEncoder.finish()]);
    await readBuffer.mapAsync(GPUMapMode.READ);
    const data = readBuffer.getMappedRange();
    const result = data.slice(0);
    readBuffer.unmap();
    readBuffer.destroy();
    return result;
}
/**
 * Dispatch compute shader
 */
export function dispatchCompute(device, pipeline, bindGroup, workgroupsX, workgroupsY = 1, workgroupsZ = 1) {
    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatchWorkgroups(workgroupsX, workgroupsY, workgroupsZ);
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);
}
/**
 * Check for specific GPU features
 */
export async function hasFeature(feature) {
    if (!navigator.gpu)
        return false;
    try {
        const adapter = await navigator.gpu.requestAdapter();
        return adapter?.features.has(feature) ?? false;
    }
    catch (e) {
        return false;
    }
}
/**
 * Get optimal workgroup size
 */
export function getOptimalWorkgroupSize(totalSize, preferredSize = 64) {
    // Find a workgroup size that divides evenly
    let workgroupSize = preferredSize;
    while (workgroupSize > 1 && totalSize % workgroupSize !== 0) {
        workgroupSize--;
    }
    return {
        workgroupSize,
        workgroups: Math.ceil(totalSize / workgroupSize)
    };
}
