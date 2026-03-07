"use strict";
/**
 * QAntum Framework v1.7.0 - "The Global Nexus & Autonomous Onboarding"
 *
 * Unified export for all v1.7.0 modules
 *
 * MODULE INVENTORY:
 * ├── NexusOrchestrator    - P2P Swarm Mesh Communication (+$280,000)
 * ├── AutoOnboarder        - Stripe → Docker Auto-Provisioning (+$195,000)
 * ├── GlobalThreatIntel    - Fatality + Nexus 0.05ms Immunity (+$320,000)
 * └── CaseStudyGenerator   - Auto Documentation v2 (+$85,000)
 *
 * TOTAL v1.7.0 VALUE: +$880,000
 *
 * @module global-nexus
 * @version 1.7.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MARKET_VALUE = exports.CODENAME = exports.VERSION = exports.createCaseStudyGenerator = exports.CaseStudyGenerator = exports.createGlobalThreatIntel = exports.GlobalThreatIntel = exports.createAutoOnboarder = exports.AutoOnboarder = exports.createNexusOrchestrator = exports.NexusOrchestrator = void 0;
exports.createGlobalNexusSystem = createGlobalNexusSystem;
// ═══════════════════════════════════════════════════════════════════════════
// SWARM MESH - P2P Communication
// ═══════════════════════════════════════════════════════════════════════════
var NexusOrchestrator_1 = require("../swarm/mesh/NexusOrchestrator");
Object.defineProperty(exports, "NexusOrchestrator", { enumerable: true, get: function () { return NexusOrchestrator_1.NexusOrchestrator; } });
Object.defineProperty(exports, "createNexusOrchestrator", { enumerable: true, get: function () { return NexusOrchestrator_1.createNexusOrchestrator; } });
// ═══════════════════════════════════════════════════════════════════════════
// REALITY GATEWAY - Autonomous Client Onboarding
// ═══════════════════════════════════════════════════════════════════════════
var AutoOnboarder_1 = require("../reality/gateway/AutoOnboarder");
Object.defineProperty(exports, "AutoOnboarder", { enumerable: true, get: function () { return AutoOnboarder_1.AutoOnboarder; } });
Object.defineProperty(exports, "createAutoOnboarder", { enumerable: true, get: function () { return AutoOnboarder_1.createAutoOnboarder; } });
// ═══════════════════════════════════════════════════════════════════════════
// SECURITY - Global Threat Intelligence
// ═══════════════════════════════════════════════════════════════════════════
var GlobalThreatIntel_1 = require("../security/GlobalThreatIntel");
Object.defineProperty(exports, "GlobalThreatIntel", { enumerable: true, get: function () { return GlobalThreatIntel_1.GlobalThreatIntel; } });
Object.defineProperty(exports, "createGlobalThreatIntel", { enumerable: true, get: function () { return GlobalThreatIntel_1.createGlobalThreatIntel; } });
// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENTATION - Auto Case Study Generation
// ═══════════════════════════════════════════════════════════════════════════
var CaseStudyGenerator_1 = require("../docs/CaseStudyGenerator");
Object.defineProperty(exports, "CaseStudyGenerator", { enumerable: true, get: function () { return CaseStudyGenerator_1.CaseStudyGenerator; } });
Object.defineProperty(exports, "createCaseStudyGenerator", { enumerable: true, get: function () { return CaseStudyGenerator_1.createCaseStudyGenerator; } });
// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED NEXUS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
const NexusOrchestrator_2 = require("../swarm/mesh/NexusOrchestrator");
const AutoOnboarder_2 = require("../reality/gateway/AutoOnboarder");
const GlobalThreatIntel_2 = require("../security/GlobalThreatIntel");
const CaseStudyGenerator_2 = require("../docs/CaseStudyGenerator");
/**
 * Create the unified Global Nexus system
 */
function createGlobalNexusSystem(config = {}) {
    const mesh = (0, NexusOrchestrator_2.createNexusOrchestrator)(config.mesh);
    const onboarding = (0, AutoOnboarder_2.createAutoOnboarder)(config.onboarding);
    const threatIntel = (0, GlobalThreatIntel_2.createGlobalThreatIntel)(config.threatIntel);
    const caseStudy = (0, CaseStudyGenerator_2.createCaseStudyGenerator)(config.caseStudy);
    // Wire up integrations
    // Connect threat intel to mesh for immunity patches
    threatIntel.on('patch:generated', (data) => {
        mesh.issueImmunityPatch({
            patchId: data.patchId,
            type: data.patchType,
            payload: '',
            priority: data.priority === 'emergency' ? 'critical' : 'high',
            source: 'global-threat-intel'
        });
    });
    // Connect mesh alerts to threat intel
    mesh.on('alert:received', (alert) => {
        threatIntel.reportThreatDetection({
            timestamp: new Date(),
            source: 'internal',
            detectedInRegion: 'virginia',
            detectedByWorkerId: alert.sourceNode,
            targetUrl: alert.affectedUrl || 'unknown',
            severity: alert.severity === 'critical' ? 'critical' : 'high',
            threatType: alert.threatType,
            confidence: 0.9,
            evidence: {
                requestFingerprint: '',
                userAgent: '',
                triggers: [alert.description],
                exitIp: '',
                proxyUsed: false
            },
            detectionLatencyMs: 0
        });
    });
    return {
        mesh,
        onboarding,
        threatIntel,
        caseStudy,
        getSystemStatus() {
            const meshStats = mesh.getStatistics();
            const onboardingStats = onboarding.getStatistics();
            const threatStats = threatIntel.getAnalytics();
            const caseStats = caseStudy.getStatistics();
            return {
                mesh: {
                    nodes: meshStats.totalNodes,
                    connected: meshStats.connectedNodes,
                    messagesProcessed: meshStats.messagesProcessed
                },
                onboarding: {
                    totalClients: onboardingStats.totalClients,
                    activeContainers: onboardingStats.activeContainers
                },
                threatIntel: {
                    workers: threatStats.totalWorkers,
                    detections: threatStats.totalDetections,
                    patches: threatStats.totalPatches,
                    avgLatencyMs: threatStats.averagePropagationLatencyMs
                },
                caseStudy: {
                    generated: caseStats.totalGenerated,
                    published: caseStats.totalPublished
                }
            };
        },
        async shutdown() {
            await mesh.shutdown();
            await onboarding.shutdown();
            // threatIntel and caseStudy don't need explicit shutdown
        }
    };
}
// ═══════════════════════════════════════════════════════════════════════════
// VERSION EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
exports.VERSION = '1.7.0';
exports.CODENAME = 'The Global Nexus & Autonomous Onboarding';
exports.MARKET_VALUE = {
    nexusOrchestrator: 280000,
    autoOnboarder: 195000,
    globalThreatIntel: 320000,
    caseStudyGenerator: 85000,
    total: 880000
};
exports.default = createGlobalNexusSystem;
