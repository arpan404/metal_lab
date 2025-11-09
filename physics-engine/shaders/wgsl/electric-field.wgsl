// physics-engine/shaders/wgsl/electric-field.wgsl
// Electric Field Visualization and Calculation
// Used for Millikan oil drop and general field simulations

struct FieldParams {
  resolution: vec3<u32>,
  bounds: vec3<f32>,
  plateVoltage: f32,
  plateSeparation: f32,
  numCharges: u32,
  time: f32,
}

struct PointCharge {
  position: vec3<f32>,
  charge: f32,
}

struct FieldPoint {
  electricField: vec3<f32>,
  potential: f32,
  fieldMagnitude: f32,
  _padding: f32,
}

@group(0) @binding(0) var<uniform> params: FieldParams;
@group(0) @binding(1) var<storage, read> charges: array<PointCharge>;
@group(0) @binding(2) var<storage, read_write> fieldGrid: array<FieldPoint>;

const K_E: f32 = 8.98755e9; // Coulomb constant (N⋅m²/C²)
const EPSILON: f32 = 0.001;

// Calculate electric field at a point due to a point charge
fn electricFieldFromCharge(position: vec3<f32>, charge: PointCharge) -> vec3<f32> {
  let r = position - charge.position;
  let distance = length(r);
  
  if (distance < EPSILON) {
    return vec3<f32>(0.0, 0.0, 0.0);
  }
  
  let fieldMagnitude = K_E * charge.charge / (distance * distance);
  return fieldMagnitude * normalize(r);
}

// Calculate electric potential at a point
fn electricPotential(position: vec3<f32>, charge: PointCharge) -> f32 {
  let r = position - charge.position;
  let distance = length(r);
  
  if (distance < EPSILON) {
    return 0.0;
  }
  
  return K_E * charge.charge / distance;
}

// Uniform field between parallel plates
fn parallelPlateField(position: vec3<f32>) -> vec3<f32> {
  // Field between plates points from positive to negative
  // Assuming plates are horizontal (perpendicular to y-axis)
  let fieldStrength = params.plateVoltage / params.plateSeparation;
  
  // Check if position is between plates
  let lowerPlate = -params.plateSeparation / 2.0;
  let upperPlate = params.plateSeparation / 2.0;
  
  if (position.y >= lowerPlate && position.y <= upperPlate) {
    return vec3<f32>(0.0, -fieldStrength, 0.0);
  }
  
  // Outside plates, field is weak/zero
  return vec3<f32>(0.0, 0.0, 0.0);
}

// Convert 3D grid position to 1D index
fn gridIndex(x: u32, y: u32, z: u32) -> u32 {
  return x + y * params.resolution.x + z * params.resolution.x * params.resolution.y;
}

// Convert grid coordinates to world position
fn gridToWorld(gridPos: vec3<u32>) -> vec3<f32> {
  let normalized = vec3<f32>(gridPos) / vec3<f32>(params.resolution);
  return (normalized - 0.5) * 2.0 * params.bounds;
}

@compute @workgroup_size(8, 8, 8)
fn calculateField(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let gridPos = global_id;
  
  if (gridPos.x >= params.resolution.x || 
      gridPos.y >= params.resolution.y || 
      gridPos.z >= params.resolution.z) {
    return;
  }
  
  let worldPos = gridToWorld(gridPos);
  let index = gridIndex(gridPos.x, gridPos.y, gridPos.z);
  
  var totalField = vec3<f32>(0.0, 0.0, 0.0);
  var totalPotential = 0.0;
  
  // Add field from parallel plates (if present)
  if (params.plateSeparation > 0.0) {
    totalField += parallelPlateField(worldPos);
  }
  
  // Add fields from all point charges
  for (var i = 0u; i < params.numCharges; i++) {
    totalField += electricFieldFromCharge(worldPos, charges[i]);
    totalPotential += electricPotential(worldPos, charges[i]);
  }
  
  // Store results
  fieldGrid[index].electricField = totalField;
  fieldGrid[index].potential = totalPotential;
  fieldGrid[index].fieldMagnitude = length(totalField);
}

// Calculate field lines using streamline integration
@compute @workgroup_size(256)
fn integrateFieldLine(@builtin(global_invocation_id) global_id: vec3<u32>) {
  // This would integrate field lines for visualization
  // Implementation would depend on output buffer structure
}

// Visualization helpers
@compute @workgroup_size(8, 8, 8)
fn calculateFieldColor(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let gridPos = global_id;
  
  if (gridPos.x >= params.resolution.x || 
      gridPos.y >= params.resolution.y || 
      gridPos.z >= params.resolution.z) {
    return;
  }
  
  let index = gridIndex(gridPos.x, gridPos.y, gridPos.z);
  let field = fieldGrid[index].electricField;
  let magnitude = length(field);
  
  // Logarithmic scaling for better visualization
  let maxField = 1000.0; // Adjust based on expected values
  let normalized = clamp(log2(magnitude + 1.0) / log2(maxField + 1.0), 0.0, 1.0);
  
  // Color mapping would be done in a separate visualization pass
  // This is a placeholder for the calculation
}

// Energy density calculation
@compute @workgroup_size(8, 8, 8)
fn calculateEnergyDensity(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let gridPos = global_id;
  
  if (gridPos.x >= params.resolution.x || 
      gridPos.y >= params.resolution.y || 
      gridPos.z >= params.resolution.z) {
    return;
  }
  
  let index = gridIndex(gridPos.x, gridPos.y, gridPos.z);
  let field = fieldGrid[index].electricField;
  let magnitude = length(field);
  
  // Energy density: u = (ε₀/2)E²
  let epsilon0 = 8.854e-12;
  let energyDensity = 0.5 * epsilon0 * magnitude * magnitude;
  
  // Store or visualize energy density
}
