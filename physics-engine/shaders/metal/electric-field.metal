// physics-engine/shaders/metal/electric-field.metal
// Electric Field Visualization and Calculation
// Used for Millikan oil drop and general field simulations
// Metal Shading Language version

#include <metal_stdlib>
using namespace metal;

struct FieldParams {
  uint3 resolution;
  float3 bounds;
  float plateVoltage;
  float plateSeparation;
  uint numCharges;
  float time;
};

struct PointCharge {
  float3 position;
  float charge;
};

struct FieldPoint {
  float3 electricField;
  float potential;
  float fieldMagnitude;
  float _padding;
};

constant float K_E = 8.98755e9; // Coulomb constant (N⋅m²/C²)
constant float EPSILON = 0.001;

// Calculate electric field at a point due to a point charge
float3 electricFieldFromCharge(float3 position, PointCharge charge) {
  float3 r = position - charge.position;
  float distance = length(r);

  if (distance < EPSILON) {
    return float3(0.0, 0.0, 0.0);
  }

  float fieldMagnitude = K_E * charge.charge / (distance * distance);
  return fieldMagnitude * normalize(r);
}

// Calculate electric potential at a point
float electricPotential(float3 position, PointCharge charge) {
  float3 r = position - charge.position;
  float distance = length(r);

  if (distance < EPSILON) {
    return 0.0;
  }

  return K_E * charge.charge / distance;
}

// Uniform field between parallel plates
float3 parallelPlateField(float3 position, constant FieldParams& params) {
  // Field between plates points from positive to negative
  // Assuming plates are horizontal (perpendicular to y-axis)
  float fieldStrength = params.plateVoltage / params.plateSeparation;

  // Check if position is between plates
  float lowerPlate = -params.plateSeparation / 2.0;
  float upperPlate = params.plateSeparation / 2.0;

  if (position.y >= lowerPlate && position.y <= upperPlate) {
    return float3(0.0, -fieldStrength, 0.0);
  }

  // Outside plates, field is weak/zero
  return float3(0.0, 0.0, 0.0);
}

// Convert 3D grid position to 1D index
uint gridIndex(uint x, uint y, uint z, constant FieldParams& params) {
  return x + y * params.resolution.x + z * params.resolution.x * params.resolution.y;
}

// Convert grid coordinates to world position
float3 gridToWorld(uint3 gridPos, constant FieldParams& params) {
  float3 normalized = float3(gridPos) / float3(params.resolution);
  return (normalized - 0.5) * 2.0 * params.bounds;
}

kernel void calculateField(
    constant FieldParams& params [[buffer(0)]],
    constant PointCharge* charges [[buffer(1)]],
    device FieldPoint* fieldGrid [[buffer(2)]],
    uint3 gid [[thread_position_in_grid]]
) {
  if (gid.x >= params.resolution.x ||
      gid.y >= params.resolution.y ||
      gid.z >= params.resolution.z) {
    return;
  }

  float3 worldPos = gridToWorld(gid, params);
  uint index = gridIndex(gid.x, gid.y, gid.z, params);

  float3 totalField = float3(0.0, 0.0, 0.0);
  float totalPotential = 0.0;

  // Add field from parallel plates (if present)
  if (params.plateSeparation > 0.0) {
    totalField += parallelPlateField(worldPos, params);
  }

  // Add fields from all point charges
  for (uint i = 0; i < params.numCharges; i++) {
    totalField += electricFieldFromCharge(worldPos, charges[i]);
    totalPotential += electricPotential(worldPos, charges[i]);
  }

  // Store results
  fieldGrid[index].electricField = totalField;
  fieldGrid[index].potential = totalPotential;
  fieldGrid[index].fieldMagnitude = length(totalField);
}

// Calculate field lines using streamline integration
kernel void integrateFieldLine(
    constant FieldParams& params [[buffer(0)]],
    device FieldPoint* fieldGrid [[buffer(2)]],
    uint gid [[thread_position_in_grid]]
) {
  // This would integrate field lines for visualization
  // Implementation would depend on output buffer structure
}

// Visualization helpers
kernel void calculateFieldColor(
    constant FieldParams& params [[buffer(0)]],
    device FieldPoint* fieldGrid [[buffer(2)]],
    uint3 gid [[thread_position_in_grid]]
) {
  if (gid.x >= params.resolution.x ||
      gid.y >= params.resolution.y ||
      gid.z >= params.resolution.z) {
    return;
  }

  uint index = gridIndex(gid.x, gid.y, gid.z, params);
  float3 field = fieldGrid[index].electricField;
  float magnitude = length(field);

  // Logarithmic scaling for better visualization
  float maxField = 1000.0; // Adjust based on expected values
  float normalized = clamp(log2(magnitude + 1.0) / log2(maxField + 1.0), 0.0, 1.0);

  // Color mapping would be done in a separate visualization pass
  // This is a placeholder for the calculation
}

// Energy density calculation
kernel void calculateEnergyDensity(
    constant FieldParams& params [[buffer(0)]],
    device FieldPoint* fieldGrid [[buffer(2)]],
    uint3 gid [[thread_position_in_grid]]
) {
  if (gid.x >= params.resolution.x ||
      gid.y >= params.resolution.y ||
      gid.z >= params.resolution.z) {
    return;
  }

  uint index = gridIndex(gid.x, gid.y, gid.z, params);
  float3 field = fieldGrid[index].electricField;
  float magnitude = length(field);

  // Energy density: u = (ε₀/2)E²
  float epsilon0 = 8.854e-12;
  float energyDensity = 0.5 * epsilon0 * magnitude * magnitude;

  // Store or visualize energy density
}
