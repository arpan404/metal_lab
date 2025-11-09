// physics-engine/utils/animation.ts
export const Easing = {
    // No easing
    linear: (t) => t,
    // Quadratic
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    // Cubic
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    // Quartic
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - (--t) * t * t * t,
    easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    // Quintic
    easeInQuint: (t) => t * t * t * t * t,
    easeOutQuint: (t) => 1 + (--t) * t * t * t * t,
    easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
    // Sine
    easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    // Exponential
    easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
    easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInOutExpo: (t) => {
        if (t === 0 || t === 1)
            return t;
        return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
    },
    // Circular
    easeInCirc: (t) => 1 - Math.sqrt(1 - t * t),
    easeOutCirc: (t) => Math.sqrt(1 - (--t) * t),
    easeInOutCirc: (t) => {
        return t < 0.5
            ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
            : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
    },
    // Elastic
    easeInElastic: (t) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    easeOutElastic: (t) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    // Bounce
    easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        }
        else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        }
        else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        }
        else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }
};
/**
 * Tweening class for animating values
 */
export class Tween {
    constructor(startValue, endValue, duration, easing = Easing.linear) {
        this.active = false;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.easing = easing;
        this.startTime = 0;
    }
    start() {
        this.startTime = performance.now();
        this.active = true;
    }
    update(currentTime) {
        if (!this.active)
            return false;
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
    setOnUpdate(callback) {
        this.onUpdate = callback;
        return this;
    }
    setOnComplete(callback) {
        this.onComplete = callback;
        return this;
    }
    stop() {
        this.active = false;
    }
    isActive() {
        return this.active;
    }
}
/**
 * Animation manager
 */
export class AnimationManager {
    constructor() {
        this.tweens = [];
        this.animationFrameId = null;
    }
    add(tween) {
        this.tweens.push(tween);
        tween.start();
        if (!this.animationFrameId) {
            this.start();
        }
    }
    start() {
        const animate = (time) => {
            this.tweens = this.tweens.filter(tween => tween.update(time));
            if (this.tweens.length > 0) {
                this.animationFrameId = requestAnimationFrame(animate);
            }
            else {
                this.animationFrameId = null;
            }
        };
        this.animationFrameId = requestAnimationFrame(animate);
    }
    stopAll() {
        this.tweens.forEach(tween => tween.stop());
        this.tweens = [];
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    getActiveCount() {
        return this.tweens.length;
    }
}
/**
 * Spring physics for natural motion
 */
export class Spring {
    constructor(initialPosition = 0, stiffness = 100, damping = 10) {
        this.position = initialPosition;
        this.velocity = 0;
        this.target = initialPosition;
        this.stiffness = stiffness;
        this.damping = damping;
    }
    setTarget(target) {
        this.target = target;
    }
    update(deltaTime) {
        const force = this.stiffness * (this.target - this.position);
        const dampingForce = -this.damping * this.velocity;
        const acceleration = force + dampingForce;
        this.velocity += acceleration * deltaTime;
        this.position += this.velocity * deltaTime;
        return this.position;
    }
    getPosition() {
        return this.position;
    }
    getVelocity() {
        return this.velocity;
    }
    isAtRest(threshold = 0.01) {
        return Math.abs(this.velocity) < threshold && Math.abs(this.target - this.position) < threshold;
    }
}
