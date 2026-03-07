"use strict";
/**
 * 🧬 Biometric Jitter Engine
 * Purpose: Simulates human-like behavior (mouse movement, typing rhythm, eye-tracking patterns)
 * to bypass advanced anti-bot telemetries and behavioral analysis.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiometricJitter = void 0;
class BiometricJitter {
    noiseLevel;
    baseDelay = 50;
    constructor(noiseLevel = 0.2) {
        this.noiseLevel = noiseLevel;
    }
    /**
     * Generates a randomized delay to simulate human typing rhythm.
     */
    // Complexity: O(1)
    async humanDelay() {
        const jitter = Math.random() * this.baseDelay * this.noiseLevel;
        const finalDelay = this.baseDelay + (Math.random() > 0.5 ? jitter : -jitter);
        return new Promise(resolve => setTimeout(resolve, finalDelay));
    }
    /**
     * Simulates a "thinking" pause between actions.
     */
    // Complexity: O(1)
    async thinkingPause(min = 500, max = 2000) {
        const delay = Math.floor(Math.random() * (max - min + 1) + min);
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    /**
     * Generates a coordinate path for "human" mouse movement.
     */
    // Complexity: O(1)
    generatePath(startX, startY, endX, endY) {
        // Basic bezier curve logic would go here
        return [
            { x: startX, y: startY },
            { x: (startX + endX) / 2 + Math.random() * 20, y: (startY + endY) / 2 + Math.random() * 20 },
            { x: endX, y: endY }
        ];
    }
}
exports.BiometricJitter = BiometricJitter;
