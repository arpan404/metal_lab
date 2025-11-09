// physics-engine/shaders/glsl/particle-trails.frag
// Fragment shader for particle trail rendering
#version 300 es

precision highp float;

// Input from vertex shader
in vec2 vUv;
in vec4 vColor;
in float vAlpha;
in float vLifetime;
in vec3 vPosition;

// Uniforms
uniform float time;
uniform vec3 glowColor;
uniform float glowIntensity;
uniform bool enableGlow;
uniform float dashLength;
uniform float dashGap;
uniform bool enableDashing;

// Trail effects
uniform float velocityColorInfluence;
uniform vec3 highVelocityColor;
uniform vec3 lowVelocityColor;

// Output
out vec4 fragColor;

// Smooth edge fadeout
float edgeFadeout(float dist) {
    return smoothstep(1.0, 0.5, dist);
}

// Dashed pattern
float dashPattern(float position, float dashLen, float gapLen) {
    float totalLength = dashLen + gapLen;
    float modPos = mod(position, totalLength);
    return step(modPos, dashLen);
}

// Glow effect (Gaussian-like)
float glowEffect(float dist, float intensity) {
    return exp(-dist * dist * intensity);
}

// Velocity-based coloring
vec3 velocityColor(float lifetime, vec3 baseColor) {
    float velocity = 1.0 - lifetime; // Approximate velocity from position in trail
    return mix(lowVelocityColor, highVelocityColor, velocity);
}

// Sparkle effect for high-energy particles
float sparkleEffect(vec2 uv, float time) {
    float sparkle = sin(uv.x * 100.0 + time * 5.0) * 
                   sin(uv.y * 100.0 + time * 3.0);
    return smoothstep(0.9, 1.0, sparkle);
}

void main() {
    // Distance from center of trail (tube)
    float distFromCenter = abs(vUv.y - 0.5) * 2.0;
    
    // Base color with velocity influence
    vec3 baseColor = vColor.rgb;
    if (velocityColorInfluence > 0.0) {
        vec3 velColor = velocityColor(vLifetime, baseColor);
        baseColor = mix(baseColor, velColor, velocityColorInfluence);
    }
    
    // Apply edge fadeout for smooth trails
    float edgeFade = edgeFadeout(distFromCenter);
    
    // Apply dashing if enabled
    float dash = 1.0;
    if (enableDashing) {
        dash = dashPattern(vUv.x * 10.0, dashLength, dashGap);
    }
    
    // Base alpha with fadeout
    float alpha = vAlpha * edgeFade * dash;
    
    // Add glow effect
    vec3 finalColor = baseColor;
    if (enableGlow) {
        float glow = glowEffect(distFromCenter, glowIntensity);
        finalColor = mix(baseColor, glowColor, glow * 0.5);
        alpha = max(alpha, glow * 0.3); // Glow extends beyond trail edge
    }
    
    // Add sparkle for fresh trail segments
    if (vLifetime < 0.2) {
        float sparkle = sparkleEffect(vUv, time);
        finalColor += sparkle * 0.3;
    }
    
    // Fresnel-like effect for volumetric appearance
    float fresnel = pow(1.0 - distFromCenter, 2.0);
    finalColor += fresnel * vec3(0.2) * 0.5;
    
    // HDR bloom preparation (boost bright areas)
    float luminance = dot(finalColor, vec3(0.299, 0.587, 0.114));
    if (luminance > 0.8) {
        finalColor *= 1.0 + (luminance - 0.8) * 2.0;
    }
    
    // Output
    fragColor = vec4(finalColor, alpha);
    
    // Premultiply alpha for correct blending
    fragColor.rgb *= fragColor.a;
}
