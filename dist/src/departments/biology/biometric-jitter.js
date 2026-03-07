"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.0 - BIOMETRIC JITTER                                    ║
 * ║  "Dimitar DNA Guard" - Unique Behavioral Fingerprint                      ║
 * ║                                                                           ║
 * ║  Generates human-like trading patterns to avoid bot detection             ║
 * ║  Персонален поведенчески отпечатък за Димитър Продромов                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.biometricJitter = exports.BiometricJitter = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════
// DIMITAR DNA PROFILE
// ═══════════════════════════════════════════════════════════════════════════
const DIMITAR_PROFILE = {
    id: 'dimitar-prodromov-dna',
    name: 'Димитър Продромов',
    // Bulgarian timezone patterns (UTC+2/+3)
    avgReactionTimeMs: 847, // ~0.85 seconds average reaction
    reactionTimeVariance: 234, // ±234ms variance
    typingSpeedWPM: 72, // Fast but not robotic
    typingVariance: 15, // Natural variation
    // Decision making style - cautious but decisive
    hesitationProbability: 0.12, // 12% chance to hesitate
    doubleCheckProbability: 0.08, // 8% chance to double-check
    cancelProbability: 0.03, // 3% chance to cancel last-second
    // Active during European evening hours
    activeHours: { start: 9, end: 23 }, // 9 AM to 11 PM
    peakActivityHours: [10, 11, 14, 15, 20, 21],
    // Fatigue pattern (multiplier per hour, 1.0 = normal)
    fatiguePattern: [
        0.3, 0.2, 0.1, 0.1, 0.2, 0.3, // 00:00 - 05:59 (sleeping)
        0.5, 0.7, 0.9, 1.0, 1.1, 1.0, // 06:00 - 11:59 (morning peak)
        0.8, 0.9, 1.1, 1.0, 0.9, 0.8, // 12:00 - 17:59 (afternoon)
        0.9, 1.0, 1.2, 1.1, 0.9, 0.7, // 18:00 - 23:59 (evening peak)
    ],
    // Order patterns - prefers clean numbers
    preferRoundNumbers: true,
    roundNumberProbability: 0.65, // 65% chance to round
    preferredOrderSizes: [100, 250, 500, 1000, 2500, 5000],
    orderSizeVariance: 0.15, // ±15% from preferred sizes
    // Session patterns
    avgSessionDurationMinutes: 45,
    breakProbability: 0.15, // 15% chance to take break
    minBreakMinutes: 5,
    maxBreakMinutes: 20,
};
// ═══════════════════════════════════════════════════════════════════════════
// BIOMETRIC JITTER ENGINE
// ═══════════════════════════════════════════════════════════════════════════
class BiometricJitter extends events_1.EventEmitter {
    profile;
    sessionStart = Date.now();
    actionsThisSession = 0;
    lastActionTime = Date.now();
    isOnBreak = false;
    breakEndTime = 0;
    // Entropy pool for randomization
    entropyPool = [];
    entropyIndex = 0;
    // Statistics
    totalActions = 0;
    avgJitter = 0;
    constructor(profile = DIMITAR_PROFILE) {
        super();
        this.profile = profile;
        this.refillEntropyPool();
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  🧬 DIMITAR DNA GUARD - Biometric Jitter Engine                           ║
║                                                                           ║
║  Profile: ${this.profile.name.padEnd(40)}              ║
║  ID: ${this.profile.id.padEnd(45)}              ║
║                                                                           ║
║  "Всеки тик е уникален. Всяка сделка - човешка."                          ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // ENTROPY MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    refillEntropyPool() {
        // Generate cryptographically secure random values
        const buffer = crypto.randomBytes(1024);
        this.entropyPool = [];
        for (let i = 0; i < buffer.length; i += 4) {
            const value = buffer.readUInt32BE(i) / 0xFFFFFFFF;
            this.entropyPool.push(value);
        }
        this.entropyIndex = 0;
    }
    // Complexity: O(N) — potential recursive descent
    getSecureRandom() {
        if (this.entropyIndex >= this.entropyPool.length) {
            this.refillEntropyPool();
        }
        return this.entropyPool[this.entropyIndex++];
    }
    // Complexity: O(N) — potential recursive descent
    gaussianRandom() {
        // Box-Muller transform for normal distribution
        const u1 = this.getSecureRandom();
        const u2 = this.getSecureRandom();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // TIMING JITTER
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Apply human-like delay jitter to an action
     */
    // Complexity: O(N*M) — nested iteration detected
    jitterDelay(baseDelayMs) {
        const currentHour = new Date().getHours();
        const fatigue = this.profile.fatiguePattern[currentHour];
        // Check if we should be on break
        if (this.isOnBreak && Date.now() < this.breakEndTime) {
            // Still on break, return very long delay
            return {
                originalDelay: baseDelayMs,
                actualDelay: this.breakEndTime - Date.now(),
                jitterApplied: 0,
                fatigueMultiplier: fatigue,
                wasHesitation: false,
                timestamp: Date.now(),
            };
        }
        this.isOnBreak = false;
        // Base jitter using Gaussian distribution
        const jitter = this.gaussianRandom() * this.profile.reactionTimeVariance;
        // Apply fatigue multiplier
        const fatigueAdjusted = baseDelayMs * (2 - fatigue); // Lower fatigue = slower
        // Check for hesitation
        let hesitationDelay = 0;
        const wasHesitation = this.getSecureRandom() < this.profile.hesitationProbability;
        if (wasHesitation) {
            // Add 500-2000ms hesitation
            hesitationDelay = 500 + this.getSecureRandom() * 1500;
        }
        // Check for double-check behavior
        if (this.getSecureRandom() < this.profile.doubleCheckProbability) {
            hesitationDelay += 300 + this.getSecureRandom() * 700;
        }
        // Calculate final delay
        const actualDelay = Math.max(50, fatigueAdjusted + jitter + hesitationDelay);
        // Maybe trigger a break
        this.actionsThisSession++;
        if (this.actionsThisSession > 20 && this.getSecureRandom() < this.profile.breakProbability) {
            const breakDuration = (this.profile.minBreakMinutes +
                this.getSecureRandom() * (this.profile.maxBreakMinutes - this.profile.minBreakMinutes)) * 60000;
            this.isOnBreak = true;
            this.breakEndTime = Date.now() + breakDuration;
            this.actionsThisSession = 0;
            console.log(`[BiometricJitter] ☕ Taking a ${Math.round(breakDuration / 60000)} minute break`);
        }
        // Update stats
        this.totalActions++;
        this.avgJitter = ((this.avgJitter * (this.totalActions - 1)) + jitter) / this.totalActions;
        const action = {
            originalDelay: baseDelayMs,
            actualDelay,
            jitterApplied: jitter,
            fatigueMultiplier: fatigue,
            wasHesitation,
            timestamp: Date.now(),
        };
        this.emit('delay-jittered', action);
        return action;
    }
    /**
     * Wait with human-like timing
     */
    // Complexity: O(1)
    async humanDelay(baseMs) {
        const jittered = this.jitterDelay(baseMs);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(resolve => setTimeout(resolve, jittered.actualDelay));
    }
    // ═══════════════════════════════════════════════════════════════════════
    // ORDER HUMANIZATION
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Humanize order amount to look more natural
     */
    // Complexity: O(N) — linear iteration
    humanizeOrderAmount(amount) {
        let modified = amount;
        let roundingApplied = false;
        // Maybe round to preferred size
        if (this.profile.preferRoundNumbers &&
            this.getSecureRandom() < this.profile.roundNumberProbability) {
            // Find nearest preferred size
            const preferredSizes = this.profile.preferredOrderSizes;
            let nearestSize = preferredSizes[0];
            let nearestDiff = Math.abs(amount - nearestSize);
            for (const size of preferredSizes) {
                const diff = Math.abs(amount - size);
                if (diff < nearestDiff) {
                    nearestDiff = diff;
                    nearestSize = size;
                }
            }
            // Apply variance to the rounded number
            const variance = 1 + (this.gaussianRandom() * this.profile.orderSizeVariance);
            modified = nearestSize * variance;
            roundingApplied = true;
        }
        else {
            // Just add small variance
            const variance = 1 + (this.gaussianRandom() * 0.02); // ±2%
            modified = amount * variance;
        }
        // Final human touches
        // Humans often use numbers ending in 0 or 5
        if (modified > 10 && this.getSecureRandom() < 0.4) {
            const lastDigit = modified % 10;
            if (lastDigit !== 0 && lastDigit !== 5) {
                modified = Math.round(modified / 5) * 5;
            }
        }
        return {
            originalAmount: amount,
            modifiedAmount: modified,
            originalPrice: 0,
            modifiedPrice: 0,
            roundingApplied,
            humanizedAt: Date.now(),
        };
    }
    /**
     * Humanize order price (slight adjustments)
     */
    // Complexity: O(1)
    humanizeOrderPrice(price, isBuy) {
        // Humans often place orders slightly better than market
        // Buy: slightly lower, Sell: slightly higher
        const adjustment = (this.getSecureRandom() * 0.001) + 0.0002; // 0.02% - 0.12%
        if (isBuy) {
            return price * (1 - adjustment);
        }
        else {
            return price * (1 + adjustment);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════
    // CANCELLATION BEHAVIOR
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Check if action should be cancelled (human indecision)
     */
    // Complexity: O(N) — potential recursive descent
    shouldCancel() {
        return this.getSecureRandom() < this.profile.cancelProbability;
    }
    /**
     * Simulate re-evaluation of a trade
     */
    // Complexity: O(1) — amortized
    async simulateReEvaluation() {
        const thinkingTime = 500 + this.getSecureRandom() * 2000;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(resolve => setTimeout(resolve, thinkingTime));
        const reconsider = this.getSecureRandom() < 0.2; // 20% chance to reconsider
        let newDecision = 'proceed';
        if (reconsider) {
            const roll = this.getSecureRandom();
            if (roll < 0.6)
                newDecision = 'proceed';
            else if (roll < 0.9)
                newDecision = 'modify';
            else
                newDecision = 'cancel';
        }
        return { reconsider, newDecision, thinkingTime };
    }
    // ═══════════════════════════════════════════════════════════════════════
    // TIME-OF-DAY AWARENESS
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Check if current time is within active hours
     */
    // Complexity: O(1)
    isActiveTime() {
        const hour = new Date().getHours();
        return hour >= this.profile.activeHours.start &&
            hour <= this.profile.activeHours.end;
    }
    /**
     * Check if current time is peak activity
     */
    // Complexity: O(1)
    isPeakTime() {
        const hour = new Date().getHours();
        return this.profile.peakActivityHours.includes(hour);
    }
    /**
     * Get current fatigue level
     */
    // Complexity: O(1) — hash/map lookup
    getCurrentFatigue() {
        const hour = new Date().getHours();
        return this.profile.fatiguePattern[hour];
    }
    // ═══════════════════════════════════════════════════════════════════════
    // TYPING SIMULATION
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Simulate typing a string with human-like speed
     */
    // Complexity: O(N*M) — nested iteration detected
    async simulateTyping(text, callback) {
        const baseDelay = 60000 / (this.profile.typingSpeedWPM * 5); // ms per character
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            // Calculate delay for this character
            let delay = baseDelay;
            // Variance
            delay += this.gaussianRandom() * (baseDelay * this.profile.typingVariance / 100);
            // Space is faster
            if (char === ' ')
                delay *= 0.7;
            // Shift characters are slower
            if (/[A-Z!@#$%^&*()_+{}|:"<>?]/.test(char))
                delay *= 1.3;
            // Numbers are slightly slower
            if (/[0-9]/.test(char))
                delay *= 1.1;
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(resolve => setTimeout(resolve, Math.max(30, delay)));
            if (callback) {
                // Complexity: O(1)
                callback(char, i);
            }
        }
    }
    // ═══════════════════════════════════════════════════════════════════════
    // STATISTICS
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — amortized
    getStats() {
        return {
            profileName: this.profile.name,
            totalActions: this.totalActions,
            avgJitterMs: this.avgJitter,
            currentFatigue: this.getCurrentFatigue(),
            isActiveTime: this.isActiveTime(),
            isPeakTime: this.isPeakTime(),
            sessionDurationMinutes: (Date.now() - this.sessionStart) / 60000,
            actionsThisSession: this.actionsThisSession,
        };
    }
    // Complexity: O(1)
    getProfile() {
        return { ...this.profile };
    }
    // Complexity: O(1) — hash/map lookup
    updateProfile(updates) {
        this.profile = { ...this.profile, ...updates };
        console.log('[BiometricJitter] Profile updated');
    }
}
exports.BiometricJitter = BiometricJitter;
// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════
exports.biometricJitter = new BiometricJitter(DIMITAR_PROFILE);
exports.default = BiometricJitter;
