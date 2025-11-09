/**
 * Performance monitoring utilities
 */
export declare class PerformanceMonitor {
    private frameTimestamps;
    private maxSamples;
    private metrics;
    recordFrame(): void;
    getFPS(): number;
    getAverageFrameTime(): number;
    recordMetric(name: string, value: number): void;
    getMetricAverage(name: string): number;
    getMetricMax(name: string): number;
    reset(): void;
    getReport(): PerformanceReport;
}
export interface PerformanceReport {
    fps: number;
    averageFrameTime: number;
    metrics: Record<string, {
        average: number;
        max: number;
        current: number;
    }>;
}
/**
 * Timing utility for measuring code execution
 */
export declare class Timer {
    private startTime;
    private endTime;
    private isRunning;
    start(): void;
    stop(): number;
    getElapsed(): number;
    reset(): void;
}
/**
 * Profile a function execution
 */
export declare function profile<T>(name: string, fn: () => T): T;
/**
 * Async profile
 */
export declare function profileAsync<T>(name: string, fn: () => Promise<T>): Promise<T>;
/**
 * Memory usage snapshot
 */
export declare function getMemoryUsage(): MemoryInfo | null;
export interface MemoryInfo {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}
/**
 * Throttle function execution
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Debounce function execution
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void;
//# sourceMappingURL=performance.d.ts.map