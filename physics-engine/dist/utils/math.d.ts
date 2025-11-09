import type { Vector3D, Vector2D } from '../types';
/**
 * Vector math utilities
 */
export declare function vectorAdd(a: Vector3D, b: Vector3D): Vector3D;
export declare function vectorSubtract(a: Vector3D, b: Vector3D): Vector3D;
export declare function vectorScale(v: Vector3D, scalar: number): Vector3D;
export declare function vectorMagnitude(v: Vector3D): number;
export declare function vectorNormalize(v: Vector3D): Vector3D;
export declare function vectorDot(a: Vector3D, b: Vector3D): number;
export declare function vectorCross(a: Vector3D, b: Vector3D): Vector3D;
export declare function vectorDistance(a: Vector3D, b: Vector3D): number;
export declare function vectorLerp(a: Vector3D, b: Vector3D, t: number): Vector3D;
/**
 * 2D Vector operations
 */
export declare function vector2DAdd(a: Vector2D, b: Vector2D): Vector2D;
export declare function vector2DMagnitude(v: Vector2D): number;
export declare function vector2DNormalize(v: Vector2D): Vector2D;
/**
 * Interpolation functions
 */
export declare function lerp(a: number, b: number, t: number): number;
export declare function clamp(value: number, min: number, max: number): number;
export declare function smoothstep(edge0: number, edge1: number, x: number): number;
export declare function smootherstep(edge0: number, edge1: number, x: number): number;
/**
 * Angle utilities
 */
export declare function degreesToRadians(degrees: number): number;
export declare function radiansToDegrees(radians: number): number;
export declare function normalizeAngle(angle: number): number;
export declare function angleDifference(a: number, b: number): number;
/**
 * Matrix operations (3x3)
 */
export type Matrix3x3 = number[][];
export declare function matrix3x3Identity(): Matrix3x3;
export declare function matrix3x3Multiply(a: Matrix3x3, b: Matrix3x3): Matrix3x3;
export declare function rotationMatrix(axis: 'x' | 'y' | 'z', angle: number): Matrix3x3;
/**
 * Random utilities
 */
export declare function randomRange(min: number, max: number): number;
export declare function randomInt(min: number, max: number): number;
export declare function randomVector3D(min: number, max: number): Vector3D;
export declare function randomUnitVector3D(): Vector3D;
/**
 * Statistical utilities
 */
export declare function mean(values: number[]): number;
export declare function standardDeviation(values: number[]): number;
export declare function median(values: number[]): number;
/**
 * Numerical methods
 */
export declare function findRoot(f: (x: number) => number, x0: number, x1: number, tolerance?: number, maxIterations?: number): number | null;
export declare function derivative(f: (x: number) => number, x: number, h?: number): number;
export declare function integral(f: (x: number) => number, a: number, b: number, n?: number): number;
//# sourceMappingURL=math.d.ts.map