"use strict";
/**
 * 🔐 NEURAL FINGERPRINT ACTIVATOR
 *
 * v1.0.0.0 Future Practice: Activate unique behavioral profiles for ALL accounts
 *
 * This module bridges the NeuralFingerprintingEngine with account databases,
 * ensuring every single account has its own unique behavioral DNA:
 * - Typing speed jitter (unique per-account variation)
 * - Mouse path randomness (bezier curve signatures)
 * - Scroll patterns (unique acceleration/deceleration)
 * - Click timing signatures
 * - Hesitation patterns
 *
 * "Every account is a unique human - no two behave the same"
 *
 * @version 1.0.0-QANTUM-PRIME
 * @phase Future Practices - Neural Activation Layer
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
exports.NeuralFingerprintActivator = void 0;
exports.createNeuralFingerprintActivator = createNeuralFingerprintActivator;
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
const logger = console;
// ============================================================
// NEURAL FINGERPRINT ACTIVATOR ENGINE
// ============================================================
class NeuralFingerprintActivator extends events_1.EventEmitter {
    config;
    activatedProfiles = new Map();
    profilesLoaded = false;
    // Genetic variation pools for realistic distribution
    static TYPING_WPM_DISTRIBUTION = {
        min: 15,
        max: 120,
        mean: 55,
        stdDev: 20
    };
    static COMMON_TYPOS = [
        ['teh', 'the'], ['adn', 'and'], ['taht', 'that'], ['wiht', 'with'],
        ['hte', 'the'], ['form', 'from'], ['yoru', 'your'], ['thier', 'their'],
        ['recieve', 'receive'], ['occured', 'occurred'], ['seperate', 'separate']
    ];
    static HESITATION_TRIGGERS = [
        'submit-button', 'payment-form', 'delete-action', 'external-link',
        'checkbox-agreement', 'dropdown-complex', 'date-picker', 'file-upload'
    ];
    constructor(config = {}) {
        super();
        this.config = {
            databasePath: './accounts-database.json',
            autoActivateNewAccounts: true,
            persistProfiles: true,
            profileStoragePath: './neural-profiles',
            regenerateExisting: false,
            batchSize: 100,
            ...config
        };
    }
    /**
     * 🚀 Initialize Neural Fingerprint Activator
     */
    async initialize() {
        logger.debug(`
╔═══════════════════════════════════════════════════════════════╗
║  🔐 NEURAL FINGERPRINT ACTIVATOR v1.0.0.0                      ║
║                                                               ║
║  "Every account gets its unique behavioral DNA"               ║
╚═══════════════════════════════════════════════════════════════╝
`);
        // Load existing profiles if persistence enabled
        if (this.config.persistProfiles) {
            await this.loadPersistedProfiles();
        }
        logger.debug(`   📁 Storage: ${this.config.profileStoragePath}`);
        logger.debug(`   📊 Loaded profiles: ${this.activatedProfiles.size}`);
        logger.debug(`   🔄 Auto-activate: ${this.config.autoActivateNewAccounts}`);
    }
    /**
     * Load persisted profiles from disk
     */
    async loadPersistedProfiles() {
        const storagePath = this.config.profileStoragePath;
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath, { recursive: true });
            return;
        }
        const files = fs.readdirSync(storagePath).filter(f => f.endsWith('.json'));
        for (const file of files) {
            try {
                const content = fs.readFileSync(path.join(storagePath, file), 'utf-8');
                const profile = JSON.parse(content);
                // Restore Maps from JSON
                profile.typing.charTimingOffsets = new Map(Object.entries(profile.typing.charTimingOffsets || {}));
                profile.typing.bigramTimings = new Map(Object.entries(profile.typing.bigramTimings || {}));
                this.activatedProfiles.set(profile.accountId, profile);
            }
            catch (e) {
                logger.warn(`   ⚠️ Failed to load profile: ${file}`);
            }
        }
        this.profilesLoaded = true;
    }
    /**
     * 🎯 Activate ALL accounts from database
     */
    async activateAllAccounts(accounts) {
        const startTime = Date.now();
        logger.debug(`\n🔐 Activating behavioral DNA for ${accounts.length} accounts...`);
        const report = {
            totalAccounts: accounts.length,
            newlyActivated: 0,
            alreadyActivated: 0,
            failed: 0,
            duration: 0,
            timestamp: startTime
        };
        // Process in batches
        for (let i = 0; i < accounts.length; i += this.config.batchSize) {
            const batch = accounts.slice(i, i + this.config.batchSize);
            await Promise.all(batch.map(async (account) => {
                try {
                    const existing = this.activatedProfiles.get(account.id);
                    if (existing && !this.config.regenerateExisting) {
                        report.alreadyActivated++;
                        return;
                    }
                    const dna = await this.generateBehavioralDNA(account.id);
                    this.activatedProfiles.set(account.id, dna);
                    // Persist if enabled
                    if (this.config.persistProfiles) {
                        await this.persistProfile(dna);
                    }
                    report.newlyActivated++;
                }
                catch (e) {
                    report.failed++;
                }
            }));
            // Progress update
            const progress = Math.min(i + this.config.batchSize, accounts.length);
            const percent = Math.round((progress / accounts.length) * 100);
            process.stdout.write(`\r   Progress: ${percent}% (${progress}/${accounts.length})`);
        }
        report.duration = Date.now() - startTime;
        logger.debug(`\n
   ✅ Activation Complete!
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📊 Total:     ${report.totalAccounts}
   🆕 Activated: ${report.newlyActivated}
   ✓ Existing:  ${report.alreadyActivated}
   ❌ Failed:    ${report.failed}
   ⏱️ Duration:  ${report.duration}ms
`);
        this.emit('activation:complete', report);
        return report;
    }
    /**
     * 🧬 Generate unique behavioral DNA for account
     */
    async generateBehavioralDNA(accountId) {
        // Use accountId as seed for reproducible but unique randomness
        const seedHash = crypto.createHash('sha256').update(accountId).digest('hex');
        const seededRandom = this.createSeededRandom(seedHash);
        const dna = {
            accountId,
            dnaHash: crypto.createHash('sha256')
                .update(accountId + Date.now())
                .digest('hex'),
            createdAt: Date.now(),
            lastActivated: Date.now(),
            typing: this.generateTypingDNA(seededRandom),
            mouse: this.generateMouseDNA(seededRandom),
            interaction: this.generateInteractionDNA(seededRandom),
            session: this.generateSessionDNA(seededRandom),
            activated: true,
            usageCount: 0
        };
        this.emit('dna:generated', { accountId, dnaHash: dna.dnaHash });
        return dna;
    }
    /**
     * ⌨️ Generate unique typing DNA
     */
    generateTypingDNA(random) {
        const baseWPM = this.gaussianRandom(random, NeuralFingerprintActivator.TYPING_WPM_DISTRIBUTION.mean, NeuralFingerprintActivator.TYPING_WPM_DISTRIBUTION.stdDev);
        // Generate unique character timing offsets
        const charTimingOffsets = new Map();
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        for (const char of chars) {
            // Each character has unique timing offset (-30ms to +30ms)
            charTimingOffsets.set(char, (random() - 0.5) * 60);
        }
        // Generate bigram timings
        const bigramTimings = new Map();
        const commonBigrams = ['th', 'he', 'in', 'er', 'an', 'on', 'en', 'at', 'es', 'ed',
            'or', 'ti', 'is', 'it', 'al', 'as', 'ha', 'ng', 'nd', 're'];
        for (const bigram of commonBigrams) {
            // Each bigram pair has unique timing
            bigramTimings.set(bigram, 80 + (random() * 80));
        }
        // Select common mistakes for this account
        const mistakeCount = Math.floor(random() * 5) + 2;
        const commonMistakes = this.shuffleArray([...NeuralFingerprintActivator.COMMON_TYPOS], random).slice(0, mistakeCount).map(([typo]) => typo);
        return {
            baseWPM: Math.max(15, Math.min(120, baseWPM)),
            wpmJitter: random() * 15 + 3,
            keyHoldMean: 80 + random() * 60,
            keyHoldStdDev: 15 + random() * 25,
            keyIntervalMean: 100 + random() * 80,
            keyIntervalStdDev: 20 + random() * 40,
            charTimingOffsets,
            bigramTimings,
            errorProbability: 0.01 + random() * 0.08,
            commonMistakes,
            correctionStyle: this.pickRandomWeighted(random, [
                ['backspace-each', 0.4],
                ['backspace-all', 0.3],
                ['select-replace', 0.15],
                ['mixed', 0.15]
            ]),
            correctionDelay: 200 + random() * 800,
            burstLength: Math.floor(5 + random() * 20),
            burstPauseDuration: 50 + random() * 200,
            fatigueOnset: Math.floor(200 + random() * 500),
            fatigueMultiplier: 1.1 + random() * 0.4
        };
    }
    /**
     * 🖱️ Generate unique mouse DNA
     */
    generateMouseDNA(random) {
        return {
            baseSpeed: 400 + random() * 1200,
            speedJitter: 50 + random() * 150,
            accelerationCurve: this.pickRandomWeighted(random, [
                ['ease-in-out', 0.4],
                ['ease-out', 0.25],
                ['ease-in', 0.15],
                ['linear', 0.1],
                ['custom', 0.1]
            ]),
            accelerationFactor: 1.2 + random() * 1.5,
            decelerationFactor: 0.7 + random() * 0.5,
            bezierControlPointJitter: 10 + random() * 40,
            pathOvershootProbability: random() * 0.15,
            overshootMagnitude: 5 + random() * 25,
            microMovementAmplitude: 0.5 + random() * 2,
            microMovementFrequency: 0.02 + random() * 0.08,
            clickDurationMean: 70 + random() * 80,
            clickDurationStdDev: 15 + random() * 30,
            doubleClickInterval: 200 + random() * 250,
            clickPositionJitter: random() * 5,
            scrollStyle: this.pickRandomWeighted(random, [
                ['smooth', 0.4],
                ['stepped', 0.35],
                ['inertial', 0.25]
            ]),
            scrollSpeedBase: 100 + random() * 200,
            scrollAcceleration: 1 + random() * 0.5,
            scrollOverscrollProbability: random() * 0.2,
            hoverDwellTime: 200 + random() * 600,
            hoverMicroMovements: random() > 0.5
        };
    }
    /**
     * 🎯 Generate unique interaction DNA
     */
    generateInteractionDNA(random) {
        // Select hesitation triggers for this account
        const triggerCount = Math.floor(random() * 4) + 2;
        const hesitationTriggers = this.shuffleArray([...NeuralFingerprintActivator.HESITATION_TRIGGERS], random).slice(0, triggerCount);
        // Select frustration behaviors
        const frustrationBehaviors = [];
        if (random() > 0.3)
            frustrationBehaviors.push('rapid-click');
        if (random() > 0.4)
            frustrationBehaviors.push('erratic-mouse');
        if (random() > 0.5)
            frustrationBehaviors.push('scroll-spam');
        return {
            hesitationProbability: 0.05 + random() * 0.25,
            hesitationDuration: {
                min: 200 + random() * 300,
                max: 800 + random() * 1200
            },
            hesitationTriggers,
            readingSpeed: 150 + random() * 350,
            scanPattern: this.pickRandomWeighted(random, [
                ['f-pattern', 0.4],
                ['z-pattern', 0.25],
                ['sequential', 0.25],
                ['random', 0.1]
            ]),
            regressionProbability: random() * 0.15,
            focusShiftFrequency: 0.5 + random() * 2,
            tabSwitchingRate: random() * 0.1,
            multitaskingScore: random(),
            reactionTimeBase: 150 + random() * 300,
            reactionTimeVariance: 30 + random() * 70,
            frustrationThreshold: 3 + Math.floor(random() * 7),
            frustrationBehaviors
        };
    }
    /**
     * 📅 Generate unique session DNA
     */
    generateSessionDNA(random) {
        // Generate active hours (when this account is typically online)
        const activeHours = [];
        const startHour = Math.floor(random() * 12) + 6; // 6 AM - 6 PM start
        const activeSpan = Math.floor(random() * 8) + 4; // 4-12 hour span
        for (let h = 0; h < activeSpan; h++) {
            activeHours.push((startHour + h) % 24);
        }
        return {
            activeHours,
            sessionDurationMean: (20 + random() * 100) * 60 * 1000, // 20-120 minutes
            sessionDurationStdDev: (5 + random() * 30) * 60 * 1000,
            microBreakFrequency: 2 + random() * 6,
            microBreakDuration: 5000 + random() * 30000,
            longBreakThreshold: (30 + random() * 60) * 60 * 1000,
            energyCurve: this.pickRandomWeighted(random, [
                ['declining', 0.35],
                ['u-shaped', 0.25],
                ['constant', 0.25],
                ['variable', 0.15]
            ]),
            peakEnergyTime: random() * 30 * 60 * 1000 // First 30 minutes
        };
    }
    /**
     * 🔍 Get behavioral DNA for account
     */
    getAccountDNA(accountId) {
        return this.activatedProfiles.get(accountId);
    }
    /**
     * 🎲 Simulate typing sequence with account's DNA
     */
    simulateTypingSequence(accountId, text) {
        const dna = this.activatedProfiles.get(accountId);
        if (!dna) {
            throw new Error(`Account ${accountId} not activated`);
        }
        const sequence = [];
        let currentTime = 0;
        let charsSinceLastPause = 0;
        let totalCharsTyped = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i].toLowerCase();
            const prevChar = i > 0 ? text[i - 1].toLowerCase() : '';
            const bigram = prevChar + char;
            // Base interval with account-specific jitter
            let interval = dna.typing.keyIntervalMean +
                (Math.random() - 0.5) * dna.typing.keyIntervalStdDev * 2;
            // Apply character-specific timing offset
            const charOffset = dna.typing.charTimingOffsets.get(char) || 0;
            interval += charOffset;
            // Apply bigram timing if exists
            const bigramTiming = dna.typing.bigramTimings.get(bigram);
            if (bigramTiming) {
                interval = bigramTiming + (Math.random() - 0.5) * 30;
            }
            // Apply fatigue multiplier
            if (totalCharsTyped > dna.typing.fatigueOnset) {
                interval *= dna.typing.fatigueMultiplier;
            }
            // Burst pause
            charsSinceLastPause++;
            if (charsSinceLastPause >= dna.typing.burstLength) {
                interval += dna.typing.burstPauseDuration;
                charsSinceLastPause = 0;
            }
            currentTime += Math.max(30, interval);
            totalCharsTyped++;
            // Key hold duration with account-specific variance
            const keyHoldDuration = dna.typing.keyHoldMean +
                (Math.random() - 0.5) * dna.typing.keyHoldStdDev * 2;
            sequence.push({
                char: text[i],
                timestamp: currentTime,
                keyHoldDuration: Math.max(30, keyHoldDuration)
            });
        }
        return sequence;
    }
    /**
     * 🖱️ Simulate mouse path with account's DNA
     */
    simulateMousePath(accountId, from, to) {
        const dna = this.activatedProfiles.get(accountId);
        if (!dna) {
            throw new Error(`Account ${accountId} not activated`);
        }
        const path = [];
        const distance = Math.hypot(to.x - from.x, to.y - from.y);
        // Calculate duration based on account's speed
        const baseDuration = distance / dna.mouse.baseSpeed * 1000;
        const duration = baseDuration + (Math.random() - 0.5) * dna.mouse.speedJitter;
        // Generate bezier control points with account-specific jitter
        const jitter = dna.mouse.bezierControlPointJitter;
        const cp1 = {
            x: from.x + (to.x - from.x) * 0.25 + (Math.random() - 0.5) * jitter,
            y: from.y + (to.y - from.y) * 0.25 + (Math.random() - 0.5) * jitter
        };
        const cp2 = {
            x: from.x + (to.x - from.x) * 0.75 + (Math.random() - 0.5) * jitter,
            y: from.y + (to.y - from.y) * 0.75 + (Math.random() - 0.5) * jitter
        };
        // Generate points along bezier curve
        const steps = Math.max(10, Math.floor(duration / 16)); // ~60fps
        for (let i = 0; i <= steps; i++) {
            let t = i / steps;
            // Apply acceleration curve
            switch (dna.mouse.accelerationCurve) {
                case 'ease-in':
                    t = t * t;
                    break;
                case 'ease-out':
                    t = 1 - (1 - t) * (1 - t);
                    break;
                case 'ease-in-out':
                    t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                    break;
            }
            // Cubic bezier calculation
            const mt = 1 - t;
            let x = mt * mt * mt * from.x +
                3 * mt * mt * t * cp1.x +
                3 * mt * t * t * cp2.x +
                t * t * t * to.x;
            let y = mt * mt * mt * from.y +
                3 * mt * mt * t * cp1.y +
                3 * mt * t * t * cp2.y +
                t * t * t * to.y;
            // Add micro-movements (unique tremor)
            if (dna.mouse.hoverMicroMovements && Math.random() < dna.mouse.microMovementFrequency) {
                x += (Math.random() - 0.5) * dna.mouse.microMovementAmplitude;
                y += (Math.random() - 0.5) * dna.mouse.microMovementAmplitude;
            }
            path.push({
                x: Math.round(x),
                y: Math.round(y),
                timestamp: Math.round(i * (duration / steps))
            });
        }
        // Apply overshoot if configured
        if (Math.random() < dna.mouse.pathOvershootProbability) {
            const overshoot = dna.mouse.overshootMagnitude;
            const dirX = (to.x - from.x) / distance;
            const dirY = (to.y - from.y) / distance;
            // Add overshoot point
            path.push({
                x: Math.round(to.x + dirX * overshoot),
                y: Math.round(to.y + dirY * overshoot),
                timestamp: Math.round(duration + 50)
            });
            // Return to target
            path.push({
                x: to.x,
                y: to.y,
                timestamp: Math.round(duration + 150)
            });
        }
        return path;
    }
    /**
     * 💾 Persist profile to disk
     */
    async persistProfile(dna) {
        const storagePath = this.config.profileStoragePath;
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath, { recursive: true });
        }
        // Convert Maps to objects for JSON serialization
        const serializable = {
            ...dna,
            typing: {
                ...dna.typing,
                charTimingOffsets: Object.fromEntries(dna.typing.charTimingOffsets),
                bigramTimings: Object.fromEntries(dna.typing.bigramTimings)
            }
        };
        const filePath = path.join(storagePath, `${dna.accountId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(serializable, null, 2));
    }
    /**
     * 📊 Get activation statistics
     */
    getStats() {
        const profiles = Array.from(this.activatedProfiles.values());
        const avgTypingWPM = profiles.length > 0
            ? profiles.reduce((sum, p) => sum + p.typing.baseWPM, 0) / profiles.length
            : 0;
        const avgMouseSpeed = profiles.length > 0
            ? profiles.reduce((sum, p) => sum + p.mouse.baseSpeed, 0) / profiles.length
            : 0;
        // Categorize typing speeds
        const distribution = {
            slow: 0, // < 30 WPM
            average: 0, // 30-60 WPM
            fast: 0, // 60-90 WPM
            expert: 0 // > 90 WPM
        };
        for (const profile of profiles) {
            if (profile.typing.baseWPM < 30)
                distribution.slow++;
            else if (profile.typing.baseWPM < 60)
                distribution.average++;
            else if (profile.typing.baseWPM < 90)
                distribution.fast++;
            else
                distribution.expert++;
        }
        return {
            totalActivated: profiles.length,
            avgTypingWPM: Math.round(avgTypingWPM),
            avgMouseSpeed: Math.round(avgMouseSpeed),
            profileDistribution: distribution
        };
    }
    // ============================================================
    // UTILITY METHODS
    // ============================================================
    createSeededRandom(seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return () => {
            hash = Math.sin(hash) * 10000;
            return hash - Math.floor(hash);
        };
    }
    gaussianRandom(random, mean, stdDev) {
        const u1 = random();
        const u2 = random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return mean + z0 * stdDev;
    }
    pickRandomWeighted(random, options) {
        const total = options.reduce((sum, [, weight]) => sum + weight, 0);
        let r = random() * total;
        for (const [value, weight] of options) {
            r -= weight;
            if (r <= 0)
                return value;
        }
        return options[options.length - 1][0];
    }
    shuffleArray(array, random) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}
exports.NeuralFingerprintActivator = NeuralFingerprintActivator;
// ============================================================
// EXPORTS
// ============================================================
function createNeuralFingerprintActivator(config) {
    return new NeuralFingerprintActivator(config);
}
// Note: All types are already exported at their definitions above (v1.0.0.0)
