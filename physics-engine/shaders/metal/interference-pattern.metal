// physics-engine/shaders/metal/interference-pattern.metal
// Interference Pattern Calculation for Double Slit Experiment
// Computes classical and quantum interference patterns
// Metal Shading Language version

#include <metal_stdlib>
using namespace metal;

struct InterferenceParams {
  uint screenWidth;
  uint screenHeight;
  float wavelength;
  float slitSeparation;
  float slitWidth;
  float distanceToScreen;
  float intensity;
  uint quantumMode;
};

struct SlitConfig {
  float2 position;
  float width;
  uint isOpen;
};

constant float PI = 3.14159265359;
constant float TWO_PI = 6.28318530718;

// Calculate path difference from a slit to a point on the screen
float pathDifference(float2 slitPos, float2 screenPos, constant InterferenceParams& params) {
  float dx = screenPos.x - slitPos.x;
  float dy = screenPos.y - slitPos.y;
  float dz = params.distanceToScreen;

  return sqrt(dx * dx + dy * dy + dz * dz);
}

// Single slit diffraction amplitude
float singleSlitAmplitude(float2 slitPos, float2 screenPos, constant InterferenceParams& params) {
  float r = pathDifference(slitPos, screenPos, params);

  // Angle from slit center to screen point
  float dx = screenPos.x - slitPos.x;
  float theta = atan2(dx, params.distanceToScreen);

  // Single slit diffraction: sinc function
  float beta = (PI * params.slitWidth * sin(theta)) / params.wavelength;

  float amplitude;
  if (abs(beta) < 0.001) {
    amplitude = 1.0;
  } else {
    amplitude = sin(beta) / beta;
  }

  return amplitude / r; // Include 1/r falloff
}

// Calculate phase at a point from a slit
float calculatePhase(float2 slitPos, float2 screenPos, constant InterferenceParams& params) {
  float r = pathDifference(slitPos, screenPos, params);
  float k = TWO_PI / params.wavelength;
  return k * r;
}

// Classical wave interference calculation
float calculateClassicalInterference(float2 screenPos, constant InterferenceParams& params, constant SlitConfig* slits) {
  float totalAmplitude = 0.0;
  float totalIntensity = 0.0;

  // Sum contributions from all open slits
  for (uint i = 0; i < 2; i++) {
    if (slits[i].isOpen == 0) {
      continue;
    }

    float amplitude = singleSlitAmplitude(slits[i].position, screenPos, params);
    float phase = calculatePhase(slits[i].position, screenPos, params);

    // Add complex amplitude: A*e^(iφ)
    totalAmplitude += amplitude * cos(phase);
    totalIntensity += amplitude * sin(phase);
  }

  // Intensity = |A|²
  float intensity = totalAmplitude * totalAmplitude + totalIntensity * totalIntensity;

  return intensity * params.intensity;
}

// Quantum mechanical probability calculation
float calculateQuantumProbability(float2 screenPos, constant InterferenceParams& params, constant SlitConfig* slits) {
  // In quantum mechanics, we add probability amplitudes
  float realPart = 0.0;
  float imagPart = 0.0;

  for (uint i = 0; i < 2; i++) {
    if (slits[i].isOpen == 0) {
      continue;
    }

    float amplitude = singleSlitAmplitude(slits[i].position, screenPos, params);
    float phase = calculatePhase(slits[i].position, screenPos, params);

    // Quantum amplitude: ψ = A*e^(iφ)
    realPart += amplitude * cos(phase);
    imagPart += amplitude * sin(phase);
  }

  // Probability = |ψ|²
  float probability = realPart * realPart + imagPart * imagPart;

  return probability * params.intensity;
}

// Fraunhofer diffraction pattern (far-field)
float fraunhoferPattern(float2 screenPos, constant InterferenceParams& params) {
  float x = screenPos.x;
  float y = screenPos.y;

  // Angular position
  float thetaX = atan2(x, params.distanceToScreen);
  float thetaY = atan2(y, params.distanceToScreen);

  // Double slit interference factor
  float beta = (PI * params.slitSeparation * sin(thetaX)) / params.wavelength;
  float interferencePattern;
  if (abs(beta) < 0.001) {
    interferencePattern = 4.0; // cos²(0) = 1, factor of 4 from two slits
  } else {
    interferencePattern = 4.0 * cos(beta) * cos(beta);
  }

  // Single slit diffraction envelope
  float alpha = (PI * params.slitWidth * sin(thetaX)) / params.wavelength;
  float diffractionEnvelope;
  if (abs(alpha) < 0.001) {
    diffractionEnvelope = 1.0;
  } else {
    float sincAlpha = sin(alpha) / alpha;
    diffractionEnvelope = sincAlpha * sincAlpha;
  }

  return params.intensity * interferencePattern * diffractionEnvelope;
}

// Convert screen coordinates to array index
uint screenIndex(uint x, uint y, constant InterferenceParams& params) {
  return y * params.screenWidth + x;
}

// Convert pixel coordinates to physical coordinates
float2 pixelToPhysical(uint2 pixelPos, constant InterferenceParams& params) {
  // Center the coordinate system
  float centerX = float(params.screenWidth) / 2.0;
  float centerY = float(params.screenHeight) / 2.0;

  // Physical screen size (arbitrary units, should match experimental setup)
  float screenPhysicalWidth = 0.1; // 10 cm
  float screenPhysicalHeight = 0.1;

  float x = (float(pixelPos.x) - centerX) / float(params.screenWidth) * screenPhysicalWidth;
  float y = (float(pixelPos.y) - centerY) / float(params.screenHeight) * screenPhysicalHeight;

  return float2(x, y);
}

kernel void calculatePattern(
    constant InterferenceParams& params [[buffer(0)]],
    constant SlitConfig* slits [[buffer(1)]],
    device float* intensityPattern [[buffer(2)]],
    uint2 gid [[thread_position_in_grid]]
) {
  uint pixelX = gid.x;
  uint pixelY = gid.y;

  if (pixelX >= params.screenWidth || pixelY >= params.screenHeight) {
    return;
  }

  float2 screenPos = pixelToPhysical(uint2(pixelX, pixelY), params);
  uint idx = screenIndex(pixelX, pixelY, params);

  float intensity;

  if (params.quantumMode == 1) {
    // Quantum interference
    intensity = calculateQuantumProbability(screenPos, params, slits);
  } else {
    // Classical wave interference
    intensity = calculateClassicalInterference(screenPos, params, slits);
  }

  // Apply Fraunhofer approximation for far-field
  // intensity = fraunhoferPattern(screenPos, params);

  intensityPattern[idx] = intensity;
}

// Time-evolved interference pattern (for wave packets)
kernel void calculateTimeEvolvedPattern(
    constant InterferenceParams& params [[buffer(0)]],
    constant SlitConfig* slits [[buffer(1)]],
    device float* intensityPattern [[buffer(2)]],
    uint2 gid [[thread_position_in_grid]]
) {
  uint pixelX = gid.x;
  uint pixelY = gid.y;

  if (pixelX >= params.screenWidth || pixelY >= params.screenHeight) {
    return;
  }

  float2 screenPos = pixelToPhysical(uint2(pixelX, pixelY), params);
  uint idx = screenIndex(pixelX, pixelY, params);

  // This would integrate wave function contributions over time
  // For particle detection, this accumulates detection events

  float currentIntensity = intensityPattern[idx];
  float newContribution = calculateQuantumProbability(screenPos, params, slits);

  // Accumulate over time
  intensityPattern[idx] = currentIntensity + newContribution * 0.01;
}

// Gaussian beam intensity profile
float gaussianBeam(float2 screenPos, float beamWaist, constant InterferenceParams& params) {
  float r2 = screenPos.x * screenPos.x + screenPos.y * screenPos.y;
  float z = params.distanceToScreen;

  // Rayleigh range
  float z0 = PI * beamWaist * beamWaist / params.wavelength;

  // Beam radius at distance z
  float wz = beamWaist * sqrt(1.0 + (z / z0) * (z / z0));

  // Intensity profile
  float intensity = exp(-2.0 * r2 / (wz * wz));

  return params.intensity * intensity;
}

// Apply beam profile modulation
kernel void applyBeamProfile(
    constant InterferenceParams& params [[buffer(0)]],
    device float* intensityPattern [[buffer(2)]],
    uint2 gid [[thread_position_in_grid]]
) {
  uint pixelX = gid.x;
  uint pixelY = gid.y;

  if (pixelX >= params.screenWidth || pixelY >= params.screenHeight) {
    return;
  }

  float2 screenPos = pixelToPhysical(uint2(pixelX, pixelY), params);
  uint idx = screenIndex(pixelX, pixelY, params);

  float beamWaist = 0.005; // 5 mm
  float beamProfile = gaussianBeam(screenPos, beamWaist, params);

  intensityPattern[idx] = intensityPattern[idx] * beamProfile;
}
