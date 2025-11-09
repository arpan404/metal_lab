// physics-engine/shaders/glsl/glow-effect.frag
// Post-processing glow/bloom effect for particles and fields
#version 300 es

precision highp float;

// Input
in vec2 vUv;

// Uniforms
uniform sampler2D tDiffuse;
uniform sampler2D tGlow;
uniform vec2 resolution;
uniform float glowStrength;
uniform float glowRadius;
uniform float threshold;
uniform float exposure;
uniform bool enableChromaticAberration;
uniform float aberrationStrength;

// Output
out vec4 fragColor;

// Gaussian blur weights for 9-tap blur
const float weights[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

// Extract bright areas above threshold
vec3 extractBrightAreas(vec3 color) {
    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
    float extractAmount = max(0.0, luminance - threshold);
    return color * extractAmount;
}

// Gaussian blur (separable for efficiency)
vec3 gaussianBlur(sampler2D tex, vec2 uv, vec2 direction) {
    vec3 result = texture(tex, uv).rgb * weights[0];
    
    for (int i = 1; i < 5; i++) {
        vec2 offset = direction * float(i) * glowRadius / resolution;
        result += texture(tex, uv + offset).rgb * weights[i];
        result += texture(tex, uv - offset).rgb * weights[i];
    }
    
    return result;
}

// Kawase blur (more efficient for large radius)
vec3 kawaseBlur(sampler2D tex, vec2 uv, float iteration) {
    vec2 texelSize = 1.0 / resolution;
    float offset = iteration * glowRadius;
    
    vec3 result = vec3(0.0);
    result += texture(tex, uv + vec2(-offset, -offset) * texelSize).rgb;
    result += texture(tex, uv + vec2( offset, -offset) * texelSize).rgb;
    result += texture(tex, uv + vec2(-offset,  offset) * texelSize).rgb;
    result += texture(tex, uv + vec2( offset,  offset) * texelSize).rgb;
    
    return result * 0.25;
}

// Dual Kawase blur (up-sampling)
vec3 dualKawaseUp(sampler2D tex, vec2 uv, float iteration) {
    vec2 texelSize = 1.0 / resolution;
    float offset = iteration * glowRadius;
    
    vec3 result = vec3(0.0);
    
    // Sample with bilinear pattern
    result += texture(tex, uv + vec2(-offset, -offset) * texelSize).rgb;
    result += texture(tex, uv + vec2( offset, -offset) * texelSize).rgb * 2.0;
    result += texture(tex, uv + vec2(-offset,  offset) * texelSize).rgb * 2.0;
    result += texture(tex, uv + vec2( offset,  offset) * texelSize).rgb;
    result += texture(tex, uv + vec2(      0, -offset) * texelSize).rgb * 2.0;
    result += texture(tex, uv + vec2(-offset,       0) * texelSize).rgb * 2.0;
    result += texture(tex, uv + vec2( offset,       0) * texelSize).rgb * 2.0;
    result += texture(tex, uv + vec2(      0,  offset) * texelSize).rgb * 2.0;
    
    return result / 12.0;
}

// Chromatic aberration for extra visual interest
vec3 chromaticAberration(sampler2D tex, vec2 uv) {
    vec2 direction = uv - 0.5;
    float dist = length(direction);
    direction = normalize(direction);
    
    float aberration = aberrationStrength * dist * 0.01;
    
    float r = texture(tex, uv + direction * aberration).r;
    float g = texture(tex, uv).g;
    float b = texture(tex, uv - direction * aberration).b;
    
    return vec3(r, g, b);
}

// Tone mapping (ACES filmic)
vec3 acesFilmic(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

// Reinhard tone mapping
vec3 reinhard(vec3 color) {
    return color / (1.0 + color);
}

// Uncharted 2 tone mapping
vec3 uncharted2Tonemap(vec3 x) {
    float A = 0.15;
    float B = 0.50;
    float C = 0.10;
    float D = 0.20;
    float E = 0.02;
    float F = 0.30;
    return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

// Vignette effect
float vignette(vec2 uv) {
    float dist = distance(uv, vec2(0.5));
    return smoothstep(0.8, 0.3, dist);
}

// Lens flare effect
vec3 lensFlare(vec2 uv, vec2 lightPos) {
    vec2 delta = uv - lightPos;
    float dist = length(delta);
    float angle = atan(delta.y, delta.x);
    
    vec3 flare = vec3(0.0);
    
    // Main flare
    flare += vec3(0.5, 0.7, 1.0) * exp(-dist * dist * 20.0);
    
    // Secondary flares
    for (int i = 1; i <= 3; i++) {
        vec2 flarePos = lightPos + delta * float(i) * 0.3;
        float flareDist = length(uv - flarePos);
        flare += vec3(0.3, 0.5, 0.8) * exp(-flareDist * flareDist * 50.0) * 0.2;
    }
    
    // Hexagonal aperture pattern
    float hexAngle = 6.0 * angle / (2.0 * 3.14159);
    float hexPattern = abs(cos(hexAngle)) * 0.1;
    flare *= 1.0 + hexPattern;
    
    return flare;
}

void main() {
    vec2 uv = vUv;
    
    // Sample base scene
    vec3 sceneColor = texture(tDiffuse, uv).rgb;
    
    // Apply chromatic aberration if enabled
    if (enableChromaticAberration) {
        sceneColor = chromaticAberration(tDiffuse, uv);
    }
    
    // Sample pre-blurred glow texture
    vec3 glowColor = texture(tGlow, uv).rgb;
    
    // Multi-pass blur for softer glow (if needed)
    glowColor = kawaseBlur(tGlow, uv, 1.0);
    glowColor += kawaseBlur(tGlow, uv, 2.0) * 0.5;
    glowColor += kawaseBlur(tGlow, uv, 3.0) * 0.25;
    
    // Combine scene and glow
    vec3 finalColor = sceneColor + glowColor * glowStrength;
    
    // Apply exposure
    finalColor *= exposure;
    
    // Tone mapping
    finalColor = acesFilmic(finalColor);
    
    // Apply vignette
    float vig = vignette(uv);
    finalColor *= vig;
    
    // Gamma correction
    finalColor = pow(finalColor, vec3(1.0 / 2.2));
    
    fragColor = vec4(finalColor, 1.0);
}
