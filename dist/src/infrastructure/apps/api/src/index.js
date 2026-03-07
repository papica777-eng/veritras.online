"use strict";
/**
 * QAntum SaaS API Server
 *
 * Main entry point for the API server using Fastify
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const fastify_2 = require("@clerk/fastify");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
// Import routes
const projects_1 = require("../../../../scripts/NEW/src/commands/projects");
const tests_1 = require("../../../../scripts/qantum/api/unified/tests");
const runs_1 = require("../../../routes/runs");
const ai_1 = require("../../../routes/ai");
const billing_1 = require("../../../routes/billing");
const webhooks_1 = require("../../../../scripts/qantum/integrations/webhooks");
const dashboard_1 = require("../../../routes/dashboard");
const genesis_1 = require("../../../../scripts/NEW/src/commands/genesis");
const chronos_1 = require("../../../routes/chronos");
const aeterna_1 = require("../../../routes/aeterna");
const config = {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
};
// Initialize Fastify
const app = (0, fastify_1.default)({
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        transport: {
            target: 'pino-pretty',
            options: { colorize: true },
        },
    },
});
exports.app = app;
// Redis connection
const redis = new ioredis_1.default(config.redis);
// Job queue
const testQueue = new bullmq_1.Queue('test-execution', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
    },
});
// Register plugins
// SAFETY: async operation — wrap in try-catch for production resilience
await app.register(cors_1.default, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
});
// SAFETY: async operation — wrap in try-catch for production resilience
await app.register(fastify_2.clerkPlugin, {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
});
// Decorate with shared resources
app.decorate('redis', redis);
app.decorate('testQueue', testQueue);
// Health check
app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
}));
// API routes — Service 01: QAntum Prime (veritras.website)
app.register(projects_1.projectRoutes, { prefix: '/api/v1/projects' });
app.register(tests_1.testRoutes, { prefix: '/api/v1/tests' });
app.register(runs_1.runRoutes, { prefix: '/api/v1/runs' });
app.register(dashboard_1.dashboardRoutes, { prefix: '/api/v1/dashboard' });
app.register(ai_1.aiRoutes, { prefix: '/api/v1/ai' });
app.register(genesis_1.genesisRoutes, { prefix: '/api/v1/genesis' });
// API routes — Service 02: AETERNA Logos (aeterna.website)
app.register(aeterna_1.aeternaRoutes, { prefix: '/api/v1/aeterna' });
// API routes — Service 03: CHRONOS Sovereign (veritras.online)
app.register(chronos_1.chronosRoutes, { prefix: '/api/v1/chronos' });
// Shared routes
app.register(billing_1.billingRoutes, { prefix: '/api/v1/billing' });
app.register(webhooks_1.webhookRoutes, { prefix: '/webhooks' });
// Error handler
app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;
    reply.status(statusCode).send({
        error: {
            code: error.code || 'INTERNAL_ERROR',
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
    });
});
// Graceful shutdown
const shutdown = async () => {
    app.log.info('Shutting down...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await testQueue.close();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await redis.quit();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await app.close();
    process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
// Start server
try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   ⚡ VERITRAS Sovereign API v1.0.0                                      ║
║   Server: http://${config.host}:${config.port}                                      ║
║                                                                        ║
║   SERVICE 01 — QAntum Prime (veritras.website)                         ║
║   • POST /api/v1/tests/run        — Execute tests                     ║
║   • POST /api/v1/ai/generate      — AI test generation                ║
║   • GET  /api/v1/runs/:id         — Get run results                   ║
║   • GET  /api/v1/dashboard/stats  — Dashboard metrics                 ║
║                                                                        ║
║   SERVICE 02 — AETERNA Logos (aeterna.website)                         ║
║   • POST /api/v1/aeterna/nodes        — Deploy Manifold Node          ║
║   • GET  /api/v1/aeterna/pulse        — Logic Pulse monitoring        ║
║   • POST /api/v1/aeterna/bridge/*     — Wealth Bridge API             ║
║   • POST /api/v1/aeterna/soul/compile — LwaS .soul compiler           ║
║   • POST /api/v1/aeterna/vault/store  — Encryption Vault              ║
║                                                                        ║
║   SERVICE 03 — CHRONOS Sovereign (veritras.online)                     ║
║   • POST /api/v1/chronos/predict  — Catuskoti prediction              ║
║   • GET  /api/v1/chronos/karma    — Soul Karma status                 ║
║   • GET  /api/v1/chronos/catuskoti — Logic system info                ║
║   • GET  /api/v1/chronos/pairs    — Live trading pairs                ║
║                                                                        ║
║   SHARED                                                               ║
║   • GET  /api/v1/billing/plans    — Product pricing                   ║
║   • POST /webhooks/stripe         — Stripe events                     ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
  `);
}
catch (err) {
    app.log.error(err);
    process.exit(1);
}
