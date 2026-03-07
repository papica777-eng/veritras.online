"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║   ██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗    ██████╗ ██████╗ ██╗███╗   ███╗  ║
 * ║  ██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║    ██╔══██╗██╔══██╗██║████╗ ████║  ║
 * ║  ██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║    ██████╔╝██████╔╝██║██╔████╔██║  ║
 * ║  ██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║    ██╔═══╝ ██╔══██╗██║██║╚██╔╝██║  ║
 * ║  ╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║    ██║     ██║  ██║██║██║ ╚═╝ ██║  ║
 * ║   ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝    ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝  ║
 * ║                                                                                               ║
 * ║                         🚀 QAntum PRIME TESTING FRAMEWORK v28.4 🚀                            ║
 * ║                                                                                               ║
 * ║   "The Nexus of Complete Testing Solutions - From Unit to Enterprise"                         ║
 * ║                                                                                               ║
 * ║   Authored by: Dimitar Prodromov                                                                ║
 * ║   © 2025-2026 QAntum | All Rights Reserved                                                    ║
 * ║                                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QAntum_METADATA = exports.BUILD_DATE = exports.CODENAME = exports.VERSION = void 0;
exports.QAntum = QAntum;
// ═══════════════════════════════════════════════════════════════════════════════
// CORE MODULES
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./core"), exports);
// ═══════════════════════════════════════════════════════════════════════════════
// AI & COGNITION
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./ai"), exports);
__exportStar(require("./cognition"), exports);
// ═══════════════════════════════════════════════════════════════════════════════
// TESTING MODULES
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./api"), exports);
__exportStar(require("./validation"), exports);
__exportStar(require("./integration"), exports);
__exportStar(require("./performance"), exports);
__exportStar(require("./security"), exports);
__exportStar(require("./accessibility"), exports);
__exportStar(require("./visual"), exports);
// ═══════════════════════════════════════════════════════════════════════════════
// REPORTING & ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./reporter"), exports);
// ═══════════════════════════════════════════════════════════════════════════════
// DATA MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./data"), exports);
__exportStar(require("./storage"), exports);
// ═══════════════════════════════════════════════════════════════════════════════
// INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./config"), exports);
__exportStar(require("./plugins"), exports);
__exportStar(require("./events"), exports);
__exportStar(require("./distributed"), exports);
__exportStar(require("./extensibility"), exports);
// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED MODULES
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./chronos"), exports);
__exportStar(require("./oracle"), exports);
__exportStar(require("./reality"), exports);
__exportStar(require("./swarm"), exports);
__exportStar(require("./ghost"), exports);
// ═══════════════════════════════════════════════════════════════════════════════
// SCIENTIFIC MODULES
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./math"), exports);
__exportStar(require("./physics"), exports);
__exportStar(require("./biology"), exports);
// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS MODULES
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./saas"), exports);
__exportStar(require("./licensing"), exports);
__exportStar(require("./dashboard"), exports);
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// DYNAMIC MODULES (Universal Connector)
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./modules"), exports);
// VERSION & METADATA
// ═══════════════════════════════════════════════════════════════════════════════
exports.VERSION = '28.4.0';
exports.CODENAME = 'SUPREMACY';
exports.BUILD_DATE = new Date().toISOString();
exports.QAntum_METADATA = {
    name: 'QAntum Prime',
    version: exports.VERSION,
    codename: exports.CODENAME,
    author: 'Dimitar Prodromov',
    license: 'MIT',
    repository: 'https://github.com/papica777-eng/QA-Framework',
    homepage: 'https://QAntum.dev',
    features: [
        'Unit Testing',
        'Integration Testing',
        'API Testing',
        'Performance Testing',
        'Security Testing',
        'Accessibility Testing',
        'Visual Regression',
        'AI-Powered Testing',
        'Distributed Testing',
        'Enterprise Features',
    ],
    modules: {
        core: 'Test runner, assertions, hooks, decorators',
        ai: 'Cognitive testing, neural validation, pattern recognition',
        api: 'REST, GraphQL, WebSocket, gRPC testing',
        performance: 'Load testing, profiling, benchmarking',
        security: 'Vulnerability scanning, authentication testing',
        accessibility: 'WCAG compliance, screen reader testing',
        visual: 'Screenshot comparison, snapshot testing',
        data: 'Factories, fixtures, fake data generation',
        storage: 'Key-value, file, cache storage',
        config: 'Multi-format configuration, schema validation',
        plugins: 'Extensible plugin architecture',
        events: 'Event bus, typed emitters',
        distributed: 'Multi-node test execution',
        chronos: 'Time manipulation, temporal testing',
        oracle: 'Predictive analytics, test oracle',
        reality: 'Reality-bending test manipulation',
        swarm: 'Multi-agent testing intelligence',
        ghost: 'Ghost dimension isolation',
    },
};
// ═══════════════════════════════════════════════════════════════════════════════
// QUICK START EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Quick start function for QAntum
 */
function QAntum() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 QAntum PRIME v${exports.VERSION} - ${exports.CODENAME}              ║
║                                                               ║
║   The Complete Testing Framework                              ║
║   Ready for action!                                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
    return exports.QAntum_METADATA;
}
exports.default = QAntum;
