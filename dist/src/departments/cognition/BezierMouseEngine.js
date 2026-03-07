"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║          BEZIER MOUSE ENGINE - HUMAN-LIKE CURSOR MOVEMENT SYSTEM             ║
 * ║                                                                               ║
 * ║   Cubic Bezier curves + overshoot + micro-jitter + nervous tremor             ║
 * ║   "Никой човек не се телепортира." — всеки клик е пътешествие.                ║
 * ║                                                                               ║
 * ║   Features:                                                                   ║
 * ║   • Cubic Bezier trajectory with randomized control points                    ║
 * ║   • Overshoot — cursor passes target and returns (80% natural feel)           ║
 * ║   • Micro-jitter — subtle tremor on each step (Perlin-style noise)            ║
 * ║   • Fatigue model — nervousness increases with session length                 ║
 * ║   • Speed variation — acceleration/deceleration mimics real hand              ║
 * ║   • Pause zones — hesitation before clickable elements                        ║
 * ║   • Hardware-aware — jitter intensity from HardwareBridge CPU load            ║
 * ║                                                                               ║
 * ║  Created: 2026-02-23 | QAntum Prime v28.2.0 - Stealth Layer                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BezierMouseEngine = void 0;
exports.getBezierMouseEngine = getBezierMouseEngine;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// BEZIER MOUSE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class BezierMouseEngine extends events_1.EventEmitter {
    config;
    sessionStart;
    totalMoves = 0;
    currentPos = { x: 0, y: 0 };
    // Perlin-like noise state for organic jitter
    noisePhase = Math.random() * 1000;
    noiseStep = 0.02 + Math.random() * 0.03;
    constructor(config) {
        super();
        this.config = {
            baseSpeed: config?.baseSpeed ?? 2.5,
            overshootProbability: config?.overshootProbability ?? 0.75,
            overshootRange: config?.overshootRange ?? [0.06, 0.15],
            jitterRange: config?.jitterRange ?? [0.3, 1.5],
            nervousness: config?.nervousness ?? 0.3,
            steps: config?.steps,
            hesitationRange: config?.hesitationRange ?? [50, 250],
            enableFatigue: config?.enableFatigue ?? true,
            fatigueRate: config?.fatigueRate ?? 0.01,
            maxFatigue: config?.maxFatigue ?? 2.5,
        };
        this.sessionStart = Date.now();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate a human-like movement path from current position to target.
     * Returns array of steps to execute sequentially via page.mouse.move().
     */
    // Complexity: O(1) — amortized
    generatePath(from, to) {
        this.totalMoves++;
        const distance = this.distance(from, to);
        if (distance < 2) {
            // Already there — just jitter in place
            return [{ x: to.x, y: to.y, delay: this.randInt(10, 30), phase: 'cruise' }];
        }
        const fatigue = this.getFatigueFactor();
        const steps = [];
        // Phase 1: Main Bezier curve to target (or overshoot point)
        const willOvershoot = Math.random() < this.config.overshootProbability && distance > 30;
        const overshootTarget = willOvershoot ? this.computeOvershootPoint(from, to) : to;
        const mainCurve = this.cubicBezierPath(from, overshootTarget, distance, fatigue);
        steps.push(...mainCurve);
        // Phase 2: Overshoot correction — smooth return to actual target
        if (willOvershoot) {
            const correctionCurve = this.correctionPath(overshootTarget, to, fatigue);
            steps.push(...correctionCurve);
        }
        // Phase 3: Hesitation before click zone
        if (this.shouldHesitate()) {
            const [minH, maxH] = this.config.hesitationRange;
            steps.push({
                x: to.x + this.jitter(fatigue) * 0.3,
                y: to.y + this.jitter(fatigue) * 0.3,
                delay: this.randInt(minH, maxH),
                phase: 'hesitate',
            });
        }
        // Update current position
        this.currentPos = to;
        this.emit('path-generated', {
            from, to, steps: steps.length,
            overshoot: willOvershoot,
            fatigue,
            distance,
        });
        return steps;
    }
    /**
     * Execute movement on a Playwright page.
     * This is the main integration point.
     */
    // Complexity: O(N) — linear iteration
    async moveAndClick(page, target, options) {
        // Get current mouse position (approximate from last move)
        const from = { ...this.currentPos };
        const path = this.generatePath(from, target);
        // Execute each movement step
        for (const step of path) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await page.mouse.move(step.x, step.y);
            if (step.delay > 0) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.sleep(step.delay);
            }
        }
        // Pre-click micro-pause (humans don't click instantly after arriving)
        const preClickPause = this.randInt(30, 120);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sleep(preClickPause);
        // Click with natural press duration
        const clickDuration = this.randInt(50, 150);
        if (options?.doubleClick) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await page.mouse.dblclick(target.x, target.y, {
                delay: this.randInt(40, 100),
                button: options?.button || 'left',
            });
        }
        else {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await page.mouse.down({ button: options?.button || 'left' });
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(clickDuration);
            // Micro-shift during click hold (humans can't hold perfectly still)
            // SAFETY: async operation — wrap in try-catch for production resilience
            await page.mouse.move(target.x + this.jitter(this.getFatigueFactor()) * 0.2, target.y + this.jitter(this.getFatigueFactor()) * 0.2);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await page.mouse.up({ button: options?.button || 'left' });
        }
        this.emit('click', { target, clickDuration, preClickPause });
    }
    /**
     * Generate a natural scroll movement.
     */
    // Complexity: O(N) — linear iteration
    async humanScroll(page, deltaY, options) {
        const scrollSteps = options?.steps ?? this.randInt(3, 8);
        const basePerStep = deltaY / scrollSteps;
        for (let i = 0; i < scrollSteps; i++) {
            // Vary each scroll chunk
            const variation = 0.7 + Math.random() * 0.6; // 70%-130% of base
            const chunk = basePerStep * variation;
            // SAFETY: async operation — wrap in try-catch for production resilience
            await page.mouse.wheel(0, Math.round(chunk));
            // Natural pause between scroll events
            const scrollPause = this.randInt(20, 80);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(scrollPause);
        }
        this.emit('scroll', { deltaY, steps: scrollSteps });
    }
    /**
     * Simulate idle behavior — micro-movements while "reading".
     */
    // Complexity: O(N) — loop-based
    async idleDrift(page, durationMs, center) {
        const start = Date.now();
        const driftRadius = 15 + Math.random() * 30;
        while (Date.now() - start < durationMs) {
            const angle = this.noiseValue() * Math.PI * 2;
            const radius = driftRadius * (0.3 + Math.random() * 0.7);
            const driftX = center.x + Math.cos(angle) * radius;
            const driftY = center.y + Math.sin(angle) * radius;
            // SAFETY: async operation — wrap in try-catch for production resilience
            await page.mouse.move(driftX, driftY);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(this.randInt(100, 500));
        }
    }
    /**
     * Update nervousness dynamically (e.g., from HardwareBridge CPU load).
     */
    // Complexity: O(1)
    setNervousness(value) {
        this.config.nervousness = Math.max(0, Math.min(1, value));
    }
    /**
     * Get movement statistics.
     */
    // Complexity: O(N) — potential recursive descent
    getStats() {
        return {
            totalMoves: this.totalMoves,
            sessionDuration: Date.now() - this.sessionStart,
            currentFatigue: this.getFatigueFactor(),
            nervousness: this.config.nervousness,
            currentPos: { ...this.currentPos },
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // BEZIER MATH
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate cubic Bezier path with organic noise.
     */
    // Complexity: O(N*M) — nested iteration detected
    cubicBezierPath(from, to, distance, fatigue) {
        const numSteps = this.config.steps || this.calculateSteps(distance);
        const steps = [];
        // Generate 2 random control points for cubic Bezier
        const cp1 = this.randomControlPoint(from, to, 0.2 + Math.random() * 0.3);
        const cp2 = this.randomControlPoint(from, to, 0.5 + Math.random() * 0.3);
        for (let i = 1; i <= numSteps; i++) {
            const t = i / numSteps;
            // Cubic Bezier interpolation
            const base = this.cubicBezier(from, cp1, cp2, to, t);
            // Add organic jitter
            const jx = this.jitter(fatigue);
            const jy = this.jitter(fatigue);
            // Speed curve: slow start, fast middle, slow end (ease-in-out)
            const speedFactor = this.easeInOutSpeed(t);
            const baseDelay = (1 / (this.config.baseSpeed * speedFactor)) * 8;
            const delay = Math.max(2, baseDelay + this.randFloat(-2, 2));
            // Determine phase
            let phase;
            if (t < 0.2)
                phase = 'accelerate';
            else if (t > 0.85)
                phase = 'decelerate';
            else
                phase = 'cruise';
            steps.push({
                x: Math.round((base.x + jx) * 10) / 10,
                y: Math.round((base.y + jy) * 10) / 10,
                delay: Math.round(delay),
                phase,
            });
        }
        return steps;
    }
    /**
     * Smooth correction path after overshoot.
     */
    // Complexity: O(N*M) — nested iteration detected
    correctionPath(from, to, fatigue) {
        const distance = this.distance(from, to);
        const steps = Math.max(5, Math.ceil(distance / 3));
        const result = [];
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            // Ease-out for smooth deceleration into target
            const eased = 1 - Math.pow(1 - t, 3);
            const x = from.x + (to.x - from.x) * eased + this.jitter(fatigue) * 0.5;
            const y = from.y + (to.y - from.y) * eased + this.jitter(fatigue) * 0.5;
            result.push({
                x: Math.round(x * 10) / 10,
                y: Math.round(y * 10) / 10,
                delay: this.randInt(4, 12),
                phase: i === steps ? 'correct' : 'overshoot',
            });
        }
        return result;
    }
    /**
     * Cubic Bezier formula: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
     */
    // Complexity: O(1)
    cubicBezier(p0, p1, p2, p3, t) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;
        return {
            x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
            y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
        };
    }
    /**
     * Random control point perpendicular to the movement line.
     */
    // Complexity: O(1)
    randomControlPoint(from, to, position) {
        const midX = from.x + (to.x - from.x) * position;
        const midY = from.y + (to.y - from.y) * position;
        // Perpendicular vector
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Random offset perpendicular to the line (±30-60% of distance)
        const offsetMag = dist * (0.15 + Math.random() * 0.25);
        const side = Math.random() > 0.5 ? 1 : -1;
        return {
            x: midX + (-dy / dist) * offsetMag * side,
            y: midY + (dx / dist) * offsetMag * side,
        };
    }
    /**
     * Compute overshoot point beyond target.
     */
    // Complexity: O(1)
    computeOvershootPoint(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const [minOver, maxOver] = this.config.overshootRange;
        const overshootDist = dist * (minOver + Math.random() * (maxOver - minOver));
        // Slight angle deviation (±15°)
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.26;
        return {
            x: to.x + Math.cos(angle) * overshootDist,
            y: to.y + Math.sin(angle) * overshootDist,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // NOISE & JITTER
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Organic jitter using simplified Perlin noise.
     */
    // Complexity: O(N) — potential recursive descent
    jitter(fatigue) {
        const [minJ, maxJ] = this.config.jitterRange;
        const amplitude = minJ + (maxJ - minJ) * this.config.nervousness * fatigue;
        this.noisePhase += this.noiseStep;
        const noise = this.noiseValue();
        return noise * amplitude;
    }
    /**
     * Simple smooth noise function (sinusoidal composition).
     */
    // Complexity: O(1)
    noiseValue() {
        const p = this.noisePhase;
        return (Math.sin(p * 1.0) * 0.5 +
            Math.sin(p * 2.3 + 1.7) * 0.3 +
            Math.sin(p * 5.1 + 3.2) * 0.2);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    getFatigueFactor() {
        if (!this.config.enableFatigue)
            return 1;
        const minutes = (Date.now() - this.sessionStart) / 60_000;
        return Math.min(this.config.maxFatigue, 1 + minutes * this.config.fatigueRate);
    }
    // Complexity: O(N) — potential recursive descent
    calculateSteps(distance) {
        // More steps for longer distances, with some randomness
        const base = Math.ceil(distance / this.config.baseSpeed);
        const jittered = base + this.randInt(-3, 5);
        return Math.max(10, Math.min(200, jittered));
    }
    // Complexity: O(1)
    easeInOutSpeed(t) {
        // Bell curve: slow → fast → slow
        if (t < 0.2)
            return 0.3 + t * 3.5; // Accelerate
        if (t > 0.8)
            return 0.3 + (1 - t) * 3.5; // Decelerate
        return 1.0; // Cruise speed
    }
    // Complexity: O(1)
    shouldHesitate() {
        // Hesitate 40% of the time (humans often micro-pause before clicking)
        return Math.random() < 0.4;
    }
    // Complexity: O(1)
    distance(a, b) {
        return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    }
    // Complexity: O(1)
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    // Complexity: O(1)
    randFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    // Complexity: O(1)
    sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
}
exports.BezierMouseEngine = BezierMouseEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════
let mouseEngine = null;
function getBezierMouseEngine(config) {
    if (!mouseEngine) {
        mouseEngine = new BezierMouseEngine(config);
    }
    return mouseEngine;
}
exports.default = BezierMouseEngine;
