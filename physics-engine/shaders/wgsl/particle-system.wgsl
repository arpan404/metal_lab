// physics-engine/shaders/wgsl/particle-system.wgsl
// Particle System Compute Shader for Rutherford and Millikan experiments
// Handles charged particle dynamics in electric fields

struct Particle {
  position: vec3<f32>,
  velocity: vec3<f32>,
  charge: f32,
  mass: f32,
  radius: f32,
  lifetime: f32,
  color: vec4<f32>,
  active: u32,
}

struct ForceField {
  electricField: vec3<f32>,
  gravitationalField: vec3<f32>,
  dragCoefficient: f32,
  nuclearCharge: f32,
  nuclearPosition: vec3<f32>,
}

struct SimParams {
  deltaTime: f32,
  particleCount: u32,
  coulombConstant: f32,
  time: f32,
}

@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<uniform> field: ForceField;
@group(0) @binding(2) var<storage, read_write> particles: array<Particle>;

// Constants
const PI: f32 = 3.14159265359;
const EPSILON: f32 = 0.0001;

// Calculate Coulomb force between charged particles
fn coulombForce(pos1: vec3<f32>, charge1: f32, pos2: vec3<f32>, charge2: f32) -> vec3<f32> {
  let r = pos2 - pos1;
  let distance = length(r);
  
  if (distance < EPSILON) {
    return vec3<f32>(0.0, 0.0, 0.0);
  }
  
  let forceMagnitude = params.coulombConstant * charge1 * charge2 / (distance * distance);
  return forceMagnitude * normalize(r);
}

// Calculate drag force (Stokes' law for spherical particles)
fn dragForce(velocity: vec3<f32>, radius: f32, dragCoeff: f32) -> vec3<f32> {
  let speed = length(velocity);
  if (speed < EPSILON) {
    return vec3<f32>(0.0, 0.0, 0.0);
  }
  
  // Stokes' drag: F = -6πηrv
  let dragMagnitude = dragCoeff * radius * speed;
  return -dragMagnitude * normalize(velocity);
}

// Rutherford scattering trajectory calculation
fn rutherfordScattering(particle: ptr<storage, Particle, read_write>) -> vec3<f32> {
  let p = *particle;
  
  // Force from nucleus
  let nuclearForce = coulombForce(
    p.position,
    p.charge,
    field.nuclearPosition,
    field.nuclearCharge
  );
  
  // No drag in vacuum for Rutherford experiment
  return nuclearForce / p.mass;
}

// Millikan oil drop force calculation
fn millikanForces(particle: ptr<storage, Particle, read_write>) -> vec3<f32> {
  let p = *particle;
  
  var totalForce = vec3<f32>(0.0, 0.0, 0.0);
  
  // Electric force: F = qE
  let electricForce = p.charge * field.electricField;
  totalForce += electricForce;
  
  // Gravitational force: F = mg
  let gravForce = p.mass * field.gravitationalField;
  totalForce += gravForce;
  
  // Drag force: F = -6πηrv
  let drag = dragForce(p.velocity, p.radius, field.dragCoefficient);
  totalForce += drag;
  
  return totalForce / p.mass;
}

// Runge-Kutta 4th order integration for accurate trajectory
fn rk4Integration(particle: ptr<storage, Particle, read_write>, acceleration_fn: u32) {
  let p = *particle;
  let dt = params.deltaTime;
  
  // Determine which force model to use
  var k1_v: vec3<f32>;
  var k2_v: vec3<f32>;
  var k3_v: vec3<f32>;
  var k4_v: vec3<f32>;
  
  if (acceleration_fn == 0u) {
    // Rutherford scattering
    k1_v = rutherfordScattering(particle);
    
    // Update position temporarily for k2
    (*particle).position = p.position + p.velocity * dt * 0.5;
    (*particle).velocity = p.velocity + k1_v * dt * 0.5;
    k2_v = rutherfordScattering(particle);
    
    // Update for k3
    (*particle).position = p.position + p.velocity * dt * 0.5;
    (*particle).velocity = p.velocity + k2_v * dt * 0.5;
    k3_v = rutherfordScattering(particle);
    
    // Update for k4
    (*particle).position = p.position + p.velocity * dt;
    (*particle).velocity = p.velocity + k3_v * dt;
    k4_v = rutherfordScattering(particle);
  } else {
    // Millikan oil drop
    k1_v = millikanForces(particle);
    
    (*particle).position = p.position + p.velocity * dt * 0.5;
    (*particle).velocity = p.velocity + k1_v * dt * 0.5;
    k2_v = millikanForces(particle);
    
    (*particle).position = p.position + p.velocity * dt * 0.5;
    (*particle).velocity = p.velocity + k2_v * dt * 0.5;
    k3_v = millikanForces(particle);
    
    (*particle).position = p.position + p.velocity * dt;
    (*particle).velocity = p.velocity + k3_v * dt;
    k4_v = millikanForces(particle);
  }
  
  // Restore original state
  (*particle).position = p.position;
  (*particle).velocity = p.velocity;
  
  // Final RK4 update
  let k_v = (k1_v + 2.0 * k2_v + 2.0 * k3_v + k4_v) / 6.0;
  
  (*particle).velocity = p.velocity + k_v * dt;
  (*particle).position = p.position + (*particle).velocity * dt;
  (*particle).lifetime += dt;
}

@compute @workgroup_size(256)
fn updateParticles(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;
  
  if (index >= params.particleCount) {
    return;
  }
  
  var particle = &particles[index];
  
  // Skip inactive particles
  if ((*particle).active == 0u) {
    return;
  }
  
  // Determine experiment type based on charge sign and field strength
  let isRutherford = field.nuclearCharge != 0.0;
  let experimentType = select(1u, 0u, isRutherford);
  
  // Integrate particle motion
  rk4Integration(particle, experimentType);
  
  // Check boundary conditions
  let pos = (*particle).position;
  
  // Deactivate particle if out of bounds
  if (abs(pos.x) > 10.0 || abs(pos.y) > 10.0 || abs(pos.z) > 10.0) {
    (*particle).active = 0u;
  }
  
  // Update color based on velocity (for visualization)
  let speed = length((*particle).velocity);
  let maxSpeed = 100.0;
  let normalizedSpeed = clamp(speed / maxSpeed, 0.0, 1.0);
  
  // Color gradient from blue (slow) to red (fast)
  (*particle).color = vec4<f32>(
    normalizedSpeed,
    0.5 * (1.0 - normalizedSpeed),
    1.0 - normalizedSpeed,
    1.0
  );
}

@compute @workgroup_size(256)
fn resetParticles(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;
  
  if (index >= params.particleCount) {
    return;
  }
  
  particles[index].lifetime = 0.0;
  particles[index].active = 1u;
}
