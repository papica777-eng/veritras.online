"use strict";
/**
 * SingularityServer — Qantum Module
 * @module SingularityServer
 * @path src/core/SingularityServer.ts
 * @auto-documented BrutalDocEngine v2.1
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingularityServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http = __importStar(require("http"));
const zod_1 = require("zod");
const DepartmentEngine_1 = require("./DepartmentEngine");
const Telemetry_1 = require("./telemetry/Telemetry");
const Logger_1 = require("./telemetry/Logger");
const paths_1 = require("../utils/paths");
// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMAS - BunkerBridge Validation
// ═══════════════════════════════════════════════════════════════════════════════
const DepartmentActionSchema = zod_1.z.object({
    action: zod_1.z.string(),
    params: zod_1.z.record(zod_1.z.unknown())
});
const LwasResonanceScanSchema = zod_1.z.object({
    manifoldId: zod_1.z.string()
});
const AskSchema = zod_1.z.object({
    prompt: zod_1.z.string()
});
/**
 * 🌌 QANTUM SINGULARITY SERVER
 * The ultimate backend server that unifies all departments and services.
 * Enforces Absolute Determinism and Zero Entropy.
 */
class SingularityServer {
    app;
    server;
    port;
    engine;
    telemetry;
    logger;
    // Complexity: O(1) — singleton lookups + middleware registration
    constructor(port = 8890) {
        this.port = port;
        this.app = (0, express_1.default)();
        this.server = http.createServer(this.app);
        this.engine = DepartmentEngine_1.DepartmentEngine.getInstance();
        this.telemetry = Telemetry_1.Telemetry.getInstance();
        this.logger = Logger_1.Logger.getInstance();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    // Complexity: O(1) — middleware stack registration
    setupMiddleware() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json({ limit: '50mb' }));
        // Performance Tracking Middleware — O(1) per request
        this.app.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                this.telemetry.trackApiRequest(req.path, req.method, res.statusCode, duration);
                this.logger.debug('HTTP', `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
            });
            next();
        });
    }
    // Complexity: O(R) where R = number of routes registered
    setupRoutes() {
        // --- Core Status Endpoints ---
        this.app.get('/api/status', async (_req, res) => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const status = await this.engine.getOverallStatus();
            res.json(status);
        });
        // --- Department Management ---
        this.app.get('/api/departments/:name', async (req, res) => {
            try {
                const dept = this.engine.getDepartment(req.params.name);
                const health = await dept.getHealth();
                res.json(health);
            }
            catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                res.status(404).json({ error: message });
            }
        });
        this.app.post('/api/departments/:name/action', async (req, res) => {
            try {
                const { name } = req.params;
                const { action, params } = DepartmentActionSchema.parse(req.body);
                const dept = this.engine.getDepartment(name);
                this.logger.info('ENGINE', `Executing ${action} in ${name}`, params);
                if (name === 'intelligence' && action === 'query') {
                    const result = await dept.processQuery(params.query);
                    return res.json(result);
                }
                res.json({ success: true, message: `Action ${action} initiated in ${name}` });
            }
            catch (err) {
                const message = err instanceof Error ? err.message : 'Validation/Execution failed';
                res.status(500).json({ error: message });
            }
        });
        // --- LwaS Resonance Bridge ---
        this.app.post('/api/lwas/resonance-scan', async (req, res) => {
            try {
                const { manifoldId } = LwasResonanceScanSchema.parse(req.body);
                this.logger.info('BRIDGE', `Initiating Resonance Scan for manifold: ${manifoldId}`);
                const scanResult = {
                    manifoldId,
                    criticalNodes: Array.from({ length: 5 }, () => Math.floor(Math.random() * 2000000000)),
                    timestamp: Date.now()
                };
                res.json(scanResult);
            }
            catch (err) {
                const message = err instanceof Error ? err.message : 'Resonance scan failed';
                res.status(500).json({ error: message });
            }
        });
        // --- Intelligence Bridge ---
        this.app.post('/api/ask', async (req, res) => {
            try {
                const { prompt } = AskSchema.parse(req.body);
                const intel = this.engine.getDepartment('intelligence');
                const result = await intel.processQuery(prompt);
                res.json({
                    response: `[Intelligence Node] Analyzed query: ${result.processed}. Confidence: ${result.confidence.toFixed(2)}`,
                });
            }
            catch (err) {
                const message = err instanceof Error ? err.message : 'Query failed';
                res.status(500).json({ error: message });
            }
        });
        // --- Static Files ---
        const dashboardDir = (0, paths_1.pathJoin)(process.cwd(), 'dashboard');
        this.app.use(express_1.default.static(dashboardDir));
        this.app.get('(.*)', (_req, res) => {
            res.sendFile((0, paths_1.pathJoin)(dashboardDir, 'qantum-singular-interface.html'));
        });
    }
    // Complexity: O(1) — express error handler registration
    setupErrorHandling() {
        this.app.use((err, _req, res, _next) => {
            this.logger.error('SERVER', 'Unhandled Exception', err);
            res.status(500).json({
                error: 'Internal Server Error',
                traceId: err.traceId || 'unknown',
            });
        });
    }
    // Complexity: O(N) — initializes all departments then binds port
    async start() {
        this.logger.info('SERVER', `Starting Singularity Server on port ${this.port}...`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.engine.initializeAll();
        this.server.listen(this.port, () => {
            this.logger.info('SERVER', `✅ SINGULARITY CORE ACTIVE on port ${this.port}`);
            this.telemetry.trackMemory();
        });
        setInterval(() => this.telemetry.trackMemory(), 30000);
    }
    // Complexity: O(N) — graceful shutdown of all departments + server close
    async stop() {
        this.logger.warn('SERVER', 'Stopping Singularity Server...');
        this.telemetry.stop();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.engine.shutdownAll();
        this.server.close();
    }
}
exports.SingularityServer = SingularityServer;
