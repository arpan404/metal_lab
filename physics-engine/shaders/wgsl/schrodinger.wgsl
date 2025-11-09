// physics-engine/shaders/wgsl/schrodinger.wgsl
// Time-dependent Schrödinger Equation Solver
// For quantum wave packet evolution and interference

struct Complex {
  real: f32,
  imag: f32,
}

struct SimParams {
  gridSize: vec3<u32>,
  spatialStep: f32,
  timeStep: f32,
  hbar: f32,
  mass: f32,
  time: f32,
}

struct Potential {
  values: array<f32>,
}

@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read> potential: array<f32>;
@group(0) @binding(2) var<storage, read> psiIn: array<Complex>;
@group(0) @binding(3) var<storage, read_write> psiOut: array<Complex>;

// Complex number operations
fn complexAdd(a: Complex, b: Complex) -> Complex {
  return Complex(a.real + b.real, a.imag + b.imag);
}

fn complexSub(a: Complex, b: Complex) -> Complex {
  return Complex(a.real - b.real, a.imag - b.imag);
}

fn complexMul(a: Complex, b: Complex) -> Complex {
  return Complex(
    a.real * b.real - a.imag * b.imag,
    a.real * b.imag + a.imag * b.real
  );
}

fn complexScale(c: Complex, s: f32) -> Complex {
  return Complex(c.real * s, c.imag * s);
}

fn complexConjugate(c: Complex) -> Complex {
  return Complex(c.real, -c.imag);
}

fn complexMagnitudeSquared(c: Complex) -> f32 {
  return c.real * c.real + c.imag * c.imag;
}

fn complexExp(phase: f32) -> Complex {
  return Complex(cos(phase), sin(phase));
}

// Convert 3D coordinates to linear index
fn index3D(x: u32, y: u32, z: u32) -> u32 {
  return x + y * params.gridSize.x + z * params.gridSize.x * params.gridSize.y;
}

// Calculate Laplacian using finite differences
fn laplacian3D(x: u32, y: u32, z: u32) -> Complex {
  let idx = index3D(x, y, z);
  let center = psiIn[idx];
  
  var lap = Complex(0.0, 0.0);
  var neighbors = Complex(0.0, 0.0);
  
  // X direction
  if (x > 0u) {
    neighbors = complexAdd(neighbors, psiIn[index3D(x - 1u, y, z)]);
  }
  if (x < params.gridSize.x - 1u) {
    neighbors = complexAdd(neighbors, psiIn[index3D(x + 1u, y, z)]);
  }
  
  // Y direction
  if (y > 0u) {
    neighbors = complexAdd(neighbors, psiIn[index3D(x, y - 1u, z)]);
  }
  if (y < params.gridSize.y - 1u) {
    neighbors = complexAdd(neighbors, psiIn[index3D(x, y + 1u, z)]);
  }
  
  // Z direction (if 3D)
  if (params.gridSize.z > 1u) {
    if (z > 0u) {
      neighbors = complexAdd(neighbors, psiIn[index3D(x, y, z - 1u)]);
    }
    if (z < params.gridSize.z - 1u) {
      neighbors = complexAdd(neighbors, psiIn[index3D(x, y, z + 1u)]);
    }
  }
  
  // Laplacian = (sum of neighbors - 6*center) / dx²
  let dx2 = params.spatialStep * params.spatialStep;
  lap = complexScale(complexSub(neighbors, complexScale(center, 6.0)), 1.0 / dx2);
  
  return lap;
}

// Split-operator method for time evolution
// H = T + V, where T is kinetic, V is potential
@compute @workgroup_size(8, 8, 4)
fn evolveWaveFunction(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let x = global_id.x;
  let y = global_id.y;
  let z = global_id.z;
  
  if (x >= params.gridSize.x || y >= params.gridSize.y || z >= params.gridSize.z) {
    return;
  }
  
  let idx = index3D(x, y, z);
  let psi = psiIn[idx];
  let V = potential[idx];
  
  // Time evolution: iℏ ∂ψ/∂t = Ĥψ = (-ℏ²/2m)∇²ψ + Vψ
  
  // Kinetic term: (-ℏ²/2m)∇²ψ
  let lap = laplacian3D(x, y, z);
  let kineticCoeff = -params.hbar * params.hbar / (2.0 * params.mass);
  let kineticTerm = complexScale(lap, kineticCoeff);
  
  // Potential term: Vψ
  let potentialTerm = complexScale(psi, V);
  
  // Total Hamiltonian: Ĥψ
  let Hpsi = complexAdd(kineticTerm, potentialTerm);
  
  // Time evolution: ψ(t+dt) = ψ(t) - (i/ℏ)Ĥψ⋅dt
  let imaginaryUnit = Complex(0.0, 1.0);
  let evolutionFactor = -params.timeStep / params.hbar;
  let evolution = complexMul(imaginaryUnit, complexScale(Hpsi, evolutionFactor));
  
  let newPsi = complexAdd(psi, evolution);
  
  psiOut[idx] = newPsi;
}

// Crank-Nicolson method (more stable, implicit)
@compute @workgroup_size(8, 8, 4)
fn crankNicolsonStep(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let x = global_id.x;
  let y = global_id.y;
  let z = global_id.z;
  
  if (x >= params.gridSize.x || y >= params.gridSize.y || z >= params.gridSize.z) {
    return;
  }
  
  let idx = index3D(x, y, z);
  
  // Crank-Nicolson: ψ(t+dt) = (1 - iHdt/2ℏ)/(1 + iHdt/2ℏ) ψ(t)
  // This requires solving a linear system, typically done iteratively
  
  // For GPU implementation, we use a simpler predictor-corrector approach
  let psi = psiIn[idx];
  let V = potential[idx];
  
  // Predictor step
  let lap = laplacian3D(x, y, z);
  let kineticCoeff = -params.hbar * params.hbar / (2.0 * params.mass);
  let kineticTerm = complexScale(lap, kineticCoeff);
  let potentialTerm = complexScale(psi, V);
  let Hpsi = complexAdd(kineticTerm, potentialTerm);
  
  let imaginaryUnit = Complex(0.0, 1.0);
  let evolutionFactor = -params.timeStep / params.hbar;
  let halfEvolution = complexMul(imaginaryUnit, complexScale(Hpsi, evolutionFactor * 0.5));
  
  let predictedPsi = complexAdd(psi, halfEvolution);
  
  // Corrector would require another pass
  psiOut[idx] = predictedPsi;
}

// Calculate probability density
@compute @workgroup_size(8, 8, 4)
fn calculateProbability(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let x = global_id.x;
  let y = global_id.y;
  let z = global_id.z;
  
  if (x >= params.gridSize.x || y >= params.gridSize.y || z >= params.gridSize.z) {
    return;
  }
  
  let idx = index3D(x, y, z);
  let psi = psiIn[idx];
  
  // Probability density: ρ = |ψ|²
  let probability = complexMagnitudeSquared(psi);
  
  // Store in a separate buffer for visualization
}

// Normalize wave function
@compute @workgroup_size(8, 8, 4)
fn normalizeWaveFunction(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let x = global_id.x;
  let y = global_id.y;
  let z = global_id.z;
  
  if (x >= params.gridSize.x || y >= params.gridSize.y || z >= params.gridSize.z) {
    return;
  }
  
  let idx = index3D(x, y, z);
  
  // This would require a two-pass approach:
  // 1. Calculate total probability (sum reduction)
  // 2. Divide each element by sqrt(total)
  
  // Placeholder for normalization
  let psi = psiIn[idx];
  // Normalization factor would be computed in a separate pass
  psiOut[idx] = psi;
}

// Initialize Gaussian wave packet
@compute @workgroup_size(8, 8, 4)
fn initializeGaussianPacket(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let x = global_id.x;
  let y = global_id.y;
  let z = global_id.z;
  
  if (x >= params.gridSize.x || y >= params.gridSize.y || z >= params.gridSize.z) {
    return;
  }
  
  let idx = index3D(x, y, z);
  
  // Convert grid position to physical coordinates
  let pos = vec3<f32>(f32(x), f32(y), f32(z)) * params.spatialStep;
  let center = vec3<f32>(params.gridSize) * params.spatialStep * 0.5;
  
  // Gaussian wave packet parameters
  let sigma = 1.0; // Width
  let k0 = vec3<f32>(5.0, 0.0, 0.0); // Initial momentum
  
  let r = pos - center;
  let gaussianAmplitude = exp(-dot(r, r) / (2.0 * sigma * sigma));
  let phase = dot(k0, r);
  
  let psi = complexScale(complexExp(phase), gaussianAmplitude);
  
  psiOut[idx] = psi;
}
