"use strict";
/**
 * /// IDENTITY: QANTUM_DIAMOND_NEXUS ///
 * /// MODE: ABSOLUTE_DETERMINISM ///
 *
 * Complexity: O(1)
 * EvolutionaryBridge unites the Catuskoti Logic Engine (MetaLogicEngine)
 * with the Autonomous Problem Solver (script-god.js) via the HybridHealer.
 * When classical logic fails (Paradox), it writes new reality.
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
exports.evolutionaryBridge = exports.EvolutionaryBridge = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
// Link with MetaLogicEngine
const MetaLogicEngine_1 = require("../../../OMEGA_CORE/Cognitive/MetaLogicEngine");
const HybridHealer_1 = require("./HybridHealer");
class EvolutionaryBridge {
    static instance;
    logicEngine;
    constructor() {
        this.logicEngine = new MetaLogicEngine_1.MetaLogicEngine();
    }
    static getInstance() {
        if (!EvolutionaryBridge.instance)
            EvolutionaryBridge.instance = new EvolutionaryBridge();
        return EvolutionaryBridge.instance;
    }
    /**
     * Complexity: O(1)
     * Analyzes anomalies. If LogicState is BOTH or TRANSCENDENT,
     * it dictates standard execution has failed logically.
     */
    // Complexity: O(N)
    async processAnomaly(proposition, context) {
        console.log(`[EvolutionaryBridge] 🌌 Anomaly Detected. Routing to Catuskoti Core.`);
        const evaluation = this.logicEngine.query(proposition.content);
        // If the proposition explicitly states it's paradoxical/transcendent, override classical evaluation
        const finalState = (proposition.truthValue === 'PARADOX' || proposition.truthValue === 'IMAGINARY' || proposition.truthValue === 'TRANSCENDENT' || proposition.truthValue === 'BOTH')
            ? proposition.truthValue
            : evaluation.answer;
        console.log(`[EvolutionaryBridge] 🔬 Catuskoti State: ${finalState}`);
        if (finalState === 'TRANSCENDENT' || finalState === 'BOTH' || finalState === 'PARADOX' || finalState === 'IMAGINARY') {
            console.log(`[EvolutionaryBridge] 🚨 PARADOX/TRANSCENDENCE CONFIRMED. Engaging Script-God for Autonomous Rewrite.`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            return await this.invokeScriptGod(proposition, context);
        }
        console.log(`[EvolutionaryBridge] 🟢 Classical bounds maintained. Handing back to HybridHealer.`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await HybridHealer_1.hybridHealer.heal(context);
    }
    /**
     * Complexity: O(1)
     * Deploys tools/script-god.js to physically modify the system logic.
     */
    // Complexity: O(N)
    async invokeScriptGod(proposition, context) {
        return new Promise((resolve) => {
            try {
                // Determine target context or default to a safe systemic location
                const target = context.component ? context.component : 'core system logic';
                // Formulate the NLP prompt for script-god.js
                // It expects verbs like "fix", "replace", "add", "migrate"
                const prompt = `fix typescript errors in ${target} to resolve logical paradox: ${proposition.content}`;
                console.log(`[EvolutionaryBridge] ⚡ Manifesting via Script-God: "${prompt}"`);
                const scriptPath = path.join(process.cwd(), 'tools', 'script-god.js');
                const out = (0, child_process_1.execSync)(`node "${scriptPath}" --execute "${prompt}"`, {
                    encoding: 'utf-8',
                    maxBuffer: 50 * 1024 * 1024 // 50MB buffer to prevent ENOBUFS
                });
                console.log(`[EvolutionaryBridge] ✅ Reality Rewritten. Entropy reset to 0.00.`);
                // Complexity: O(1)
                resolve({
                    strategy: 'AUTONOMOUS_EVOLUTION (Catuskoti Transcended)',
                    confidence: 1.0,
                    fix: `Patch Applied via Script-God. Log: ${out.substring(0, 80)}...`,
                    action: 'REWRITE_CODE'
                });
            }
            catch (err) {
                console.error(`[EvolutionaryBridge] ❌ Manifestation Failed: ${err.message}`);
                // Complexity: O(1)
                resolve({
                    strategy: 'EVOLUTION_FAILED',
                    confidence: 0,
                    fix: '',
                    action: 'IGNORE'
                });
            }
        });
    }
}
exports.EvolutionaryBridge = EvolutionaryBridge;
exports.evolutionaryBridge = EvolutionaryBridge.getInstance();
