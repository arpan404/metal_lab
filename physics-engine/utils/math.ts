// physics-engine/utils/math.ts

import type { Vector3D, Vector2D } from '../types';

/**
 * Vector math utilities
 */

export function vectorAdd(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z
  };
}

export function vectorSubtract(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };
}

export function vectorScale(v: Vector3D, scalar: number): Vector3D {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar
  };
}

export function vectorMagnitude(v: Vector3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function vectorNormalize(v: Vector3D): Vector3D {
  const mag = vectorMagnitude(v);
  if (mag === 0) return { x: 0, y: 0, z: 0 };
  
  return {
    x: v.x / mag,
    y: v.y / mag,
    z: v.z / mag
  };
}

export function vectorDot(a: Vector3D, b: Vector3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function vectorCross(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

export function vectorDistance(a: Vector3D, b: Vector3D): number {
  return vectorMagnitude(vectorSubtract(a, b));
}

export function vectorLerp(a: Vector3D, b: Vector3D, t: number): Vector3D {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t)
  };
}

/**
 * 2D Vector operations
 */

export function vector2DAdd(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vector2DMagnitude(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function vector2DNormalize(v: Vector2D): Vector2D {
  const mag = vector2DMagnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

/**
 * Interpolation functions
 */

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Angle utilities
 */

export function degreesToRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

export function radiansToDegrees(radians: number): number {
  return radians * 180 / Math.PI;
}

export function normalizeAngle(angle: number): number {
  // Normalize to [0, 2π)
  while (angle < 0) angle += 2 * Math.PI;
  while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
  return angle;
}

export function angleDifference(a: number, b: number): number {
  // Smallest difference between two angles
  const diff = normalizeAngle(b - a);
  return diff > Math.PI ? diff - 2 * Math.PI : diff;
}

/**
 * Matrix operations (3x3)
 */

export type Matrix3x3 = number[][]; // 3x3 array

export function matrix3x3Identity(): Matrix3x3 {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
}

export function matrix3x3Multiply(a: Matrix3x3, b: Matrix3x3): Matrix3x3 {
  const result: Matrix3x3 = [
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

export function rotationMatrix(axis: 'x' | 'y' | 'z', angle: number): Matrix3x3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  
  if (axis === 'x') {
    return [
      [1, 0, 0],
      [0, c, -s],
      [0, s, c]
    ];
  } else if (axis === 'y') {
    return [
      [c, 0, s],
      [0, 1, 0],
      [-s, 0, c]
    ];
  } else {
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

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

export function randomVector3D(min: number, max: number): Vector3D {
  return {
    x: randomRange(min, max),
    y: randomRange(min, max),
    z: randomRange(min, max)
  };
}

export function randomUnitVector3D(): Vector3D {
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

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const avg = mean(values);
  const squaredDiffs = values.map(v => (v - avg) ** 2);
  const variance = mean(squaredDiffs);
  
  return Math.sqrt(variance);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * Numerical methods
 */

export function findRoot(
  f: (x: number) => number,
  x0: number,
  x1: number,
  tolerance: number = 1e-6,
  maxIterations: number = 100
): number | null {
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
    } else {
      a = c;
      fa = fc;
    }
  }
  
  return (a + b) / 2;
}

export function derivative(
  f: (x: number) => number,
  x: number,
  h: number = 1e-5
): number {
  // Central difference approximation
  return (f(x + h) - f(x - h)) / (2 * h);
}

export function integral(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number = 1000
): number {
  // Trapezoidal rule
  const h = (b - a) / n;
  let sum = (f(a) + f(b)) / 2;
  
  for (let i = 1; i < n; i++) {
    sum += f(a + i * h);
  }
  
  return sum * h;
}