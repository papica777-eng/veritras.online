"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📊 VORTEX TELEMETRY DASHBOARD - PROMETHEUS METRICS SERVER
 * ═══════════════════════════════════════════════════════════════════════════════
 * Purpose: Expose real-time system health metrics for Grafana/Prometheus
 * Endpoint: http://localhost:9090/metrics
 * Integration: VortexHealingNexus, ApoptosisModule, Temporal workflows
 * ═══════════════════════════════════════════════════════════════════════════════
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeModulesCount = exports.systemUptime = exports.archivedModulesTotal = exports.moduleVitalityStatus = exports.moduleEntropyScore = exports.livenessTokensValidated = exports.livenessTokensGenerated = exports.healingDuration = exports.healingAttemptsTotal = void 0;
const express_1 = __importDefault(require("express"));
const prom_client_1 = require("prom-client");
const VortexHealingNexus_1 = require("../evolution/VortexHealingNexus");
// ─────────────────────────────────────────────────────────────────────────────
// 🎯 PROMETHEUS METRICS DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
// Healing Operations
const healingAttemptsTotal = new prom_client_1.Counter({
    name: 'vortex_healing_attempts_total',
    help: 'Total number of healing attempts by domain',
    labelNames: ['domain', 'success']
});
exports.healingAttemptsTotal = healingAttemptsTotal;
const healingDuration = new prom_client_1.Histogram({
    name: 'vortex_healing_duration_ms',
    help: 'Duration of healing operations in milliseconds',
    labelNames: ['domain'],
    buckets: [100, 500, 1000, 2000, 5000, 10000, 30000]
});
exports.healingDuration = healingDuration;
// LivenessToken Operations
const livenessTokensGenerated = new prom_client_1.Counter({
    name: 'vortex_liveness_tokens_generated_total',
    help: 'Total number of LivenessTokens generated',
    labelNames: ['status'] // HEALTHY, RECOVERING
});
exports.livenessTokensGenerated = livenessTokensGenerated;
const livenessTokensValidated = new prom_client_1.Counter({
    name: 'vortex_liveness_tokens_validated_total',
    help: 'Total number of LivenessTokens validated',
    labelNames: ['result'] // success, forged, expired, spoofed
});
exports.livenessTokensValidated = livenessTokensValidated;
// Apoptosis Module
const moduleEntropyScore = new prom_client_1.Gauge({
    name: 'vortex_module_entropy_score',
    help: 'Current entropy score for each module',
    labelNames: ['module_id']
});
exports.moduleEntropyScore = moduleEntropyScore;
const moduleVitalityStatus = new prom_client_1.Gauge({
    name: 'vortex_module_vitality_status',
    help: 'Module vitality status (0=ARCHIVED, 1=CRITICAL, 2=DEGRADED, 3=RECOVERING, 4=HEALTHY)',
    labelNames: ['module_id']
});
exports.moduleVitalityStatus = moduleVitalityStatus;
const archivedModulesTotal = new prom_client_1.Counter({
    name: 'vortex_archived_modules_total',
    help: 'Total number of modules archived (programmed death)',
    labelNames: ['reason'] // STALENESS, CRITICAL_ENTROPY, MANUAL
});
exports.archivedModulesTotal = archivedModulesTotal;
// System Health
const systemUptime = new prom_client_1.Gauge({
    name: 'vortex_system_uptime_seconds',
    help: 'System uptime in seconds'
});
exports.systemUptime = systemUptime;
const activeModulesCount = new prom_client_1.Gauge({
    name: 'vortex_active_modules_count',
    help: 'Number of currently active modules'
});
exports.activeModulesCount = activeModulesCount;
// ─────────────────────────────────────────────────────────────────────────────
// 🔄 METRICS COLLECTION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
const startTime = Date.now();
function updateSystemMetrics() {
    // Update system uptime
    const uptimeSeconds = (Date.now() - startTime) / 1000;
    systemUptime.set(uptimeSeconds);
    // Update healing metrics from VortexHealingNexus
    const nexus = VortexHealingNexus_1.VortexHealingNexus.getInstance();
    const healingMetrics = nexus.getHealingMetrics();
    for (const [domain, stats] of Object.entries(healingMetrics.byDomain)) {
        healingAttemptsTotal.labels(domain, 'true').inc(stats.successes);
        healingAttemptsTotal.labels(domain, 'false').inc(stats.attempts - stats.successes);
    }
    // Update apoptosis metrics (placeholder - would integrate with actual DB)
    // In production, query module_vitality table
    const mockModules = [
        { id: 'VortexHealingNexus', entropy: 0.0, status: 'HEALTHY' },
        { id: 'SovereignSalesHealer', entropy: 15.3, status: 'HEALTHY' },
        { id: 'ApoptosisModule', entropy: 0.0, status: 'HEALTHY' }
    ];
    let activeCount = 0;
    for (const module of mockModules) {
        moduleEntropyScore.labels(module.id).set(module.entropy);
        // Map status to numeric value
        const statusMap = {
            'ARCHIVED': 0,
            'CRITICAL': 1,
            'DEGRADED': 2,
            'RECOVERING': 3,
            'HEALTHY': 4
        };
        moduleVitalityStatus.labels(module.id).set(statusMap[module.status] || 0);
        if (module.status !== 'ARCHIVED') {
            activeCount++;
        }
    }
    activeModulesCount.set(activeCount);
}
// ─────────────────────────────────────────────────────────────────────────────
// 🌐 EXPRESS SERVER
// ─────────────────────────────────────────────────────────────────────────────
const app = (0, express_1.default)();
const PORT = process.env.METRICS_PORT || 9090;
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ONLINE',
        uptime: (Date.now() - startTime) / 1000,
        timestamp: new Date().toISOString()
    });
});
// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        // Update metrics before serving
        updateSystemMetrics();
        res.set('Content-Type', prom_client_1.register.contentType);
        res.end(await prom_client_1.register.metrics());
    }
    catch (error) {
        res.status(500).send(`Error generating metrics: ${error.message}`);
    }
});
// Dashboard endpoint (human-readable)
app.get('/', (req, res) => {
    const nexus = VortexHealingNexus_1.VortexHealingNexus.getInstance();
    const metrics = nexus.getHealingMetrics();
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>VORTEX Telemetry Dashboard</title>
            <style>
                body {
                    font-family: 'JetBrains Mono', monospace;
                    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
                    color: #00ff88;
                    padding: 2rem;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                h1 {
                    text-align: center;
                    color: #a855f7;
                    text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
                }
                .metric-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(168, 85, 247, 0.3);
                    border-radius: 8px;
                    padding: 1rem;
                    margin: 1rem 0;
                }
                .metric-label {
                    color: #06b6d4;
                    font-weight: bold;
                }
                .metric-value {
                    color: #10b981;
                    font-size: 1.5rem;
                }
                pre {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 1rem;
                    border-radius: 4px;
                    overflow-x: auto;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🌌 VORTEX TELEMETRY DASHBOARD</h1>
                
                <div class="metric-card">
                    <div class="metric-label">System Uptime</div>
                    <div class="metric-value">${((Date.now() - startTime) / 1000 / 60).toFixed(2)} minutes</div>
                </div>

                <div class="metric-card">
                    <div class="metric-label">Total Healing Attempts</div>
                    <div class="metric-value">${metrics.totalAttempts}</div>
                </div>

                <div class="metric-card">
                    <div class="metric-label">Healing Success Rate</div>
                    <div class="metric-value">${(metrics.successRate * 100).toFixed(1)}%</div>
                </div>

                <div class="metric-card">
                    <div class="metric-label">Average Healing Duration</div>
                    <div class="metric-value">${metrics.averageDuration.toFixed(0)}ms</div>
                </div>

                <div class="metric-card">
                    <div class="metric-label">Healing by Domain</div>
                    <pre>${JSON.stringify(metrics.byDomain, null, 2)}</pre>
                </div>

                <div class="metric-card">
                    <div class="metric-label">Prometheus Metrics</div>
                    <a href="/metrics" style="color: #a855f7;">View Raw Metrics</a>
                </div>
            </div>
        </body>
        </html>
    `);
});
// ─────────────────────────────────────────────────────────────────────────────
// 🚀 START SERVER
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n╔═══════════════════════════════════════════════════════════════════════════════╗`);
    console.log(`║           📊 VORTEX TELEMETRY DASHBOARD ACTIVE                                ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════════════════════╝\n`);
    console.log(`🌐 Dashboard: http://localhost:${PORT}`);
    console.log(`📈 Metrics:   http://localhost:${PORT}/metrics`);
    console.log(`💚 Health:    http://localhost:${PORT}/health\n`);
});
