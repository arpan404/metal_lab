// physics-engine/shaders/glsl/heatmap.frag
// Heatmap visualization for field intensities and probability densities
#version 300 es

precision highp float;

// Input
in vec2 vUv;
in vec3 vPosition;
in vec3 vNormal;

// Uniforms
uniform sampler2D intensityMap;
uniform float minValue;
uniform float maxValue;
uniform float time;
uniform int colorScheme; // 0: thermal, 1: viridis, 2: plasma, 3: rainbow, 4: custom
uniform bool enableContours;
uniform float contourSpacing;
uniform bool enableSmoothing;

// Output
out vec4 fragColor;

// Thermal color scheme (black -> red -> yellow -> white)
vec3 thermalColormap(float t) {
    vec3 color;
    if (t < 0.25) {
        color = mix(vec3(0.0), vec3(1.0, 0.0, 0.0), t * 4.0);
    } else if (t < 0.5) {
        color = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.25) * 4.0);
    } else if (t < 0.75) {
        color = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 1.0, 1.0), (t - 0.5) * 4.0);
    } else {
        color = vec3(1.0, 1.0, 1.0);
    }
    return color;
}

// Viridis colormap (perceptually uniform)
vec3 viridisColormap(float t) {
    const vec3 c0 = vec3(0.267004, 0.004874, 0.329415);
    const vec3 c1 = vec3(0.282623, 0.140926, 0.457517);
    const vec3 c2 = vec3(0.253935, 0.265254, 0.529983);
    const vec3 c3 = vec3(0.206756, 0.371758, 0.553117);
    const vec3 c4 = vec3(0.163625, 0.471133, 0.558148);
    const vec3 c5 = vec3(0.127568, 0.566949, 0.550556);
    const vec3 c6 = vec3(0.134692, 0.658636, 0.517649);
    const vec3 c7 = vec3(0.266941, 0.748751, 0.440573);
    const vec3 c8 = vec3(0.477504, 0.821444, 0.318195);
    const vec3 c9 = vec3(0.741388, 0.873449, 0.149561);
    const vec3 c10 = vec3(0.993248, 0.906157, 0.143936);
    
    if (t < 0.1) return mix(c0, c1, t * 10.0);
    else if (t < 0.2) return mix(c1, c2, (t - 0.1) * 10.0);
    else if (t < 0.3) return mix(c2, c3, (t - 0.2) * 10.0);
    else if (t < 0.4) return mix(c3, c4, (t - 0.3) * 10.0);
    else if (t < 0.5) return mix(c4, c5, (t - 0.4) * 10.0);
    else if (t < 0.6) return mix(c5, c6, (t - 0.5) * 10.0);
    else if (t < 0.7) return mix(c6, c7, (t - 0.6) * 10.0);
    else if (t < 0.8) return mix(c7, c8, (t - 0.7) * 10.0);
    else if (t < 0.9) return mix(c8, c9, (t - 0.8) * 10.0);
    else return mix(c9, c10, (t - 0.9) * 10.0);
}

// Plasma colormap
vec3 plasmaColormap(float t) {
    const vec3 c0 = vec3(0.050383, 0.029803, 0.527975);
    const vec3 c1 = vec3(0.286498, 0.018462, 0.613796);
    const vec3 c2 = vec3(0.474369, 0.006332, 0.657625);
    const vec3 c3 = vec3(0.644261, 0.030153, 0.641786);
    const vec3 c4 = vec3(0.795716, 0.132245, 0.568154);
    const vec3 c5 = vec3(0.908591, 0.279673, 0.458122);
    const vec3 c6 = vec3(0.980605, 0.447021, 0.327668);
    const vec3 c7 = vec3(0.999660, 0.628661, 0.206885);
    const vec3 c8 = vec3(0.972919, 0.818525, 0.143880);
    const vec3 c9 = vec3(0.940015, 0.975158, 0.131326);
    
    if (t < 0.111) return mix(c0, c1, t * 9.0);
    else if (t < 0.222) return mix(c1, c2, (t - 0.111) * 9.0);
    else if (t < 0.333) return mix(c2, c3, (t - 0.222) * 9.0);
    else if (t < 0.444) return mix(c3, c4, (t - 0.333) * 9.0);
    else if (t < 0.555) return mix(c4, c5, (t - 0.444) * 9.0);
    else if (t < 0.666) return mix(c5, c6, (t - 0.555) * 9.0);
    else if (t < 0.777) return mix(c6, c7, (t - 0.666) * 9.0);
    else if (t < 0.888) return mix(c7, c8, (t - 0.777) * 9.0);
    else return mix(c8, c9, (t - 0.888) * 9.0);
}

// Rainbow colormap (HSV-based)
vec3 rainbowColormap(float t) {
    float hue = t * 6.0;
    float c = 1.0;
    float x = c * (1.0 - abs(mod(hue, 2.0) - 1.0));
    
    vec3 color;
    if (hue < 1.0) color = vec3(c, x, 0.0);
    else if (hue < 2.0) color = vec3(x, c, 0.0);
    else if (hue < 3.0) color = vec3(0.0, c, x);
    else if (hue < 4.0) color = vec3(0.0, x, c);
    else if (hue < 5.0) color = vec3(x, 0.0, c);
    else color = vec3(c, 0.0, x);
    
    return color;
}

// Cool-to-warm diverging colormap
vec3 coolWarmColormap(float t) {
    vec3 coolColor = vec3(0.23, 0.30, 0.75);
    vec3 neutralColor = vec3(0.87, 0.87, 0.87);
    vec3 warmColor = vec3(0.71, 0.02, 0.15);
    
    if (t < 0.5) {
        return mix(coolColor, neutralColor, t * 2.0);
    } else {
        return mix(neutralColor, warmColor, (t - 0.5) * 2.0);
    }
}

// Get color based on selected scheme
vec3 getColorFromScheme(float t) {
    if (colorScheme == 0) return thermalColormap(t);
    else if (colorScheme == 1) return viridisColormap(t);
    else if (colorScheme == 2) return plasmaColormap(t);
    else if (colorScheme == 3) return rainbowColormap(t);
    else if (colorScheme == 4) return coolWarmColormap(t);
    else return viridisColormap(t); // Default
}

// Contour lines
float contourLine(float value) {
    float modValue = mod(value, contourSpacing);
    float distToLine = min(modValue, contourSpacing - modValue);
    return smoothstep(0.0, 0.01, distToLine);
}

// Bicubic interpolation for smoother sampling
vec3 bicubicSample(sampler2D tex, vec2 uv, vec2 texelSize) {
    vec2 coord = uv / texelSize - 0.5;
    vec2 f = fract(coord);
    coord = floor(coord) + 0.5;
    
    vec3 samples[4];
    for (int y = -1; y <= 2; y++) {
        vec3 row[4];
        for (int x = -1; x <= 2; x++) {
            vec2 sampleUv = (coord + vec2(float(x), float(y))) * texelSize;
            row[x + 1] = texture(tex, sampleUv).rgb;
        }
        
        float wx[4];
        wx[0] = ((-0.5 * f.x + 1.0) * f.x - 0.5) * f.x;
        wx[1] = ((1.5 * f.x - 2.5) * f.x) * f.x + 1.0;
        wx[2] = ((-1.5 * f.x + 2.0) * f.x + 0.5) * f.x;
        wx[3] = ((0.5 * f.x - 0.5) * f.x) * f.x;
        
        samples[y + 1] = row[0] * wx[0] + row[1] * wx[1] + row[2] * wx[2] + row[3] * wx[3];
    }
    
    float wy[4];
    wy[0] = ((-0.5 * f.y + 1.0) * f.y - 0.5) * f.y;
    wy[1] = ((1.5 * f.y - 2.5) * f.y) * f.y + 1.0;
    wy[2] = ((-1.5 * f.y + 2.0) * f.y + 0.5) * f.y;
    wy[3] = ((0.5 * f.y - 0.5) * f.y) * f.y;
    
    return samples[0] * wy[0] + samples[1] * wy[1] + samples[2] * wy[2] + samples[3] * wy[3];
}

void main() {
    vec2 uv = vUv;
    
    // Sample intensity value
    float intensity;
    if (enableSmoothing) {
        vec2 texelSize = vec2(1.0) / vec2(textureSize(intensityMap, 0));
        intensity = bicubicSample(intensityMap, uv, texelSize).r;
    } else {
        intensity = texture(intensityMap, uv).r;
    }
    
    // Normalize to [0, 1]
    float normalizedValue = clamp((intensity - minValue) / (maxValue - minValue), 0.0, 1.0);
    
    // Apply logarithmic scaling for better visualization of wide ranges
    // normalizedValue = log(1.0 + normalizedValue * 9.0) / log(10.0);
    
    // Get color from colormap
    vec3 color = getColorFromScheme(normalizedValue);
    
    // Add contour lines if enabled
    if (enableContours) {
        float contour = contourLine(intensity);
        color = mix(vec3(0.0), color, contour);
    }
    
    // Add animated overlay for dynamic effects
    float pulse = sin(time * 2.0 + normalizedValue * 10.0) * 0.05 + 0.95;
    color *= pulse;
    
    // Output
    fragColor = vec4(color, 1.0);
}
