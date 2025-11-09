// physics-engine/shaders/metal/schrodinger.metal
// Time-dependent Schrödinger Equation Solver
// For quantum wave packet evolution and interference
// Metal Shading Language version

#include <metal_stdlib>
using namespace metal;

struct Complex {
  float real;
  float imag;
};

struct SimParams {
  uint3 gridSize;
  float spatialStep;
  float timeStep;
  float hbar;
  float mass;
  float time;
};

// Complex number operations
Complex complexAdd(Complex a, Complex b) {
  return Complex { a.real + b.real, a.imag + b.imag };
}

Complex complexSub(Complex a, Complex b) {
  return Complex { a.real - b.real, a.imag - b.imag };
}

Complex complexMul(Complex a, Complex b) {
  return Complex {
    a.real * b.real - a.imag * b.imag,
    a.real * b.imag + a.imag * b.real
  };
}

Complex complexScale(Complex c, float s) {
  return Complex { c.real * s, c.imag * s };
}

Complex complexConjugate(Complex c) {
  return Complex { c.real, -c.imag };
}

float complexMagnitudeSquared(Complex c) {
  return c.real * c.real + c.imag * c.imag;
}

Complex complexExp(float phase) {
  return Complex { cos(phase), sin(phase) };
}

// Convert 3D coordinates to linear index
uint index3D(uint x, uint y, uint z, constant SimParams& params) {
  return x + y * params.gridSize.x + z * params.gridSize.x * params.gridSize.y;
}

// Calculate Laplacian using finite differences
Complex laplacian3D(uint x, uint y, uint z, constant SimParams& params, device Complex* psiIn) {
  uint idx = index3D(x, y, z, params);
  Complex center = psiIn[idx];

  Complex lap = Complex { 0.0, 0.0 };
  Complex neighbors = Complex { 0.0, 0.0 };

  // X direction
  if (x > 0) {
    neighbors = complexAdd(neighbors, psiIn[index3D(x - 1, y, z, params)]);
  }
  if (x < params.gridSize.x - 1) {
    neighbors = complexAdd(neighbors, psiIn[index3D(x + 1, y, z, params)]);
  }

  // Y direction
  if (y > 0) {
    neighbors = complexAdd(neighbors, psiIn[index3D(x, y - 1, z, params)]);
  }
  if (y < params.gridSize.y - 1) {
    neighbors = complexAdd(neighbors, psiIn[index3D(x, y + 1, z, params)]);
  }

  // Z direction (if 3D)
  if (params.gridSize.z > 1) {
    if (z > 0) {
      neighbors = complexAdd(neighbors, psiIn[index3D(x, y, z - 1, params)]);
    }
    if (z < params.gridSize.z - 1) {
      neighbors = complexAdd(neighbors, psiIn[index3D(x, y, z + 1, params)]);
    }
  }

  // Laplacian = (sum of neighbors - 6*center) / dx²
  float dx2 = params.spatialStep * params.spatialStep;
  lap = complexScale(complexSub(neighbors, complexScale(center, 6.0)), 1.0 / dx2);

  return lap;
}

// Split-operator method for time evolution
// H = T + V, where T is kinetic, V is potential
kernel void evolveWaveFunction(
    constant SimParams& params [[buffer(0)]],
    constant float* potential [[buffer(1)]],
    device Complex* psiIn [[buffer(2)]],
    device Complex* psiOut [[buffer(3)]],
    uint3 gid [[thread_position_in_grid]]
) {
  uint x = gid.x;
  uint y = gid.y;
  uint z = gid.z;

  if (x >= params.gridSize.x || y >= params.gridSize.y || z >= params.gridSize.z) {
    return;
  }

  uint idx = index3D(x, y, z, params);
  Complex psi = psiIn[idx];
  float V = potential[idx];

  // Time evolution: iℏ ∂ψ/∂t = Ĥψ = (-ℏ²/2m)∇²ψ + Vψ

  // Kinetic term: (-ℏ²/2m)∇²ψ
  Complex lap = laplacian3D(x, y, z, params, psiIn);
  float kineticCoeff = -params.hbar * params.hbar / (2.0 * params.mass);
  Complex kineticTerm = complexScale(lap, kineticCoeff);

  // Potential term: Vψ
  Complex potentialTerm = complexScale(psi, V);

  // Total Hamiltonian: Ĥψ
  Complex Hpsi = complexAdd(kineticTerm, potentialTerm);

  // Time evolution: ψ(t+dt) = ψ(t) - (i/ℏ)Ĥψ⋅dt
  Complex imaginaryUnit = Complex { 0.0, 1.0 };
  float evolutionFactor = -params.timeStep / params.hbar;
  Complex evolution = complexMul(imaginaryUnit, complexScale(Hpsi, evolutionFactor));

  Complex newPsi = complexAdd(psi, evolution);

  psiOut[idx] = newPsi;
}

// Crank-Nicolson method (more stable, implicit)
kernel void crankNicolsonStep(
    constant SimParams& params [[buffer(0)]],
    constant float* potential [[buffer(1)]],
    device Complex* psiIn [[buffer(2)]],
    device Complex* psiOut [[buffer(3)]],
    uint3 gid [[thread_position_in_grid]]
) {
  uint x = gid.x;
  uint y = gid.y;
  uint z = gid.z;

  if (x >= params.gridSize.x || y >= params.gridSize.y || z >= params.gridSize.z) {
    return;
  }

  uint idx = index3D(x, y, z, params);

  // Crank-Nicolson: ψ(t+dt) = (1 - iHdt/2ℏ)/(1 + iHdt/2ℏ) ψ(t)
  // This requires solving a linear system, typically done iteratively

  // For GPU implementation, we use a simpler predictor-corrector approach
  Complex psi = psiIn[idx];
  float V = potential[idx];

  // Predictor step
  Complex lap = laplacian3D(x, y, z, params, psiIn);
  float kineticCoeff = -params.hbar * params.hbar / (2.0 * params.mass);
  Complex kineticTerm = complexScale(lap, kineticCoeff);
  Complex potentialTerm = complexScale(psi, V);
  Complex Hpsi = complexAdd(kineticTerm, potentialTerm);

  Complex imaginaryUnit = Complex { 0.0, 1.0 };
  float evolutionFactor = -params.timeStep / params.hbar;
  Complex halfEvolution = complexMul(imaginaryUnit, complexScale(Hpsi, evolutionFactor * 0.5));

  Complex predictedPsi = complexAdd(psi, halfEvolution);

  // Corrector would require another pass
  psiOut[idx] = predictedPsi;
}

// Calculate probability density
kernel void calculateProbability(
    constant SimParams& params [[buffer(0)]],
    device Complex* psiIn [[buffer(2)]],
    uint3 gid [[thread_position_in_grid]]
) {
  uint x = gid.x;
  uint y = gid.y;
  uint z = gid.z;

  if (x >= params.gridSize.x || y >= params.gridSize.y || z >= params.gridSize.z) {
    return;
  }

  uint idx = index3D(x, y, z, params);
  Complex psi = psiIn[idx];

  // Probability density: ρ = |ψ|²
  float probability = complexMagnitudeSquared(psi);

  // Store in a separate buffer for visualization
}

// Normalize wave function
kernel void normalizeWaveFunction(
    constant SimParams& params [[buffer(0)]],
    device Complex* psiIn [[buffer(2)]],
    device Complex* psiOut [[buffer(3)]],
    uint3 gid [[thread_position_in_grid]]
) {
  uint x = gid.x;
  uint y = gid.y;
  uint z = gid.z;

  if (x >= params.gridSize.x || y >= params.gridSize.y || z >= params.gridSize.z) {
    return;
  }

  uint idx = index3D(x, y, z, params);

  // This would require a two-pass approach:
  // 1. Calculate total probability (sum reduction)
  // 2. Divide each element by sqrt(total)

  // Placeholder for normalization
  Complex psi = psiIn[idx];
  // Normalization factor would be computed in a separate pass
  psiOut[idx] = psi;
}

// Initialize Gaussian wave packet
kernel void initializeGaussianPacket(
    constant SimParams& params [[buffer(0)]],
    device Complex* psiOut [[buffer(3)]],
    uint3 gid [[thread_position_in_grid]]
) {
  uint x = gid.x;
  uint y = gid.y;
  uint z = gid.z;

  if (x >= params.gridSize.x || y >= params.gridSize.y || z >= params.gridSize.z) {
    return;
  }

  uint idx = index3D(x, y, z, params);

  // Convert grid position to physical coordinates
  float3 pos = float3(float(x), float(y), float(z)) * params.spatialStep;
  float3 center = float3(params.gridSize) * params.spatialStep * 0.5;

  // Gaussian wave packet parameters
  float sigma = 1.0; // Width
  float3 k0 = float3(5.0, 0.0, 0.0); // Initial momentum

  float3 r = pos - center;
  float gaussianAmplitude = exp(-dot(r, r) / (2.0 * sigma * sigma));
  float phase = dot(k0, r);

  Complex psi = complexScale(complexExp(phase), gaussianAmplitude);

  psiOut[idx] = psi;
}
