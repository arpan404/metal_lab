# Metal Shaders for Physics Engine

This directory contains Metal Shading Language (MSL) versions of the physics simulation compute shaders.

## Overview

Metal is Apple's GPU programming framework for macOS and iOS. These shaders are optimized for Apple Silicon and Intel-based Macs with Metal support.

## Shader Files

- **particle-system.metal** - Charged particle dynamics for Rutherford and Millikan experiments
- **electric-field.metal** - Electric field visualization and calculation
- **schrodinger.metal** - Time-dependent Schrödinger equation solver
- **wave-propagation.metal** - Quantum wave propagation for double-slit experiment
- **interference-pattern.metal** - Classical and quantum interference patterns

## Usage in Web Environment

While these are native Metal shaders, when running in a web environment (Safari on macOS/iOS):

1. **WebGPU Backend**: The browser's WebGPU implementation uses Metal as its backend
2. **WGSL to Metal**: WGSL shaders are automatically translated to Metal by the browser
3. **Metal Optimization**: These Metal shaders serve as reference implementations optimized for Apple GPUs

## Direct Metal Usage (Native Apps)

To use these shaders in a native macOS/iOS application:

```swift
// Load the Metal library
guard let library = device.makeDefaultLibrary() else {
    fatalError("Could not load Metal library")
}

// Create compute pipeline
guard let kernelFunction = library.makeFunction(name: "updateParticles") else {
    fatalError("Could not find kernel function")
}

let pipelineState = try device.makeComputePipelineState(function: kernelFunction)
```

## Shader Features

### Particle System
- Runge-Kutta 4th order integration
- Coulomb force calculations
- Rutherford scattering simulation
- Millikan oil drop forces (electric, gravity, drag)

### Electric Field
- Point charge field calculations
- Parallel plate capacitor fields
- Field line integration
- Energy density computation

### Schrödinger Equation
- Complex number arithmetic on GPU
- Finite difference Laplacian
- Time evolution operators
- Crank-Nicolson method (implicit)
- Gaussian wave packet initialization

### Wave Propagation
- 2D wave equation solver
- Barrier reflection
- Source emission
- Damping factors

### Interference Pattern
- Classical wave interference
- Quantum probability amplitudes
- Single-slit diffraction
- Fraunhofer diffraction
- Gaussian beam profiles

## Performance Optimization

Metal shaders are optimized for Apple GPUs with:

1. **Optimal Threadgroup Sizes**: 32, 64, 128, or 256 threads
2. **Memory Coalescing**: Aligned memory access patterns
3. **SIMD Operations**: Vectorized operations where possible
4. **Metal 2.0+ Features**: Non-uniform threadgroups, indirect dispatch

## Compilation

Metal shaders are compiled at runtime by the Metal framework. The compilation process:

1. Loads `.metal` source files
2. Compiles to Metal Intermediate Language (AIR)
3. Links into a Metal library
4. Creates compute pipelines with specific entry points

## Buffer Bindings

Metal uses explicit buffer bindings:

```metal
kernel void kernelName(
    constant Params& params [[buffer(0)]],
    device Data* data [[buffer(1)]],
    uint gid [[thread_position_in_grid]]
)
```

## Cross-Platform Considerations

- **WGSL Equivalents**: Each Metal shader has a corresponding WGSL version
- **WebGPU Mapping**: Buffer bindings map directly to WebGPU bind groups
- **Compute Pipeline**: Kernel functions map to compute shader entry points

## Testing

To test Metal shader functionality:

1. Check Metal support via WebGPU
2. Initialize Metal device
3. Load shader source
4. Compile compute pipeline
5. Dispatch workgroups
6. Read back results

See `utils/metal.ts` for Metal GPU utilities.

## References

- [Metal Shading Language Specification](https://developer.apple.com/metal/Metal-Shading-Language-Specification.pdf)
- [WebGPU Specification](https://www.w3.org/TR/webgpu/)
- [Metal Best Practices Guide](https://developer.apple.com/documentation/metal/best_practices)
