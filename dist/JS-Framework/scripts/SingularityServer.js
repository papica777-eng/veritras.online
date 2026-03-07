"use strict";
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
const DepartmentEngine_1 = require("./DepartmentEngine");
const Telemetry_1 = require("./telemetry/Telemetry");
const Logger_1 = require("./telemetry/Logger");
const path = __importStar(require("path"));
/**
 * 🌌 QANTUM SINGULARITY SERVER
 * The ultimate backend server that unifies all departments and services.
 */
class SingularityServer {
    app;
    server;
    port;
    engine;
    telemetry;
    logger;
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
    setupMiddleware() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json({ limit: '50mb' }));
        // Performance Tracking Middleware
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
    setupRoutes() {
        // --- Core Status Endpoints ---
        this.app.get('/api/status', async (req, res) => {
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
                res.status(404).json({ error: err.message });
            }
        });
        this.app.post('/api/departments/:name/action', async (req, res) => {
            const { name } = req.params;
            const { action, params } = req.body;
            try {
                const dept = this.engine.getDepartment(name);
                // Type-safe dispatching would go here. For now, we mock the execution.
                this.logger.info('ENGINE', `Executing ${action} in ${name}`, params);
                // Example of real dispatch
                if (name === 'intelligence' && action === 'query') {
                    const result = await dept.processQuery(params.query);
                    return res.json(result);
                }
                res.json({ success: true, message: `Action ${action} initiated in ${name}` });
            }
            catch (err) {
                this.logger.error('ENGINE', `Action ${action} failed in ${name}`, err);
                res.status(500).json({ error: err.message });
            }
        });
        // --- LwaS Resonance Bridge ---
        this.app.post('/api/lwas/resonance-scan', async (req, res) => {
            try {
                const { manifoldId } = req.body;
                this.logger.info('BRIDGE', `Initiating Resonance Scan for manifold: ${manifoldId}`);
                // Mocking the call to the Rust binary/FFI for now
                // In a real scenario, this calls lwas_core::omega::oracle::initiate_resonance_scan
                const scanResult = {
                    manifoldId,
                    criticalNodes: Array.from({ length: 5 }, () => Math.floor(Math.random() * 2000000000)),
                    timestamp: Date.now()
                };
                res.json(scanResult);
            }
            catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
        // --- Intelligence Bridge ---
        this.app.post('/api/ask', async (req, res) => {
            const { prompt } = req.body;
            const intel = this.engine.getDepartment('intelligence');
            const result = await intel.processQuery(prompt);
            res.json({
                response: `[Intelligence Node] Analyzed query: ${result.processed}. Confidence: ${result.confidence.toFixed(2)}`,
            });
        });
        // --- Static Files ---
        const dashboardDir = path.join(process.cwd(), 'dashboard');
        this.app.use(express_1.default.static(dashboardDir));
        this.app.get('(.*)', (req, res) => {
            res.sendFile(path.join(dashboardDir, 'qantum-singular-interface.html'));
        });
    }
    setupErrorHandling() {
        this.app.use((err, req, res, next) => {
            this.logger.error('SERVER', 'Unhandled Exception', err);
            res.status(500).json({
                error: 'Internal Server Error',
                traceId: err.traceId || 'unknown',
            });
        });
    }
    async start() {
        this.logger.info('SERVER', `Starting Singularity Server on port ${this.port}...`);
        await this.engine.initializeAll();
        this.server.listen(this.port, () => {
            this.logger.info('SERVER', 'SINGULARITY CORE ACTIVE AND LISTENING');
            this.telemetry.trackMemory();
        });
        // Start background tasks
        setInterval(() => this.telemetry.trackMemory(), 30000);
    }
    async stop() {
        this.logger.warn('SERVER', 'Stopping Singularity Server...');
        this.telemetry.stop();
        await this.engine.shutdownAll();
        this.server.close();
    }
}
exports.SingularityServer = SingularityServer;
