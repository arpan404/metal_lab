// physics-engine/shaders/metal/particle-system.metal
// Particle System Compute Shader for Rutherford and Millikan experiments
// Handles charged particle dynamics in electric fields
// Metal Shading Language version

#include <metal_stdlib>
using namespace metal;

struct Particle {
  float3 position;
  float3 velocity;
  float charge;
  float mass;
  float radius;
  float lifetime;
  float4 color;
  uint active;
};

struct ForceField {
  float3 electricField;
  float3 gravitationalField;
  float dragCoefficient;
  float nuclearCharge;
  float3 nuclearPosition;
};

struct SimParams {
  float deltaTime;
  uint particleCount;
  float coulombConstant;
  float time;
};

// Constants
constant float PI = 3.14159265359;
constant float EPSILON = 0.0001;

// Calculate Coulomb force between charged particles
float3 coulombForce(float3 pos1, float charge1, float3 pos2, float charge2, constant SimParams& params) {
  float3 r = pos2 - pos1;
  float distance = length(r);

  if (distance < EPSILON) {
    return float3(0.0, 0.0, 0.0);
  }

  float forceMagnitude = params.coulombConstant * charge1 * charge2 / (distance * distance);
  return forceMagnitude * normalize(r);
}

// Calculate drag force (Stokes' law for spherical particles)
float3 dragForce(float3 velocity, float radius, float dragCoeff) {
  float speed = length(velocity);
  if (speed < EPSILON) {
    return float3(0.0, 0.0, 0.0);
  }

  // Stokes' drag: F = -6πηrv
  float dragMagnitude = dragCoeff * radius * speed;
  return -dragMagnitude * normalize(velocity);
}

// Rutherford scattering trajectory calculation
float3 rutherfordScattering(thread Particle& particle, constant SimParams& params, constant ForceField& field) {
  // Force from nucleus
  float3 nuclearForce = coulombForce(
    particle.position,
    particle.charge,
    field.nuclearPosition,
    field.nuclearCharge,
    params
  );

  // No drag in vacuum for Rutherford experiment
  return nuclearForce / particle.mass;
}

// Millikan oil drop force calculation
float3 millikanForces(thread Particle& particle, constant ForceField& field) {
  float3 totalForce = float3(0.0, 0.0, 0.0);

  // Electric force: F = qE
  float3 electricForce = particle.charge * field.electricField;
  totalForce += electricForce;

  // Gravitational force: F = mg
  float3 gravForce = particle.mass * field.gravitationalField;
  totalForce += gravForce;

  // Drag force: F = -6πηrv
  float3 drag = dragForce(particle.velocity, particle.radius, field.dragCoefficient);
  totalForce += drag;

  return totalForce / particle.mass;
}

// Runge-Kutta 4th order integration for accurate trajectory
void rk4Integration(thread Particle& particle, uint acceleration_fn, constant SimParams& params, constant ForceField& field) {
  Particle p = particle;
  float dt = params.deltaTime;

  // Determine which force model to use
  float3 k1_v, k2_v, k3_v, k4_v;

  if (acceleration_fn == 0) {
    // Rutherford scattering
    k1_v = rutherfordScattering(particle, params, field);

    // Update position temporarily for k2
    particle.position = p.position + p.velocity * dt * 0.5;
    particle.velocity = p.velocity + k1_v * dt * 0.5;
    k2_v = rutherfordScattering(particle, params, field);

    // Update for k3
    particle.position = p.position + p.velocity * dt * 0.5;
    particle.velocity = p.velocity + k2_v * dt * 0.5;
    k3_v = rutherfordScattering(particle, params, field);

    // Update for k4
    particle.position = p.position + p.velocity * dt;
    particle.velocity = p.velocity + k3_v * dt;
    k4_v = rutherfordScattering(particle, params, field);
  } else {
    // Millikan oil drop
    k1_v = millikanForces(particle, field);

    particle.position = p.position + p.velocity * dt * 0.5;
    particle.velocity = p.velocity + k1_v * dt * 0.5;
    k2_v = millikanForces(particle, field);

    particle.position = p.position + p.velocity * dt * 0.5;
    particle.velocity = p.velocity + k2_v * dt * 0.5;
    k3_v = millikanForces(particle, field);

    particle.position = p.position + p.velocity * dt;
    particle.velocity = p.velocity + k3_v * dt;
    k4_v = millikanForces(particle, field);
  }

  // Restore original state
  particle.position = p.position;
  particle.velocity = p.velocity;

  // Final RK4 update
  float3 k_v = (k1_v + 2.0 * k2_v + 2.0 * k3_v + k4_v) / 6.0;

  particle.velocity = p.velocity + k_v * dt;
  particle.position = p.position + particle.velocity * dt;
  particle.lifetime += dt;
}

kernel void updateParticles(
    constant SimParams& params [[buffer(0)]],
    constant ForceField& field [[buffer(1)]],
    device Particle* particles [[buffer(2)]],
    uint gid [[thread_position_in_grid]]
) {
  if (gid >= params.particleCount) {
    return;
  }

  // Skip inactive particles
  if (particles[gid].active == 0) {
    return;
  }

  // Determine experiment type based on charge sign and field strength
  bool isRutherford = field.nuclearCharge != 0.0;
  uint experimentType = isRutherford ? 0 : 1;

  // Integrate particle motion
  rk4Integration(particles[gid], experimentType, params, field);

  // Check boundary conditions
  float3 pos = particles[gid].position;

  // Deactivate particle if out of bounds
  if (abs(pos.x) > 10.0 || abs(pos.y) > 10.0 || abs(pos.z) > 10.0) {
    particles[gid].active = 0;
  }

  // Update color based on velocity (for visualization)
  float speed = length(particles[gid].velocity);
  float maxSpeed = 100.0;
  float normalizedSpeed = clamp(speed / maxSpeed, 0.0, 1.0);

  // Color gradient from blue (slow) to red (fast)
  particles[gid].color = float4(
    normalizedSpeed,
    0.5 * (1.0 - normalizedSpeed),
    1.0 - normalizedSpeed,
    1.0
  );
}

kernel void resetParticles(
    constant SimParams& params [[buffer(0)]],
    device Particle* particles [[buffer(2)]],
    uint gid [[thread_position_in_grid]]
) {
  if (gid >= params.particleCount) {
    return;
  }

  particles[gid].lifetime = 0.0;
  particles[gid].active = 1;
}
