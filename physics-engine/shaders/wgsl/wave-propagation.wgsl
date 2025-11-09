// physics-engine/shaders/wgsl/wave-propagation.wgsl
// Wave Propagation Compute Shader for Young's Double Slit Experiment
// Uses Schrödinger equation to simulate quantum wave propagation

struct WaveParams {
  width: u32,
  height: u32,
  deltaTime: f32,
  wavelength: f32,
  slitSeparation: f32,
  slitWidth: f32,
  amplitude: f32,
  dampingFactor: f32,
}

struct Complex {
  real: f32,
  imag: f32,
}

@group(0) @binding(0) var<uniform> params: WaveParams;
@group(0) @binding(1) var<storage, read> waveIn: array<Complex>;
@group(0) @binding(2) var<storage, read_write> waveOut: array<Complex>;
@group(0) @binding(3) var<storage, read> barrier: array<f32>;

// Complex number operations
fn complexMul(a: Complex, b: Complex) -> Complex {
  return Complex(
    a.real * b.real - a.imag * b.imag,
    a.real * b.imag + a.imag * b.real
  );
}

fn complexAdd(a: Complex, b: Complex) -> Complex {
  return Complex(a.real + b.real, a.imag + b.imag);
}

fn complexScale(c: Complex, s: f32) -> Complex {
  return Complex(c.real * s, c.imag * s);
}

fn complexMagnitudeSquared(c: Complex) -> f32 {
  return c.real * c.real + c.imag * c.imag;
}

// Laplacian operator for 2D wave equation
fn laplacian(index: u32) -> Complex {
  let x = index % params.width;
  let y = index / params.width;
  
  var sum = Complex(0.0, 0.0);
  var count = 0.0;
  
  // Central difference approximation
  if (x > 0u) {
    sum = complexAdd(sum, waveIn[index - 1u]);
    count += 1.0;
  }
  if (x < params.width - 1u) {
    sum = complexAdd(sum, waveIn[index + 1u]);
    count += 1.0;
  }
  if (y > 0u) {
    sum = complexAdd(sum, waveIn[index - params.width]);
    count += 1.0;
  }
  if (y < params.height - 1u) {
    sum = complexAdd(sum, waveIn[index + params.width]);
    count += 1.0;
  }
  
  let center = complexScale(waveIn[index], -count);
  return complexAdd(sum, center);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let x = global_id.x;
  let y = global_id.y;
  
  if (x >= params.width || y >= params.height) {
    return;
  }
  
  let index = y * params.width + x;
  
  // Check if we're at a barrier point
  let barrierValue = barrier[index];
  if (barrierValue > 0.5) {
    // Complete reflection at barrier
    waveOut[index] = Complex(0.0, 0.0);
    return;
  }
  
  // Calculate wave propagation using finite difference method
  let k = 2.0 * 3.14159265359 / params.wavelength;
  let speedOfLight = 1.0;
  let waveSpeed = speedOfLight * k;
  
  // Schrödinger-like propagation
  let lap = laplacian(index);
  let current = waveIn[index];
  
  // Time evolution: ψ(t+dt) = ψ(t) + i*ħ*∇²ψ*dt
  let hbar = 1.0;
  let dt = params.deltaTime;
  
  let derivative = complexScale(lap, hbar * waveSpeed * waveSpeed * dt);
  let imaginaryUnit = Complex(0.0, 1.0);
  let evolution = complexMul(imaginaryUnit, derivative);
  
  var newWave = complexAdd(current, evolution);
  
  // Apply damping to prevent runaway values
  newWave = complexScale(newWave, params.dampingFactor);
  
  // Source term at the left edge (wave emitter)
  if (x < 5u) {
    let sourcePhase = k * f32(x) - waveSpeed * f32(y) * dt;
    let source = Complex(
      params.amplitude * cos(sourcePhase),
      params.amplitude * sin(sourcePhase)
    );
    newWave = complexAdd(newWave, source);
  }
  
  waveOut[index] = newWave;
}

// Kernel to calculate intensity for visualization
@compute @workgroup_size(16, 16)
fn calculateIntensity(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let x = global_id.x;
  let y = global_id.y;
  
  if (x >= params.width || y >= params.height) {
    return;
  }
  
  let index = y * params.width + x;
  let wave = waveIn[index];
  
  // Calculate probability density (intensity)
  let intensity = complexMagnitudeSquared(wave);
  
  // Store in a separate buffer for rendering
  // This would be bound to a different binding point
}
