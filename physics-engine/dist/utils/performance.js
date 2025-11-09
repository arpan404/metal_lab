// physics-engine/utils/performance.ts
/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
    constructor() {
        this.frameTimestamps = [];
        this.maxSamples = 60;
        this.metrics = new Map();
    }
    recordFrame() {
        const now = performance.now();
        this.frameTimestamps.push(now);
        if (this.frameTimestamps.length > this.maxSamples) {
            this.frameTimestamps.shift();
        }
    }
    getFPS() {
        if (this.frameTimestamps.length < 2)
            return 0;
        const timeSpan = this.frameTimestamps[this.frameTimestamps.length - 1] - this.frameTimestamps[0];
        const frameCount = this.frameTimestamps.length - 1;
        return (frameCount / timeSpan) * 1000;
    }
    getAverageFrameTime() {
        if (this.frameTimestamps.length < 2)
            return 0;
        const timeSpan = this.frameTimestamps[this.frameTimestamps.length - 1] - this.frameTimestamps[0];
        const frameCount = this.frameTimestamps.length - 1;
        return timeSpan / frameCount;
    }
    recordMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        const values = this.metrics.get(name);
        values.push(value);
        if (values.length > this.maxSamples) {
            values.shift();
        }
    }
    getMetricAverage(name) {
        const values = this.metrics.get(name);
        if (!values || values.length === 0)
            return 0;
        return values.reduce((sum, v) => sum + v, 0) / values.length;
    }
    getMetricMax(name) {
        const values = this.metrics.get(name);
        if (!values || values.length === 0)
            return 0;
        return Math.max(...values);
    }
    reset() {
        this.frameTimestamps = [];
        this.metrics.clear();
    }
    getReport() {
        return {
            fps: this.getFPS(),
            averageFrameTime: this.getAverageFrameTime(),
            metrics: Object.fromEntries(Array.from(this.metrics.entries()).map(([name, values]) => [
                name,
                {
                    average: this.getMetricAverage(name),
                    max: this.getMetricMax(name),
                    current: values[values.length - 1] || 0
                }
            ]))
        };
    }
}
/**
 * Timing utility for measuring code execution
 */
export class Timer {
    constructor() {
        this.startTime = 0;
        this.endTime = 0;
        this.isRunning = false;
    }
    start() {
        this.startTime = performance.now();
        this.isRunning = true;
    }
    stop() {
        this.endTime = performance.now();
        this.isRunning = false;
        return this.getElapsed();
    }
    getElapsed() {
        if (this.isRunning) {
            return performance.now() - this.startTime;
        }
        else {
            return this.endTime - this.startTime;
        }
    }
    reset() {
        this.startTime = 0;
        this.endTime = 0;
        this.isRunning = false;
    }
}
/**
 * Profile a function execution
 */
export function profile(name, fn) {
    const timer = new Timer();
    timer.start();
    const result = fn();
    const elapsed = timer.stop();
    console.log(`[Profile] ${name}: ${elapsed.toFixed(2)}ms`);
    return result;
}
/**
 * Async profile
 */
export async function profileAsync(name, fn) {
    const timer = new Timer();
    timer.start();
    const result = await fn();
    const elapsed = timer.stop();
    console.log(`[Profile] ${name}: ${elapsed.toFixed(2)}ms`);
    return result;
}
/**
 * Memory usage snapshot
 */
export function getMemoryUsage() {
    if ('memory' in performance) {
        const mem = performance.memory;
        return {
            usedJSHeapSize: mem.usedJSHeapSize,
            totalJSHeapSize: mem.totalJSHeapSize,
            jsHeapSizeLimit: mem.jsHeapSizeLimit
        };
    }
    return null;
}
/**
 * Throttle function execution
 */
export function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = performance.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
        }
    };
}
/**
 * Debounce function execution
 */
export function debounce(func, delay) {
    let timeoutId = null;
    return function (...args) {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, delay);
    };
}
