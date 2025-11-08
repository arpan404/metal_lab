// physics-engine/utils/animation.ts

/**
 * Easing functions for smooth animations
 */

export type EasingFunction = (t: number) => number;

export const Easing = {
  // No easing
  linear: (t: number): number => t,
  
  // Quadratic
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  // Cubic
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  // Quartic
  easeInQuart: (t: number): number => t * t * t * t,
  easeOutQuart: (t: number): number => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number): number => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  
  // Quintic
  easeInQuint: (t: number): number => t * t * t * t * t,
  easeOutQuint: (t: number): number => 1 + (--t) * t * t * t * t,
  easeInOutQuint: (t: number): number => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  
  // Sine
  easeInSine: (t: number): number => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t: number): number => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,
  
  // Exponential
  easeInExpo: (t: number): number => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
  easeOutExpo: (t: number): number => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t: number): number => {
    if (t === 0 || t === 1) return t;
    return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  
  // Circular
  easeInCirc: (t: number): number => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t: number): number => Math.sqrt(1 - (--t) * t),
  easeInOutCirc: (t: number): number => {
    return t < 0.5
      ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
      : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
  },
  
  // Elastic
  easeInElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  
  // Bounce
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
};

/**
 * Tweening class for animating values
 */
export class Tween {
  private startValue: number;
  private endValue: number;
  private duration: number;
  private easing: EasingFunction;
  private startTime: number;
  private onUpdate?: (value: number) => void;
  private onComplete?: () => void;
  private active: boolean = false;
  
  constructor(
    startValue: number,
    endValue: number,
    duration: number,
    easing: EasingFunction = Easing.linear
  ) {
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.easing = easing;
    this.startTime = 0;
  }
  
  start(): void {
    this.startTime = performance.now();
    this.active = true;
  }
  
  update(currentTime: number): boolean {
    if (!this.active) return false;
    
    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / (this.duration * 1000), 1);
    const easedProgress = this.easing(progress);
    
    const currentValue = this.startValue + (this.endValue - this.startValue) * easedProgress;
    
    if (this.onUpdate) {
      this.onUpdate(currentValue);
    }
    
    if (progress >= 1) {
      this.active = false;
      if (this.onComplete) {
        this.onComplete();
      }
      return false;
    }
    
    return true;
  }
  
  setOnUpdate(callback: (value: number) => void): this {
    this.onUpdate = callback;
    return this;
  }
  
  setOnComplete(callback: () => void): this {
    this.onComplete = callback;
    return this;
  }
  
  stop(): void {
    this.active = false;
  }
  
  isActive(): boolean {
    return this.active;
  }
}

/**
 * Animation manager
 */
export class AnimationManager {
  private tweens: Tween[] = [];
  private animationFrameId: number | null = null;
  
  add(tween: Tween): void {
    this.tweens.push(tween);
    tween.start();
    
    if (!this.animationFrameId) {
      this.start();
    }
  }
  
  private start(): void {
    const animate = (time: number) => {
      this.tweens = this.tweens.filter(tween => tween.update(time));
      
      if (this.tweens.length > 0) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.animationFrameId = null;
      }
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
  }
  
  stopAll(): void {
    this.tweens.forEach(tween => tween.stop());
    this.tweens = [];
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  getActiveCount(): number {
    return this.tweens.length;
  }
}

/**
 * Spring physics for natural motion
 */
export class Spring {
  private position: number;
  private velocity: number;
  private target: number;
  private stiffness: number;
  private damping: number;
  
  constructor(
    initialPosition: number = 0,
    stiffness: number = 100,
    damping: number = 10
  ) {
    this.position = initialPosition;
    this.velocity = 0;
    this.target = initialPosition;
    this.stiffness = stiffness;
    this.damping = damping;
  }
  
  setTarget(target: number): void {
    this.target = target;
  }
  
  update(deltaTime: number): number {
    const force = this.stiffness * (this.target - this.position);
    const dampingForce = -this.damping * this.velocity;
    
    const acceleration = force + dampingForce;
    this.velocity += acceleration * deltaTime;
    this.position += this.velocity * deltaTime;
    
    return this.position;
  }
  
  getPosition(): number {
    return this.position;
  }
  
  getVelocity(): number {
    return this.velocity;
  }
  
  isAtRest(threshold: number = 0.01): boolean {
    return Math.abs(this.velocity) < threshold && Math.abs(this.target - this.position) < threshold;
  }
}