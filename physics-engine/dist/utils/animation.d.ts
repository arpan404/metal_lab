/**
 * Easing functions for smooth animations
 */
export type EasingFunction = (t: number) => number;
export declare const Easing: {
    linear: (t: number) => number;
    easeInQuad: (t: number) => number;
    easeOutQuad: (t: number) => number;
    easeInOutQuad: (t: number) => number;
    easeInCubic: (t: number) => number;
    easeOutCubic: (t: number) => number;
    easeInOutCubic: (t: number) => number;
    easeInQuart: (t: number) => number;
    easeOutQuart: (t: number) => number;
    easeInOutQuart: (t: number) => number;
    easeInQuint: (t: number) => number;
    easeOutQuint: (t: number) => number;
    easeInOutQuint: (t: number) => number;
    easeInSine: (t: number) => number;
    easeOutSine: (t: number) => number;
    easeInOutSine: (t: number) => number;
    easeInExpo: (t: number) => number;
    easeOutExpo: (t: number) => number;
    easeInOutExpo: (t: number) => number;
    easeInCirc: (t: number) => number;
    easeOutCirc: (t: number) => number;
    easeInOutCirc: (t: number) => number;
    easeInElastic: (t: number) => number;
    easeOutElastic: (t: number) => number;
    easeOutBounce: (t: number) => number;
};
/**
 * Tweening class for animating values
 */
export declare class Tween {
    private startValue;
    private endValue;
    private duration;
    private easing;
    private startTime;
    private onUpdate?;
    private onComplete?;
    private active;
    constructor(startValue: number, endValue: number, duration: number, easing?: EasingFunction);
    start(): void;
    update(currentTime: number): boolean;
    setOnUpdate(callback: (value: number) => void): this;
    setOnComplete(callback: () => void): this;
    stop(): void;
    isActive(): boolean;
}
/**
 * Animation manager
 */
export declare class AnimationManager {
    private tweens;
    private animationFrameId;
    add(tween: Tween): void;
    private start;
    stopAll(): void;
    getActiveCount(): number;
}
/**
 * Spring physics for natural motion
 */
export declare class Spring {
    private position;
    private velocity;
    private target;
    private stiffness;
    private damping;
    constructor(initialPosition?: number, stiffness?: number, damping?: number);
    setTarget(target: number): void;
    update(deltaTime: number): number;
    getPosition(): number;
    getVelocity(): number;
    isAtRest(threshold?: number): boolean;
}
//# sourceMappingURL=animation.d.ts.map