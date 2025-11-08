// Wave propagation compute shader for double-slit experiment
// Solves 2D wave equation: ∂²ψ/∂t² = c²(∂²ψ/∂x² + ∂²ψ/∂y²)

struct WavePoint {
  amplitude: f32,
  phase: f32,
  velocity: f32,
  damping: f32,
}

struct SimParams {
  time: f32,
  deltaTime: f32,
  waveSpeed: f32,
  frequency: f32,
  slitWidth: f32,
  slitSeparation: f32,
  gridWidth: u32,
  gridHeight: u32,
}

@group(0) @binding(0) var<storage, read_write> waveField: array<WavePoint>;
@group(0) @binding(1) var<storage, read_write> nextWaveField: array<WavePoint>;
@group(0) @binding(2) var<uniform> params: SimParams;
@group(0) @binding(3) var<storage, read> barriers: array<f32>; // 1 = barrier, 0 = free

override workgroupSizeX: u32 = 8;
override workgroupSizeY: u32 = 8;

fn getIndex(x: u32, y: u32) -> u32 {
  return y * params.gridWidth + x;
}

fn isBarrier(x: u32, y: u32) -> bool {
  let idx = getIndex(x, y);
  return barriers[idx] > 0.5;
}

fn laplacian(x: u32, y: u32) -> f32 {
  // 5-point stencil for 2D Laplacian
  let center = waveField[getIndex(x, y)].amplitude;
  
  var sum = -4.0 * center;
  
  // Handle boundary conditions
  if (x > 0u) {
    sum += waveField[getIndex(x - 1u, y)].amplitude;
  } else {
    sum += center; // Neumann boundary
  }
  
  if (x < params.gridWidth - 1u) {
    sum += waveField[getIndex(x + 1u, y)].amplitude;
  } else {
    sum += center;
  }
  
  if (y > 0u) {
    sum += waveField[getIndex(x, y - 1u)].amplitude;
  } else {
    sum += center;
  }
  
  if (y < params.gridHeight - 1u) {
    sum += waveField[getIndex(x, y + 1u)].amplitude;
  } else {
    sum += center;
  }
  
  return sum;
}

fn generateSource(x: u32, y: u32) -> f32 {
  // Point source at left edge
  if (x == 0u && y == params.gridHeight / 2u) {
    return sin(params.time * params.frequency * 6.28318530718);
  }
  
  // Line source for plane wave
  if (x == 0u) {
    let centerY = f32(params.gridHeight) / 2.0;
    let dist = abs(f32(y) - centerY);
    if (dist < 10.0) {
      return sin(params.time * params.frequency * 6.28318530718) * 
             exp(-dist * dist / 100.0);
    }
  }
  
  return 0.0;
}

@compute @workgroup_size(workgroupSizeX, workgroupSizeY, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let x = global_id.x;
  let y = global_id.y;
  
  if (x >= params.gridWidth || y >= params.gridHeight) {
    return;
  }
  
  let idx = getIndex(x, y);
  
  // Skip if this is a barrier
  if (isBarrier(x, y)) {
    nextWaveField[idx].amplitude = 0.0;
    nextWaveField[idx].velocity = 0.0;
    return;
  }
  
  let current = waveField[idx];
  
  // Wave equation with finite difference
  let c2 = params.waveSpeed * params.waveSpeed;
  let dt2 = params.deltaTime * params.deltaTime;
  
  let laplace = laplacian(x, y);
  let acceleration = c2 * laplace;
  
  // Add source term
  let source = generateSource(x, y);
  
  // Verlet integration for wave equation
  var newAmplitude = current.amplitude + current.velocity * params.deltaTime + 
                      0.5 * acceleration * dt2 + source * dt2;
  var newVelocity = current.velocity + acceleration * params.deltaTime;
  
  // Apply damping at boundaries
  let boundaryDist = min(
    min(f32(x), f32(params.gridWidth - x - 1u)),
    min(f32(y), f32(params.gridHeight - y - 1u))
  );
  
  if (boundaryDist < 20.0) {
    let damping = exp(-pow(20.0 - boundaryDist, 2.0) / 50.0);
    newAmplitude *= damping;
    newVelocity *= damping;
  }
  
  // Update phase for visualization
  let newPhase = atan2(newVelocity, newAmplitude);
  
  // Write results
  nextWaveField[idx].amplitude = newAmplitude;
  nextWaveField[idx].velocity = newVelocity;
  nextWaveField[idx].phase = newPhase;
  nextWaveField[idx].damping = current.damping;
}

// Kernel for setting up double-slit barrier
@compute @workgroup_size(workgroupSizeX, workgroupSizeY, 1)
fn setupDoubleSlit(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let x = global_id.x;
  let y = global_id.y;
  
  if (x >= params.gridWidth || y >= params.gridHeight) {
    return;
  }
  
  let idx = getIndex(x, y);
  
  // Create barrier at x = gridWidth/3
  let barrierX = params.gridWidth / 3u;
  let centerY = f32(params.gridHeight) / 2.0;
  
  if (x == barrierX) {
    let yDist = abs(f32(y) - centerY);
    
    // Check if we're in a slit region
    let slit1Y = centerY - params.slitSeparation / 2.0;
    let slit2Y = centerY + params.slitSeparation / 2.0;
    
    let inSlit1 = abs(f32(y) - slit1Y) < params.slitWidth / 2.0;
    let inSlit2 = abs(f32(y) - slit2Y) < params.slitWidth / 2.0;
    
    if (!inSlit1 && !inSlit2) {
      barriers[idx] = 1.0; // This is a barrier
    } else {
      barriers[idx] = 0.0; // This is open (slit)
    }
  } else {
    barriers[idx] = 0.0; // Not a barrier
  }
}
