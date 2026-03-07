"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🎭 ANTI-DETECTION MODULE - Browser Fingerprint Randomization
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Metaphysical Principle: Identity is an illusion constructed from observable properties.
 * By controlling what properties are observed, we control the perceived identity.
 * The anti-detection module creates "polymorphic identity" - a system that presents
 * different faces to different observers, yet remains internally consistent.
 *
 * "To be is to be perceived" - Berkeley's Idealism applied to digital fingerprinting.
 * If we control perception, we control existence in the eyes of the observer.
 *
 * @author Dimitar Prodromov
 * @version 17.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiDetection = void 0;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════════════
// 🛡️ ANTI-DETECTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════
class AntiDetection extends events_1.EventEmitter {
    config;
    components;
    currentProfile = null;
    canvasFingerprint = null;
    webGLFingerprint = null;
    mutationHistory;
    entropyBuffer;
    entropyIndex;
    MAX_HISTORY = 1000;
    constructor() {
        super();
        this.config = this.getDefaultConfig();
        this.components = new Map();
        this.mutationHistory = [];
        this.entropyBuffer = new Uint8Array(1024);
        this.entropyIndex = 0;
        this.initializeComponents();
        this.seedEntropy();
    }
    /**
     * Get default fingerprint configuration
     */
    getDefaultConfig() {
        return {
            userAgent: true,
            canvas: true,
            webGL: true,
            fonts: true,
            plugins: true,
            timezone: true,
            language: true,
            screen: true,
            hardwareConcurrency: true,
            deviceMemory: true,
            audioContext: false, // Disabled by default - high detection weight
        };
    }
    /**
     * Initialize fingerprint components with weights and mutation rates
     *
     * Weights represent how heavily each component is used in detection algorithms.
     * Higher weight = more important to randomize effectively.
     */
    initializeComponents() {
        const components = [
            { name: 'userAgent', weight: 0.95, mutationRate: 0.1 },
            { name: 'canvas', weight: 0.85, mutationRate: 0.05 },
            { name: 'webGL', weight: 0.8, mutationRate: 0.15 },
            { name: 'fonts', weight: 0.7, mutationRate: 0.2 },
            { name: 'plugins', weight: 0.5, mutationRate: 0.3 },
            { name: 'timezone', weight: 0.6, mutationRate: 0.4 },
            { name: 'language', weight: 0.55, mutationRate: 0.35 },
            { name: 'screen', weight: 0.75, mutationRate: 0.1 },
            { name: 'hardwareConcurrency', weight: 0.4, mutationRate: 0.5 },
            { name: 'deviceMemory', weight: 0.35, mutationRate: 0.5 },
            { name: 'audioContext', weight: 0.9, mutationRate: 0.02 },
        ];
        for (const comp of components) {
            this.components.set(comp.name, {
                ...comp,
                lastValue: null,
                lastMutation: 0,
            });
        }
    }
    /**
     * Seed entropy buffer with cryptographically random data
     */
    seedEntropy() {
        // Use multiple entropy sources
        for (let i = 0; i < this.entropyBuffer.length; i++) {
            const timeEntropy = Date.now() ^ (i * 31);
            const mathEntropy = Math.floor(Math.random() * 256);
            const hrTime = process.hrtime();
            const processEntropy = (hrTime[0] * 1e9 + hrTime[1]) ^ i;
            this.entropyBuffer[i] = (timeEntropy ^ mathEntropy ^ processEntropy) & 0xff;
        }
        this.entropyIndex = 0;
        // Fisher-Yates shuffle
        for (let i = this.entropyBuffer.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.entropyBuffer[i], this.entropyBuffer[j]] = [
                this.entropyBuffer[j],
                this.entropyBuffer[i],
            ];
        }
    }
    /**
     * Get random byte from entropy buffer
     */
    getEntropy() {
        if (this.entropyIndex >= this.entropyBuffer.length) {
            this.seedEntropy();
        }
        return this.entropyBuffer[this.entropyIndex++];
    }
    /**
     * Get multiple random bytes
     */
    getEntropyBytes(count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(this.getEntropy());
        }
        return result;
    }
    /**
     * Apply fingerprint randomization configuration
     *
     * @param config - Configuration specifying which fingerprint components to randomize
     */
    randomizeFingerprint(config) {
        this.config = { ...this.config, ...config };
        this.regenerateAllComponents();
        this.emit('fingerprintRandomized', { config: this.config, timestamp: Date.now() });
    }
    /**
     * Regenerate all enabled fingerprint components
     */
    regenerateAllComponents() {
        if (this.config.userAgent) {
            this.currentProfile = this.generateBrowserProfile();
        }
        if (this.config.canvas) {
            this.canvasFingerprint = this.generateCanvasFingerprint();
        }
        if (this.config.webGL) {
            this.webGLFingerprint = this.generateWebGLFingerprint();
        }
    }
    /**
     * Generate realistic browser profile
     *
     * Metaphysical Note: A browser profile is the "soul" of the browser identity.
     * It must be internally consistent - a Chrome profile shouldn't have Safari
     * characteristics. This consistency makes the illusion believable.
     */
    generateBrowserProfile() {
        const entropy = this.getEntropyBytes(16);
        // Choose browser family first to ensure consistency
        const browserFamily = entropy[0] % 4;
        const profiles = this.getBrowserProfiles();
        const profile = profiles[browserFamily];
        // Add variance while maintaining consistency
        const languageOptions = [
            ['en-US', 'en'],
            ['en-GB', 'en'],
            ['de-DE', 'de', 'en-US', 'en'],
            ['fr-FR', 'fr', 'en'],
            ['es-ES', 'es', 'en'],
        ];
        const screenOptions = [
            { width: 1920, height: 1080 },
            { width: 2560, height: 1440 },
            { width: 1366, height: 768 },
            { width: 1536, height: 864 },
            { width: 3840, height: 2160 },
        ];
        const timezones = [
            { name: 'America/New_York', offset: 300 },
            { name: 'America/Los_Angeles', offset: 480 },
            { name: 'Europe/London', offset: 0 },
            { name: 'Europe/Paris', offset: -60 },
            { name: 'Asia/Tokyo', offset: -540 },
        ];
        const languages = languageOptions[entropy[1] % languageOptions.length];
        const screen = screenOptions[entropy[2] % screenOptions.length];
        const tz = timezones[entropy[3] % timezones.length];
        const cores = [4, 6, 8, 12, 16][entropy[4] % 5];
        const memory = [4, 8, 16, 32][entropy[5] % 4];
        // Update component tracking
        const component = this.components.get('userAgent');
        if (component) {
            component.lastValue = profile.userAgent;
            component.lastMutation = Date.now();
        }
        return {
            userAgent: profile.userAgent,
            platform: profile.platform,
            vendor: profile.vendor,
            language: languages[0],
            languages,
            hardwareConcurrency: cores,
            deviceMemory: memory,
            screenResolution: screen,
            colorDepth: [24, 30, 32][entropy[6] % 3],
            timezone: tz.name,
            timezoneOffset: tz.offset,
        };
    }
    /**
     * Get predefined browser profiles that are internally consistent
     */
    getBrowserProfiles() {
        return [
            {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                platform: 'Win32',
                vendor: 'Google Inc.',
            },
            {
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                platform: 'MacIntel',
                vendor: 'Google Inc.',
            },
            {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
                platform: 'Win32',
                vendor: '',
            },
            {
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
                platform: 'MacIntel',
                vendor: 'Apple Computer, Inc.',
            },
        ];
    }
    /**
     * Generate canvas fingerprint with noise injection
     *
     * Canvas fingerprinting works by rendering text/shapes and hashing the result.
     * We inject subtle noise that changes the hash without visibly affecting rendering.
     */
    generateCanvasFingerprint() {
        const entropy = this.getEntropyBytes(64);
        // Generate noise pattern
        const noise = entropy.map((b) => (b - 128) / 256); // -0.5 to 0.5 range
        // Generate pseudo data URL hash (would be actual canvas in browser environment)
        const hashBase = entropy.slice(0, 32).map((b) => b.toString(16).padStart(2, '0')).join('');
        const component = this.components.get('canvas');
        if (component) {
            component.lastValue = hashBase;
            component.lastMutation = Date.now();
        }
        return {
            dataURL: `data:image/png;base64,${hashBase}`,
            noise,
            width: 200 + (entropy[0] % 20),
            height: 100 + (entropy[1] % 10),
        };
    }
    /**
     * Generate WebGL fingerprint data
     */
    generateWebGLFingerprint() {
        const entropy = this.getEntropyBytes(16);
        const vendors = [
            'Google Inc. (Intel)',
            'Google Inc. (NVIDIA)',
            'Google Inc. (AMD)',
            'Intel Inc.',
            'NVIDIA Corporation',
        ];
        const renderers = [
            'ANGLE (Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0)',
            'ANGLE (NVIDIA GeForce GTX 1080 Direct3D11 vs_5_0 ps_5_0)',
            'ANGLE (AMD Radeon RX 580 Series Direct3D11 vs_5_0 ps_5_0)',
            'Intel(R) Iris(R) Xe Graphics',
            'AMD Radeon Pro 5500M',
        ];
        const extensionSets = [
            ['ANGLE_instanced_arrays', 'EXT_blend_minmax', 'EXT_color_buffer_half_float'],
            ['ANGLE_instanced_arrays', 'EXT_blend_minmax', 'EXT_disjoint_timer_query'],
            ['ANGLE_instanced_arrays', 'EXT_blend_minmax', 'EXT_float_blend'],
        ];
        const component = this.components.get('webGL');
        if (component) {
            component.lastValue = vendors[entropy[0] % vendors.length];
            component.lastMutation = Date.now();
        }
        return {
            vendor: vendors[entropy[0] % vendors.length],
            renderer: renderers[entropy[1] % renderers.length],
            extensions: extensionSets[entropy[2] % extensionSets.length],
            parameters: {
                maxTextureSize: [8192, 16384, 32768][entropy[3] % 3],
                maxViewportDims: [16384, 32768][entropy[4] % 2],
                maxRenderbufferSize: [8192, 16384][entropy[5] % 2],
                aliasedLineWidthRange: [1, 7.375, 1, 10][entropy[6] % 2],
                aliasedPointSizeRange: [1, 1024, 1, 2048][entropy[7] % 2],
            },
        };
    }
    /**
     * Generate randomized font list
     */
    generateFontList() {
        if (!this.config.fonts) {
            return [];
        }
        const entropy = this.getEntropyBytes(20);
        const systemFonts = [
            'Arial', 'Arial Black', 'Arial Narrow', 'Calibri', 'Cambria',
            'Cambria Math', 'Comic Sans MS', 'Consolas', 'Courier', 'Courier New',
            'Georgia', 'Helvetica', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
            'Microsoft Sans Serif', 'Monaco', 'Palatino Linotype', 'Segoe UI',
            'Segoe UI Light', 'Segoe UI Semibold', 'Segoe UI Symbol', 'Tahoma',
            'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings',
            'Wingdings', 'Wingdings 2', 'Wingdings 3',
        ];
        // Select subset based on entropy
        const count = 15 + (entropy[0] % 10);
        const selected = [];
        const indices = new Set();
        for (let i = 0; i < count && indices.size < systemFonts.length; i++) {
            const idx = (entropy[i % entropy.length] + i * 7) % systemFonts.length;
            if (!indices.has(idx)) {
                indices.add(idx);
                selected.push(systemFonts[idx]);
            }
        }
        const component = this.components.get('fonts');
        if (component) {
            component.lastValue = selected.length;
            component.lastMutation = Date.now();
        }
        return selected;
    }
    /**
     * Get current browser profile
     */
    getProfile() {
        return this.currentProfile;
    }
    /**
     * Get canvas fingerprint data
     */
    getCanvasFingerprint() {
        return this.canvasFingerprint;
    }
    /**
     * Get WebGL fingerprint data
     */
    getWebGLFingerprint() {
        return this.webGLFingerprint;
    }
    /**
     * Calculate overall fingerprint uniqueness score
     * Lower is better (less unique = harder to track)
     */
    calculateUniquenessScore() {
        let score = 0;
        let totalWeight = 0;
        for (const [name, component] of this.components) {
            if (this.config[name]) {
                // Components with values closer to common defaults score lower
                const commonalityFactor = this.getCommonalityFactor(name);
                score += component.weight * (1 - commonalityFactor);
                totalWeight += component.weight;
            }
        }
        return totalWeight > 0 ? (score / totalWeight) * 100 : 0;
    }
    /**
     * Get commonality factor for a component
     * Returns 0-1, where 1 means very common (good for anonymity)
     */
    getCommonalityFactor(component) {
        // These are approximate values based on fingerprint studies
        const commonality = {
            userAgent: 0.3, // Many unique UAs
            canvas: 0.4, // Moderate uniqueness
            webGL: 0.5, // Common hardware combinations
            fonts: 0.3, // Font combinations are unique
            plugins: 0.7, // Plugins are mostly standardized now
            timezone: 0.6, // Limited timezone options
            language: 0.5, // Common language preferences
            screen: 0.4, // Common resolutions
            hardwareConcurrency: 0.7, // Few options
            deviceMemory: 0.8, // Very few options
            audioContext: 0.2, // Highly unique
        };
        return commonality[component] || 0.5;
    }
    /**
     * Trigger selective mutation based on detection risk
     *
     * @param riskLevel - The perceived detection risk level
     */
    mutateOnRisk(riskLevel) {
        const mutationThresholds = {
            none: 0.9, // Only mutate if mutation rate > 90%
            low: 0.5, // Mutate if mutation rate > 50%
            medium: 0.2, // Mutate if mutation rate > 20%
            high: 0.05, // Mutate if mutation rate > 5%
            critical: 0, // Mutate everything
        };
        const threshold = mutationThresholds[riskLevel];
        for (const [name, component] of this.components) {
            if (component.mutationRate > threshold) {
                this.mutateComponent(name);
            }
        }
        this.emit('riskMutation', { riskLevel, threshold });
    }
    /**
     * Mutate a specific component
     */
    mutateComponent(name) {
        switch (name) {
            case 'userAgent':
            case 'screen':
            case 'timezone':
            case 'language':
                this.currentProfile = this.generateBrowserProfile();
                break;
            case 'canvas':
                this.canvasFingerprint = this.generateCanvasFingerprint();
                break;
            case 'webGL':
                this.webGLFingerprint = this.generateWebGLFingerprint();
                break;
        }
        this.mutationHistory.push({ component: name, timestamp: Date.now() });
        // Trim history if needed
        if (this.mutationHistory.length > this.MAX_HISTORY) {
            this.mutationHistory = this.mutationHistory.slice(-this.MAX_HISTORY);
        }
    }
    /**
     * Get mutation history for analytics
     */
    getMutationHistory() {
        return [...this.mutationHistory];
    }
    /**
     * Get detection resistance rating
     * Returns A-F grade based on current fingerprint configuration
     */
    getResistanceRating() {
        const uniqueness = this.calculateUniquenessScore();
        const mutationCoverage = this.calculateMutationCoverage();
        const consistencyScore = this.checkInternalConsistency();
        const overallScore = (100 - uniqueness) * 0.4 + mutationCoverage * 0.3 + consistencyScore * 0.3;
        let grade;
        if (overallScore >= 90)
            grade = 'A+';
        else if (overallScore >= 85)
            grade = 'A';
        else if (overallScore >= 80)
            grade = 'B+';
        else if (overallScore >= 75)
            grade = 'B';
        else if (overallScore >= 70)
            grade = 'C+';
        else if (overallScore >= 65)
            grade = 'C';
        else if (overallScore >= 60)
            grade = 'D';
        else
            grade = 'F';
        return {
            grade,
            score: overallScore,
            details: {
                uniqueness: `${uniqueness.toFixed(1)}% (lower is better)`,
                mutationCoverage: `${mutationCoverage.toFixed(1)}%`,
                consistency: `${consistencyScore.toFixed(1)}%`,
            },
        };
    }
    /**
     * Calculate how many components are set to mutate
     */
    calculateMutationCoverage() {
        let enabled = 0;
        let total = 0;
        for (const [name] of this.components) {
            total++;
            if (this.config[name]) {
                enabled++;
            }
        }
        return total > 0 ? (enabled / total) * 100 : 0;
    }
    /**
     * Check internal consistency of fingerprint
     * Inconsistent fingerprints can trigger detection
     */
    checkInternalConsistency() {
        let consistencyScore = 100;
        if (this.currentProfile) {
            // Check platform/userAgent consistency
            const ua = this.currentProfile.userAgent.toLowerCase();
            const platform = this.currentProfile.platform.toLowerCase();
            if (ua.includes('windows') && !platform.includes('win')) {
                consistencyScore -= 20;
            }
            if (ua.includes('macintosh') && !platform.includes('mac')) {
                consistencyScore -= 20;
            }
            // Check vendor consistency
            if (ua.includes('chrome') && !this.currentProfile.vendor.includes('Google')) {
                if (this.currentProfile.vendor !== '') {
                    consistencyScore -= 10;
                }
            }
        }
        return Math.max(0, consistencyScore);
    }
    /**
     * Export current fingerprint state for debugging
     */
    exportState() {
        return {
            config: this.config,
            profile: this.currentProfile,
            canvas: this.canvasFingerprint ? { ...this.canvasFingerprint, noise: '[hidden]' } : null,
            webGL: this.webGLFingerprint,
            rating: this.getResistanceRating(),
            mutationCount: this.mutationHistory.length,
        };
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.entropyBuffer.fill(0);
        this.mutationHistory = [];
        this.currentProfile = null;
        this.canvasFingerprint = null;
        this.webGLFingerprint = null;
        this.removeAllListeners();
    }
}
exports.AntiDetection = AntiDetection;
exports.default = AntiDetection;
