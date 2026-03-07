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

// ═══════════════════════════════════════════════════════════════════════════════
// CORE MODULES
// ═══════════════════════════════════════════════════════════════════════════════

export * from './core';

// ═══════════════════════════════════════════════════════════════════════════════
// AI & COGNITION
// ═══════════════════════════════════════════════════════════════════════════════

export * from './ai';
export * from './cognition';

// ═══════════════════════════════════════════════════════════════════════════════
// TESTING MODULES
// ═══════════════════════════════════════════════════════════════════════════════

export * from './api';
export * from './validation';
export * from './integration';
export * from './performance';
export * from './security';
export * from './accessibility';
export * from './visual';

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTING & ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

export * from './reporter';

// ═══════════════════════════════════════════════════════════════════════════════
// DATA MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export * from './data';
export * from './storage';

// ═══════════════════════════════════════════════════════════════════════════════
// INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════

export * from './config';
export * from './plugins';
export * from './events';
export * from './distributed';
export * from './extensibility';

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED MODULES
// ═══════════════════════════════════════════════════════════════════════════════

export * from './chronos';
export * from './oracle';
export * from './reality';
export * from './swarm';
export * from './ghost';

// ═══════════════════════════════════════════════════════════════════════════════
// SCIENTIFIC MODULES
// ═══════════════════════════════════════════════════════════════════════════════

export * from './math';
export * from './physics';
export * from './biology';

// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS MODULES
// ═══════════════════════════════════════════════════════════════════════════════

export * from './saas';
export * from './licensing';
export * from './dashboard';

// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// DYNAMIC MODULES (Universal Connector)
// ═══════════════════════════════════════════════════════════════════════════════

export * from './modules';

// VERSION & METADATA
// ═══════════════════════════════════════════════════════════════════════════════

export const VERSION = '28.4.0';
export const CODENAME = 'SUPREMACY';
export const BUILD_DATE = new Date().toISOString();

export const QAntum_METADATA = {
  name: 'QAntum Prime',
  version: VERSION,
  codename: CODENAME,
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
export function QAntum() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 QAntum PRIME v${VERSION} - ${CODENAME}              ║
║                                                               ║
║   The Complete Testing Framework                              ║
║   Ready for action!                                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  return QAntum_METADATA;
}

export default QAntum;
