"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🤖 DEEPSEEK-R1-SWARM - Centralized Configuration
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Single source of truth for all environment variables and defaults.
 * Zero hardcoded secrets. Zero `any` types.
 *
 * @author Dimitar Prodromov / QAntum Empire
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwarmConfig = void 0;
const dotenv_1 = require("dotenv");
const path_1 = require("path");
// Complexity: O(1)
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, '../../.env') });
// ═══════════════════════════════════════════════════════════════
// Type-Safe Environment Reader
// ═══════════════════════════════════════════════════════════════
// Complexity: O(1)
function requireEnv(key, fallback) {
    const value = process.env[key] || fallback;
    if (!value) {
        throw new Error(`[CONFIG] Missing required env var: ${key}. Copy .env.example to .env`);
    }
    return value;
}
// Complexity: O(1)
function optionalEnv(key, fallback) {
    return process.env[key] || fallback;
}
// Complexity: O(1)
function numericEnv(key, fallback) {
    const raw = process.env[key];
    if (!raw)
        return fallback;
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) {
        throw new Error(`[CONFIG] Env var ${key} must be numeric, got: "${raw}"`);
    }
    return parsed;
}
// ═══════════════════════════════════════════════════════════════
// Exported Configuration Object
// ═══════════════════════════════════════════════════════════════
exports.SwarmConfig = {
    deepseek: {
        apiKey: requireEnv('DEEPSEEK_API_KEY'),
        baseUrl: optionalEnv('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1'),
        reasonerModel: 'deepseek-reasoner',
        chatModel: 'deepseek-chat',
    },
    stripe: {
        secretKey: optionalEnv('STRIPE_SECRET_KEY', ''),
        webhookSecret: optionalEnv('STRIPE_WEBHOOK_SECRET', ''),
    },
    redis: {
        url: optionalEnv('REDIS_URL', 'redis://localhost:6379'),
    },
    swarm: {
        maxAgents: numericEnv('SWARM_MAX_AGENTS', 10),
        defaultPlan: optionalEnv('SWARM_DEFAULT_PLAN', 'team'),
    },
    executor: {
        maxParallel: numericEnv('EXECUTOR_MAX_PARALLEL', 100),
        batchSize: numericEnv('EXECUTOR_BATCH_SIZE', 50),
    },
    api: {
        host: optionalEnv('API_HOST', '0.0.0.0'),
        port: numericEnv('API_PORT', 8002),
    },
    logging: {
        level: optionalEnv('LOG_LEVEL', 'info'),
    },
};
