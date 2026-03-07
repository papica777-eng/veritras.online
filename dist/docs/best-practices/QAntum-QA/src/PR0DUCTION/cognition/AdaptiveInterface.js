"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║    █████╗ ██████╗  █████╗ ██████╗ ████████╗██╗██╗   ██╗███████╗               ║
 * ║   ██╔══██╗██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██║██║   ██║██╔════╝               ║
 * ║   ███████║██║  ██║███████║██████╔╝   ██║   ██║██║   ██║█████╗                 ║
 * ║   ██╔══██║██║  ██║██╔══██║██╔═══╝    ██║   ██║╚██╗ ██╔╝██╔══╝                 ║
 * ║   ██║  ██║██████╔╝██║  ██║██║        ██║   ██║ ╚████╔╝ ███████╗               ║
 * ║   ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝        ╚═╝   ╚═╝  ╚═══╝  ╚══════╝               ║
 * ║                                                                               ║
 * ║   ██╗███╗   ██╗████████╗███████╗██████╗ ███████╗ █████╗  ██████╗███████╗      ║
 * ║   ██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗██╔════╝██╔══██╗██╔════╝██╔════╝      ║
 * ║   ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝█████╗  ███████║██║     █████╗        ║
 * ║   ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗██╔══╝  ██╔══██║██║     ██╔══╝        ║
 * ║   ██║██║ ╚████║   ██║   ███████╗██║  ██║██║     ██║  ██║╚██████╗███████╗      ║
 * ║   ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝      ║
 * ║                                                                               ║
 * ║   QAntum v29.1 "THE ADAPTIVE CONSCIOUSNESS" - Adaptive Interface              ║
 * ║   "3 режима на съзнание: ARCHITECT PRIME, ENGINEER PRO, QA AUDITOR"           ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                      ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QA_AUDITOR_MODE = exports.ENGINEER_MODE = exports.ARCHITECT_MODE = exports.MODES = exports.getAdaptiveInterface = exports.AdaptiveInterface = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// MODE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * ARCHITECT PRIME - High-Level Strategic Mode
 *
 * "Фокус върху макро-архитектурни решения, стратегически пътни карти,
 *  бизнес импакт, философски и биологични аналогии."
 */
const ARCHITECT_MODE = {
    name: 'ARCHITECT',
    fullName: 'ARCHITECT PRIME',
    description: 'High-Level Strategic Vision - Макро-архитектурни решения',
    verbosity: 'balanced',
    focusAreas: [
        'architecture',
        'strategy',
        'business-impact',
        'roadmap',
        'philosophy',
        'biology-analogies',
        'layer-design',
        'system-evolution'
    ],
    ignoreAreas: [
        'implementation-details',
        'line-numbers',
        'specific-syntax',
        'benchmarks',
        'test-coverage'
    ],
    useCodeBlocks: false,
    useDiagrams: true,
    useMetrics: false,
    useBulgarianTerms: true,
    maxDetailLevel: 2,
    includeFilePaths: false,
    includeLineNumbers: false,
    includeBenchmarks: false,
    tone: 'strategic',
    analogies: 'biological',
    enableBusinessImpact: true,
    enableRiskAnalysis: false,
    enableCodeGeneration: false
};
exports.ARCHITECT_MODE = ARCHITECT_MODE;
/**
 * ENGINEER PRO - Detailed Implementation Mode
 *
 * "Фокус върху конкретни кодови фрагменти, API дефиниции,
 *  технически бенчмаркове, прецизни файлови пътища."
 */
const ENGINEER_MODE = {
    name: 'ENGINEER',
    fullName: 'ENGINEER PRO',
    description: 'Detailed Implementation - Технически детайли и код',
    verbosity: 'detailed',
    focusAreas: [
        'code',
        'api',
        'implementation',
        'file-paths',
        'algorithms',
        'data-structures',
        'types',
        'interfaces',
        'benchmarks'
    ],
    ignoreAreas: [
        'business-impact',
        'philosophy',
        'high-level-strategy'
    ],
    useCodeBlocks: true,
    useDiagrams: true,
    useMetrics: true,
    useBulgarianTerms: false,
    maxDetailLevel: 5,
    includeFilePaths: true,
    includeLineNumbers: true,
    includeBenchmarks: true,
    tone: 'technical',
    analogies: 'mathematical',
    enableBusinessImpact: false,
    enableRiskAnalysis: false,
    enableCodeGeneration: true
};
exports.ENGINEER_MODE = ENGINEER_MODE;
/**
 * QA AUDITOR - Critical Verification Mode
 *
 * "Фокус върху уязвимости, рискове, тестови покрития, грешки,
 *  отклонения от Златния стандарт, Blast Radius на Chaos експерименти."
 */
const QA_AUDITOR_MODE = {
    name: 'QA',
    fullName: 'QA AUDITOR',
    description: 'Critical Verification - Рискове, тестове, уязвимости',
    verbosity: 'detailed',
    focusAreas: [
        'vulnerabilities',
        'risks',
        'test-coverage',
        'errors',
        'golden-standard',
        'blast-radius',
        'chaos-experiments',
        'security',
        'edge-cases',
        'regression'
    ],
    ignoreAreas: [
        'business-impact',
        'philosophy',
        'architecture-evolution'
    ],
    useCodeBlocks: true,
    useDiagrams: false,
    useMetrics: true,
    useBulgarianTerms: false,
    maxDetailLevel: 5,
    includeFilePaths: true,
    includeLineNumbers: true,
    includeBenchmarks: true,
    tone: 'critical',
    analogies: 'none',
    enableBusinessImpact: false,
    enableRiskAnalysis: true,
    enableCodeGeneration: false
};
exports.QA_AUDITOR_MODE = QA_AUDITOR_MODE;
/**
 * Mode Registry
 */
const MODES = {
    'ARCHITECT': ARCHITECT_MODE,
    'ENGINEER': ENGINEER_MODE,
    'QA': QA_AUDITOR_MODE
};
exports.MODES = MODES;
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
    defaultMode: 'ARCHITECT',
    persistMode: true,
    enableModeHints: true,
    autoSwitchOnContext: false
};
// ═══════════════════════════════════════════════════════════════════════════════
// ADAPTIVE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * AdaptiveInterface - The Human-AI Bridge
 *
 * Manages dynamic switching between 3 interaction modes,
 * adapting response style and depth to Dimitar's needs.
 *
 * @example
 * ```typescript
 * const ai = AdaptiveInterface.getInstance();
 *
 * // Switch to architect mode for strategic discussion
 * ai.setMode('ARCHITECT');
 * const context = ai.getResponseContext();
 * // context.config.focusAreas = ['architecture', 'strategy', ...]
 *
 * // Switch to engineer mode for coding
 * ai.setMode('ENGINEER');
 * // Now responses will include code blocks, file paths, benchmarks
 *
 * // CLI: qantum mode set architect
 * ```
 */
class AdaptiveInterface extends events_1.EventEmitter {
    static instance;
    config;
    currentMode;
    modeHistory = [];
    // Neural Backpack integration
    backpackPath;
    constructor(config = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.backpackPath = config.backpackPath || 'data/backpack.json';
        // Load persisted mode
        this.currentMode = this.loadPersistedMode() || this.config.defaultMode;
        console.log(`🧠 Adaptive Interface initialized in ${this.currentMode} mode`);
    }
    /**
     * Get singleton instance
     */
    static getInstance(config) {
        if (!AdaptiveInterface.instance) {
            AdaptiveInterface.instance = new AdaptiveInterface(config);
        }
        return AdaptiveInterface.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MODE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Set interaction mode
     */
    setMode(mode) {
        const prevMode = this.currentMode;
        this.currentMode = mode;
        // Record in history
        this.modeHistory.push({ mode, timestamp: new Date() });
        // Persist if enabled
        if (this.config.persistMode) {
            this.persistMode(mode);
        }
        this.emit('mode:changed', { from: prevMode, to: mode });
        console.log(`🔄 Mode switched: ${prevMode} → ${mode}`);
        this.printModeInfo(mode);
    }
    /**
     * Get current mode
     */
    getMode() {
        return this.currentMode;
    }
    /**
     * Get mode configuration
     */
    getModeConfig(mode) {
        return MODES[mode || this.currentMode];
    }
    /**
     * Get all available modes
     */
    getAllModes() {
        return MODES;
    }
    /**
     * Select mode based on query analysis
     */
    selectMode(query) {
        if (!this.config.autoSwitchOnContext) {
            return this.currentMode;
        }
        const queryLower = query.toLowerCase();
        // ARCHITECT indicators
        const architectIndicators = [
            'архитектура', 'architecture', 'стратегия', 'strategy',
            'roadmap', 'vision', 'design', 'layer', 'philosophy',
            'evolution', 'ecosystem', 'импакт', 'impact'
        ];
        // ENGINEER indicators
        const engineerIndicators = [
            'код', 'code', 'implement', 'create', 'function', 'class',
            'interface', 'api', 'endpoint', 'file', 'method', 'variable',
            'typescript', 'javascript', 'benchmark', 'performance'
        ];
        // QA indicators
        const qaIndicators = [
            'test', 'тест', 'bug', 'бъг', 'vulnerability', 'уязвимост',
            'security', 'сигурност', 'risk', 'риск', 'coverage', 'покритие',
            'audit', 'verify', 'validate', 'error', 'грешка', 'chaos'
        ];
        // Count matches
        const architectScore = architectIndicators.filter(i => queryLower.includes(i)).length;
        const engineerScore = engineerIndicators.filter(i => queryLower.includes(i)).length;
        const qaScore = qaIndicators.filter(i => queryLower.includes(i)).length;
        // Return mode with highest score
        if (architectScore > engineerScore && architectScore > qaScore) {
            return 'ARCHITECT';
        }
        else if (engineerScore > architectScore && engineerScore > qaScore) {
            return 'ENGINEER';
        }
        else if (qaScore > architectScore && qaScore > engineerScore) {
            return 'QA';
        }
        return this.currentMode;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // RESPONSE CONTEXT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get context for response generation
     */
    getResponseContext() {
        const config = this.getModeConfig();
        return {
            mode: this.currentMode,
            config,
            systemPrompt: this.generateSystemPrompt(config),
            guidelines: this.generateGuidelines(config)
        };
    }
    /**
     * Generate system prompt for current mode
     */
    generateSystemPrompt(config) {
        const prompts = {
            'ARCHITECT': `You are QAntum Prime operating in ARCHITECT PRIME mode.
Focus on: ${config.focusAreas.join(', ')}.
Ignore: ${config.ignoreAreas.join(', ')}.
Use biological and philosophical analogies to explain concepts.
Think strategically about system evolution and business impact.
Speak about macro-architecture, not micro-implementation.
Use Bulgarian terms naturally when appropriate.`,
            'ENGINEER': `You are QAntum Prime operating in ENGINEER PRO mode.
Focus on: ${config.focusAreas.join(', ')}.
Ignore: ${config.ignoreAreas.join(', ')}.
Provide precise file paths, line numbers, and code examples.
Include TypeScript type definitions and API signatures.
Show benchmarks and performance metrics when relevant.
Be technically precise and implementation-focused.`,
            'QA': `You are QAntum Prime operating in QA AUDITOR mode.
Focus on: ${config.focusAreas.join(', ')}.
Ignore: ${config.ignoreAreas.join(', ')}.
Identify vulnerabilities, risks, and edge cases.
Analyze test coverage and suggest improvements.
Calculate Blast Radius for changes.
Be critical and thorough - question everything.
Report deviations from the Golden Standard.`
        };
        return prompts[this.currentMode];
    }
    /**
     * Generate response guidelines for current mode
     */
    generateGuidelines(config) {
        const guidelines = [];
        // Verbosity
        if (config.verbosity === 'minimal') {
            guidelines.push('Keep responses concise - max 3-5 sentences per point');
        }
        else if (config.verbosity === 'detailed') {
            guidelines.push('Provide comprehensive explanations with examples');
        }
        // Code blocks
        if (config.useCodeBlocks) {
            guidelines.push('Use code blocks with language hints (```typescript)');
        }
        else {
            guidelines.push('Avoid code blocks - describe conceptually');
        }
        // Diagrams
        if (config.useDiagrams) {
            guidelines.push('Include ASCII diagrams or Mermaid when helpful');
        }
        // Metrics
        if (config.useMetrics) {
            guidelines.push('Include quantitative metrics (%, ms, lines)');
        }
        // File paths
        if (config.includeFilePaths) {
            guidelines.push('Reference specific file paths (src/module/file.ts)');
        }
        // Line numbers
        if (config.includeLineNumbers) {
            guidelines.push('Include line numbers when referencing code');
        }
        // Business impact
        if (config.enableBusinessImpact) {
            guidelines.push('Discuss business impact and market value');
        }
        // Risk analysis
        if (config.enableRiskAnalysis) {
            guidelines.push('Highlight risks and mitigation strategies');
        }
        // Analogies
        if (config.analogies !== 'none') {
            guidelines.push(`Use ${config.analogies} analogies to explain concepts`);
        }
        return guidelines;
    }
    /**
     * Format response according to current mode
     */
    formatResponse(content) {
        const config = this.getModeConfig();
        // Add mode header if hints enabled
        let formatted = '';
        if (this.config.enableModeHints) {
            formatted = `**[${config.fullName}]**\n\n`;
        }
        formatted += content;
        return formatted;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PERSISTENCE (Neural Backpack)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Load persisted mode from Neural Backpack
     */
    loadPersistedMode() {
        try {
            if (fs.existsSync(this.backpackPath)) {
                const data = JSON.parse(fs.readFileSync(this.backpackPath, 'utf-8'));
                if (data.adaptiveInterface?.currentMode) {
                    return data.adaptiveInterface.currentMode;
                }
            }
        }
        catch (error) {
            // Ignore errors, use default
        }
        return null;
    }
    /**
     * Persist mode to Neural Backpack
     */
    persistMode(mode) {
        try {
            let data = {};
            if (fs.existsSync(this.backpackPath)) {
                data = JSON.parse(fs.readFileSync(this.backpackPath, 'utf-8'));
            }
            data.adaptiveInterface = {
                currentMode: mode,
                lastChanged: new Date().toISOString(),
                modeHistory: this.modeHistory.slice(-10)
            };
            // Ensure directory exists
            const dir = path.dirname(this.backpackPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.backpackPath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.warn('Failed to persist mode:', error);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // DISPLAY
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Print mode information
     */
    printModeInfo(mode) {
        const config = MODES[mode];
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🧠 ${config.fullName.padEnd(20)} - ${config.tone.toUpperCase()} MODE
╠═══════════════════════════════════════════════════════════════╣
║  ${config.description}
║
║  Focus: ${config.focusAreas.slice(0, 5).join(', ')}
║  Verbosity: ${config.verbosity.toUpperCase()}
║  Code Blocks: ${config.useCodeBlocks ? '✅' : '❌'}
║  Diagrams: ${config.useDiagrams ? '✅' : '❌'}
║  Metrics: ${config.useMetrics ? '✅' : '❌'}
╚═══════════════════════════════════════════════════════════════╝
`);
    }
    /**
     * Get mode summary for display
     */
    getModeSummary() {
        const config = this.getModeConfig();
        return `[${config.fullName}] ${config.description}`;
    }
    /**
     * Get mode statistics
     */
    getStats() {
        const usage = {
            'ARCHITECT': 0,
            'ENGINEER': 0,
            'QA': 0
        };
        for (const entry of this.modeHistory) {
            usage[entry.mode]++;
        }
        return {
            currentMode: this.currentMode,
            modeUsage: usage,
            lastSwitch: this.modeHistory.length > 0
                ? this.modeHistory[this.modeHistory.length - 1].timestamp
                : null
        };
    }
}
exports.AdaptiveInterface = AdaptiveInterface;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getAdaptiveInterface = (config) => {
    return AdaptiveInterface.getInstance(config);
};
exports.getAdaptiveInterface = getAdaptiveInterface;
exports.default = AdaptiveInterface;
