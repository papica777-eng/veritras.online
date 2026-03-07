"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║   ███╗   ███╗ ██████╗ ██████╗ ██╗   ██╗██╗     ███████╗                                       ║
 * ║   ████╗ ████║██╔═══██╗██╔══██╗██║   ██║██║     ██╔════╝                                       ║
 * ║   ██╔████╔██║██║   ██║██║  ██║██║   ██║██║     █████╗                                         ║
 * ║   ██║╚██╔╝██║██║   ██║██║  ██║██║   ██║██║     ██╔══╝                                         ║
 * ║   ██║ ╚═╝ ██║╚██████╔╝██████╔╝╚██████╔╝███████╗███████╗                                       ║
 * ║   ╚═╝     ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝                                       ║
 * ║                                                                                               ║
 * ║    ██████╗██╗      █████╗ ███████╗███████╗███████╗███████╗                                    ║
 * ║   ██╔════╝██║     ██╔══██╗██╔════╝██╔════╝██╔════╝██╔════╝                                    ║
 * ║   ██║     ██║     ███████║███████╗███████╗█████╗  ███████╗                                    ║
 * ║   ██║     ██║     ██╔══██║╚════██║╚════██║██╔══╝  ╚════██║                                    ║
 * ║   ╚██████╗███████╗██║  ██║███████║███████║███████╗███████║                                    ║
 * ║    ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚══════╝                                    ║
 * ║                                                                                               ║
 * ║   КЛАСОВА АРХИТЕКТУРА НА МОДУЛИТЕ                                                             ║
 * ║   Групиране по функционалност - не песъчинки, а кабели                                        ║
 * ║                                                                                               ║
 * ║   "Когато всеки модул е свързан с кабел, проблемът се засича веднага."                        ║
 * ║                                                                                               ║
 * ║   Created: 2026-01-02 | QAntum Empire                                                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassRegistry = exports.Orchestrator = exports.Module = exports.GuardianModule = exports.IntelligenceModule = exports.ClassOrchestrator = exports.BaseModule = exports.MODULE_CLASS_REGISTRY = void 0;
exports.getOrchestrator = getOrchestrator;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// CLASS DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
exports.MODULE_CLASS_REGISTRY = {
    INTELLIGENCE: {
        emoji: '🧠',
        name: 'INTELLIGENCE',
        description: 'Intelligence & Analysis Layer - Мозъкът на екосистемата',
        color: '#667eea',
        modules: [
            'EcosystemSyncValidator',
            'EcosystemHarmonizer',
            'CrossProjectSynergy',
            'SovereignAudit',
            'HealthMonitor',
            'VectorSync',
            'PricingSyncEngine',
            'DeepSeekLink'
        ],
        dependencies: ['PHYSICS', 'OMEGA'],
        dependents: ['GUARDIANS', 'REALITY']
    },
    OMEGA: {
        emoji: '⚡',
        name: 'OMEGA',
        description: 'Command & Control Center - Централата на властта',
        color: '#764ba2',
        modules: [
            'SovereignMagnet',
            'SovereignNucleus',
            'OmegaServer',
            'GenesisEngine'
        ],
        dependencies: ['PHYSICS', 'FORTRESS'],
        dependents: ['INTELLIGENCE', 'GUARDIANS']
    },
    PHYSICS: {
        emoji: '🔬',
        name: 'PHYSICS',
        description: 'Mathematical & Computational Core - Чистата математика',
        color: '#00ff88',
        modules: [
            'NeuralInference',
            'VectorEngine',
            'MatrixOps',
            'TensorCore',
            'GPUAccelerator'
        ],
        dependencies: [],
        dependents: ['OMEGA', 'INTELLIGENCE', 'BIOLOGY']
    },
    FORTRESS: {
        emoji: '🏰',
        name: 'FORTRESS',
        description: 'Security & Authentication - Непробиваемата стена',
        color: '#ff6b6b',
        modules: [
            'VaultGuard',
            'TokenManager',
            'CryptoEngine',
            'AccessControl',
            'AuditLogger'
        ],
        dependencies: ['PHYSICS'],
        dependents: ['OMEGA', 'REALITY']
    },
    BIOLOGY: {
        emoji: '🧬',
        name: 'BIOLOGY',
        description: 'Evolution & Learning Systems - Еволюцията на кода',
        color: '#ffd93d',
        modules: [
            'EvolutionEngine',
            'LearningCore',
            'AdaptiveSystem',
            'GeneticOptimizer',
            'NeuralEvolver'
        ],
        dependencies: ['PHYSICS'],
        dependents: ['INTELLIGENCE']
    },
    GUARDIANS: {
        emoji: '🛡️',
        name: 'GUARDIANS',
        description: 'Monitoring & Self-Healing - Вечните пазители',
        color: '#4ecdc4',
        modules: [
            'UnifiedGuardian',
            'EternalGuardian',
            'NucleusMapper',
            'HealthDaemon',
            'SelfHealer'
        ],
        dependencies: ['INTELLIGENCE', 'OMEGA'],
        dependents: []
    },
    REALITY: {
        emoji: '🌐',
        name: 'REALITY',
        description: 'External Interfaces - Връзката с външния свят',
        color: '#ff9f43',
        modules: [
            'APIGateway',
            'WebhookManager',
            'RESTController',
            'GraphQLServer',
            'WebSocketHub'
        ],
        dependencies: ['FORTRESS', 'INTELLIGENCE'],
        dependents: []
    },
    CHEMISTRY: {
        emoji: '🔗',
        name: 'CHEMISTRY',
        description: 'Connectors & Adapters - Лепилото на системата',
        color: '#a29bfe',
        modules: [
            'EventBridge',
            'DataTransformer',
            'ProtocolAdapter',
            'MessageQueue',
            'StateSync'
        ],
        dependencies: [],
        dependents: ['INTELLIGENCE', 'OMEGA', 'REALITY']
    }
};
exports.ClassRegistry = exports.MODULE_CLASS_REGISTRY;
// ═══════════════════════════════════════════════════════════════════════════════
// BASE MODULE CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class BaseModule extends events_1.EventEmitter {
    version = '1.0.0';
    _status = 'offline';
    _lastHealth = null;
    _connections = [];
    get status() {
        return this._status;
    }
    // Complexity: O(1)
    async initialize() {
        this._status = 'healthy';
        this.emit('initialized', { module: this.name, class: this.className });
    }
    // Complexity: O(1)
    async healthCheck() {
        this._lastHealth = {
            status: this._status,
            message: `${this.name} is ${this._status}`,
            lastCheck: new Date()
        };
        return this._lastHealth;
    }
    // Complexity: O(1)
    async shutdown() {
        this._status = 'offline';
        this.emit('shutdown', { module: this.name });
    }
    // Complexity: O(1)
    connect(target, type = 'dependency') {
        this._connections.push({
            from: this.name,
            to: target.name,
            type,
            strength: 'strong'
        });
        this.emit('connected', { from: this.name, to: target.name, type });
    }
    // Complexity: O(1)
    getConnections() {
        return [...this._connections];
    }
}
exports.BaseModule = BaseModule;
exports.Module = BaseModule;
// ═══════════════════════════════════════════════════════════════════════════════
// CLASS ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════
class ClassOrchestrator extends events_1.EventEmitter {
    modules = new Map();
    classes = new Map();
    constructor() {
        super();
        // Initialize class sets
        for (const className of Object.keys(exports.MODULE_CLASS_REGISTRY)) {
            this.classes.set(className, new Set());
        }
    }
    /**
     * Регистрира модул в съответния клас
     */
    // Complexity: O(1) — hash/map lookup
    register(module) {
        this.modules.set(module.name, module);
        this.classes.get(module.className)?.add(module.name);
        this.emit('registered', { module: module.name, class: module.className });
    }
    /**
     * Връща всички модули от даден клас
     */
    // Complexity: O(N) — linear iteration
    getClassModules(className) {
        const moduleNames = this.classes.get(className);
        if (!moduleNames)
            return [];
        return Array.from(moduleNames)
            .map(name => this.modules.get(name))
            .filter((m) => m !== undefined);
    }
    /**
     * Проверява здравето на цял клас
     */
    // Complexity: O(N) — linear iteration
    async checkClassHealth(className) {
        const modules = this.getClassModules(className);
        const results = [];
        for (const module of modules) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            results.push(await module.healthCheck());
        }
        const healthyCount = results.filter(r => r.status === 'healthy').length;
        const totalCount = results.length;
        return {
            className,
            definition: exports.MODULE_CLASS_REGISTRY[className],
            modules: results,
            healthScore: totalCount > 0 ? (healthyCount / totalCount) * 100 : 100,
            status: healthyCount === totalCount ? 'healthy' : healthyCount > 0 ? 'warning' : 'error'
        };
    }
    /**
     * Проверява здравето на цялата екосистема
     */
    // Complexity: O(N) — linear iteration
    async checkEcosystemHealth() {
        const classReports = [];
        for (const className of Object.keys(exports.MODULE_CLASS_REGISTRY)) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            classReports.push(await this.checkClassHealth(className));
        }
        const totalScore = classReports.reduce((sum, r) => sum + r.healthScore, 0) / classReports.length;
        return {
            timestamp: new Date(),
            classes: classReports,
            totalModules: this.modules.size,
            healthScore: totalScore,
            status: totalScore >= 90 ? 'healthy' : totalScore >= 70 ? 'warning' : 'error',
            connections: this.getAllConnections()
        };
    }
    /**
     * Връща всички връзки между модулите
     */
    // Complexity: O(N) — linear iteration
    getAllConnections() {
        const connections = [];
        for (const module of this.modules.values()) {
            if ('getConnections' in module && typeof module.getConnections === 'function') {
                connections.push(...module.getConnections());
            }
        }
        return connections;
    }
    /**
     * Намира всички модули, свързани с даден модул
     */
    // Complexity: O(N) — linear iteration
    findConnectedModules(moduleName) {
        const connections = this.getAllConnections();
        const connected = new Set();
        for (const conn of connections) {
            if (conn.from === moduleName)
                connected.add(conn.to);
            if (conn.to === moduleName)
                connected.add(conn.from);
        }
        return Array.from(connected);
    }
    /**
     * Визуализира класовата архитектура
     */
    // Complexity: O(N*M) — nested iteration detected
    visualize() {
        let output = '\n╔═══════════════════════════════════════════════════════════════════════════════╗\n';
        output += '║                       CLASS ARCHITECTURE MAP                                  ║\n';
        output += '╠═══════════════════════════════════════════════════════════════════════════════╣\n';
        for (const [className, definition] of Object.entries(exports.MODULE_CLASS_REGISTRY)) {
            const modules = this.getClassModules(className);
            const healthyCount = modules.filter(m => m.status === 'healthy').length;
            output += `║  ${definition.emoji} ${className.padEnd(15)} │ ${healthyCount}/${modules.length} modules │ ${definition.description.substring(0, 30)}...  ║\n`;
            for (const dep of definition.dependencies) {
                output += `║     └── depends on: ${exports.MODULE_CLASS_REGISTRY[dep].emoji} ${dep.padEnd(45)}║\n`;
            }
        }
        output += '╚═══════════════════════════════════════════════════════════════════════════════╝\n';
        return output;
    }
}
exports.ClassOrchestrator = ClassOrchestrator;
exports.Orchestrator = ClassOrchestrator;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════
let orchestratorInstance = null;
function getOrchestrator() {
    if (!orchestratorInstance) {
        orchestratorInstance = new ClassOrchestrator();
    }
    return orchestratorInstance;
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE MODULE IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Intelligence Module Example
 */
class IntelligenceModule extends BaseModule {
    name;
    className = 'INTELLIGENCE';
    constructor(name) {
        super();
        this.name = name;
    }
}
exports.IntelligenceModule = IntelligenceModule;
/**
 * Guardian Module Example
 */
class GuardianModule extends BaseModule {
    name;
    className = 'GUARDIANS';
    constructor(name) {
        super();
        this.name = name;
    }
    // Complexity: O(1)
    async healthCheck() {
        // Guardian-specific health check
        return {
            status: 'healthy',
            message: `${this.name} is actively monitoring`,
            metrics: {
                checksPerformed: 100,
                issuesFound: 0,
                autoHealed: 5
            },
            lastCheck: new Date()
        };
    }
}
exports.GuardianModule = GuardianModule;
