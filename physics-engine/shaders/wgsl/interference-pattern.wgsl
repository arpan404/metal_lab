// physics-engine/shaders/wgsl/interference-pattern.wgsl
// Interference Pattern Calculation for Double Slit Experiment
// Computes classical and quantum interference patterns

struct InterferenceParams {
  screenWidth: u32,
  screenHeight: u32,
  wavelength: f32,
  slitSeparation: f32,
  slitWidth: f32,
  distanceToScreen: f32,
  intensity: f32,
  quantumMode: u32,
}

struct SlitConfig {
  position: vec2<f32>,
  width: f32,
  isOpen: u32,
}

@group(0) @binding(0) var<uniform> params: InterferenceParams;
@group(0) @binding(1) var<storage, read> slits: array<SlitConfig>;
@group(0) @binding(2) var<storage, read_write> intensityPattern: array<f32>;

const PI: f32 = 3.14159265359;
const TWO_PI: f32 = 6.28318530718;

// Calculate path difference from a slit to a point on the screen
fn pathDifference(slitPos: vec2<f32>, screenPos: vec2<f32>) -> f32 {
  let dx = screenPos.x - slitPos.x;
  let dy = screenPos.y - slitPos.y;
  let dz = params.distanceToScreen;
  
  return sqrt(dx * dx + dy * dy + dz * dz);
}

// Single slit diffraction amplitude
fn singleSlitAmplitude(slitPos: vec2<f32>, screenPos: vec2<f32>) -> f32 {
  let r = pathDifference(slitPos, screenPos);
  
  // Angle from slit center to screen point
  let dx = screenPos.x - slitPos.x;
  let theta = atan2(dx, params.distanceToScreen);
  
  // Single slit diffraction: sinc function
  let beta = (PI * params.slitWidth * sin(theta)) / params.wavelength;
  
  var amplitude: f32;
  if (abs(beta) < 0.001) {
    amplitude = 1.0;
  } else {
    amplitude = sin(beta) / beta;
  }
  
  return amplitude / r; // Include 1/r falloff
}

// Calculate phase at a point from a slit
fn calculatePhase(slitPos: vec2<f32>, screenPos: vec2<f32>) -> f32 {
  let r = pathDifference(slitPos, screenPos);
  let k = TWO_PI / params.wavelength;
  return k * r;
}

// Classical wave interference calculation
fn calculateClassicalInterference(screenPos: vec2<f32>) -> f32 {
  var totalAmplitude = 0.0;
  var totalIntensity = 0.0;
  
  // Sum contributions from all open slits
  for (var i = 0u; i < 2u; i++) {
    if (slits[i].isOpen == 0u) {
      continue;
    }
    
    let amplitude = singleSlitAmplitude(slits[i].position, screenPos);
    let phase = calculatePhase(slits[i].position, screenPos);
    
    // Add complex amplitude: A*e^(iφ)
    totalAmplitude += amplitude * cos(phase);
    totalIntensity += amplitude * sin(phase);
  }
  
  // Intensity = |A|²
  let intensity = totalAmplitude * totalAmplitude + totalIntensity * totalIntensity;
  
  return intensity * params.intensity;
}

// Quantum mechanical probability calculation
fn calculateQuantumProbability(screenPos: vec2<f32>) -> f32 {
  // In quantum mechanics, we add probability amplitudes
  var realPart = 0.0;
  var imagPart = 0.0;
  
  for (var i = 0u; i < 2u; i++) {
    if (slits[i].isOpen == 0u) {
      continue;
    }
    
    let amplitude = singleSlitAmplitude(slits[i].position, screenPos);
    let phase = calculatePhase(slits[i].position, screenPos);
    
    // Quantum amplitude: ψ = A*e^(iφ)
    realPart += amplitude * cos(phase);
    imagPart += amplitude * sin(phase);
  }
  
  // Probability = |ψ|²
  let probability = realPart * realPart + imagPart * imagPart;
  
  return probability * params.intensity;
}

// Fraunhofer diffraction pattern (far-field)
fn fraunhoferPattern(screenPos: vec2<f32>) -> f32 {
  let x = screenPos.x;
  let y = screenPos.y;
  
  // Angular position
  let thetaX = atan2(x, params.distanceToScreen);
  let thetaY = atan2(y, params.distanceToScreen);
  
  // Double slit interference factor
  let beta = (PI * params.slitSeparation * sin(thetaX)) / params.wavelength;
  var interferencePattern: f32;
  if (abs(beta) < 0.001) {
    interferencePattern = 4.0; // cos²(0) = 1, factor of 4 from two slits
  } else {
    interferencePattern = 4.0 * cos(beta) * cos(beta);
  }
  
  // Single slit diffraction envelope
  let alpha = (PI * params.slitWidth * sin(thetaX)) / params.wavelength;
  var diffractionEnvelope: f32;
  if (abs(alpha) < 0.001) {
    diffractionEnvelope = 1.0;
  } else {
    let sincAlpha = sin(alpha) / alpha;
    diffractionEnvelope = sincAlpha * sincAlpha;
  }
  
  return params.intensity * interferencePattern * diffractionEnvelope;
}

// Convert screen coordinates to array index
fn screenIndex(x: u32, y: u32) -> u32 {
  return y * params.screenWidth + x;
}

// Convert pixel coordinates to physical coordinates
fn pixelToPhysical(pixelPos: vec2<u32>) -> vec2<f32> {
  // Center the coordinate system
  let centerX = f32(params.screenWidth) / 2.0;
  let centerY = f32(params.screenHeight) / 2.0;
  
  // Physical screen size (arbitrary units, should match experimental setup)
  let screenPhysicalWidth = 0.1; // 10 cm
  let screenPhysicalHeight = 0.1;
  
  let x = (f32(pixelPos.x) - centerX) / f32(params.screenWidth) * screenPhysicalWidth;
  let y = (f32(pixelPos.y) - centerY) / f32(params.screenHeight) * screenPhysicalHeight;
  
  return vec2<f32>(x, y);
}

@compute @workgroup_size(16, 16)
fn calculatePattern(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let pixelX = global_id.x;
  let pixelY = global_id.y;
  
  if (pixelX >= params.screenWidth || pixelY >= params.screenHeight) {
    return;
  }
  
  let screenPos = pixelToPhysical(vec2<u32>(pixelX, pixelY));
  let idx = screenIndex(pixelX, pixelY);
  
  var intensity: f32;
  
  if (params.quantumMode == 1u) {
    // Quantum interference
    intensity = calculateQuantumProbability(screenPos);
  } else {
    // Classical wave interference
    intensity = calculateClassicalInterference(screenPos);
  }
  
  // Apply Fraunhofer approximation for far-field
  // intensity = fraunhoferPattern(screenPos);
  
  intensityPattern[idx] = intensity;
}

// Time-evolved interference pattern (for wave packets)
@compute @workgroup_size(16, 16)
fn calculateTimeEvolvedPattern(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let pixelX = global_id.x;
  let pixelY = global_id.y;
  
  if (pixelX >= params.screenWidth || pixelY >= params.screenHeight) {
    return;
  }
  
  let screenPos = pixelToPhysical(vec2<u32>(pixelX, pixelY));
  let idx = screenIndex(pixelX, pixelY);
  
  // This would integrate wave function contributions over time
  // For particle detection, this accumulates detection events
  
  let currentIntensity = intensityPattern[idx];
  let newContribution = calculateQuantumProbability(screenPos);
  
  // Accumulate over time
  intensityPattern[idx] = currentIntensity + newContribution * 0.01;
}

// Gaussian beam intensity profile
fn gaussianBeam(screenPos: vec2<f32>, beamWaist: f32) -> f32 {
  let r2 = screenPos.x * screenPos.x + screenPos.y * screenPos.y;
  let z = params.distanceToScreen;
  
  // Rayleigh range
  let z0 = PI * beamWaist * beamWaist / params.wavelength;
  
  // Beam radius at distance z
  let wz = beamWaist * sqrt(1.0 + (z / z0) * (z / z0));
  
  // Intensity profile
  let intensity = exp(-2.0 * r2 / (wz * wz));
  
  return params.intensity * intensity;
}

// Apply beam profile modulation
@compute @workgroup_size(16, 16)
fn applyBeamProfile(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let pixelX = global_id.x;
  let pixelY = global_id.y;
  
  if (pixelX >= params.screenWidth || pixelY >= params.screenHeight) {
    return;
  }
  
  let screenPos = pixelToPhysical(vec2<u32>(pixelX, pixelY));
  let idx = screenIndex(pixelX, pixelY);
  
  let beamWaist = 0.005; // 5 mm
  let beamProfile = gaussianBeam(screenPos, beamWaist);
  
  intensityPattern[idx] = intensityPattern[idx] * beamProfile;
}
