// physics-engine/shaders/metal/wave-propagation.metal
// Wave Propagation Compute Shader for Young's Double Slit Experiment
// Uses Schrödinger equation to simulate quantum wave propagation
// Metal Shading Language version

#include <metal_stdlib>
using namespace metal;

struct WaveParams {
  uint width;
  uint height;
  float deltaTime;
  float wavelength;
  float slitSeparation;
  float slitWidth;
  float amplitude;
  float dampingFactor;
};

struct Complex {
  float real;
  float imag;
};

// Complex number operations
Complex complexMul(Complex a, Complex b) {
  return Complex {
    a.real * b.real - a.imag * b.imag,
    a.real * b.imag + a.imag * b.real
  };
}

Complex complexAdd(Complex a, Complex b) {
  return Complex { a.real + b.real, a.imag + b.imag };
}

Complex complexScale(Complex c, float s) {
  return Complex { c.real * s, c.imag * s };
}

float complexMagnitudeSquared(Complex c) {
  return c.real * c.real + c.imag * c.imag;
}

// Laplacian operator for 2D wave equation
Complex laplacian(uint index, constant WaveParams& params, device Complex* waveIn) {
  uint x = index % params.width;
  uint y = index / params.width;

  Complex sum = Complex { 0.0, 0.0 };
  float count = 0.0;

  // Central difference approximation
  if (x > 0) {
    sum = complexAdd(sum, waveIn[index - 1]);
    count += 1.0;
  }
  if (x < params.width - 1) {
    sum = complexAdd(sum, waveIn[index + 1]);
    count += 1.0;
  }
  if (y > 0) {
    sum = complexAdd(sum, waveIn[index - params.width]);
    count += 1.0;
  }
  if (y < params.height - 1) {
    sum = complexAdd(sum, waveIn[index + params.width]);
    count += 1.0;
  }

  Complex center = complexScale(waveIn[index], -count);
  return complexAdd(sum, center);
}

kernel void main(
    constant WaveParams& params [[buffer(0)]],
    device Complex* waveIn [[buffer(1)]],
    device Complex* waveOut [[buffer(2)]],
    constant float* barrier [[buffer(3)]],
    uint2 gid [[thread_position_in_grid]]
) {
  uint x = gid.x;
  uint y = gid.y;

  if (x >= params.width || y >= params.height) {
    return;
  }

  uint index = y * params.width + x;

  // Check if we're at a barrier point
  float barrierValue = barrier[index];
  if (barrierValue > 0.5) {
    // Complete reflection at barrier
    waveOut[index] = Complex { 0.0, 0.0 };
    return;
  }

  // Calculate wave propagation using finite difference method
  float k = 2.0 * 3.14159265359 / params.wavelength;
  float speedOfLight = 1.0;
  float waveSpeed = speedOfLight * k;

  // Schrödinger-like propagation
  Complex lap = laplacian(index, params, waveIn);
  Complex current = waveIn[index];

  // Time evolution: ψ(t+dt) = ψ(t) + i*ħ*∇²ψ*dt
  float hbar = 1.0;
  float dt = params.deltaTime;

  Complex derivative = complexScale(lap, hbar * waveSpeed * waveSpeed * dt);
  Complex imaginaryUnit = Complex { 0.0, 1.0 };
  Complex evolution = complexMul(imaginaryUnit, derivative);

  Complex newWave = complexAdd(current, evolution);

  // Apply damping to prevent runaway values
  newWave = complexScale(newWave, params.dampingFactor);

  // Source term at the left edge (wave emitter)
  if (x < 5) {
    float sourcePhase = k * float(x) - waveSpeed * float(y) * dt;
    Complex source = Complex {
      params.amplitude * cos(sourcePhase),
      params.amplitude * sin(sourcePhase)
    };
    newWave = complexAdd(newWave, source);
  }

  waveOut[index] = newWave;
}

// Kernel to calculate intensity for visualization
kernel void calculateIntensity(
    constant WaveParams& params [[buffer(0)]],
    device Complex* waveIn [[buffer(1)]],
    uint2 gid [[thread_position_in_grid]]
) {
  uint x = gid.x;
  uint y = gid.y;

  if (x >= params.width || y >= params.height) {
    return;
  }

  uint index = y * params.width + x;
  Complex wave = waveIn[index];

  // Calculate probability density (intensity)
  float intensity = complexMagnitudeSquared(wave);

  // Store in a separate buffer for rendering
  // This would be bound to a different binding point
}
