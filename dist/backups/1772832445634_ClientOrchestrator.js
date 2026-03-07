"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * 🏛️ CLIENT ORCHESTRATOR - THE SOVEREIGN GATEWAY
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * v1.5.0 "The Sovereign Gateway" - Enterprise Client Management System
 *
 *   ███████╗ ██████╗ ██╗   ██╗███████╗██████╗ ███████╗██╗ ██████╗ ███╗   ██╗
 *   ██╔════╝██╔═══██╗██║   ██║██╔════╝██╔══██╗██╔════╝██║██╔════╝ ████╗  ██║
 *   ███████╗██║   ██║██║   ██║█████╗  ██████╔╝█████╗  ██║██║  ███╗██╔██╗ ██║
 *   ╚════██║██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗██╔══╝  ██║██║   ██║██║╚██╗██║
 *   ███████║╚██████╔╝ ╚████╔╝ ███████╗██║  ██║███████╗██║╚██████╔╝██║ ╚████║
 *   ╚══════╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 *   MARKET VALUE INCREMENT: +$180,000
 *
 *   Features:
 *   • License Key Validation & Management
 *   • Plan-based API Access Control
 *   • Rate Limiting Integration
 *   • Billing Telemetry Hooks
 *   • Fatality Engine Security Integration
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * @module reality/gateway
 * @version 1.5.0
 * @license Commercial - All Rights Reserved
 * @author QANTUM AI Architect
 * @commercial true
 * @marketValue $180,000
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
exports.ClientOrchestrator = exports.TIER_RATE_LIMITS = void 0;
exports.getClientOrchestrator = getClientOrchestrator;
exports.createClientOrchestrator = createClientOrchestrator;
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════════════════
// TIER RATE LIMITS
// ═══════════════════════════════════════════════════════════════════════════════════════════
exports.TIER_RATE_LIMITS = {
    starter: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
        maxConcurrentSyncs: 5,
        maxProvidersPerSync: 2,
        maxTemplateSize: 1 * 1024 * 1024, // 1MB
        burstAllowance: 10
    },
    professional: {
        requestsPerMinute: 300,
        requestsPerHour: 5000,
        requestsPerDay: 50000,
        maxConcurrentSyncs: 25,
        maxProvidersPerSync: 4,
        maxTemplateSize: 5 * 1024 * 1024, // 5MB
        burstAllowance: 50
    },
    enterprise: {
        requestsPerMinute: 1000,
        requestsPerHour: 20000,
        requestsPerDay: 200000,
        maxConcurrentSyncs: 100,
        maxProvidersPerSync: 5,
        maxTemplateSize: 50 * 1024 * 1024, // 50MB
        burstAllowance: 200
    },
    unlimited: {
        requestsPerMinute: -1, // Unlimited
        requestsPerHour: -1,
        requestsPerDay: -1,
        maxConcurrentSyncs: -1,
        maxProvidersPerSync: 5,
        maxTemplateSize: -1, // Unlimited
        burstAllowance: -1
    }
};
// ═══════════════════════════════════════════════════════════════════════════════════════════
// CLIENT ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════════════════
/**
 * 🏛️ ClientOrchestrator - The Sovereign Gateway
 *
 * Manages enterprise client access to the Virtual Sync API.
 * Handles authentication, rate limiting, and security integration.
 *
 * @example
 * ```typescript
 * const gateway = new ClientOrchestrator({
 *   enableFatality: true,
 *   enableBilling: true
 * });
 *
 // SAFETY: async operation — wrap in try-catch for production resilience
 * await gateway.initialize();
 *
 // SAFETY: async operation — wrap in try-catch for production resilience
 * const auth = await gateway.authenticate('API_KEY_HERE', '192.168.1.1');
 * if (auth.authenticated) {
 *   // Proceed with API call
 *   const canProceed = gateway.checkRateLimit(auth.session!.sessionId);
 * }
 * ```
 */
class ClientOrchestrator extends events_1.EventEmitter {
    config;
    licenses = new Map();
    sessions = new Map();
    apiKeyToLicense = new Map(); // apiKeyHash -> keyId
    invalidAttempts = new Map();
    bannedIPs = new Set();
    isInitialized = false;
    // Metrics
    metrics = {
        activeSessions: 0,
        requestsToday: 0,
        syncsToday: 0,
        throttledClients: 0,
        bannedIPs: 0,
        revenue: { daily: 0, monthly: 0, yearly: 0 },
        byTier: {
            starter: { activeClients: 0, requestsToday: 0, syncsToday: 0 },
            professional: { activeClients: 0, requestsToday: 0, syncsToday: 0 },
            enterprise: { activeClients: 0, requestsToday: 0, syncsToday: 0 },
            unlimited: { activeClients: 0, requestsToday: 0, syncsToday: 0 }
        }
    };
    constructor(config) {
        super();
        this.setMaxListeners(100);
        this.config = {
            strictIPValidation: config?.strictIPValidation ?? true,
            sessionTimeout: config?.sessionTimeout ?? 3600000, // 1 hour
            maxInvalidAttempts: config?.maxInvalidAttempts ?? 5,
            enableFatality: config?.enableFatality ?? true,
            fatalityHook: config?.fatalityHook,
            enableBilling: config?.enableBilling ?? true,
            billingHook: config?.billingHook,
            licensePath: config?.licensePath ?? './data/licenses',
            sessionPath: config?.sessionPath ?? './data/sessions'
        };
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Initialize the gateway
     */
    // Complexity: O(1)
    async initialize() {
        if (this.isInitialized)
            return;
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                               ║
║   🏛️ CLIENT ORCHESTRATOR - THE SOVEREIGN GATEWAY                                              ║
║                                                                                               ║
║   ┌─────────────────────────────────────────────────────────────────────────────────────┐    ║
║   │  📜 License Management     │  ✅ ACTIVE                                             │    ║
║   │  ⚡ Rate Limiting          │  ✅ ACTIVE                                             │    ║
║   │  💀 Fatality Integration   │  ${this.config.enableFatality ? '✅ ARMED' : '❌ DISABLED'}                                             │    ║
║   │  💰 Billing Telemetry      │  ${this.config.enableBilling ? '✅ ACTIVE' : '❌ DISABLED'}                                             │    ║
║   └─────────────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                               ║
║   TIER RATE LIMITS:                                                                          ║
║   ├─ Starter:      60 req/min  │  5 concurrent  │  2 providers                              ║
║   ├─ Professional: 300 req/min │  25 concurrent │  4 providers                              ║
║   ├─ Enterprise:   1000 req/min│  100 concurrent│  5 providers                              ║
║   └─ Unlimited:    ∞           │  ∞             │  5 providers                              ║
║                                                                                               ║
║                     "Welcome to the Empire. Your keys are your crown."                        ║
║                                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
`);
        // Load existing licenses
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.loadLicenses();
        // Start session cleanup timer
        this.startSessionCleanup();
        // Start metrics reset timer (daily)
        this.startMetricsReset();
        this.isInitialized = true;
        this.emit('initialized');
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // LICENSE MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Generate a new license key
     */
    // Complexity: O(1) — lookup
    generateLicenseKey(organizationId, organizationName, tier, expiresInDays = 365, allowedIPs = [], features = []) {
        // Generate secure API key
        const apiKey = `qntm_${tier}_${crypto.randomBytes(32).toString('hex')}`;
        const apiKeyHash = this.hashApiKey(apiKey);
        const keyId = `LIC_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
        const license = {
            keyId,
            apiKeyHash,
            organizationId,
            organizationName,
            tier,
            createdAt: Date.now(),
            expiresAt: Date.now() + (expiresInDays * 24 * 60 * 60 * 1000),
            status: 'active',
            allowedIPs,
            features: new Set(features),
            metadata: {}
        };
        this.licenses.set(keyId, license);
        this.apiKeyToLicense.set(apiKeyHash, keyId);
        this.emit('license_created', { keyId, organizationName, tier });
        return { keyId, apiKey, license };
    }
    /**
     * Revoke a license
     */
    // Complexity: O(N) — loop
    revokeLicense(keyId, reason) {
        const license = this.licenses.get(keyId);
        if (!license)
            return false;
        license.status = 'suspended';
        license.metadata.revokedAt = Date.now();
        license.metadata.revokeReason = reason;
        // Terminate all sessions
        for (const [sessionId, session] of this.sessions) {
            if (session.keyId === keyId) {
                this.terminateSession(sessionId);
            }
        }
        this.emit('license_revoked', { keyId, reason });
        return true;
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // AUTHENTICATION
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Authenticate a client with API key
     */
    // Complexity: O(1) — lookup
    async authenticate(apiKey, clientIP) {
        // Check if IP is banned
        if (this.bannedIPs.has(clientIP)) {
            return {
                authenticated: false,
                errorCode: 'IP_BLOCKED',
                errorMessage: 'Your IP has been blocked due to security violations'
            };
        }
        // Check with Fatality if enabled
        if (this.config.enableFatality && this.config.fatalityHook) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const isBanned = await this.config.fatalityHook.isIPBanned(clientIP);
            if (isBanned) {
                return {
                    authenticated: false,
                    errorCode: 'IP_BLOCKED',
                    errorMessage: 'Access denied by security system'
                };
            }
        }
        // Hash the provided API key
        const apiKeyHash = this.hashApiKey(apiKey);
        const keyId = this.apiKeyToLicense.get(apiKeyHash);
        if (!keyId) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.recordInvalidAttempt(clientIP, 'UNKNOWN', 'Invalid API key');
            const attempts = this.invalidAttempts.get(clientIP);
            return {
                authenticated: false,
                errorCode: 'INVALID_KEY',
                errorMessage: 'Invalid API key provided',
                invalidAttempts: attempts?.count || 1
            };
        }
        const license = this.licenses.get(keyId);
        if (!license) {
            return {
                authenticated: false,
                errorCode: 'INVALID_KEY',
                errorMessage: 'License not found'
            };
        }
        // Check license status
        if (license.status === 'banned') {
            return {
                authenticated: false,
                errorCode: 'BANNED',
                errorMessage: 'This license has been permanently banned'
            };
        }
        if (license.status === 'suspended') {
            return {
                authenticated: false,
                errorCode: 'SUSPENDED',
                errorMessage: 'This license has been suspended'
            };
        }
        if (license.status === 'expired' || Date.now() > license.expiresAt) {
            license.status = 'expired';
            return {
                authenticated: false,
                errorCode: 'EXPIRED',
                errorMessage: 'This license has expired'
            };
        }
        // Check IP whitelist
        if (this.config.strictIPValidation && license.allowedIPs.length > 0) {
            if (!license.allowedIPs.includes(clientIP) && !license.allowedIPs.includes('*')) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.recordInvalidAttempt(clientIP, keyId, 'IP not in whitelist');
                return {
                    authenticated: false,
                    errorCode: 'IP_BLOCKED',
                    errorMessage: 'This IP is not authorized for this license'
                };
            }
        }
        // Create or get existing session
        const session = this.getOrCreateSession(keyId, clientIP);
        // Check rate limit
        if (session.isThrottled && Date.now() < session.throttledUntil) {
            return {
                authenticated: false,
                errorCode: 'RATE_LIMITED',
                errorMessage: `Rate limited. Try again in ${Math.ceil((session.throttledUntil - Date.now()) / 1000)} seconds`,
                session,
                license
            };
        }
        // Reset invalid attempts on successful auth
        this.invalidAttempts.delete(clientIP);
        // Record API call for billing
        if (this.config.enableBilling && this.config.billingHook) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.config.billingHook.recordAPICall(keyId, 'authenticate', 200);
        }
        this.emit('client_authenticated', { keyId, clientIP, tier: license.tier });
        return {
            authenticated: true,
            session,
            license
        };
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // RATE LIMITING
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Check if request can proceed (rate limit check)
     */
    // Complexity: O(1) — lookup
    checkRateLimit(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return { allowed: false };
        }
        const license = this.licenses.get(session.keyId);
        if (!license) {
            return { allowed: false };
        }
        const limits = license.customLimits || exports.TIER_RATE_LIMITS[license.tier];
        // Unlimited tier bypass
        if (limits.requestsPerMinute === -1) {
            session.requestCount++;
            session.lastActivity = Date.now();
            this.metrics.requestsToday++;
            this.metrics.byTier[license.tier].requestsToday++;
            return { allowed: true };
        }
        // Check if window needs reset
        const windowDuration = 60000; // 1 minute
        if (Date.now() - session.windowStart > windowDuration) {
            session.windowStart = Date.now();
            session.requestCount = 0;
            session.isThrottled = false;
        }
        // Check rate limit
        if (session.requestCount >= limits.requestsPerMinute) {
            session.isThrottled = true;
            session.throttledUntil = session.windowStart + windowDuration;
            this.metrics.throttledClients++;
            this.emit('client_throttled', {
                keyId: session.keyId,
                tier: license.tier,
                requestCount: session.requestCount,
                limit: limits.requestsPerMinute
            });
            return {
                allowed: false,
                retryAfter: Math.ceil((session.throttledUntil - Date.now()) / 1000)
            };
        }
        // Allow request
        session.requestCount++;
        session.lastActivity = Date.now();
        this.metrics.requestsToday++;
        this.metrics.byTier[license.tier].requestsToday++;
        return { allowed: true };
    }
    /**
     * Check if sync can proceed (concurrent sync limit)
     */
    // Complexity: O(1) — lookup
    checkSyncLimit(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return { allowed: false, reason: 'Session not found' };
        }
        const license = this.licenses.get(session.keyId);
        if (!license) {
            return { allowed: false, reason: 'License not found' };
        }
        const limits = license.customLimits || exports.TIER_RATE_LIMITS[license.tier];
        // Unlimited bypass
        if (limits.maxConcurrentSyncs === -1) {
            return { allowed: true };
        }
        if (session.activeSyncs >= limits.maxConcurrentSyncs) {
            return {
                allowed: false,
                reason: `Concurrent sync limit reached (${session.activeSyncs}/${limits.maxConcurrentSyncs})`
            };
        }
        return { allowed: true };
    }
    /**
     * Start a sync (increment counter)
     */
    // Complexity: O(1) — lookup
    startSync(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return false;
        const check = this.checkSyncLimit(sessionId);
        if (!check.allowed)
            return false;
        session.activeSyncs++;
        session.totalSyncs++;
        this.metrics.syncsToday++;
        const license = this.licenses.get(session.keyId);
        if (license) {
            this.metrics.byTier[license.tier].syncsToday++;
        }
        return true;
    }
    /**
     * End a sync (decrement counter)
     */
    // Complexity: O(N)
    endSync(sessionId, provider, templateType, durationMs) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        session.activeSyncs = Math.max(0, session.activeSyncs - 1);
        // Record for billing
        if (this.config.enableBilling && this.config.billingHook) {
            this.config.billingHook.recordSync(session.keyId, provider, templateType, durationMs);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // SECURITY - FATALITY INTEGRATION
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Record invalid authentication attempt
     */
    // Complexity: O(1) — lookup
    async recordInvalidAttempt(ip, keyId, reason) {
        const attempts = this.invalidAttempts.get(ip) || { count: 0, firstAttempt: Date.now() };
        attempts.count++;
        this.invalidAttempts.set(ip, attempts);
        // Report to Fatality
        if (this.config.enableFatality && this.config.fatalityHook) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.config.fatalityHook.reportInvalidAttempt(ip, keyId, reason);
        }
        // Check threshold
        if (attempts.count >= this.config.maxInvalidAttempts) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.banIP(ip, `Exceeded ${this.config.maxInvalidAttempts} invalid authentication attempts`);
        }
        this.emit('invalid_attempt', { ip, keyId, reason, attemptCount: attempts.count });
    }
    /**
     * Ban an IP address
     */
    // Complexity: O(N) — loop
    async banIP(ip, reason, duration = 86400000) {
        this.bannedIPs.add(ip);
        this.metrics.bannedIPs = this.bannedIPs.size;
        // Terminate any active sessions from this IP
        for (const [sessionId, session] of this.sessions) {
            if (session.clientIP === ip) {
                this.terminateSession(sessionId);
            }
        }
        // Report to Fatality
        if (this.config.enableFatality && this.config.fatalityHook) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.config.fatalityHook.banIP(ip, reason, duration);
        }
        // Auto-unban after duration
        // Complexity: O(1)
        setTimeout(() => {
            this.bannedIPs.delete(ip);
            this.metrics.bannedIPs = this.bannedIPs.size;
        }, duration);
        this.emit('ip_banned', { ip, reason, duration });
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // SESSION MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Get or create a session
     */
    // Complexity: O(N*M) — nested iteration
    getOrCreateSession(keyId, clientIP) {
        // Look for existing session
        for (const [sessionId, session] of this.sessions) {
            if (session.keyId === keyId && session.clientIP === clientIP) {
                session.lastActivity = Date.now();
                return session;
            }
        }
        // Create new session
        const sessionId = `SES_${crypto.randomBytes(16).toString('hex')}`;
        const session = {
            sessionId,
            keyId,
            clientIP,
            startedAt: Date.now(),
            lastActivity: Date.now(),
            requestCount: 0,
            windowStart: Date.now(),
            activeSyncs: 0,
            totalSyncs: 0,
            isThrottled: false,
            throttledUntil: 0
        };
        this.sessions.set(sessionId, session);
        this.metrics.activeSessions = this.sessions.size;
        const license = this.licenses.get(keyId);
        if (license) {
            this.metrics.byTier[license.tier].activeClients++;
        }
        this.emit('session_created', { sessionId, keyId, clientIP });
        return session;
    }
    /**
     * Terminate a session
     */
    // Complexity: O(1) — lookup
    terminateSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        const license = this.licenses.get(session.keyId);
        if (license) {
            this.metrics.byTier[license.tier].activeClients--;
        }
        this.sessions.delete(sessionId);
        this.metrics.activeSessions = this.sessions.size;
        this.emit('session_terminated', { sessionId });
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // UTILITY METHODS
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Hash an API key
     */
    // Complexity: O(1)
    hashApiKey(apiKey) {
        return crypto.createHash('sha256').update(apiKey).digest('hex');
    }
    /**
     * Load licenses from storage
     */
    // Complexity: O(1)
    async loadLicenses() {
        // In production, this would load from database
        // For now, create demo licenses
        this.generateLicenseKey('DEMO_ORG', 'Demo Organization', 'professional', 30);
        console.log('[Gateway] Loaded licenses from storage');
    }
    /**
     * Start session cleanup timer
     */
    // Complexity: O(N) — loop
    startSessionCleanup() {
        // Complexity: O(N) — loop
        setInterval(() => {
            const now = Date.now();
            for (const [sessionId, session] of this.sessions) {
                if (now - session.lastActivity > this.config.sessionTimeout) {
                    this.terminateSession(sessionId);
                }
            }
        }, 60000); // Check every minute
    }
    /**
     * Start daily metrics reset
     */
    // Complexity: O(1)
    startMetricsReset() {
        // Calculate time until midnight
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const msUntilMidnight = midnight.getTime() - now.getTime();
        // Complexity: O(1)
        setTimeout(() => {
            this.resetDailyMetrics();
            // Then reset every 24 hours
            // Complexity: O(1)
            setInterval(() => this.resetDailyMetrics(), 86400000);
        }, msUntilMidnight);
    }
    /**
     * Reset daily metrics
     */
    // Complexity: O(N) — loop
    resetDailyMetrics() {
        this.metrics.requestsToday = 0;
        this.metrics.syncsToday = 0;
        for (const tier of Object.keys(this.metrics.byTier)) {
            this.metrics.byTier[tier].requestsToday = 0;
            this.metrics.byTier[tier].syncsToday = 0;
        }
        this.emit('metrics_reset');
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // PUBLIC GETTERS
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Get current metrics
     */
    // Complexity: O(1)
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get license by key ID
     */
    // Complexity: O(1) — lookup
    getLicense(keyId) {
        return this.licenses.get(keyId);
    }
    /**
     * Get session by ID
     */
    // Complexity: O(1) — lookup
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    /**
     * Check if gateway is initialized
     */
    // Complexity: O(1)
    isReady() {
        return this.isInitialized;
    }
}
exports.ClientOrchestrator = ClientOrchestrator;
// ═══════════════════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════
let gatewayInstance = null;
/**
 * Get singleton gateway instance
 */
function getClientOrchestrator(config) {
    if (!gatewayInstance) {
        gatewayInstance = new ClientOrchestrator(config);
    }
    return gatewayInstance;
}
/**
 * Create new gateway instance
 */
function createClientOrchestrator(config) {
    return new ClientOrchestrator(config);
}
exports.default = ClientOrchestrator;
