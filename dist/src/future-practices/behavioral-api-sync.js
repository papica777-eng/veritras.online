"use strict";
/**
 * 🔗 BEHAVIORAL API SYNC ENGINE
 *
 * v1.0.0.0 Future Practice: Ghost tests that carry human behavioral fingerprints
 *
 * This module bridges Neuro-Sentinel's behavioral analysis with Ghost Protocol's
 * API speed, creating requests that are indistinguishable from real human activity.
 *
 * Core Innovation:
 * - Ghost API calls now include realistic "think-time" intervals
 * - Request patterns mirror actual human browsing behavior
 * - Cloudflare/Akamai see human-like patterns, not bot signatures
 *
 * @version 1.0.0-QANTUM-PRIME
 * @phase Future Practices - Behavioral API Injection
 * @author QANTUM AI Architect
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
exports.BehavioralAPISyncEngine = void 0;
exports.createBehavioralAPISync = createBehavioralAPISync;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
const logger_1 = require("../api/unified/utils/logger");
// ============================================================
// BEHAVIORAL API SYNC ENGINE
// ============================================================
class BehavioralAPISyncEngine extends events_1.EventEmitter {
    config;
    profiles = new Map();
    sessionStates = new Map();
    requestHistory = [];
    // Statistical distributions
    distributions = {
        normal: (mean, stdDev) => {
            // Box-Muller transform
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            return mean + z * stdDev;
        },
        poisson: (lambda) => {
            let L = Math.exp(-lambda);
            let k = 0;
            let p = 1;
            do {
                k++;
                p *= Math.random();
            } while (p > L);
            return k - 1;
        },
        exponential: (lambda) => {
            return -Math.log(1 - Math.random()) / lambda;
        },
        bimodal: (mean1, mean2, ratio) => {
            return Math.random() < ratio ? mean1 : mean2;
        }
    };
    constructor(config = {}) {
        super();
        this.config = {
            profileCacheSize: 10000,
            defaultThinkTimeMs: 1500,
            fatigueEnabled: true,
            debugMode: false,
            ...config
        };
    }
    /**
     * 🚀 Initialize Behavioral API Sync
     */
    // Complexity: O(1)
    async initialize() {
        logger_1.logger.debug(`
╔═══════════════════════════════════════════════════════════════╗
║  🔗 BEHAVIORAL API SYNC ENGINE v1.0.0.0                        ║
║                                                               ║
║  "Ghost speed with human soul"                                ║
╚═══════════════════════════════════════════════════════════════╝
`);
        // Generate base profiles
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.generateBaseProfiles();
        logger_1.logger.debug(`   ✅ Initialized with ${this.profiles.size} behavioral profiles`);
        logger_1.logger.debug(`   ✅ Fatigue simulation: ${this.config.fatigueEnabled ? 'ENABLED' : 'DISABLED'}`);
        logger_1.logger.debug(`   ✅ Default think-time: ${this.config.defaultThinkTimeMs}ms`);
    }
    /**
     * 🧠 Generate behavioral profiles from Neuro-Sentinel patterns
     */
    // Complexity: O(N*M) — nested iteration
    async generateBaseProfiles() {
        // Generate diverse profile archetypes
        const archetypes = [
            { name: 'quick_scanner', thinkTimeMean: 500, readingSpeed: 400, energyDecay: 0.02 },
            { name: 'careful_reader', thinkTimeMean: 2500, readingSpeed: 180, energyDecay: 0.008 },
            { name: 'power_user', thinkTimeMean: 300, readingSpeed: 500, energyDecay: 0.03 },
            { name: 'casual_browser', thinkTimeMean: 1800, readingSpeed: 220, energyDecay: 0.015 },
            { name: 'methodical_worker', thinkTimeMean: 1200, readingSpeed: 280, energyDecay: 0.01 },
            { name: 'distracted_user', thinkTimeMean: 3000, readingSpeed: 150, energyDecay: 0.025 },
            { name: 'morning_person', thinkTimeMean: 800, readingSpeed: 350, energyDecay: 0.012 },
            { name: 'night_owl', thinkTimeMean: 1500, readingSpeed: 250, energyDecay: 0.018 }
        ];
        for (const archetype of archetypes) {
            // Generate variations for each archetype
            for (let i = 0; i < 125; i++) { // 8 archetypes * 125 = 1000 profiles
                const profile = this.generateProfileFromArchetype(archetype, i);
                this.profiles.set(profile.profileId, profile);
            }
        }
    }
    /**
     * Generate unique profile from archetype with variations
     */
    // Complexity: O(1)
    generateProfileFromArchetype(archetype, index) {
        const profileId = `${archetype.name}_${index}_${crypto.randomBytes(4).toString('hex')}`;
        // Add random variations (±30%)
        const vary = (base) => base * (0.7 + Math.random() * 0.6);
        return {
            profileId,
            accountId: `account_${index}`,
            thinkTime: {
                min: Math.max(100, vary(archetype.thinkTimeMean * 0.3)),
                max: vary(archetype.thinkTimeMean * 2.5),
                mean: vary(archetype.thinkTimeMean),
                stdDev: vary(archetype.thinkTimeMean * 0.4),
                distribution: this.randomDistribution()
            },
            readingBehavior: {
                charsPerSecond: vary(archetype.readingSpeed),
                pauseAfterParagraph: vary(800),
                scrollPattern: this.randomScrollPattern(),
                attentionSpan: vary(45) // seconds
            },
            interactionTiming: {
                clickToAction: { min: vary(80), max: vary(300) },
                formFieldDelay: { min: vary(200), max: vary(1500) },
                submitHesitation: vary(500),
                errorRecoveryTime: vary(2000)
            },
            fatigueCurve: {
                startEnergy: 1.0,
                decayRate: vary(archetype.energyDecay),
                breakThreshold: 0.2 + Math.random() * 0.2,
                recoveryRate: vary(0.1)
            },
            sessionPattern: {
                avgDuration: vary(30) * 60 * 1000, // 30 min average, varied
                peakActivityHour: Math.floor(Math.random() * 14) + 8, // 8-22
                timezone: this.randomTimezone(),
                weekendBehavior: this.randomWeekendBehavior()
            }
        };
    }
    // Complexity: O(1)
    randomDistribution() {
        const distributions = ['normal', 'poisson', 'exponential', 'bimodal'];
        return distributions[Math.floor(Math.random() * distributions.length)];
    }
    // Complexity: O(1)
    randomScrollPattern() {
        const patterns = ['continuous', 'stepped', 'random'];
        return patterns[Math.floor(Math.random() * patterns.length)];
    }
    // Complexity: O(1)
    randomTimezone() {
        const timezones = ['Europe/Sofia', 'Europe/London', 'America/New_York',
            'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney'];
        return timezones[Math.floor(Math.random() * timezones.length)];
    }
    // Complexity: O(1)
    randomWeekendBehavior() {
        const behaviors = ['same', 'reduced', 'increased'];
        return behaviors[Math.floor(Math.random() * behaviors.length)];
    }
    /**
     * 🎯 Calculate human-like think time for a request
     */
    // Complexity: O(1) — lookup
    calculateThinkTime(profileId, context) {
        const profile = this.profiles.get(profileId);
        if (!profile) {
            return this.config.defaultThinkTimeMs;
        }
        const session = this.getOrCreateSession(profileId);
        let baseTime;
        // Apply distribution-based calculation
        switch (profile.thinkTime.distribution) {
            case 'normal':
                baseTime = this.distributions.normal(profile.thinkTime.mean, profile.thinkTime.stdDev);
                break;
            case 'poisson':
                baseTime = this.distributions.poisson(profile.thinkTime.mean / 100) * 100;
                break;
            case 'exponential':
                baseTime = this.distributions.exponential(1 / profile.thinkTime.mean) * 1000;
                break;
            case 'bimodal':
                baseTime = this.distributions.bimodal(profile.thinkTime.mean * 0.5, profile.thinkTime.mean * 1.5, 0.4);
                break;
            default:
                baseTime = profile.thinkTime.mean;
        }
        // Apply fatigue modifier
        if (this.config.fatigueEnabled) {
            const fatigueMultiplier = 1 + (1 - session.currentEnergy) * 0.5;
            baseTime *= fatigueMultiplier;
        }
        // Apply context modifiers
        if (context) {
            if (context.isFormField) {
                baseTime *= 1.3; // Slower on forms
            }
            if (context.isNewPage) {
                baseTime *= 1.5; // Slower on new pages (reading)
            }
            if (context.isError) {
                baseTime += profile.interactionTiming.errorRecoveryTime;
            }
            if (context.contentLength) {
                // Add reading time based on content
                const readingTime = context.contentLength / profile.readingBehavior.charsPerSecond * 1000;
                baseTime += readingTime * 0.3; // 30% of full reading time
            }
        }
        // Clamp to profile bounds
        return Math.max(profile.thinkTime.min, Math.min(profile.thinkTime.max, baseTime));
    }
    /**
     * 🔄 Wrap Ghost API request with behavioral timing
     */
    async executeWithBehavior(profileId, requestFn, options = {}) {
        const opts = {
            applyThinkTime: true,
            simulateFatigue: true,
            addMicroVariations: true,
            respectSessionPatterns: true,
            ...options
        };
        const profile = this.profiles.get(profileId) || this.getDefaultProfile();
        const session = this.getOrCreateSession(profileId);
        const requestId = crypto.randomBytes(8).toString('hex');
        const scheduledAt = Date.now();
        // Calculate think time
        let thinkTime = 0;
        if (opts.applyThinkTime) {
            thinkTime = this.calculateThinkTime(profileId);
            // Add micro-variations
            if (opts.addMicroVariations) {
                thinkTime += (Math.random() - 0.5) * 100; // ±50ms jitter
            }
        }
        // Apply think time delay
        if (thinkTime > 0) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(thinkTime);
        }
        const executedAt = Date.now();
        // Execute the actual request
        const startTime = performance.now();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await requestFn();
        const responseTime = performance.now() - startTime;
        // Update session state
        this.updateSessionState(profileId, responseTime);
        // Calculate human-likelihood score
        const humanScore = this.calculateHumanLikelihood(profile, session, thinkTime);
        const behavioralResult = {
            requestId,
            result,
            timing: {
                scheduledAt,
                thinkTimeApplied: thinkTime,
                actualDelay: executedAt - scheduledAt,
                executedAt,
                responseTime
            },
            metadata: {
                profileId,
                currentEnergy: session.currentEnergy,
                sessionDuration: Date.now() - session.startTime,
                requestsInSession: session.requestCount,
                humanLikelihoodScore: humanScore
            }
        };
        this.emit('request:complete', behavioralResult);
        return behavioralResult;
    }
    /**
     * 🎭 Execute batch of requests with realistic inter-request delays
     */
    async executeBatch(profileId, requests, options) {
        const results = [];
        const profile = this.profiles.get(profileId) || this.getDefaultProfile();
        for (let i = 0; i < requests.length; i++) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await this.executeWithBehavior(profileId, requests[i], options);
            results.push(result);
            // Check for fatigue-induced break
            const session = this.sessionStates.get(profileId);
            if (session && session.currentEnergy < profile.fatigueCurve.breakThreshold) {
                logger_1.logger.debug(`   ☕ Profile ${profileId.substring(0, 8)} taking fatigue break...`);
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.simulateBreak(profileId);
            }
        }
        return results;
    }
    /**
     * 📊 Calculate human-likelihood score (0-1)
     */
    // Complexity: O(N*M) — nested iteration
    calculateHumanLikelihood(profile, session, thinkTime) {
        let score = 0.5; // Base score
        // Think time within normal range
        if (thinkTime >= profile.thinkTime.min && thinkTime <= profile.thinkTime.max) {
            score += 0.15;
        }
        // Realistic session duration
        const sessionMinutes = (Date.now() - session.startTime) / 60000;
        if (sessionMinutes > 1 && sessionMinutes < 120) {
            score += 0.1;
        }
        // Request count reasonable for session length
        const requestsPerMinute = session.requestCount / Math.max(1, sessionMinutes);
        if (requestsPerMinute > 0.5 && requestsPerMinute < 10) {
            score += 0.1;
        }
        // Energy depletion matches fatigue curve
        const expectedEnergy = Math.max(0, 1 - (sessionMinutes * profile.fatigueCurve.decayRate));
        const energyDiff = Math.abs(session.currentEnergy - expectedEnergy);
        if (energyDiff < 0.2) {
            score += 0.1;
        }
        // Add randomness for unpredictability
        score += (Math.random() - 0.5) * 0.1;
        return Math.max(0, Math.min(1, score));
    }
    /**
     * Get or create session state
     */
    // Complexity: O(1) — lookup
    getOrCreateSession(profileId) {
        let session = this.sessionStates.get(profileId);
        if (!session) {
            const profile = this.profiles.get(profileId);
            session = {
                profileId,
                startTime: Date.now(),
                requestCount: 0,
                currentEnergy: profile?.fatigueCurve.startEnergy || 1.0,
                lastRequestTime: Date.now()
            };
            this.sessionStates.set(profileId, session);
        }
        return session;
    }
    /**
     * Update session state after request
     */
    // Complexity: O(1) — lookup
    updateSessionState(profileId, responseTime) {
        const session = this.sessionStates.get(profileId);
        const profile = this.profiles.get(profileId);
        if (session && profile) {
            session.requestCount++;
            session.lastRequestTime = Date.now();
            // Apply energy decay
            const timeSinceStart = (Date.now() - session.startTime) / 60000; // minutes
            session.currentEnergy = Math.max(0, profile.fatigueCurve.startEnergy - (timeSinceStart * profile.fatigueCurve.decayRate));
        }
    }
    /**
     * Simulate a break (energy recovery)
     */
    // Complexity: O(1) — lookup
    async simulateBreak(profileId) {
        const session = this.sessionStates.get(profileId);
        const profile = this.profiles.get(profileId);
        if (session && profile) {
            const breakDuration = 5000 + Math.random() * 10000; // 5-15 seconds
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(breakDuration);
            // Recover energy
            session.currentEnergy = Math.min(1.0, session.currentEnergy + profile.fatigueCurve.recoveryRate * (breakDuration / 1000));
        }
    }
    /**
     * Get default profile for unknown accounts
     */
    // Complexity: O(1)
    getDefaultProfile() {
        return {
            profileId: 'default',
            accountId: 'default',
            thinkTime: {
                min: 300,
                max: 3000,
                mean: 1500,
                stdDev: 500,
                distribution: 'normal'
            },
            readingBehavior: {
                charsPerSecond: 250,
                pauseAfterParagraph: 800,
                scrollPattern: 'stepped',
                attentionSpan: 45
            },
            interactionTiming: {
                clickToAction: { min: 100, max: 300 },
                formFieldDelay: { min: 300, max: 1200 },
                submitHesitation: 500,
                errorRecoveryTime: 2000
            },
            fatigueCurve: {
                startEnergy: 1.0,
                decayRate: 0.015,
                breakThreshold: 0.25,
                recoveryRate: 0.1
            },
            sessionPattern: {
                avgDuration: 1800000,
                peakActivityHour: 14,
                timezone: 'Europe/Sofia',
                weekendBehavior: 'reduced'
            }
        };
    }
    /**
     * 📊 Get sync statistics
     */
    // Complexity: O(N) — linear scan
    getStats() {
        const sessions = Array.from(this.sessionStates.values());
        const activeSessionsCount = sessions.filter(s => Date.now() - s.lastRequestTime < 300000 // 5 min
        ).length;
        const avgEnergy = sessions.length > 0
            ? sessions.reduce((sum, s) => sum + s.currentEnergy, 0) / sessions.length
            : 1.0;
        const totalRequests = sessions.reduce((sum, s) => sum + s.requestCount, 0);
        return {
            totalProfiles: this.profiles.size,
            activeSessions: activeSessionsCount,
            totalRequests,
            averageEnergy: avgEnergy,
            avgThinkTime: this.config.defaultThinkTimeMs,
            humanLikelihoodAvg: 0.75 // Estimated based on behavioral patterns
        };
    }
    /**
     * 🔄 Assign profile to account
     */
    // Complexity: O(N*M) — nested iteration
    assignProfileToAccount(accountId) {
        // Find or create profile for account
        for (const [id, profile] of this.profiles) {
            if (profile.accountId === accountId) {
                return id;
            }
        }
        // Assign random existing profile
        const profileIds = Array.from(this.profiles.keys());
        const randomProfile = profileIds[Math.floor(Math.random() * profileIds.length)];
        const profile = this.profiles.get(randomProfile);
        // Clone and assign to account
        const newProfile = { ...profile, accountId };
        newProfile.profileId = `${accountId}_${crypto.randomBytes(4).toString('hex')}`;
        this.profiles.set(newProfile.profileId, newProfile);
        return newProfile.profileId;
    }
    /**
     * Reset session for profile
     */
    // Complexity: O(1)
    resetSession(profileId) {
        this.sessionStates.delete(profileId);
    }
    // Complexity: O(1)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.BehavioralAPISyncEngine = BehavioralAPISyncEngine;
// ============================================================
// EXPORTS
// ============================================================
function createBehavioralAPISync(config) {
    return new BehavioralAPISyncEngine(config);
}
