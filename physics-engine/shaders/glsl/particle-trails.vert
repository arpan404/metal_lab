// physics-engine/shaders/glsl/particle-trails.vert
// Vertex shader for particle trail rendering
#version 300 es

precision highp float;

// Vertex attributes
in vec3 position;
in vec3 previous;
in vec3 next;
in float side;
in float width;
in vec2 uv;
in vec4 color;
in float alpha;

// Uniforms
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 resolution;
uniform float lineWidth;
uniform float aspect;
uniform float time;

// Trail-specific uniforms
uniform float trailLength;
uniform float fadeStart;
uniform float fadeEnd;
uniform bool taperTrail;

// Varyings
out vec2 vUv;
out vec4 vColor;
out float vAlpha;
out float vLifetime;
out vec3 vPosition;

// Miter calculation for smooth trail corners
vec2 calculateMiter(vec2 p0, vec2 p1, vec2 p2) {
    vec2 v1 = normalize(p1 - p0);
    vec2 v2 = normalize(p2 - p1);
    
    vec2 tangent = normalize(v1 + v2);
    vec2 miter = vec2(-tangent.y, tangent.x);
    
    float miterLength = 1.0 / dot(miter, vec2(-v1.y, v1.x));
    
    return miter * miterLength;
}

// Convert 3D position to 2D screen space
vec2 toScreenSpace(vec4 pos) {
    vec2 screen = pos.xy / pos.w;
    screen.x *= aspect;
    return screen;
}

void main() {
    vUv = uv;
    vColor = color;
    vLifetime = uv.x; // x coordinate represents position along trail
    vPosition = position;
    
    // Transform positions to clip space
    vec4 clipPos = modelViewMatrix * vec4(position, 1.0);
    vec4 clipPrev = modelViewMatrix * vec4(previous, 1.0);
    vec4 clipNext = modelViewMatrix * vec4(next, 1.0);
    
    // Project to screen space
    vec2 screenPos = toScreenSpace(projectionMatrix * clipPos);
    vec2 screenPrev = toScreenSpace(projectionMatrix * clipPrev);
    vec2 screenNext = toScreenSpace(projectionMatrix * clipNext);
    
    // Calculate miter for smooth corners
    vec2 miter = calculateMiter(screenPrev, screenPos, screenNext);
    
    // Calculate perpendicular direction
    vec2 dir = screenNext - screenPrev;
    vec2 normal = normalize(vec2(-dir.y, dir.x));
    
    // Use miter if angle isn't too sharp
    float miterDot = dot(miter, normal);
    if (abs(miterDot) > 0.3) {
        normal = miter;
    }
    
    // Calculate width with optional tapering
    float effectiveWidth = width * lineWidth;
    if (taperTrail) {
        // Taper trail from full width at head to point at tail
        effectiveWidth *= (1.0 - vLifetime);
    }
    
    // Fade trail along its length
    float fade = 1.0;
    if (vLifetime > fadeStart) {
        fade = 1.0 - smoothstep(fadeStart, fadeEnd, vLifetime);
    }
    
    vAlpha = alpha * fade;
    
    // Offset position perpendicular to direction
    vec2 offset = normal * effectiveWidth * side;
    vec2 finalPos = screenPos + offset / resolution;
    
    // Convert back to clip space
    vec4 finalClipPos = clipPos;
    finalClipPos.xy = finalPos * clipPos.w;
    finalClipPos.xy /= vec2(aspect, 1.0);
    
    gl_Position = finalClipPos;
}
