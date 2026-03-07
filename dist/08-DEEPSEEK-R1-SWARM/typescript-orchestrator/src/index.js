"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🤖 DEEPSEEK-R1-SWARM - Entry Point & Fastify API
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Unified entry: starts Fastify server + deploys Deca-Guard swarm.
 * Exposes REST API for task assignment, status, and agent control.
 *
 * @author Dimitar Prodromov / QAntum Empire
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swarm = exports.app = void 0;
const fastify_1 = __importDefault(require("fastify"));
const SwarmCommander_1 = require("./SwarmCommander");
const config_1 = require("./config");
const crypto_1 = require("crypto");
// ═══════════════════════════════════════════════════════════════
// Initialize
// ═══════════════════════════════════════════════════════════════
const app = (0, fastify_1.default)({ logger: { level: config_1.SwarmConfig.logging.level } });
exports.app = app;
const swarm = new SwarmCommander_1.DecaGuardSwarm();
exports.swarm = swarm;
// ═══════════════════════════════════════════════════════════════
// Routes
// ═══════════════════════════════════════════════════════════════
// Complexity: O(1)
app.get('/health', async () => {
    return { status: 'operational', timestamp: Date.now(), agents: 10 };
});
// Complexity: O(n) where n = agents
app.get('/swarm/status', async () => {
    return swarm.getStatus();
});
// Complexity: O(1) — single task assignment
app.post('/swarm/task', async (request, reply) => {
    const body = request.body;
    if (!body.type) {
        return reply.status(400).send({ error: 'Missing required field: type' });
    }
    const validTypes = [
        'security', 'penetration', 'prediction', 'generation',
        'monitoring', 'infrastructure', 'communication',
        'strategy', 'critical', 'chaos',
    ];
    if (!validTypes.includes(body.type)) {
        return reply.status(400).send({
            error: `Invalid task type: ${body.type}`,
            validTypes,
        });
    }
    const task = {
        id: (0, crypto_1.randomUUID)(),
        type: body.type,
        priority: body.priority || 5,
        payload: {
            target: body.target,
            code: body.code,
            tests: body.tests,
            context: body.context,
            config: body.config,
        },
        createdAt: Date.now(),
    };
    try {
        const result = await swarm.assignTask(task);
        return { success: true, result };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return reply.status(500).send({ success: false, error: message });
    }
});
// Complexity: O(n) — batch task assignment
app.post('/swarm/batch', async (request, reply) => {
    const { tasks: taskDefs } = request.body;
    if (!Array.isArray(taskDefs) || taskDefs.length === 0) {
        return reply.status(400).send({ error: 'Provide a non-empty tasks array' });
    }
    if (taskDefs.length > 50) {
        return reply.status(400).send({ error: 'Maximum 50 tasks per batch' });
    }
    const tasks = taskDefs.map((def) => ({
        id: (0, crypto_1.randomUUID)(),
        type: def.type,
        priority: def.priority || 5,
        payload: {
            target: def.target,
            code: def.code,
            tests: def.tests,
            context: def.context,
            config: def.config,
        },
        createdAt: Date.now(),
    }));
    try {
        const results = await swarm.assignBatch(tasks);
        const successCount = results.filter((r) => r.success).length;
        return {
            success: true,
            total: results.length,
            succeeded: successCount,
            failed: results.length - successCount,
            results,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return reply.status(500).send({ success: false, error: message });
    }
});
// ═══════════════════════════════════════════════════════════════
// Startup
// ═══════════════════════════════════════════════════════════════
// Complexity: O(1)
async function main() {
    try {
        // Deploy swarm first
        await swarm.deploy();
        // Start API server
        await app.listen({
            host: config_1.SwarmConfig.api.host,
            port: config_1.SwarmConfig.api.port,
        });
        console.log(`\n🌐 API Server: http://localhost:${config_1.SwarmConfig.api.port}`);
        console.log('   POST /swarm/task   — Assign single task');
        console.log('   POST /swarm/batch  — Assign batch of tasks');
        console.log('   GET  /swarm/status — Swarm health & metrics');
        console.log('   GET  /health       — Service health check\n');
    }
    catch (error) {
        console.error('❌ Startup failed:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⚡ SIGINT received...');
    await swarm.shutdown();
    await app.close();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n⚡ SIGTERM received...');
    await swarm.shutdown();
    await app.close();
    process.exit(0);
});
main();
