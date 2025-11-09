// physics-engine/shaders/glsl/wave-visualization.vert
// Vertex shader for wave function visualization
#version 300 es

precision highp float;

// Vertex attributes
in vec3 position;
in vec2 uv;
in vec3 normal;

// Uniforms
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

// Wave parameters
uniform float time;
uniform float waveAmplitude;
uniform float waveFrequency;
uniform vec2 waveDirection;
uniform float phaseOffset;

// Varyings to fragment shader
out vec3 vPosition;
out vec2 vUv;
out vec3 vNormal;
out vec3 vWorldPosition;
out float vDisplacement;
out vec3 vViewPosition;

// Helper function for wave displacement
float waveDisplacement(vec2 pos, float t) {
    vec2 wavePos = pos * waveFrequency;
    float phase = dot(waveDirection, wavePos) - t + phaseOffset;
    return waveAmplitude * sin(phase);
}

// Calculate wave gradient for normals
vec3 calculateWaveNormal(vec2 pos, float t) {
    float eps = 0.01;
    
    // Sample wave height at nearby points
    float h = waveDisplacement(pos, t);
    float hx = waveDisplacement(pos + vec2(eps, 0.0), t);
    float hy = waveDisplacement(pos + vec2(0.0, eps), t);
    
    // Calculate gradient
    vec3 tangentX = vec3(eps, 0.0, hx - h);
    vec3 tangentY = vec3(0.0, eps, hy - h);
    
    // Cross product for normal
    vec3 waveNormal = normalize(cross(tangentX, tangentY));
    
    return waveNormal;
}

void main() {
    vUv = uv;
    
    // Apply wave displacement
    vec3 displacedPosition = position;
    float displacement = waveDisplacement(position.xy, time);
    displacedPosition.z += displacement;
    
    vDisplacement = displacement;
    vPosition = displacedPosition;
    
    // Calculate wave-modified normal
    vec3 waveNormal = calculateWaveNormal(position.xy, time);
    vNormal = normalize((normalMatrix * vec4(waveNormal, 0.0)).xyz);
    
    // World position
    vec4 worldPos = modelMatrix * vec4(displacedPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    
    // View space position
    vec4 viewPos = viewMatrix * worldPos;
    vViewPosition = viewPos.xyz;
    
    // Final position
    gl_Position = projectionMatrix * viewPos;
}
