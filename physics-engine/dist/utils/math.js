// physics-engine/utils/math.ts
/**
 * Vector math utilities
 */
export function vectorAdd(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z
    };
}
export function vectorSubtract(a, b) {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z
    };
}
export function vectorScale(v, scalar) {
    return {
        x: v.x * scalar,
        y: v.y * scalar,
        z: v.z * scalar
    };
}
export function vectorMagnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}
export function vectorNormalize(v) {
    const mag = vectorMagnitude(v);
    if (mag === 0)
        return { x: 0, y: 0, z: 0 };
    return {
        x: v.x / mag,
        y: v.y / mag,
        z: v.z / mag
    };
}
export function vectorDot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}
export function vectorCross(a, b) {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}
export function vectorDistance(a, b) {
    return vectorMagnitude(vectorSubtract(a, b));
}
export function vectorLerp(a, b, t) {
    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
        z: lerp(a.z, b.z, t)
    };
}
/**
 * 2D Vector operations
 */
export function vector2DAdd(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}
export function vector2DMagnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}
export function vector2DNormalize(v) {
    const mag = vector2DMagnitude(v);
    if (mag === 0)
        return { x: 0, y: 0 };
    return { x: v.x / mag, y: v.y / mag };
}
/**
 * Interpolation functions
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
export function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}
export function smootherstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * t * (t * (t * 6 - 15) + 10);
}
/**
 * Angle utilities
 */
export function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}
export function radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
}
export function normalizeAngle(angle) {
    // Normalize to [0, 2π)
    while (angle < 0)
        angle += 2 * Math.PI;
    while (angle >= 2 * Math.PI)
        angle -= 2 * Math.PI;
    return angle;
}
export function angleDifference(a, b) {
    // Smallest difference between two angles
    const diff = normalizeAngle(b - a);
    return diff > Math.PI ? diff - 2 * Math.PI : diff;
}
export function matrix3x3Identity() {
    return [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];
}
export function matrix3x3Multiply(a, b) {
    const result = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return result;
}
export function rotationMatrix(axis, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    if (axis === 'x') {
        return [
            [1, 0, 0],
            [0, c, -s],
            [0, s, c]
        ];
    }
    else if (axis === 'y') {
        return [
            [c, 0, s],
            [0, 1, 0],
            [-s, 0, c]
        ];
    }
    else {
        return [
            [c, -s, 0],
            [s, c, 0],
            [0, 0, 1]
        ];
    }
}
/**
 * Random utilities
 */
export function randomRange(min, max) {
    return min + Math.random() * (max - min);
}
export function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}
export function randomVector3D(min, max) {
    return {
        x: randomRange(min, max),
        y: randomRange(min, max),
        z: randomRange(min, max)
    };
}
export function randomUnitVector3D() {
    // Uniform random distribution on unit sphere
    const theta = randomRange(0, 2 * Math.PI);
    const phi = Math.acos(randomRange(-1, 1));
    return {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi)
    };
}
/**
 * Statistical utilities
 */
export function mean(values) {
    if (values.length === 0)
        return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}
export function standardDeviation(values) {
    if (values.length === 0)
        return 0;
    const avg = mean(values);
    const squaredDiffs = values.map(v => (v - avg) ** 2);
    const variance = mean(squaredDiffs);
    return Math.sqrt(variance);
}
export function median(values) {
    if (values.length === 0)
        return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    else {
        return sorted[mid];
    }
}
/**
 * Numerical methods
 */
export function findRoot(f, x0, x1, tolerance = 1e-6, maxIterations = 100) {
    // Bisection method
    let a = x0;
    let b = x1;
    let fa = f(a);
    let fb = f(b);
    if (fa * fb > 0) {
        return null; // No root in interval
    }
    for (let i = 0; i < maxIterations; i++) {
        const c = (a + b) / 2;
        const fc = f(c);
        if (Math.abs(fc) < tolerance || (b - a) / 2 < tolerance) {
            return c;
        }
        if (fa * fc < 0) {
            b = c;
            fb = fc;
        }
        else {
            a = c;
            fa = fc;
        }
    }
    return (a + b) / 2;
}
export function derivative(f, x, h = 1e-5) {
    // Central difference approximation
    return (f(x + h) - f(x - h)) / (2 * h);
}
export function integral(f, a, b, n = 1000) {
    // Trapezoidal rule
    const h = (b - a) / n;
    let sum = (f(a) + f(b)) / 2;
    for (let i = 1; i < n; i++) {
        sum += f(a + i * h);
    }
    return sum * h;
}
