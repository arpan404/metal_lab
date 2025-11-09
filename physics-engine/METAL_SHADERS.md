# Metal GPU Shaders for Physics Engine

## Overview

This physics engine now includes full Metal GPU support for high-performance physics simulations on Apple devices. Metal is Apple's low-level graphics and compute API that provides near-direct access to the GPU.

## What's New

### Metal Shaders
All compute shaders have been ported to Metal Shading Language (MSL):

- ✅ **particle-system.metal** - Particle physics with RK4 integration
- ✅ **electric-field.metal** - Electric field calculations
- ✅ **schrodinger.metal** - Quantum wave function evolution
- ✅ **wave-propagation.metal** - Wave equation solver
- ✅ **interference-pattern.metal** - Quantum interference

### New Utilities

#### Metal GPU Support (`utils/metal.ts`)
```typescript
import {
  checkMetalSupport,
  initializeMetalGPU,
  getMetalCapabilities,
  createMetalBuffer,
  dispatchMetalCompute
} from 'physics-engine';

// Check if Metal is available
const isMetalSupported = await checkMetalSupport();

// Initialize Metal GPU
const device = await initializeMetalGPU();

// Get GPU capabilities
const capabilities = await getMetalCapabilities();
console.log(capabilities);
// {
//   metalSupported: true,
//   gpuFamily: "Apple M1",
//   maxThreadsPerThreadgroup: 1024,
//   maxBufferLength: 268435456
// }
```

#### Shader Loader (`shaders/ShaderLoader.ts`)
```typescript
import { ShaderLoader, loadShaderForBackend } from 'physics-engine';

// Load appropriate shader for current backend
const shader = await loadShaderForBackend('particle-system');

// Or load specific shader type
const loader = new ShaderLoader();
const wgslShader = await loader.loadShader('particle-system', 'wgsl');
```

## Architecture

### WebGPU + Metal Integration

On Apple devices running Safari or WebKit-based browsers:

```
Your Code
    ↓
WebGPU API (WGSL Shaders)
    ↓
Browser WebGPU Implementation
    ↓
Metal API (Automatic Translation)
    ↓
Apple GPU (Metal Hardware)
```

The browser automatically:
1. Translates WGSL → Metal Shading Language
2. Compiles Metal shaders to GPU-specific code
3. Executes on Metal-optimized hardware

### Direct Metal Usage (Native Apps)

For native macOS/iOS applications, use the `.metal` shader files directly:

```swift
import Metal

// Load Metal library
let library = device.makeDefaultLibrary()

// Get compute function
let function = library?.makeFunction(name: "updateParticles")

// Create pipeline
let pipeline = try device.makeComputePipelineState(function: function!)
```

## Usage Examples

### Basic Metal Shader Execution

```typescript
import {
  initializeMetalGPU,
  createMetalBuffer,
  dispatchMetalCompute
} from 'physics-engine';

async function runParticleSimulation() {
  // Initialize Metal GPU
  const device = await initializeMetalGPU();
  if (!device) {
    console.error('Metal not supported');
    return;
  }

  // Load shader (WGSL, which uses Metal backend on Apple devices)
  const shaderCode = `
    @compute @workgroup_size(256)
    fn updateParticles(@builtin(global_invocation_id) gid: vec3<u32>) {
      // Shader code...
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  // Create compute pipeline
  const pipeline = await device.createComputePipelineAsync({
    layout: 'auto',
    compute: {
      module: shaderModule,
      entryPoint: 'updateParticles'
    }
  });

  // Create buffers
  const particleData = new Float32Array(1000 * 8); // 1000 particles
  const buffer = createMetalBuffer(device, particleData);

  // Create bind group
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{
      binding: 0,
      resource: { buffer }
    }]
  });

  // Dispatch compute shader
  dispatchMetalCompute(device, pipeline, bindGroup, 1000);
}
```

### Performance Optimization

```typescript
import { getMetalWorkgroupSize, getMetalPerformanceHints } from 'physics-engine';

async function optimizedCompute() {
  const device = await initializeMetalGPU();

  // Get performance hints
  const hints = await getMetalPerformanceHints();
  console.log('Integrated GPU:', hints.isIntegrated);
  console.log('Recommended size:', hints.recommendedWorkgroupSize);

  // Calculate optimal workgroup size
  const totalParticles = 10000;
  const { workgroupSize, workgroups } = getMetalWorkgroupSize(
    device,
    totalParticles,
    hints.recommendedWorkgroupSize
  );

  console.log(`Using ${workgroups} workgroups of size ${workgroupSize}`);
}
```

## Testing

### Quick Test
Open `test-metal-shaders.html` in Safari on macOS/iOS:

```bash
# Start local server
python3 -m http.server 8000

# Open in Safari
open http://localhost:8000/test-metal-shaders.html
```

### Programmatic Testing

```typescript
import { checkMetalSupport, getMetalCapabilities } from 'physics-engine';

async function testMetal() {
  // Check support
  const supported = await checkMetalSupport();
  console.log('Metal supported:', supported);

  // Get capabilities
  const caps = await getMetalCapabilities();
  console.log('GPU:', caps.gpuFamily);
  console.log('Max threads:', caps.maxThreadsPerThreadgroup);
}
```

## Performance Characteristics

### Apple Silicon (M1/M2/M3)
- **Optimal Workgroup Size**: 256 threads
- **Memory Bandwidth**: Up to 400 GB/s (M2 Max)
- **Shared Memory**: 32KB per threadgroup
- **Unified Memory**: Direct CPU-GPU memory sharing

### Intel Macs
- **Optimal Workgroup Size**: 128 threads
- **Memory Bandwidth**: Varies by GPU
- **Dedicated VRAM**: Separate GPU memory

## Shader Features Comparison

| Feature | WGSL | Metal | Status |
|---------|------|-------|--------|
| Compute Shaders | ✅ | ✅ | Full parity |
| Complex Numbers | ✅ | ✅ | Implemented |
| RK4 Integration | ✅ | ✅ | Optimized |
| 3D Grids | ✅ | ✅ | Supported |
| Atomic Operations | ✅ | ✅ | Available |

## Debugging

### Enable Metal Validation

In native apps, enable Metal API validation:
```swift
// Set environment variable
setenv("METAL_DEVICE_WRAPPER_TYPE", "1", 1)
```

### WebGPU Debugging

In browser console:
```javascript
// Check adapter info
const adapter = await navigator.gpu.requestAdapter();
console.log(adapter.info);

// Check for errors
device.pushErrorScope('validation');
// ... perform operations ...
const error = await device.popErrorScope();
if (error) console.error(error.message);
```

## Browser Support

| Browser | Platform | Metal Support | Status |
|---------|----------|---------------|--------|
| Safari 16+ | macOS | ✅ Native | Full support |
| Safari 16+ | iOS/iPadOS | ✅ Native | Full support |
| Chrome | macOS | ⚠️ Limited | Via WebGPU |
| Firefox | macOS | ❌ No | Not yet |

## Migration Guide

### From WebGL to Metal/WebGPU

```typescript
// Old WebGL approach
const gl = canvas.getContext('webgl2');
// ... WebGL code ...

// New Metal/WebGPU approach
const device = await initializeMetalGPU();
const context = canvas.getContext('webgpu');
context.configure({
  device,
  format: navigator.gpu.getPreferredCanvasFormat()
});
```

### From GLSL to WGSL/Metal

Key syntax differences:
```glsl
// GLSL
uniform float time;
in vec3 position;
out vec4 color;
```

```wgsl
// WGSL (auto-translated to Metal)
@group(0) @binding(0) var<uniform> time: f32;
@location(0) var position: vec3<f32>;
@location(0) var color: vec4<f32>;
```

## Known Limitations

1. **WebGPU Availability**: Safari 16+ required
2. **Shader Debugging**: Limited in web environment
3. **Direct Metal Access**: Only in native apps
4. **Memory Limits**: Browser-imposed restrictions

## Future Enhancements

- [ ] Metal Performance Shaders (MPS) integration
- [ ] Ray tracing support (Metal 3)
- [ ] Mesh shaders
- [ ] Advanced profiling tools
- [ ] Native Metal demo app

## Resources

- [Metal Shading Language Spec](https://developer.apple.com/metal/Metal-Shading-Language-Specification.pdf)
- [WebGPU Specification](https://www.w3.org/TR/webgpu/)
- [Metal Best Practices](https://developer.apple.com/documentation/metal/best_practices)
- [Apple GPU Architecture](https://developer.apple.com/documentation/metal/gpu_devices_and_work_submission)

## Support

For issues or questions:
1. Check shader files in `shaders/metal/`
2. Review utility functions in `utils/metal.ts`
3. Test with `test-metal-shaders.html`
4. Open GitHub issue with Metal-specific label

## License

Same as physics-engine main license.
