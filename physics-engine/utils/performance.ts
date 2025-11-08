// physics-engine/utils/performance.ts

/**
 * Performance monitoring utilities
 */

export class PerformanceMonitor {
    private frameTimestamps: number[] = [];
    private maxSamples: number = 60;
    private metrics: Map<string, number[]> = new Map();
    
    recordFrame(): void {
      const now = performance.now();
      this.frameTimestamps.push(now);
      
      if (this.frameTimestamps.length > this.maxSamples) {
        this.frameTimestamps.shift();
      }
    }
    
    getFPS(): number {
      if (this.frameTimestamps.length < 2) return 0;
      
      const timeSpan = this.frameTimestamps[this.frameTimestamps.length - 1] - this.frameTimestamps[0];
      const frameCount = this.frameTimestamps.length - 1;
      
      return (frameCount / timeSpan) * 1000;
    }
    
    getAverageFrameTime(): number {
      if (this.frameTimestamps.length < 2) return 0;
      
      const timeSpan = this.frameTimestamps[this.frameTimestamps.length - 1] - this.frameTimestamps[0];
      const frameCount = this.frameTimestamps.length - 1;
      
      return timeSpan / frameCount;
    }
    
    recordMetric(name: string, value: number): void {
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      const values = this.metrics.get(name)!;
      values.push(value);
      
      if (values.length > this.maxSamples) {
        values.shift();
      }
    }
    
    getMetricAverage(name: string): number {
      const values = this.metrics.get(name);
      if (!values || values.length === 0) return 0;
      
      return values.reduce((sum, v) => sum + v, 0) / values.length;
    }
    
    getMetricMax(name: string): number {
      const values = this.metrics.get(name);
      if (!values || values.length === 0) return 0;
      
      return Math.max(...values);
    }
    
    reset(): void {
      this.frameTimestamps = [];
      this.metrics.clear();
    }
    
    getReport(): PerformanceReport {
      return {
        fps: this.getFPS(),
        averageFrameTime: this.getAverageFrameTime(),
        metrics: Object.fromEntries(
          Array.from(this.metrics.entries()).map(([name, values]) => [
            name,
            {
              average: this.getMetricAverage(name),
              max: this.getMetricMax(name),
              current: values[values.length - 1] || 0
            }
          ])
        )
      };
    }
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
  export class Timer {
    private startTime: number = 0;
    private endTime: number = 0;
    private isRunning: boolean = false;
    
    start(): void {
      this.startTime = performance.now();
      this.isRunning = true;
    }
    
    stop(): number {
      this.endTime = performance.now();
      this.isRunning = false;
      return this.getElapsed();
    }
    
    getElapsed(): number {
      if (this.isRunning) {
        return performance.now() - this.startTime;
      } else {
        return this.endTime - this.startTime;
      }
    }
    
    reset(): void {
      this.startTime = 0;
      this.endTime = 0;
      this.isRunning = false;
    }
  }
  
  /**
   * Profile a function execution
   */
  export function profile<T>(name: string, fn: () => T): T {
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
  export async function profileAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
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
  export function getMemoryUsage(): MemoryInfo | null {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      return {
        usedJSHeapSize: mem.usedJSHeapSize,
        totalJSHeapSize: mem.totalJSHeapSize,
        jsHeapSizeLimit: mem.jsHeapSizeLimit
      };
    }
    return null;
  }
  
  export interface MemoryInfo {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  }
  
  /**
   * Throttle function execution
   */
  export function throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    
    return function (...args: Parameters<T>) {
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
  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number | null = null;
    
    return function (...args: Parameters<T>) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = window.setTimeout(() => {
        func(...args);
        timeoutId = null;
      }, delay);
    };
  }