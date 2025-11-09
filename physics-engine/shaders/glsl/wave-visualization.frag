// physics-engine/shaders/glsl/wave-visualization.frag
// Fragment shader for wave function visualization
#version 300 es

precision highp float;

// Input from vertex shader
in vec3 vPosition;
in vec2 vUv;
in vec3 vNormal;
in vec3 vWorldPosition;
in float vDisplacement;
in vec3 vViewPosition;

// Uniforms
uniform vec3 cameraPosition;
uniform float time;
uniform float opacity;

// Wave visualization parameters
uniform vec3 colorPositive;
uniform vec3 colorNegative;
uniform vec3 colorZero;
uniform float contourInterval;
uniform bool showContours;
uniform bool showPhase;

// Lighting
uniform vec3 lightPosition;
uniform vec3 lightColor;
uniform float ambientStrength;
uniform float specularStrength;
uniform float shininess;

// Output
out vec4 fragColor;

// Color interpolation based on displacement
vec3 getWaveColor(float displacement) {
    float normalized = displacement / 1.0; // Normalize to [-1, 1]
    
    if (normalized > 0.0) {
        return mix(colorZero, colorPositive, normalized);
    } else {
        return mix(colorZero, colorNegative, -normalized);
    }
}

// Contour lines
float getContourMask(float value, float interval) {
    float modValue = mod(value, interval);
    float distToLine = min(modValue, interval - modValue);
    return 1.0 - smoothstep(0.0, 0.02, distToLine);
}

// Fresnel effect for enhanced visualization
float fresnelEffect(vec3 viewDir, vec3 normal, float power) {
    return pow(1.0 - abs(dot(viewDir, normal)), power);
}

// Blinn-Phong lighting model
vec3 calculateLighting(vec3 normal, vec3 viewDir, vec3 lightDir) {
    // Ambient
    vec3 ambient = ambientStrength * lightColor;
    
    // Diffuse
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;
    
    // Specular (Blinn-Phong)
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);
    vec3 specular = specularStrength * spec * lightColor;
    
    return ambient + diffuse + specular;
}

// Phase-based coloring for quantum visualization
vec3 getPhaseColor(float phase) {
    // Map phase [0, 2π] to HSV color wheel
    float hue = phase / (2.0 * 3.14159265359);
    
    // Simple HSV to RGB conversion
    float c = 1.0;
    float x = c * (1.0 - abs(mod(hue * 6.0, 2.0) - 1.0));
    
    vec3 rgb;
    if (hue < 1.0/6.0) rgb = vec3(c, x, 0.0);
    else if (hue < 2.0/6.0) rgb = vec3(x, c, 0.0);
    else if (hue < 3.0/6.0) rgb = vec3(0.0, c, x);
    else if (hue < 4.0/6.0) rgb = vec3(0.0, x, c);
    else if (hue < 5.0/6.0) rgb = vec3(x, 0.0, c);
    else rgb = vec3(c, 0.0, x);
    
    return rgb;
}

// Grid overlay
float gridPattern(vec2 uv, float scale) {
    vec2 grid = abs(fract(uv * scale - 0.5) - 0.5) / fwidth(uv * scale);
    float line = min(grid.x, grid.y);
    return 1.0 - min(line, 1.0);
}

void main() {
    // Normalize normal
    vec3 N = normalize(vNormal);
    
    // View direction
    vec3 V = normalize(cameraPosition - vWorldPosition);
    
    // Light direction
    vec3 L = normalize(lightPosition - vWorldPosition);
    
    // Base color from wave displacement
    vec3 baseColor = getWaveColor(vDisplacement);
    
    // Apply phase-based coloring if enabled
    if (showPhase) {
        float phase = atan(vDisplacement, length(vPosition.xy));
        vec3 phaseColor = getPhaseColor(phase);
        baseColor = mix(baseColor, phaseColor, 0.5);
    }
    
    // Calculate lighting
    vec3 lighting = calculateLighting(N, V, L);
    vec3 litColor = baseColor * lighting;
    
    // Add contour lines if enabled
    if (showContours) {
        float contourMask = getContourMask(vDisplacement, contourInterval);
        litColor = mix(litColor, vec3(0.0), contourMask * 0.5);
    }
    
    // Fresnel rim lighting for depth perception
    float fresnel = fresnelEffect(V, N, 3.0);
    litColor += fresnel * vec3(0.2, 0.3, 0.5) * 0.3;
    
    // Grid overlay for reference
    float grid = gridPattern(vUv, 10.0);
    litColor = mix(litColor, litColor * 0.8, grid * 0.1);
    
    // Distance-based fog for depth
    float fogDistance = length(vViewPosition);
    float fogFactor = exp(-fogDistance * 0.05);
    vec3 fogColor = vec3(0.1, 0.1, 0.15);
    litColor = mix(fogColor, litColor, fogFactor);
    
    // Output with opacity
    fragColor = vec4(litColor, opacity);
    
    // Enhance visualization with brightness boost for peaks
    float intensityBoost = abs(vDisplacement) * 0.5 + 0.5;
    fragColor.rgb *= intensityBoost;
    
    // Gamma correction
    fragColor.rgb = pow(fragColor.rgb, vec3(1.0 / 2.2));
}
